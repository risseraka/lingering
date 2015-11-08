var lingering = require('lingering');

lingering(function synchronous() {
  console.log('my job here is done');
});

lingering(function asynchronous(done) {
  setTimeout(function () {
    console.log('did I really do a great job?');
    done();
  }, 500);
});

console.log('let\'s start this.');

setTimeout(function () {
  console.log('ok, let\'s finish this.');

  process.kill(process.pid, 'SIGTERM');
}, 100);
