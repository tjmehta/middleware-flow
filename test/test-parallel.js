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
var parallel = require('../index').parallel;

describe('parallel', function() {
  it('should run middlewares in parallel', function (done) {
    var app = createAppWithMiddleware(
      parallel(
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
      if (first) {
        req.count = createCount(3, done); // expects three
      }
      else {
        req.count.next();
      }
    }
  });
  it('should next(err) if an error occurs (next)', function (done) {
    var count = createCount(3);
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      parallel(
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
      count.next(next);
    }
  });
  it('should next(err) if an error occurs (next)', function (done) {
    var count = createCount(3);
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      parallel(
        step,
        throwErr(err),
        step
      ),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);

    function step (req, res, next) {
      count.next(next);
    }
  });
});
