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
var exists = require('101/exists');
var throwErr = errMw.throwErr;
var nextErr = errMw.nextErr;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var parallel = require('../index').parallel;
var each = require('../index').each;

describe('each', function() {
  it('should work like next if array is empty', function (done) {
    var arr = [];
    var app = createAppWithMiddleware(
      each(arr,
        function (item, req, eachReq, res, next) {
          // nothing
        }
      ),
      function (req, res, next) {
        res.send('done');
      }
    );
    request(app)
      .get('/')
      .end(done);
  });
  it('should run middlewares in parallel', function (done) {
    var arr = [1, 1, 1];
    var app = createAppWithMiddleware(
      each(arr,
        function (item, req, eachReq, res, next) {
          req.add = exists(req.add) ? req.add : 0;
          req.add += item;
          next();
        },
        function (eachReq, res, next) {
          next();
        }
      ),
      function (req, res, next) {
        res.send(req.add);
      }
    );
    request(app)
      .get('/')
      .expect(3)
      .end(done);
  });
  it('should next(err) if an error occurs (next)', function (done) {
    var err = new Error('boom');
    var arr = [1, 1, 1];
    var app = createAppWithMiddleware(
      each(arr,
        function (item, req, eachReq, res, next) {
          nextErr(err)(eachReq, res, next);
        }
      ),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
  it('should next(err) if an error occurs (throw)', function (done) {
    var err = new Error('boom');
    var arr = [1, 1, 1];
    var app = createAppWithMiddleware(
      each(arr,
        function (item, req, eachReq, res, next) {
          throwErr(err)(eachReq, res, next);
        }
      ),
      res.sendErr()
    );
    request(app)
      .get('/')
      .expect(err.message)
      .end(done);
  });
});
