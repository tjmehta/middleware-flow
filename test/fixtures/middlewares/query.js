var query = module.exports = {};

query.set = function (key, val) {
  return function (req, res, next) {
    req.query = {};
    req.query[key] = val;
    next();
  };
};

query.setAsErr = function (key) {
  return function (err, req, res, next) {
    req.query = {};
    req.query[key] = err;
    next();
  };
};