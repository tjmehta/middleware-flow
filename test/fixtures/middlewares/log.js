module.exports = log;

function log (/* args */) {
  var args = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    console.log.apply(console, args);
    next();
  };
}