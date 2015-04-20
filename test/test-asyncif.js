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
var asyncIf = flow.asyncIf;

describe('asyncIf', function() {
  it('should run middleware passed to then if the function callbacks true', function(done) {
    var app = createAppWithMiddleware(
      asyncIf(callbackTrue)
        .then(res.write('A'))
        .else(res.write('B')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('A')
      .end(done);
  });
  it('should run middleware passed to then if the function callbacks false', function(done) {
    var app = createAppWithMiddleware(
      asyncIf(callbackFalse)
        .then(res.write('A'))
        .else(res.write('B')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('B')
      .end(done);
  });
  it('should run middleware passed to then if the function callbacks false', function(done) {
    var app = createAppWithMiddleware(
      asyncIf(callbackFalse)
        .then(res.write('A')),
      res.write('B'),
      res.end()
    );
    request(app)
      .get('/')
      .expect('B')
      .end(done);
  });
  it('should next(err) if the mw next(err)', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      asyncIf(nextErr(err))
        .then(res.send('1'))
        .else(res.send('2')),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
  it('should next(err) if the mw has uncaught exception', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      asyncIf(throwErr(err))
        .then(res.send('1'))
        .else(res.send('2')),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
});

function callbackTrue (req, res, next) {
  next(null, true);
}

function callbackFalse (req, res, next) {
  next(null, false);
}
