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
