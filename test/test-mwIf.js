var createCount = require('callback-count');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;
var before = lab.before;
var after = lab.after;
var request = require('supertest');
var res = require ('./fixtures/middlewares/res');
var errMw = require('./fixtures/middlewares/err');
var throwErr = errMw.throwErr;
var nextErr = errMw.nextErr;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var flow = require('../index');
var mwIf = flow.mwIf;

describe('mwIf', function() {
  it('should run middleware passed to then if the mw passes', function(done) {
    var app = createAppWithMiddleware(
      mwIf(flow.next)
        .then(res.write('1'))
        .else(res.write('2')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('1')
      .end(done);
  });
  it('should run middleware passed to else if the mw next(err) (and pass error if accepted)', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      mwIf(nextErr(err))
        .then(res.write('1'))
        .else(res.sendErr()),
      res.end()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
  it('should run middleware passed to else if the mw next(err) (and not pass error if not-accepted)', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      mwIf(nextErr(err))
        .then(res.write('1'))
        .else(res.write('2')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('2')
      .end(done);
  });
  it('should run middleware passed to else if the mw next(err) (and pass error if accepted)', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      mwIf(nextErr(err))
        .then(res.write('1'))
        .else(res.sendErr())
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
  it('should run middleware passed to else if the mw next(err) (and pass error if accepted)', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      mwIf(nextErr(err))
        .then(res.write('1')),
      res.sendErr(), // skip me
      res.send('skip success')
    );
    request(app)
      .get('/')
      .expect('skip success')
      .end(done);
  });
  it('should next(err) if the mw has uncaught exception', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      mwIf(throwErr(err))
        .then(res.write('1'))
        .else(
          res.write('2'),
          res.end()),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
  it('should run middleware passed to else if the mw next(err) (and pass correct error message - shared scope test)', function(done) {
    var app = createAppWithMiddleware(
      mwIf(function (req, res, next) {
          next(new Error(req.body.message));
        })
        .then(res.send('skip success'))
        .else(function (err, req, res, next) {
          res.send(err.message);
        })
    );
    var count = createCount(done);
    request(app)
      .post('/')
      .send({message:'one'})
      .expect('one')
      .end(count.inc().next);
    request(app)
      .post('/')
      .send({message:'two'})
      .expect('two')
      .end(count.inc().next);
  });
});
