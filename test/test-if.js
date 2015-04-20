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

describe('if', function() {
  it('should run middleware passed to then if the function returns true', function(done) {
    var app = createAppWithMiddleware(
      flow.if(true)
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
      flow.if(false)
        .then(res.write('1'))
        .else(res.write('2')),
      res.end()
    );
    request(app)
      .get('/')
      .expect('2')
      .end(done);
  });
});
