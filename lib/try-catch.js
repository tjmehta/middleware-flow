var series = require('./series');
var hasProps = require('101/has-properties');

module.exports = function (mwIf) {
  return function (/* middlewares */) {
    var middlewares = Array.prototype.slice.call(arguments);
    if (middlewares.some(hasProps({length:4}))) {
      throw new Error('"try" should get any err middlewares');
    }
    else {
      var mw = mwIf.apply(null, middlewares);
      mw.catch = mw.else;
      return mw;
    }
  };
};