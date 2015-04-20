var res = module.exports = {
  write: function (data) {
    return function (req, res, next) {
      res.write(data);
      next();
    };
  },
  end: function () {
    return function (req, res, next) {
      res.end();
    };
  },
  send: function (data) {
    return function (req, res, next) {
      res.send(data);
    };
  },
  sendErr: function () {
    return function (err, req, res, next) {
      res.send(err.message);
    };
  },
  sendQuery: function () {
    return function (req, res, next) {
      res.json(req.query);
    };
  }
};
