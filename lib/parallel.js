var createCount = require('callback-count');

module.exports = parallel;

function parallel (/* middlewares */) {
  var args = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    var count = createCount(next);
    var middlewares = args.slice(); // copy

    middlewares.forEach(function () {
      count.inc(); // inc first just in case the middlewares are sync
    });
    middlewares.forEach(function (mw) {
      try {
        mw(req, res, count.next);
      }
      catch (err) {
        count.next(err);
      }
    });
  };
}