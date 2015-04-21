module.exports = {
  throwErr: function (err) {
    return function () {
      throw err;
    };
  },
  nextErr: function (err) {
    return function (req, res, next) {
      next(err);
    };
  },
  wrapAcceptErr: function (mw) {
    return function (err, req, res, next) {
      mw(req, res, function (e) {
        next(e || err);
      });
    };
  },
  ignoreErr: function () {
    return function (err, req, res, next) { // eslint-disable-line handle-callback-err,no-unused-vars
      next();
    };
  },
  extendErrMessage: function (ext) {
    return function (err, req, res, next) {
      err.message = err.message + ext;
      next(err);
    };
  }
};
