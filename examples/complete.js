var lingering = require('..');

lingering(function twins() {
});

lingering('twins', function () {
});

lingering(function unruly() {
  throw new Error('ohsnap');
});

lingering(function () {
  throw null;
});

lingering(function peaceful(done) {
  setTimeout(function () {
    done();
  }, 0);
});

lingering(function lawful(done) {
  setTimeout(function () {
    done('oops');
  }, 0);
});

lingering(function unlawful(done) {
  done();
  done();
});

lingering(function annoying(done) {
  setTimeout(function () {
    throw new Error('catch me if you can!');
  }, 0);
});

lingering(function superAnnoying(done) {
  setTimeout(function () {
    throw 'no stack for you.';
  }, 0);
});

lingering(function lingering(done) {
  setTimeout(done, 100000);
});

setInterval(function () {
  console.log('still alive!');
}, 100);

setTimeout(function () {
  process.kill(process.pid, 'SIGTERM');
}, 1000);
