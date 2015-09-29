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
        return Tangerine.db = new PouchDB(pouchName, {
          adapter: 'memory'
        }, function(err) {
          console.log("Before: Created Pouch: " + pouchName);
          if (err) {
            console.log("Before: I got an error: " + err);
            return done(err);
          } else {
            return done();
          }
        });
      });
      after('Teardown Pouch', function(done) {
        var pouchName, result;
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        result = Tangerine.db.destroy(function(er) {}).then(function(er) {
          console.log("After: Destroyed db: " + JSON.stringify(result) + " er: " + JSON.stringify(er));
          return done();
        })["catch"](function(er) {
          console.log("After: Problem destroying db: " + er);
          return done(er);
        });
        console.log("clear locastorage" + dbName);
        return localStorage.clear();
      });
      it('Populate pouch with Assessments', function(done) {
        var db;
        db = Tangerine.db;
        return db.get("initialized", function(error, doc) {
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
              return $.ajax({
                dataType: "json",
                url: "../src/js/init/pack" + paddedPackNumber + ".json",
                error: function(res) {
                  console.log("If you get an error starting with 'Error loading resource file', it's probably ok.");
                  console.log("We're done. No more files to process.");
                  return done();
                },
                success: function(res) {
                  packNumber++;
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
      return it('Should return the expected assessment', function(done) {
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
        return assessment.deepFetch().then(function(assessment) {
          expect(assessment.name).to.equal('setHint');
          return done();
        })["catch"](function(err) {
          console.log("Catch Error: " + JSON.stringify(err));
          return done(err);
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
