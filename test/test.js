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

describe('series', series('series'));
describe('and', series('and'));
function series (method) {
  return function () {
    before(function () {
      this.app = createAppWithMiddleware(
        flow[method](
          appendReqBody('key', '1'),
          appendReqBody('key', '2'),
          appendReqBody('key', '3')
        )
      );
    });
    it('should run middlewares in ' + method, function (done) {
      request(this.app)
        .post('/')
        .send({})
        .expect(200)
        .expect(function (res) {
          res.body.key.should.equal('123');
        })
        .end(done);
    });
    it('should return the first error', function (done) {
      var err = this.err = new Error('boom');
      this.app = createAppWithMiddleware(
        flow[method](
          appendReqBody('key', '1'),
          nextError(err),
          appendReqBody('key', '3')
        )
      );
      request(this.app)
        .post('/')
        .send({})
        .expect(500)
        .expect(function (res) {
          res.body.message.should.eql(err.message);
        })
        .end(done);
    });
  };
}

describe('parallel', function () {
  before(function () {
    this.app = createAppWithMiddleware(
      flow.parallel(
        appendReqBody('key', '1'),
        appendReqBody('key2', '2'),
        appendReqBody('key3', '3')
      )
    );
  });
  it('should run middlewares in parallel', function (done) {
    request(this.app)
      .post('/')
      .send({})
      .expect(200)
      .expect(function (res) {
        res.body.should.eql({
          key : 1,
          key2: 2,
          key3: 3
        });
      })
      .end(done);
  });
  it('should return the first error', function (done) {
    var err = this.err = new Error('boom');
    this.app = createAppWithMiddleware(
      flow.parallel(
        appendReqBody('key', '1'),
        nextError(err),
        appendReqBody('key', '3')
      )
    );
    request(this.app)
      .post('/')
      .send({})
      .expect(500)
      .expect(function (res) {
        res.body.message.should.eql(err.message);
      })
      .end(done);
  });
});

describe('or', function () {
  describe('passing', function () {
    before(function () {
      var err = this.err = new Error('boom');
      this.passApp1 = createAppWithMiddleware(
        flow.or(
          nextError(err),
          appendReqBody('key1', '1'),
          appendReqBody('key2', '2')
        )
      );
      this.passApp2 = createAppWithMiddleware(
        flow.or(
          appendReqBody('key1', '1'),
          nextError(err),
          appendReqBody('key2', '2')
        )
      );
      this.passApp3 = createAppWithMiddleware(
        flow.or(
          appendReqBody('key1', '1'),
          appendReqBody('key2', '2'),
          nextError(err)
        )
      );
    });
    it('should run middlewares until one passes', function (done) {
      var count = createCount(done);
      var self = this;
      [1,2,3].forEach(function (i) {
        request(self['passApp'+i])
          .post('/')
          .send({})
          .expect(200)
          .expect(function (res) {
            res.body.should.eql({
              key1 : 1
            });
          })
          .end(count.inc().next);
      });
    });
  });
  describe('error', function () {
    before(function () {
      this.err1 = new Error('boom1');
      this.err2 = new Error('boom2');
      this.err3 = new Error('boom3');
      this.app = createAppWithMiddleware(
        flow.parallel(
          nextError(this.err1),
          nextError(this.err2),
          nextError(this.err3)
        )
      );
    });
    it('should return the first error', function (done) {
      var self = this;
      request(this.app)
        .post('/')
        .send({})
        .expect(500)
        .expect(function (res) {
          res.body.message.should.eql(self.err1.message);
        })
        .end(done);
    });
  });
});