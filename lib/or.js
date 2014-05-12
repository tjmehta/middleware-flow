module.exports = or;

function or (/* middlewares */) {
  var args = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    var middlewares = args.slice(); // copy
    var firstErr;

    step(middlewares.shift());
    function step (mw) {
      if (mw) {
        try {
          mw(req, res, nextStep);
        }
        catch (e) {
          next(e);
        }
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