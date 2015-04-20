var express = require('express');
var mw = require('../../index');

module.exports = function createAppWithMiddlewares (/* middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments);
  var app = express();
  app.use(express.bodyParser());
  middlewares.forEach(function (mw) {
    app.use(mw);
  });
  return app;
};
