var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;
var request = require('supertest');
var res = require('./fixtures/middlewares/res');

var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
var flow = require('../index');
var createCount = require('callback-count');

describe('background', function () {
  it('should run middlewares in background', function (done) {
    var app = createAppWithMiddleware(
      flow.bg(
        function (req, res, next) {
          var resEnd = res.end.bind(res);
          res.end = function () {
            setTimeout(function () {
              thisShouldBeCalledAfterRouteComplete();
              next(); // this should do nothing
            }, 10);
            resEnd();
          };
          next();
        }
      ),
      res.send('1')
    );
    var count = createCount(2, done);
    request(app)
      .get('/')
      .expect('1')
      .end(function () {
        expect(count.count).to.equal(2); // called first
        count.next();
      });
    function thisShouldBeCalledAfterRouteComplete () {
      expect(count.count).to.equal(1); // called second
      count.next();
    }
  });
});
