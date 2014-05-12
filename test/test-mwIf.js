// var createCount = require('callback-count');
// var Lab = require('lab');

// var describe = Lab.experiment;
// var it = Lab.test;
// var expect = Lab.expect;
// var before = Lab.before;
// var after = Lab.after;
// var request = require('supertest');
// var res = require ('./fixtures/middlewares/res');
// var errMw = require('./fixtures/middlewares/err');
// var throwErr = errMw.throwErr;
// var nextErr = errMw.nextErr;

// var createAppWithMiddleware = require('./fixtures/createAppWithMiddleware');
// var flow = require('../index');
// var mwIf = flow.mwIf;

// describe('or', function() {
//   it('should run middleware passed to then if the mw passes', function(done) {
//     var app = createAppWithMiddleware(
//       mwIf(flow.next)
//         .then(res.write('1'))
//         .else(res.write('2')),
//       res.end()
//     );
//     request(app)
//       .get('/')
//       .expect('1')
//       .end(done);
//   });
//   it('should run middleware passed to else if the mw next(err) (and pass error if accepted)', function(done) {
//     var err = new Error('boom');
//     var app = createAppWithMiddleware(
//       mwIf(nextErr(err))
//         .then(res.write('1'))
//         .else(res.sendErr()),
//       res.end()
//     );
//     request(app)
//       .get('/')
//       .expect(err.message)
//       .end(done);
//   });
//   it('should run middleware passed to else if the mw has uncaught exception (and pass error if accepted)', function(done) {
//     var err = new Error('boom');
//     var app = createAppWithMiddleware(
//       mwIf(throwErr(err))
//         .then(res.write('1'))
//         .else(res.sendErr()),
//       res.end()
//     );
//     request(app)
//       .get('/')
//       .expect(err.message)
//       .end(done);
//   });
//   it('should run middleware passed to else if the mw next(err) (and not pass error if not-accepted)', function(done) {
//     var err = new Error('boom');
//     var app = createAppWithMiddleware(
//       mwIf(nextErr(err))
//         .then(res.write('1'))
//         .else(res.write('2')),
//       res.end()
//     );
//     request(app)
//       .get('/')
//       .expect('2')
//       .end(done);
//   });
// });