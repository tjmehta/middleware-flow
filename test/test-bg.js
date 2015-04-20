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
var ignoreErr = errMw.ignoreErr;
var wrapAcceptErr = errMw.wrapAcceptErr;

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var flow = require('../index');
var createCount = require('callback-count');

describe('background', function () {
  it('should run middlewares in background', function (done) {
    var app = createAppWithMiddleware(
      flow.bg(
        function (req, res, next) {
          var resEnd = res.end.bind(res);
          res.end(function () {
            setTimeout(function () {
              thisShouldBeCalledAfterRouteComplete();
              next(); // this should do nothing
            }, 10);
            resEnd();
          });
        }
      ),
      res.write('1'),
      res.write('2'),
      res.write('3'),
      res.end()
    );
    var count = createCount(2, done);
    request(app)
      .get('/')
      .expect('123')
      .end(function () {
        expect(count.count).to.equal(2); // called first
        count.next();
      });
    function thisShouldBeCalledAfterRouteComplete() {
      expect(count.count).to.equal(1); // called second
      count.next();
    }
  });
});
