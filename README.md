# lingering

When you want to finish what you've started.

# install

With [npm](http://npmjs.org) do:

```
npm install lingering
```

# usage

```js
var lingering = require('lingering');

lingering(function synchronous() {
  console.log('My job here is done');
});

lingering('asynchronous', function (done) {
  setTimeout(function () {
    console.log('Did I really do a great job?');
    done();
  }, 500);
});

console.log('Let\'s start this.');

setTimeout(function () {
  console.log('OK, let\'s finish this.');

  process.kill(process.pid, 'SIGTERM');
}, 100);

/*
Let's start this.
OK, let's finish this.
Terminating due to SIGTERM signal, calling all handlers...
My job here is done
Did I really do a great job?
[synchronous] terminated peacefully.
[asynchronous] terminated peacefully.
*/

```

# error handling

```js
var lingering = require('lingering');

lingering(function synchronousError() {
  throw new Error('It won\'t go as planned');
});

lingering('asynchronousError', function (done) {
  setTimeout(function () {
    done(new Error('I feel a bit mischievous'));
  }, 500);
});

console.log('Will everything be alright?');

setTimeout(function () {
  console.log('I\'ll try my best finishing this up.');

  process.kill(process.pid, 'SIGTERM');
}, 100);

/*
Will everything be alright?
I'll try my best finishing this up.
Terminating due to SIGTERM signal, calling all handlers...
[synchronousError] terminated with error: Error: It won't go as planned
    at synchronousError (/home/adrien/pleasure/bemyapp/lingering/errors.js:4:9)
    at Object.func (/home/adrien/pleasure/bemyapp/node_modules/lingering/index.js:7:27)
    at /home/adrien/pleasure/bemyapp/node_modules/lingering/index.js:53:13
    at Array.forEach (native)
    at processHandlers (/home/adrien/pleasure/bemyapp/node_modules/lingering/index.js:52:16)
    at onSignal (/home/adrien/pleasure/bemyapp/node_modules/lingering/index.js:86:3)
    at emitNone (events.js:67:13)
    at process.emit (events.js:166:7)
    at Signal.wrap.onsignal (node.js:790:46)
[asynchronousError] terminated with error: Error: I feel a bit mischievous
    at null._onTimeout (/home/adrien/pleasure/bemyapp/lingering/errors.js:9:10)
    at Timer.listOnTimeout (timers.js:89:15)
*/

```
