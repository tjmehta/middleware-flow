var createCount = require('callback-count');
var noop = require('101/noop');

var flow = module.exports = {};
flow.series = require('./lib/series');
flow.parallel = require('./lib/parallel');
flow.parallelWait = require('./lib/parallel-wait');
flow.or = require('./lib/or');
flow.each = require('./lib/each');
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
        if (uncaught || conditional.type !== 'middleware') {
          next(err);
        }
        else { // if (conditional.type === 'middleware') {
          if (conditional.else && conditional.else[0]) {
            if (conditional.else[0].length === 4) {
              var newElse = conditional.else.slice(); // shallow clone
              newElse[0] = newElse[0].bind(null, err);
              flow.series.apply(null, newElse)(req, res, next);
            }
            else {
              flow.series.apply(null, conditional.else)(req, res, next);
            }
          } else {
            next();
          }
        }
      }
      else if (result) {
        flow.series.apply(null, conditional.then)(req, res, next);
      }
      else if (conditional.else && conditional.else[0]) {
        flow.series.apply(null, conditional.else)(req, res, next);
      } else {
        next();
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
flow.bg = flow.background = function (/* middlewares */) {
  var mw = flow.series.apply(flow, arguments);
  return function (req, res, next) {
    mw(req, res, noop);
    next();
  };
};

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
