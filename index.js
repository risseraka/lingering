'use strict';

function asyncify(func) {
  return function (done) {
    // check function arity,
    // if it doesn't take parameters, consider it as synchronous
    if (func.length === 0) {
      try {
        return done(null, func());
      } catch (err) {
        return done(err instanceof Error ? err : new Error(err));
      }
    }

    func(done);
  };
}

function onlyOnce(func, errorMessage) {
  var called = false;

  return function () {
    if (called) return console.trace(new Error(errorMessage));

    called = true;
    func.apply(this, arguments);
  };
}

var exitHandlers = [];

function finalExit(reason) {
  var errored = exitHandlers.reduce(function (r, handler) {
    if (!handler.done) {
      handler.error = reason;
    }

    if (handler.error) {
      console.error(handler.name, 'terminated with error:', handler.error.stack || handler.error)
    } else {
      console.info(handler.name, 'terminated peacefully.');
    }

    return r + handler.error !== null;
  }, 0);

  process.exit(errored ? 1 : 0);
}

function processHandlers() {
  var total = exitHandlers.length;
  var processed = 0;

  exitHandlers.forEach(function (handler) {
    handler.func(onlyOnce(function (err) {
      processed += 1;

      handler.done = true;
      handler.error = err;

      if (processed === total) {
        finalExit();
      }
    }, 'handler callback should only be called once'));
  });
}

var master = true;
var ending = false;

function onSignal(signal, e) {
  if (ending) {
    console.info('process already finishing');
    return;
  }

  ending = true;

  console.info('Terminating due to', signal, 'signal, calling all handlers...');

  process.on('uncaughtException', function (err) {
    console.error('uncaughtException:', err.stack || err);
    finalExit('uncaughtException?');
  });

  // exit in 10 seconds if all handlers have not already finished
  setTimeout(finalExit.bind(this, 'timeout'), 10000);

  processHandlers();
}

function saveHandler(handler) {
  exitHandlers.push(handler);
}

function addHandler(name, func) {
  if (!func) {
    func = name;
    name = func.name || 'unnamed';
  }

  var handler = {
    name: '[' + name + ']',
    func: asyncify(func),
    done: false,
    error: null
  };

  if (!master) {
    // pass handler to master instance
    process.emit('lingering_handler', handler);
  } else {
    saveHandler(handler);
  }
}

module.exports = addHandler;

var signalsHandlers = ['SIGINT', 'SIGQUIT', 'SIGTERM'].map(function (signal) {
  return {
    signal: signal,
    listener: onSignal.bind(null, signal)
  };
});

signalsHandlers.forEach(function (signalHandler) {
  process.on(signalHandler.signal, signalHandler.listener);
});

var pinged = false;
var listening = false;

function onPing() {
  pinged = true;

  process.emit('lingering_pong');
}

function onPong() {
  if (!pinged) {
    master = false;
    // remove event listeners, master handle it
    process.removeListener('lingering_pong', onPong);
    process.removeListener('lingering_ping', onPing);
    signalsHandlers.forEach(function (signalHandler) {
      process.removeListener(signalHandler.signal, signalHandler.listener);
    });
  } else if (!listening) {
    // master only needs to listen to new handlers once
    listening = true;

    // master must listen to new handlers coming from slaves
    process.on('lingering_handler', saveHandler);
  }
}

// as emitting is synchronous, first listen to pong
process.on('lingering_pong', onPong);

// try to ping already listening instances
process.emit('lingering_ping');

// listening after emitting avoids pinging oneself
process.on('lingering_ping', onPing);
