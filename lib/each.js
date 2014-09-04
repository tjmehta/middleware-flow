var createCount = require('callback-count');
var series = require('./series');

module.exports = each;

function each (arr /*, middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments, 1);
  return function (req, res, next) {
    if (arr.length === 0) {
      next();
    }
    else {
      var count = createCount(arr.length, next);
      arr.forEach(function (item) {
        var eachReq = { __proto__: req };
        var mws = middlewares.map(function (mw) {
          return mw.length === 5 ?
            mw.bind(mw, item, req) :
            mw;
        });
        series.apply(null, mws)(eachReq, res, count.next);
      });
    }
  };
}