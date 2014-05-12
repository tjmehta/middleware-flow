var createCount = require('callback-count');
var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var request = require('supertest');
var res = require ('./fixtures/middlewares/res');
var errMw = require('./fixtures/middlewares/err');
var throwErr = errMw.throwErr;
var nextErr = errMw.nextErr;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var or = require('../index').or;

describe('or', function() {
  it('should next on the first middleware that passes', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      or(
        nextErr(err),
        res.write('A'),
        nextErr(err),
        res.write('B')
      ),
      res.end()
    );
    request(app)
      .get('/')
      .expect('A')
      .end(done);

    function pass (req, res, next) {
      next();
    }
  });
  it('should next the first error if none pass', function(done) {
    var err1 = new Error('boom1');
    var err2 = new Error('boom2');
    var err3 = new Error('boom3');
    var app = createAppWithMiddleware(
      or(
        nextErr(err1),
        nextErr(err2),
        nextErr(err3)
      ),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err1.message)
      .end(done);

    function pass (req, res, next) {
      next();
    }
  });
  it('should next immediate if a middleware contains an uncaught exception', function(done) {
    var err = new Error('boom1');
    var app = createAppWithMiddleware(
      or(
        throwErr(err),
        res.write('A'),
        res.end()
      ),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);

    function pass (req, res, next) {
      next();
    }
  });
});