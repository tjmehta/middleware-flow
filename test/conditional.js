var createCount = require('callback-count');
var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var flow = require('../index');
var request = require('supertest');
var appendReqBody = function (key, val) {
  return function (req, res, next) {
    var bodyVal = req.body[key];
    req.body[key] = bodyVal === undefined ? val : bodyVal + val;
    next();
  };
};
var nextError = function (err) {
  return function (req, res, next) {
    next(err);
  };
};
var err = new Error('boom');
function syncPass () { return true; }
function syncFail () { return false; }
function asyncPass (req, res, cb) { cb(null, true); }
var asyncFail = nextError(err);
function mwPass (req, res, cb) { cb(); }
function mwFail (req, res, cb) { cb(err); }
var mwFailErr = nextError(err);

describe('if',      conditional('if', true, false));
describe('syncIf',  conditional('syncIf', syncPass, syncFail));
describe('asyncIf', conditional('asyncIf', asyncPass, asyncFail));
describe('mwIf', function () {
  describe('then',     conditionalPass('mwIf', mwPass));
  describe('else',     conditionalFail('mwIf', mwFail));
  describe('err else', conditionalFail('mwIf', mwFailErr));
});

function conditional (method, testPass, testFail) {
  return function () {
    describe('then', conditionalPass(method, testPass));
    describe('else', conditionalFail(method, testFail));
  };
}

function conditionalPass (method, test, pass) {
  return function () {
    before(function () {
      this.app = createAppWithMiddleware(
        flow[method](test)
          .then(
            appendReqBody('key', '1'),
            appendReqBody('key', '2'),
            appendReqBody('key', '3')
          )
          .else(nextError(err))
      );
    });
    it('should run middlewares in then if it passes', function (done) {
      request(this.app)
        .post('/')
        .send({})
        .expect(200)
        .expect(function (res) {
          res.body.key.should.equal('123');
        })
        .end(done);
    });
  };
}
function conditionalFail (method, test, pass) {
  return function () {
    before(function () {
      this.app = createAppWithMiddleware(
        flow[method](test)
          .then(
            appendReqBody('key', '1'),
            appendReqBody('key', '2'),
            appendReqBody('key', '3')
          )
          .else(nextError(err)),
        function (err, req, res, next) {
          if (test === mwFailErr || test === asyncFail) {
            if (!req.lastError) {
              throw new Error('lastError was not set');
            }
          }
          next();
        }
      );
    });
    it('should run middlewares in else if it doesnt pass', function (done) {
      request(this.app)
        .post('/')
        .send({})
        .expect(500)
        .expect(function (res) {
          res.body.message.should.equal('boom');
        })
        .end(done);
    });
  };
}
