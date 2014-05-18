# middleware-flow [![Build Status](https://travis-ci.org/tjmehta/middleware-flow.png?branch=master)](https://travis-ci.org/tjmehta/middleware-flow)

Middleware control flow library

# Installation
```bash
npm install middleware-flow
```

# Examples

## series(middlewares...)

```js
var series = require('middleware-flow').series;
var app = require('express')();

app.use(series(mw1, mw2, mw2)); // equivalent to app.use(mw1, mw2, mw3);
```

## parallel(middlewares...)

```js
var parallel = require('middleware-flow').parallel;
var app = require('express')();
                                  // runs the middlewares in 'parallel'
app.use(parallel(mw1, mw2, mw2)); // if err, returns the first error that occurred
```

## or(middlewares...)

```js
var or = require('middleware-flow').or;
var app = require('express')();
                                             // runs the middlewares in series, until one passes (no next(err));
app.use(or(user.isOwner, user.isModerator)); // if err, returns the first error that occurred
```

## and(middlewares...)

Same as series.

## if(value).then(middlewares...).else(middlewares...)

```js
var if = require('middleware-flow').if;
var app = require('express')();

app.use(
  if(true)
    .then(one, two, three)
    .else(error)
);
```

## syncIf(fn).then(middlewares...).else(middlewares...)

```js
var syncIf = require('middleware-flow').syncIf;
var app = require('express')();

app.use(
  syncIf(nameQueryExists)   // accepts a sync function that returns a boolean
    .then(one, two, three)  // true -> then, error -> skips all next(err)
    .else(error)
);
function nameQueryExists (req, res) {
  return exists(req.query.name);
}
function exists (val) {
  return val !== null && val !== undefined;
}
```

## asyncIf(fn).then(middlewares...).else(middlewares...)

```js
var asyncIf = require('middleware-flow').asyncIf;
var or = require('middleware-flow').or;
var fs = require('fs');
var app = require('express')();

app.use(
  asyncIf(bodyFileExists)    // expects boolean as the result argument
    .then(one, two, three)   // true -> then, false -> else, error -> skips all next(err)
    .else(other)
);
function logExists (req, res, cb) {
  fs.exists(req.body.file, function (exists) {
    cb(null, exists);
  });
}
```

## mwIf(middleware).then(middlewares...).else(middlewares...)

```js
var mwIf = require('middleware-flow').mwIf;
var or = require('middleware-flow').or;
var app = require('express')();

app.use(
  mwIf(userIsModerator)    // error here, just runs the else middlewares
    .then(one, two, three) // no error -> then, error -> else
    .else(other)           // if other is an error middleware it will recieve
                           // the error else the error will be ignored
);
function userIsModerator (req, res, next) {
  if (!req.user.isModerator) {
    next(new Error('access denied'));
  }
  else {
    next();
  }
}
```

# License
### MIT