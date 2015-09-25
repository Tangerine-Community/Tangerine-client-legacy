(function() {
  'use strict';
  var dbs, tests;
  if (Mocha.process.browser) {
    dbs = 'testdb' + Math.random();
  } else {
    dbs = Mocha.process.env.TEST_DB;
  }
  tests = function(dbName) {
    var async;
    async = function(functions, callback) {
      series(functions)(function() {
        var fn;
        callback = callback || function() {};
        if (!functions.length) {
          return callback();
        }
        fn = functions.shift();
        return fn.call(fn, function(err) {
          if (err) {
            callback(err);
            return;
          }
          return series(functions);
        });
      });
      return series(functions);
    };
    return describe('Should get the assessment', function() {
      this.timeout(10000);
      dbs = [];
      afterEach(function() {
        return Promise.all(dbs.map(function(db) {
          console.log("gonna destroy db:" + db);
          return new PouchDB(db).destroy();
        })).then(function() {
          return console.log("PouchDB.resetAllDbs");
        });
      });
      return it('new Pouch registered in allDbs', function(done) {
        var after, myPouch, pouchName;
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        after = function(err) {
          return new PouchDB(pouchName).destroy(function(er) {
            if (er) {
              console.log("i got an error: " + err);
              return done(er);
            } else {
              console.log("we can wrap this thing up: " + err);
              return done(err);
            }
          });
        };
        return myPouch = new PouchDB(pouchName, function(err) {
          var result;
          console.log("Created Pouch: " + pouchName);
          if (err) {
            console.log("i got an error: " + err);
            return after(err);
          }
          result = checkDatabase(myPouch, done);
          return PouchDB.allDbs(function(err, dbs) {
            if (err) {
              return after(err);
            }
            dbs.some(function(dbname) {
              console.log("pouchName: " + pouchName + " dbname: " + dbname);
              return dbname === pouchName;
            }).should.equal(true, 'pouch exists in allDbs database, dbs are ' + JSON.stringify(dbs) + ', tested against ' + pouchName);
            return after();
          });
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
