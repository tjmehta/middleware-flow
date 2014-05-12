var createCount = require('callback-count');

var flow = module.exports = {
  series: require('./lib/series'),
  parallel: require('./lib/parallel'),
  or: require('./lib/or'),
  next: function (req, res, next) {
    next();
  },
  _execConditional: function (conditional) {
    return function (req, res, next) {
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
      else if (conditional.type === 'value') {
        sync(conditional.if);
      }
      else {
        throw new Error('unknown conditional type');
      }
      function sync (result) {
        if (result) {
          flow.series.apply(null, conditional.then)(req, res, next);
        }
        else {
          flow.series.apply(null, conditional.else)(req, res, next);
        }
      }
      function async (err, result) {
        if (err || !result) {
          if (exists(err)) {
            req.lastError = err;
          }
          flow.series.apply(null, conditional.else)(req, res, next);
        }
        else {
          // TODO
          // if (err && conditional.then[0] && conditional.then[0].length === 4) {
          //   console.log('fjdksl;afjksdla;fsda');
          //   conditional.then[0] = conditional.then[0].bind(null, err);
          // }
          flow.series.apply(null, conditional.then)(req, res, next);
        }
      }
    };
  },
  conditional: function (type, test) {
    var conditional = {
      type: type,
      if: test
    };
    return thenAndElse(flow._execConditional(conditional), conditional);
  },
  mwIf: function (mw) {
    return flow.conditional('middleware', mw);
  },
  syncIf: function (mw) {
    return flow.conditional('sync', mw);
  },
  asyncIf: function (mw) {
    return flow.conditional('async', mw);
  },
  if: function (val) {
    return flow.conditional('value', val);
  }
};
flow.and = flow.series;

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

function exists (v) {
  return v !== null && v !== undefined;
}

function lengthOf (i) {
  return function (foo) {
    return foo.length === i;
  };
}
