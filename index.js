var createCount = require('callback-count');

var flow = module.exports = {};
flow.series = require('./lib/series');
flow.parallel = require('./lib/parallel');
flow.or = require('./lib/or');
flow.next = function (req, res, next) {
  next();
};
flow._execConditional = function (conditional) {
  return function (req, res, next) {
    try {
      if (conditional.type === 'middleware') {
        conditional.if(req, res, function (err) {
          async(err, !err);
        });
      }
      else if (conditional.type === 'async') {
        conditional.if(req, res, async);
      }
      else if (conditional.type === 'sync') {
        sync(conditional.if(req, res));
      }
      else { //if (conditional.type === 'value') {
        sync(conditional.if);
      }
    }
    catch (err) {
      async(err, !err, true);
    }
    function sync (result) {
      if (result) {
        flow.series.apply(null, conditional.then)(req, res, next);
      }
      else {
        flow.series.apply(null, conditional.else)(req, res, next);
      }
    }
    function async (err, result, uncaught) {
      if (err) {
        if (uncaught || conditional.type !== 'middleware' || !conditional.else || !conditional.else[0]) {
          next(err);
        }
        else { // if (conditional.type === 'middleware') {
          if (conditional.else[0].length === 4) {
            conditional.else[0] = conditional.else[0].bind(null, err);
          }
          flow.series.apply(null, conditional.else)(req, res, next);
        }
      }
      else if (result) {
        flow.series.apply(null, conditional.then)(req, res, next);
      }
      else {
        flow.series.apply(null, conditional.else)(req, res, next);
      }
    }
  };
};
flow.conditional = function (type, test) {
  var conditional = {
    type: type,
    if: test
  };
  return thenAndElse(flow._execConditional(conditional), conditional);
};
flow.mwIf = function (mw) {
  return flow.conditional('middleware', mw);
};
flow.syncIf = function (mw) {
  return flow.conditional('sync', mw);
};
flow.asyncIf = function (mw) {
  return flow.conditional('async', mw);
};
flow.if = function (val) {
  return flow.conditional('value', val);
};
flow.and = flow.series;
flow.try = require('./lib/try-catch')(flow.mwIf);

function thenAndElse (exec, conditional) {
  exec.then = function (/* middlewares */) {
    conditional.then = Array.prototype.slice.call(arguments);
    return exec;
  };
  exec.else = function (/* middlewares */) {
    conditional.else = Array.prototype.slice.call(arguments);
    return exec;
  };
  return exec;
}