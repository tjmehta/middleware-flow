var createCount = require('callback-count');

module.exports = parallelWait;

function parallelWait (/* middlewares */) {
  var args = Array.prototype.slice.call(arguments);

  return function (req, res, next) {
    var middlewares = args.slice(); // copy
    var _err = null;
    var count = createCount(function(err) { next(_err || err); });

    middlewares.forEach(function () {
      count.inc(); // inc first just in case the middlewares are sync
    });

    middlewares.forEach(function (mw) {
      try {
        mw(req, res, function(err) {
          // set aside the error (if it's the first one)
          _err = _err || err;
          // lie to callback-count (waiting all the siblings)
          count.next(null);
        });
      } catch (err) {
        // set aside the error (if it's the first one)
        _err = _err || err;
        // lie to callback-count (waiting all the siblings)
        count.next(null);
      }
    });
  };
}
