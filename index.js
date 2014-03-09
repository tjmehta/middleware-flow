var createCount = require('callback-count');

var flow = module.exports = {
  series: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy
      step(middlewares.shift());
      function step (mw) {
        if (mw) {
          mw(req, res, nextStep);
        }
        else {
          next(); // done
        }
      }
      function nextStep (err) {
        if (err) return next(err);
        step(middlewares.shift()); // continue
      }
    };
  },
  parallel: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var count = createCount(next);
      var middlewares = args.slice(); // copy

      middlewares.forEach(function () {
        count.inc(); // inc first just in case the middlewares are sync
      });
      middlewares.forEach(function (mw) {
        mw(req, res, count.next);
      });
    };
  },
  or: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy
      var firstErr;

      step(middlewares.shift());
      function step (mw) {
        if (mw) {
          mw(req, res, nextStep);
        }
        else {
          next(firstErr); // done w/ err or no mw
        }
      }
      function nextStep (err) {
        if (err) {
          firstErr = firstErr || err;
          step(middlewares.shift()); // continue
        }
        else {
          next(); // done
        }
      }
    };
  }
};
flow.and = flow.series;