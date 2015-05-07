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
var parallelWait = require('../index').parallelWait;

describe('parallelWait', function() {
  it('should run middlewares in parallel and wait for all of them', function (done) {
    var app = createAppWithMiddleware(
      parallelWait(
        step,
        step,
        step
      ),
      res.send('done')
    );

    request(app)
      .get('/')
      .end(done);

    function step (req, res, next) {
      next(null);
    }
  });

  it('should next(err) if an error occurs (next) once all the middlewares have terminated', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      parallelWait(
        step,
        nextErr(err),
        step
      ),
      res.sendErr()
    );

    request(app)
      .get('/')
      .expect(err.message)
      .end(done);

    function step (req, res, next) {
      next();
    }
  });

  it('should next(err) if an error occurs (next) once all the middlewares have terminated', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      parallelWait(
        step,
        throwErr(err),
        throwErr(err)
      ),
      res.sendErr()
    );

    request(app)
      .get('/')
      .expect(err.message)
      .end(done);

    function step (req, res, next) {
      next();
    }
  });
});
