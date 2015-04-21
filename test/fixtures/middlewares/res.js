module.exports = {
  write: function (data) {
    return function (req, res, next) {
      res.write(data);
      next();
    };
  },
  end: function () {
    return function (req, res) {
      res.end();
    };
  },
  send: function (data) {
    return function (req, res) {
      res.send(data);
    };
  },
  sendErr: function () {
    return function (err, req, res, next) { // eslint-disable-line no-unused-vars
      res.send(err.message);
    };
  },
  sendQuery: function () {
    return function (req, res) {
      res.json(req.query);
    };
  }
};
