(function() {
  'use strict';
  var dbs, tests;
  if (Mocha.process.browser) {
    dbs = 'testdb' + Math.random();
  } else {
    dbs = Mocha.process.env.TEST_DB;
  }
  Backbone.history.start();
  Tangerine.addRegions({
    siteNav: "#siteNav"
  });
  Tangerine.addRegions({
    mainRegion: "#content"
  });
  Tangerine.addRegions({
    dashboardRegion: "#dashboard"
  });
  Backbone.Model.prototype.idAttribute = '_id';
  $.i18n.init({
    "fallbackLng": false,
    "lng": "en",
    "resGetPath": "../src/locales/__lng__/translation.json"
  }, function(t) {
    return window.t = t;
  });
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
      before('Setup Tangerine and Pouch', function(done) {
        var pouchName;
        this.$container = $("#view-test-container");
        this.$fixture = $("<div>", {
          id: "fixture"
        });
        this.timeout(5000);
        pouchName = dbName;
        dbs = [dbName];
        Tangerine.db = new PouchDB(pouchName, {
          adapter: 'memory'
        }, function(err) {
          if (err) {
            console.log("Before: I got an error: " + err);
            return done(err);
          } else {
            return done();
          }
        });
        return Backbone.sync = BackbonePouch.sync({
          db: Tangerine.db,
          fetch: 'view',
          view: 'tangerine/byCollection',
          viewOptions: {
            include_docs: true
          }
        });
      });
      after('Teardown Pouch', function(done) {
        var pouchName, result;
        console.log("after");
        this.$container.empty();
        delete this.$fixture;
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        return result = Tangerine.db.destroy(function(er) {}).then(function(er) {
          return done();
        })["catch"](function(er) {
          console.log("After: Problem destroying db: " + er);
          return done(er);
        });
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
      it('Should return the expected assessment', function(done) {
        var assessment, id;
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            Tangerine.assessment = assessment;
            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            return done();
          }
        });
      });
      return it('Should make the view', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              console.log("view.$el.html():" + view.$el.html());
              return expect(view.$el.text()).to.contain("01. LTTP2 2015 - Student");
            });
            view.render();
            return done();
          }
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
