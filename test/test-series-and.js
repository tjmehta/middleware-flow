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
var ignoreErr = errMw.ignoreErr;
var wrapAcceptErr = errMw.wrapAcceptErr;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var series = require('../index').series;
var and = require('../index').and;

describe('series', function () {
  it('should run middlewares in series', function (done) {
    var app = createAppWithMiddleware(
      series(
        res.write('1'),
        res.write('2'),
        res.write('3')
      ),
      res.end()
    );
    request(app)
      .get('/')
      .expect('123')
      .end(done);
  });
  it('should only exec error middleware if an error occurs (next)', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      series(
        wrapAcceptErr(res.write('NO')),
        nextErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(res.write('A')),
        expectErr(err),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err),
        wrapAcceptErr(res.write('C')),
        expectErr(err),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should only exec error middleware if an error occurs (uncaught)', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      series(
        throwErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(res.write('A')),
        expectErr(err),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err),
        wrapAcceptErr(res.write('C')),
        expectErr(err),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should only exec error middleware if an error occurs (uncaught error mw)', function (done) {
    var err = new Error('boom');
    var err2 = new Error('boom2');
    var app = createAppWithMiddleware(
      series(
        throwErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(throwErr(err2)),
        wrapAcceptErr(res.write('A')),
        expectErr(err2),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err2),
        wrapAcceptErr(res.write('C')),
        expectErr(err2),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should throw an error if given non-function middlewares', function (done) {
    var mw = function () {};
    try {
      series(1, mw, mw);
    }
    catch (err) {
      expect(err.message).to.equal('middlewares must be functions');
    }
    finally {
      done();
    }
  });
});

describe('and', function () {
  it('should run middlewares in and', function (done) {
    var app = createAppWithMiddleware(
      and(
        res.write('1'),
        res.write('2'),
        res.write('3')
      ),
      res.end()
    );
    request(app)
      .get('/')
      .expect('123')
      .end(done);
  });
  it('should only exec error middleware if an error occurs (next)', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      and(
        nextErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(res.write('A')),
        expectErr(err),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err),
        wrapAcceptErr(res.write('C')),
        expectErr(err),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should only exec error middleware if an error occurs (uncaught)', function (done) {
    var err = new Error('boom');
    var app = createAppWithMiddleware(
      and(
        throwErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(res.write('A')),
        expectErr(err),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err),
        wrapAcceptErr(res.write('C')),
        expectErr(err),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should only exec error middleware if an error occurs (uncaught error mw)', function (done) {
    var err = new Error('boom');
    var err2 = new Error('boom2');
    var app = createAppWithMiddleware(
      and(
        throwErr(err),
        res.write('1'),
        res.write('2'),
        res.write('3'),
        wrapAcceptErr(throwErr(err2)),
        wrapAcceptErr(res.write('A')),
        expectErr(err2),
        res.write('4'),
        wrapAcceptErr(res.write('B')),
        expectErr(err2),
        wrapAcceptErr(res.write('C')),
        expectErr(err2),
        res.write('5'),
        ignoreErr(),
        res.end()
      )
    );
    request(app)
      .get('/')
      .expect('ABC')
      .end(done);

    function expectErr (err) {
      return function (e, req, res, next) {
        expect(e).to.equal(err);
        next(e);
      };
    }
  });
  it('should throw an error if given non-function middlewares', function (done) {
    var mw = function () {};
    try {
      and(1, mw, mw);
    }
    catch (err) {
      expect(err.message).to.equal('middlewares must be functions');
    }
    finally {
      done();
    }
  });
});
