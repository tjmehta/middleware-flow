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
var syncIf = flow.syncIf;

describe('syncIf', function() {
  it('should run middleware passed to then if the function returns true', function(done) {
    var app = createAppWithMiddleware(
      syncIf(returnTrue)
        .then(res.write('1'))
        .else(res.write('2')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('1')
      .end(done);
  });
  it('should run middleware passed to then if the function returns true', function(done) {
    var app = createAppWithMiddleware(
      syncIf(returnFalse)
        .then(res.write('1'))
        .else(res.write('2')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('2')
      .end(done);
  });
  it('should run middleware passed to else if function has an uncaught error', function(done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      syncIf(throwErr(err))
        .then(res.write('1'))
        .else(res.write('2')),
      res.sendErr(),
      res.end()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
});

function returnTrue (req, res, next) {
  return true;
}
function returnFalse (req, res, next) {
  return false;
}
