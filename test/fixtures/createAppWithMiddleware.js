var express = require('express');
var bodyParser = require('body-parser');

module.exports = function createAppWithMiddlewares (/* middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments);
  var app = express();
  app.use(bodyParser.json());
  middlewares.forEach(function (mw) {
    app.use(mw);
  });
  return app;
};
