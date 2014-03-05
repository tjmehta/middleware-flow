var createCount = require('callback-count');

var flow = module.exports = {
  series: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy

      step(middlewares.unshift());
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
        step(middlewares.unshift()); // continue
      }
    };
  },
  parallel: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var count = createCount(next);
      var middlewares = args.slice(); // copy

      middlewares.forEach(function (mw) {
        mw(req, res, count.inc().next);
      });
    };
  },
  or: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy
      var firstErr;

      step(middlewares.unshift());
      function step (mw) {
        if (mw) {
          mw(req, res, nextStep);
        }
        else {
          next(firstErr); // done w/ err
        }
      }
      function nextStep (err) {
        if (err) {
          firstErr = firstErr || err;
          step(middlewares.unshift()); // continue
        }
        else {
          next(); // done
        }
      }
    };
  },
};