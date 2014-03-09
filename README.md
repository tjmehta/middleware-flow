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
var flow = require('middleware-flow');
var app = require('express')();
                                  // runs the middlewares in 'parallel'
app.use(parallel(mw1, mw2, mw2)); // if err, returns the first error that occurred
```

## or(middlewares...)

```js
var parallel = require('middleware-flow').parallel;
var app = require('express')();
                                             // runs the middlewares in series, until one passes (no next(err));
app.use(or(user.isOwner, user.isModerator)); // if err, returns the first error that occurred
```

## and(middlewares...)

Same as series.

# License
### MIT