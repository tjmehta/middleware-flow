var createCount = require('callback-count');

var flow = module.exports = {
  series: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy
      step(middlewares.shift());
      function step (mw) {
        if (mw) {
          mw(req, res, nextStep);
        }
        else {
          next(); // done
        }
      }
      function nextStep (err) {
        if (err) return next(err);
        step(middlewares.shift()); // continue
      }
    };
  },
  parallel: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var count = createCount(next);
      var middlewares = args.slice(); // copy

      middlewares.forEach(function () {
        count.inc(); // inc first just in case the middlewares are sync
      });
      middlewares.forEach(function (mw) {
        mw(req, res, count.next);
      });
    };
  },
  or: function (/* middlewares */) {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      var middlewares = args.slice(); // copy
      var firstErr;

      step(middlewares.shift());
      function step (mw) {
        if (mw) {
          mw(req, res, nextStep);
        }
        else {
          next(firstErr); // done w/ err or no mw
        }
      }
      function nextStep (err) {
        if (err) {
          firstErr = firstErr || err;
          step(middlewares.shift()); // continue
        }
        else {
          next(); // done
        }
      }
    };
  },
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
          flow.series.apply(null, conditional.else)(req, res, next);
        }
        else {
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
    return thenAndElse(this._execConditional(conditional), conditional);
  },
  mwIf: function (mw) {
    return this.conditional('middleware', mw);
  },
  syncIf: function (mw) {
    return this.conditional('sync', mw);
  },
  asyncIf: function (mw) {
    return this.conditional('async', mw);
  },
  if: function (val) {
    return this.conditional('value', val);
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