var createCount = require('callback-count');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;
var request = require('supertest');
var res = require('./fixtures/middlewares/res');
var errMw = require('./fixtures/middlewares/err');
var query = require('./fixtures/middlewares/query');
var nextErr = errMw.nextErr;
var extendErrMessage = errMw.extendErrMessage;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var flow = require('../index');

describe('try', function () {
  it('should skip catch middlewares if the try middlewares pass', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(flow.next)
        .catch(
          res.send('caught')
        ),
      res.send('nocatch')
    );
    request(app)
      .get('/')
      .expect('nocatch')
      .end(done);
  });
  it('should run the catch middlewares (no err mws) if the try middlewares error', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(nextErr(new Error('boom')))
        .catch(
          query.set('foo', 'bar'),
          res.sendQuery()
        ),
      res.send('good')
    );
    request(app)
      .get('/')
      .expect({ foo: 'bar' })
      .end(done);
  });
  it('should run the catch middlewares (err mws) if the try middlewares error', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(nextErr(new Error('boom')))
        .catch(
          extendErrMessage('boom'),
          res.sendErr()
        ),
      res.send('good')
    );
    request(app)
      .get('/')
      .expect('boomboom')
      .end(done);
  });
  it('should run the catch middlewares (mixed mws) if the try middlewares error', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(nextErr(new Error('boom')))
        .catch(
          query.setAsErr('foo'),
          res.sendQuery()
        ),
      res.send('good')
    );
    request(app)
      .get('/')
      .expect({ foo: {} })
      .end(done);
  });
  it('should throw an error if try is given error middlewares', function (done) {
    try {
      createAppWithMiddleware(
        flow
          .try(function (err, req, res, next) { next(); }) // eslint-disable-line handle-callback-err
          .catch(
            res.send('caught')
          ),
        res.send('good')
      );
    }
    catch (err) {
      expect(err.message).to.match(/try/);
      done();
    }
  });
  it('should pass error to first mw catch', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(nextErr(new Error('boom')))
        .catch(function (err, req, res, next) { // eslint-disable-line handle-callback-err,no-unused-vars
          res.send('caught');
        }
      ),
      res.send('nocaught')
    );
    request(app)
      .get('/')
      .expect('caught')
      .end(done);
  });
  it('should pass error to first mw catch', function (done) {
    var app = createAppWithMiddleware(
      flow
        .try(
          flow.next,
          nextErr(new Error('boom'))
        )
        .catch(
          function (err, req, res, next) { // eslint-disable-line handle-callback-err,no-unused-vars
            res.send('caught');
          }
        ),
      res.send('nocaught')
    );
    request(app)
      .get('/')
      .expect('caught')
      .end(done);
  });
  it('should pass error to first mw catch (and pass correct error message - shared scope test)', function (done) {
    var app = createAppWithMiddleware(
      flow.each([1],
        flow
          .try(
            function (eachReq, res, next) {
              var err = new Error(eachReq.body.message);
              next(err); // next the error
            }
          )
          .catch(
            function (err, eachReq, res, next) { // eslint-disable-line no-unused-vars
              res.send(err.message);
            }
          )
        ),
        res.send('nocaught')
    );
    var countZ = createCount(done);
    request(app)
      .post('/')
      .send({ message: 'foo' })
      .expect('foo')
      .end(countZ.inc().next);
    request(app)
      .post('/')
      .send({ message: 'bar' })
      .expect('bar')
      .end(countZ.inc().next);
  });
});
