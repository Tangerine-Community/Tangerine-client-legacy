(function() {
  'use strict';
  var Tangerine, dbs, tests;
  if (Mocha.process.browser) {
    dbs = 'testdb' + Math.random();
  } else {
    dbs = Mocha.process.env.TEST_DB;
  }
  Tangerine = {};
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
      before('Setup Pouch', function(done) {
        var pouchName;
        this.timeout(5000);
        pouchName = dbName;
        dbs = [dbName];
        console.log("creating Tangerine.db");
        return Tangerine.db = new PouchDB(pouchName, function(err) {
          console.log("Created Pouch: " + pouchName);
          if (err) {
            console.log("i got an error: " + err);
            return done(err);
          } else {
            return done();
          }
        });
      });
      after('Teardown Pouch', function(done) {
        var after, pouchName;
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        after = function(err) {
          return new PouchDB(pouchName).destroy(function(er) {
            if (er) {
              console.log("i got an error: " + er);
              return done(er);
            } else {
              console.log("we can wrap this thing up: " + err);
              return done(err);
            }
          });
        };
        return PouchDB.allDbs(function(err, dbs) {
          if (err) {
            return after(err);
          }
          dbs.some(function(dbname) {
            if (dbname !== pouchName) {
              console.log("pouchName: " + pouchName + " dbname: " + dbname);
              return new PouchDB(dbname).destroy(function(er) {
                if (er) {
                  return console.log("while deleting i got an error: " + er);
                } else {
                  return console.log("good: " + er);
                }
              });
            } else {
              return dbname === pouchName;
            }
          }).should.equal(true, 'pouch exists in allDbs database, dbs are ' + JSON.stringify(dbs) + ', tested against ' + pouchName);
          return after();
        });
      });
      it('Populate pouch with Assessments', function(done) {
        var db;
        db = Tangerine.db;
        return db.get("initialized", function(error, doc) {
          if (!error) {
            return done();
          }
          console.log("initializing database");
          return db.put({
            _id: "_design/tangerine",
            views: {
              byDKey: {
                map: (function(doc) {
                  var id;
                  if (doc.collection === "result") {
                    return;
                  }
                  if (doc.curriculumId) {
                    id = doc.curriculumId;
                    if (doc.collection === "klass") {
                      return;
                    }
                  } else {
                    id = doc.assessmentId;
                  }
                  return emit(id.substr(-5, 5), null);
                }).toString()
              },
              byCollection: {
                map: (function(doc) {
                  var result;
                  if (!doc.collection) {
                    return;
                  }
                  emit(doc.collection, null);
                  if (doc.collection === 'subtest') {
                    return emit("subtest-" + doc.assessmentId);
                  } else if (doc.collection === 'question') {
                    return emit("question-" + doc.subtestId);
                  } else if (doc.collection === 'result') {
                    result = {
                      _id: doc._id
                    };
                    doc.subtestData.forEach(function(subtest) {
                      if (subtest.prototype === "id") {
                        result.participantId = subtest.data.participant_id;
                      }
                      if (subtest.prototype === "complete") {
                        return result.endTime = subtest.data.end_time;
                      }
                    });
                    result.startTime = doc.start_time;
                    return emit("result-" + doc.assessmentId, result);
                  }
                }).toString()
              }
            }
          }).then(function() {
            var doOne, packNumber;
            packNumber = 0;
            doOne = function() {
              var paddedPackNumber;
              paddedPackNumber = ("0000" + packNumber).slice(-4);
              console.log("paddedPackNumber: " + paddedPackNumber);
              return $.ajax({
                dataType: "json",
                url: "../src/js/init/pack" + paddedPackNumber + ".json",
                error: function(res) {
                  console.log("We're done. No more files to process. res.status: " + res.status);
                  return done();
                },
                success: function(res) {
                  packNumber++;
                  console.log("yes! uploaded paddedPackNumber: " + paddedPackNumber);
                  return db.bulkDocs(res.docs, function(error, doc) {
                    if (error) {
                      return alert("could not save initialization document: " + error);
                    }
                    return doOne();
                  });
                }
              });
            };
            return doOne();
          });
        });
      });
      it('Query an Assessment', function(done) {
        var assessment, id;
        console.log("Setting up Backbone sync ");
        Backbone.sync = BackbonePouch.sync({
          db: Tangerine.db,
          fetch: 'view',
          view: 'tangerine/byCollection',
          viewOptions: {
            include_docs: true
          }
        });
        Backbone.Model.prototype.idAttribute = '_id';
        id = "70f8af3b-e1da-3a75-d84e-a7da4be99116";
        assessment = new Assessment({
          "_id": id
        });
        console.log("querying id: " + id);
        return assessment.deepFetch({
          success: function() {
            console.log("assessment: " + JSON.stringify(assessment));
            return done();
          },
          error: function(model, err, cb) {
            console.log("Error: " + JSON.stringify(err));
            return done(err);
          }
        });
      });
      return describe('Give it some context', function() {
        return describe('maybe a bit more context here', function() {
          return it('should run here few assertions', function() {});
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
