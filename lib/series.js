var findIndex = require('101/find-index');
var hasProps = require('101/has-properties');
var isFunction = require('101/is-function');
var lengthOf = function (len) {
  return hasProps({ length: len });
};

module.exports = series;

function series (/* middlewares */) {
  var args = Array.prototype.slice.call(arguments);
  if (!args.every(isFunction)) {
    throw new TypeError('middlewares must be functions');
  }
  return function (req, res, next) {
    var middlewares = args.slice(); // copy
    // if (arguments.length === 4) { // force being used as error middleware
    //   errorStep(req); // req is err - [err, req, res, next]
    // }
    // else {
      step(middlewares.shift());
    // }
    function step (mw) {
      if (mw) {
        try {
          if (mw.length === 4) {
            return step(middlewares.shift());
          }
          mw(req, res, function (err) {
            if (err) {
              errorStep(err);
            }
            else {
              step(middlewares.shift());
            }
          });
        }
        catch (err) {
          errorStep(err);
        }
      }
      else {
        next(); // done
      }
    }
    function errorStep (err) {
      var errorIndex = findIndex(middlewares, lengthOf(4));
      var mw;
      if (~errorIndex) {
        middlewares = middlewares.slice(errorIndex);
        mw = middlewares.shift();
        try {
          mw(err, req, res, function (e) {
            if (e) {
              errorStep(e);
            }
            else {
              step(middlewares.shift());
            }
          });
        }
        catch (e) {
          errorStep(e);
        }
      }
      else {
        next(err); // done
      }
    }
  };
}