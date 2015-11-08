'use strict';

function asyncify(func) {
  return function (done) {
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

function addHandler(name, func) {
  if (!func) {
    func = name;
    name = func.name || 'unnamed';
  }

  exitHandlers.push({
    name: '[' + name + ']',
    func: asyncify(func),
    done: false,
    error: null
  });
}

module.exports = addHandler;

['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach(function (signal) {
  process.on(signal, onSignal.bind(null, signal));
});
