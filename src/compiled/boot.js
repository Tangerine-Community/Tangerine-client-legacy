Tangerine.bootSequence = {
  basicConfig: function(callback) {

    /*
    Pouch configuration
     */
    Tangerine.db = new PouchDB(Tangerine.conf.db_name);
    Backbone.sync = BackbonePouch.sync({
      db: Tangerine.db,
      fetch: 'view',
      view: 'tangerine/byCollection',
      viewOptions: {
        include_docs: true
      }
    });
    Backbone.Model.prototype.idAttribute = '_id';
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };
    return callback();

    /*
    Tangerine.db.destroy (error) ->
      return alert error if error?
    
      Tangerine.db = new PouchDB("tangerine")
      Backbone.sync = BackbonePouch.sync
        db: Tangerine.db
    
    
      callback()
     */
  },
  checkDatabase: function(callback) {
    var db;
    db = Tangerine.db;
    return db.get("initialized", function(error, doc) {
      if (!error) {
        return callback();
      }
      console.log("initializing database");
      return db.put({
        _id: "_design/" + Tangerine.conf.design_doc,
        views: {

          /*
            Used for replication.
            Will give one key for all documents associated with an assessment or curriculum.
           */
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
            url: "js/init/pack" + paddedPackNumber + ".json",
            error: function(res) {
              if (res.status === 404) {
                return db.put({
                  "_id": "initialized"
                }).then(function() {
                  return callback();
                });
              }
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
  },
  versionTag: function(callback) {
    $("#footer").append("<div id='version'>" + Tangerine.version + "-" + Tangerine.buildVersion + "</div>");
    return callback();
  },
  fetchSettings: function(callback) {
    Tangerine.settings = new Settings({
      "_id": "settings"
    });
    return Tangerine.settings.fetch({
      success: callback,
      error: function() {
        return Tangerine.settings.save(Tangerine.defaults.settings, {
          error: function() {
            console.error(arguments);
            return alert("Could not save default settings");
          },
          success: callback
        });
      }
    });
  },
  guaranteeInstanceId: function(callback) {
    if (!Tangerine.settings.has("instanceId")) {
      return Tangerine.settings.save({
        "instanceId": Utils.humanGUID()
      }, {
        error: function() {
          return alert("Could not save new Instance Id");
        },
        success: callback
      });
    } else {
      return callback();
    }
  },
  documentReady: function(callback) {
    return $(function() {
      return callback();
    });
  },
  loadI18n: function(callback) {
    return i18n.init({
      fallbackLng: "en-US",
      lng: Tangerine.settings.get("language"),
      resStore: Tangerine.locales
    }, function(err, t) {
      window.t = t;
      return callback();
    });
  },
  handleCordovaEvents: function(callback) {
    var error, error1;
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
      console.log("loading cordova methods");
      try {
        cordova.file.writeTextToFile = function(params, callback) {
          return window.resolveLocalFileSystemURL(params.path, function(dir) {
            return dir.getFile(params.fileName, {
              create: true
            }, function(file) {
              if (!file) {
                return callback.error('dir.getFile failed');
              }
              return file.createWriter(function(fileWriter) {
                var blob;
                if (params.append === true) {
                  fileWriter.seek(fileWriter.length);
                }
                blob = new Blob([params.text], {
                  type: 'text/plain'
                });
                fileWriter.write(blob);
                return callback.success(file);
              }, function(error) {
                return callback.error(error);
              });
            });
          });
        };
        Utils.saveRecordsToFile = function() {
          return cordova.file.writeTextToFile({
            text: 'The date is ' + (new Date()),
            path: cordova.file.externalDataDirectory,
            fileName: 'example-file.txt',
            append: false
          }, {
            success: function(file) {
              console.log("Success! Look for the file at " + file.nativeURL);
              return console.log(file);
            },
            error: function(error) {
              return console.log(error);
            }
          });
        };
      } catch (error1) {
        error = error1;
        console.log("Unable to fetch script. Error: " + error);
      }
    }
    return callback();
  },
  loadSingletons: function(callback) {
    window.vm = new ViewManager();
    Tangerine.router = new Router();
    Tangerine.user = new TabletUser();
    Tangerine.nav = new NavigationView({
      user: Tangerine.user,
      router: Tangerine.router
    });
    Tangerine.log = new Log();
    Tangerine.session = new Session();
    Tangerine.app = new Marionette.Application();
    Tangerine.app.rm = new Marionette.RegionManager();
    Tangerine.app.rm.addRegions({
      siteNav: "#siteNav"
    });
    Tangerine.app.rm.addRegions({
      mainRegion: "#content"
    });
    Tangerine.app.rm.addRegions({
      dashboardRegion: "#dashboard"
    });
    return callback();
  },
  reloadUserSession: function(callback) {
    return Tangerine.user.sessionRefresh({
      error: function() {
        return Tangerine.user.logout();
      },
      success: callback
    });
  },
  startBackbone: function(callback) {
    Backbone.history.start();
    return callback();
  },
  monitorBrowserBack: function(callback) {
    return window.addEventListener('popstate', function(e) {
      var sendTo;
      sendTo = Backbone.history.getFragment();
      return Tangerine.router.navigate(sendTo, {
        trigger: true,
        replace: true
      });
    });
  }
};

Tangerine.boot = function() {
  var sequence;
  sequence = [Tangerine.bootSequence.handleCordovaEvents, Tangerine.bootSequence.basicConfig, Tangerine.bootSequence.checkDatabase, Tangerine.bootSequence.versionTag, Tangerine.bootSequence.fetchSettings, Tangerine.bootSequence.guaranteeInstanceId, Tangerine.bootSequence.documentReady, Tangerine.bootSequence.loadI18n, Tangerine.bootSequence.loadSingletons, Tangerine.bootSequence.reloadUserSession, Tangerine.bootSequence.startBackbone];
  return Utils.execute(sequence);
};

Tangerine.boot();

//# sourceMappingURL=data:application/json;base64,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LE9BQUEsRUFBUyxJQUFYO1FBQWlCLE9BQUEsRUFBUyxJQUExQjtPQUFsQztJQUZrQyxDQUFwQztFQURrQixDQS9RcEI7OztBQXFSRixTQUFTLENBQUMsSUFBVixHQUFpQixTQUFBO0FBRWYsTUFBQTtFQUFBLFFBQUEsR0FBVyxDQUNULFNBQVMsQ0FBQyxZQUFZLENBQUMsbUJBRGQsRUFFVCxTQUFTLENBQUMsWUFBWSxDQUFDLFdBRmQsRUFHVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBSGQsRUFJVCxTQUFTLENBQUMsWUFBWSxDQUFDLFVBSmQsRUFLVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBTGQsRUFNVCxTQUFTLENBQUMsWUFBWSxDQUFDLG1CQU5kLEVBT1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQVBkLEVBUVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQVJkLEVBU1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxjQVRkLEVBVVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxpQkFWZCxFQVdULFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFYZDtTQWVYLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBZDtBQWpCZTs7QUFtQmpCLFNBQVMsQ0FBQyxJQUFWLENBQUEiLCJmaWxlIjoiYm9vdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuIyBUaGlzIGZpbGUgbG9hZHMgdGhlIG1vc3QgYmFzaWMgc2V0dGluZ3MgcmVsYXRlZCB0byBUYW5nZXJpbmUgYW5kIGtpY2tzIG9mZiBCYWNrYm9uZSdzIHJvdXRlci5cbiMgICAqIFRoZSBkb2MgYGNvbmZpZ3VyYXRpb25gIGhvbGRzIHRoZSBtYWpvcml0eSBvZiBzZXR0aW5ncy5cbiMgICAqIFRoZSBTZXR0aW5ncyBvYmplY3QgY29udGFpbnMgbWFueSBjb252ZW5pZW5jZSBmdW5jdGlvbnMgdGhhdCB1c2UgY29uZmlndXJhdGlvbidzIGRhdGEuXG4jICAgKiBUZW1wbGF0ZXMgc2hvdWxkIGNvbnRhaW4gb2JqZWN0cyBhbmQgY29sbGVjdGlvbnMgb2Ygb2JqZWN0cyByZWFkeSB0byBiZSB1c2VkIGJ5IGEgRmFjdG9yeS5cbiMgQWxzbyBpbnRpYWxpemVkIGhlcmUgYXJlOiBCYWNrYm9uZS5qcywgYW5kIGpRdWVyeS5pMThuXG4jIEFueXRoaW5nIHRoYXQgZmFpbHMgYmFkIGhlcmUgc2hvdWxkIHByb2JhYmx5IGJlIGZhaWxpbmcgaW4gZnJvbnQgb2YgdGhlIHVzZXIuXG5cbiMgVXRpbHMuZGlzYWJsZUNvbnNvbGVMb2coKVxuIyBVdGlscy5kaXNhYmxlQ29uc29sZUFzc2VydCgpXG5cblRhbmdlcmluZS5ib290U2VxdWVuY2UgPVxuXG4gICMgQmFzaWMgY29uZmlndXJhdGlvblxuXG4gIGJhc2ljQ29uZmlnIDogKGNhbGxiYWNrKSAtPlxuXG4gICAgIyMjXG4gICAgUG91Y2ggY29uZmlndXJhdGlvblxuICAgICMjI1xuXG4gICAgVGFuZ2VyaW5lLmRiID0gbmV3IFBvdWNoREIoVGFuZ2VyaW5lLmNvbmYuZGJfbmFtZSlcbiAgICBCYWNrYm9uZS5zeW5jID0gQmFja2JvbmVQb3VjaC5zeW5jXG4gICAgICBkYjogVGFuZ2VyaW5lLmRiXG4gICAgICBmZXRjaDogJ3ZpZXcnXG4gICAgICB2aWV3OiAndGFuZ2VyaW5lL2J5Q29sbGVjdGlvbidcbiAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICBpbmNsdWRlX2RvY3MgOiB0cnVlXG5cbiAgICBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuaWRBdHRyaWJ1dGUgPSAnX2lkJ1xuXG4gICAgIyBzZXQgdW5kZXJzY29yZSdzIHRlbXBsYXRlIGVuZ2luZSB0byBhY2NlcHQgaGFuZGxlYmFyLXN0eWxlIHZhcmlhYmxlc1xuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IGludGVycG9sYXRlIDogL1xce1xceyguKz8pXFx9XFx9L2dcblxuICAgIGNhbGxiYWNrKClcblxuICAgICMjI1xuICAgIFRhbmdlcmluZS5kYi5kZXN0cm95IChlcnJvcikgLT5cbiAgICAgIHJldHVybiBhbGVydCBlcnJvciBpZiBlcnJvcj9cblxuICAgICAgVGFuZ2VyaW5lLmRiID0gbmV3IFBvdWNoREIoXCJ0YW5nZXJpbmVcIilcbiAgICAgIEJhY2tib25lLnN5bmMgPSBCYWNrYm9uZVBvdWNoLnN5bmNcbiAgICAgICAgZGI6IFRhbmdlcmluZS5kYlxuXG5cbiAgICAgIGNhbGxiYWNrKClcbiAgICAjIyNcblxuICAjIENoZWNrIGZvciBuZXcgZGF0YWJhc2UsIGluaXRpYWxpemUgd2l0aCBwYWNrcyBpZiBub25lIGV4aXN0c1xuICBjaGVja0RhdGFiYXNlOiAoY2FsbGJhY2spIC0+XG5cbiAgICAjIExvY2FsIHRhbmdlcmluZSBkYXRhYmFzZSBoYW5kbGVcbiAgICBkYiA9IFRhbmdlcmluZS5kYlxuXG4gICAgZGIuZ2V0IFwiaW5pdGlhbGl6ZWRcIiwgKGVycm9yLCBkb2MpIC0+XG5cbiAgICAgIHJldHVybiBjYWxsYmFjaygpIHVubGVzcyBlcnJvclxuXG4gICAgICBjb25zb2xlLmxvZyBcImluaXRpYWxpemluZyBkYXRhYmFzZVwiXG5cbiAgICAgICMgU2F2ZSB2aWV3c1xuICAgICAgZGIucHV0KFxuICAgICAgICBfaWQ6IFwiX2Rlc2lnbi8je1RhbmdlcmluZS5jb25mLmRlc2lnbl9kb2N9XCJcbiAgICAgICAgdmlld3M6XG4gICAgICAgICAgIyMjXG4gICAgICAgICAgICBVc2VkIGZvciByZXBsaWNhdGlvbi5cbiAgICAgICAgICAgIFdpbGwgZ2l2ZSBvbmUga2V5IGZvciBhbGwgZG9jdW1lbnRzIGFzc29jaWF0ZWQgd2l0aCBhbiBhc3Nlc3NtZW50IG9yIGN1cnJpY3VsdW0uXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgYnlES2V5OlxuICAgICAgICAgICAgbWFwOiAoKGRvYykgLT5cbiAgICAgICAgICAgICAgcmV0dXJuIGlmIGRvYy5jb2xsZWN0aW9uIGlzIFwicmVzdWx0XCJcblxuICAgICAgICAgICAgICBpZiBkb2MuY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgaWQgPSBkb2MuY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgIyBEbyBub3QgcmVwbGljYXRlIGtsYXNzZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgZG9jLmNvbGxlY3Rpb24gaXMgXCJrbGFzc1wiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZCA9IGRvYy5hc3Nlc3NtZW50SWRcblxuICAgICAgICAgICAgICBlbWl0IGlkLnN1YnN0cigtNSw1KSwgbnVsbFxuICAgICAgICAgICAgKS50b1N0cmluZygpXG5cbiAgICAgICAgICBieUNvbGxlY3Rpb246XG4gICAgICAgICAgICBtYXAgOiAoIChkb2MpIC0+XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBkb2MuY29sbGVjdGlvblxuXG4gICAgICAgICAgICAgIGVtaXQgZG9jLmNvbGxlY3Rpb24sIG51bGxcblxuICAgICAgICAgICAgICAjIEJlbG9uZ3MgdG8gcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAgIGlmIGRvYy5jb2xsZWN0aW9uIGlzICdzdWJ0ZXN0J1xuICAgICAgICAgICAgICAgIGVtaXQgXCJzdWJ0ZXN0LSN7ZG9jLmFzc2Vzc21lbnRJZH1cIlxuXG4gICAgICAgICAgICAgICMgQmVsb25ncyB0byByZWxhdGlvbnNoaXBcbiAgICAgICAgICAgICAgZWxzZSBpZiBkb2MuY29sbGVjdGlvbiBpcyAncXVlc3Rpb24nXG4gICAgICAgICAgICAgICAgZW1pdCBcInF1ZXN0aW9uLSN7ZG9jLnN1YnRlc3RJZH1cIlxuXG4gICAgICAgICAgICAgIGVsc2UgaWYgZG9jLmNvbGxlY3Rpb24gaXMgJ3Jlc3VsdCdcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBfaWQgOiBkb2MuX2lkXG4gICAgICAgICAgICAgICAgZG9jLnN1YnRlc3REYXRhLmZvckVhY2ggKHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LnByb3RvdHlwZSBpcyBcImlkXCIgdGhlbiByZXN1bHQucGFydGljaXBhbnRJZCA9IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5wcm90b3R5cGUgaXMgXCJjb21wbGV0ZVwiIHRoZW4gcmVzdWx0LmVuZFRpbWUgPSBzdWJ0ZXN0LmRhdGEuZW5kX3RpbWVcbiAgICAgICAgICAgICAgICByZXN1bHQuc3RhcnRUaW1lID0gZG9jLnN0YXJ0X3RpbWVcbiAgICAgICAgICAgICAgICBlbWl0IFwicmVzdWx0LSN7ZG9jLmFzc2Vzc21lbnRJZH1cIiwgcmVzdWx0XG5cbiAgICAgICAgICAgICkudG9TdHJpbmcoKVxuXG4gICAgICApLnRoZW4gLT5cblxuICAgICAgICAjXG4gICAgICAgICMgTG9hZCBQYWNrcyB0aGF0IFRyZWUgY3JlYXRlcyBmb3IgYW4gQVBLLCB0aGVuIGxvYWQgdGhlIFBhY2tzIHdlIHVzZSBmb3JcbiAgICAgICAgIyBkZXZlbG9wbWVudCBwdXJwb3Nlcy5cbiAgICAgICAgI1xuXG4gICAgICAgIHBhY2tOdW1iZXIgPSAwXG5cbiAgICAgICAgIyBSZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCB3aWxsIGl0ZXJhdGUgdGhyb3VnaCBqcy9pbml0L3BhY2swMDBbMC14XSB1bnRpbFxuICAgICAgICAjIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldHVybmVkIHBhY2suXG4gICAgICAgIGRvT25lID0gLT5cblxuICAgICAgICAgIHBhZGRlZFBhY2tOdW1iZXIgPSAoXCIwMDAwXCIgKyBwYWNrTnVtYmVyKS5zbGljZSgtNClcblxuICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICB1cmw6IFwianMvaW5pdC9wYWNrI3twYWRkZWRQYWNrTnVtYmVyfS5qc29uXCJcbiAgICAgICAgICAgIGVycm9yOiAocmVzKSAtPlxuICAgICAgICAgICAgICAjIE5vIG1vcmUgcGFjaz8gV2UncmUgYWxsIGRvbmUgaGVyZS5cbiAgICAgICAgICAgICAgaWYgcmVzLnN0YXR1cyBpcyA0MDRcbiAgICAgICAgICAgICAgICAjIE1hcmsgdGhpcyBkYXRhYmFzZSBhcyBpbml0aWFsaXplZCBzbyB0aGF0IHRoaXMgcHJvY2VzcyBkb2VzIG5vdFxuICAgICAgICAgICAgICAgICMgcnVuIGFnYWluIG9uIHBhZ2UgcmVmcmVzaCwgdGhlbiBsb2FkIERldmVsb3BtZW50IFBhY2tzLlxuICAgICAgICAgICAgICAgIGRiLnB1dCh7XCJfaWRcIjpcImluaXRpYWxpemVkXCJ9KS50aGVuKCAtPiBjYWxsYmFjaygpIClcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXMpIC0+XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXIrK1xuXG4gICAgICAgICAgICAgIGRiLmJ1bGtEb2NzIHJlcy5kb2NzLCAoZXJyb3IsIGRvYykgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsZXJ0IFwiY291bGQgbm90IHNhdmUgaW5pdGlhbGl6YXRpb24gZG9jdW1lbnQ6ICN7ZXJyb3J9XCJcbiAgICAgICAgICAgICAgICBkb09uZSgpXG5cbiAgICAgICAgIyBraWNrIG9mZiByZWN1cnNpdmUgcHJvY2Vzc1xuICAgICAgICBkb09uZSgpXG5cbiAgIyBQdXQgdGhpcyB2ZXJzaW9uJ3MgaW5mb3JtYXRpb24gaW4gdGhlIGZvb3RlclxuICB2ZXJzaW9uVGFnOiAoIGNhbGxiYWNrICkgLT5cbiAgICAkKFwiI2Zvb3RlclwiKS5hcHBlbmQoXCI8ZGl2IGlkPSd2ZXJzaW9uJz4je1RhbmdlcmluZS52ZXJzaW9ufS0je1RhbmdlcmluZS5idWlsZFZlcnNpb259PC9kaXY+XCIpXG4gICAgY2FsbGJhY2soKVxuXG4gICMgZ2V0IG91ciBsb2NhbCBUYW5nZXJpbmUgc2V0dGluZ3NcbiAgIyB0aGVzZSBkbyB0ZW5kIHRvIGNoYW5nZSBkZXBlbmRpbmcgb24gdGhlIHBhcnRpY3VsYXIgaW5zdGFsbCBvZiB0aGVcbiAgZmV0Y2hTZXR0aW5ncyA6ICggY2FsbGJhY2sgKSAtPlxuICAgIFRhbmdlcmluZS5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyBcIl9pZFwiIDogXCJzZXR0aW5nc1wiXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLmZldGNoXG4gICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5zYXZlIFRhbmdlcmluZS5kZWZhdWx0cy5zZXR0aW5ncyxcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgYXJndW1lbnRzXG4gICAgICAgICAgICBhbGVydCBcIkNvdWxkIG5vdCBzYXZlIGRlZmF1bHQgc2V0dGluZ3NcIlxuICAgICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG5cbiAgIyBmb3IgdXBncmFkZXNcbiAgZ3VhcmFudGVlSW5zdGFuY2VJZDogKCBjYWxsYmFjayApIC0+XG4gICAgdW5sZXNzIFRhbmdlcmluZS5zZXR0aW5ncy5oYXMoXCJpbnN0YW5jZUlkXCIpXG4gICAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZVxuICAgICAgICBcImluc3RhbmNlSWRcIiA6IFV0aWxzLmh1bWFuR1VJRCgpXG4gICAgICAsXG4gICAgICAgIGVycm9yOiAtPiBhbGVydCBcIkNvdWxkIG5vdCBzYXZlIG5ldyBJbnN0YW5jZSBJZFwiXG4gICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2soKVxuXG4gIGRvY3VtZW50UmVhZHk6ICggY2FsbGJhY2sgKSAtPiAkIC0+XG5cbiAgICAjJChcIjxidXR0b24gaWQ9J3JlbG9hZCc+cmVsb2FkIG1lPC9idXR0b24+XCIpLmFwcGVuZFRvKFwiI2Zvb3RlclwiKS5jbGljayAtPiBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4gICAgY2FsbGJhY2soKVxuXG4gIGxvYWRJMThuOiAoIGNhbGxiYWNrICkgLT5cbiAgICBpMThuLmluaXRcbiAgICAgIGZhbGxiYWNrTG5nIDogXCJlbi1VU1wiXG4gICAgICBsbmcgICAgICAgICA6IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJsYW5ndWFnZVwiKVxuICAgICAgcmVzU3RvcmUgICAgOiBUYW5nZXJpbmUubG9jYWxlc1xuICAgICwgKGVyciwgdCkgLT5cbiAgICAgIHdpbmRvdy50ID0gdFxuICAgICAgY2FsbGJhY2soKVxuXG4gIGhhbmRsZUNvcmRvdmFFdmVudHM6ICggY2FsbGJhY2sgKSAtPlxuIyAgICBjb25zb2xlLmxvZyhcInRyeWluZyB0byBsb2FkIGNvcmRvdmFcIilcbiAgICAjIExvYWQgY29yZG92YS5qcyBpZiB3ZSBhcmUgaW4gYSBjb3Jkb3ZhIGNvbnRleHRcbiAgICBpZihuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBob25lfGlQb2R8aVBhZHxBbmRyb2lkfEJsYWNrQmVycnl8SUVNb2JpbGUpLykpXG4gICAgICBjb25zb2xlLmxvZyhcImxvYWRpbmcgY29yZG92YSBtZXRob2RzXCIpXG4jICAgICAgeGhyT2JqID0gIG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICB0cnlcbiMgICAgICAgIHhock9iai5vcGVuKCdHRVQnLCAnY29yZG92YS5qcycsIGZhbHNlKVxuIyAgICAgICAgeGhyT2JqLnNlbmQoJycpXG4jICAgICAgICBzZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4jICAgICAgICBzZS50ZXh0ID0geGhyT2JqLnJlc3BvbnNlVGV4dFxuIyAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzZSlcblxuICAgICAgICAjICAvKlxuICAgICAgICAjICogQXR0YWNoIGEgd3JpdGVUZXh0VG9GaWxlIG1ldGhvZCB0byBjb3Jkb3ZhLmZpbGUgQVBJLlxuICAgICAgICAjICpcbiAgICAgICAgIyAqIHBhcmFtcyA9IHtcbiAgICAgICAgIyAqICB0ZXh0OiAnVGV4dCB0byBnbyBpbnRvIHRoZSBmaWxlLicsXG4gICAgICAgICMgKiAgcGF0aDogJ2ZpbGU6Ly9wYXRoL3RvL2RpcmVjdG9yeScsXG4gICAgICAgICMqICBmaWxlTmFtZTogJ25hbWUtb2YtdGhlLWZpbGUudHh0JyxcbiAgICAgICAgIyogIGFwcGVuZDogZmFsc2VcbiAgICAgICAgIyogfVxuICAgICAgICAjKlxuICAgICAgICAjKiBjYWxsYmFjayA9IHtcbiAgICAgICAgIyogICBzdWNjZXNzOiBmdW5jdGlvbihmaWxlKSB7fSxcbiAgICAgICAgIyogICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHt9XG4gICAgICAgICMqIH1cbiAgICAgICAgIypcbiAgICAgICAgIyovXG4gICAgICAgIGNvcmRvdmEuZmlsZS53cml0ZVRleHRUb0ZpbGUgPSAocGFyYW1zLCBjYWxsYmFjaykgLT5cbiAgICAgICAgICB3aW5kb3cucmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTChwYXJhbXMucGF0aCwgKGRpcikgLT5cbiAgICAgICAgICAgIGRpci5nZXRGaWxlKHBhcmFtcy5maWxlTmFtZSwge2NyZWF0ZTp0cnVlfSwgKGZpbGUpIC0+XG4gICAgICAgICAgICAgIGlmICghZmlsZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suZXJyb3IoJ2Rpci5nZXRGaWxlIGZhaWxlZCcpXG4gICAgICAgICAgICAgIGZpbGUuY3JlYXRlV3JpdGVyKFxuICAgICAgICAgICAgICAgIChmaWxlV3JpdGVyKSAtPlxuICAgICAgICAgICAgICAgICAgaWYgcGFyYW1zLmFwcGVuZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIuc2VlayhmaWxlV3JpdGVyLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIGJsb2IgPSBuZXcgQmxvYihbcGFyYW1zLnRleHRdLCB7dHlwZTondGV4dC9wbGFpbid9KVxuICAgICAgICAgICAgICAgICAgZmlsZVdyaXRlci53cml0ZShibG9iKVxuICAgICAgICAgICAgICAgICAgY2FsbGJhY2suc3VjY2VzcyhmaWxlKVxuICAgICAgICAgICAgICAsKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmVycm9yKGVycm9yKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuXG4gICAgICAgICMvKlxuICAgICAgICAjICogVXNlIHRoZSB3cml0ZVRleHRUb0ZpbGUgbWV0aG9kLlxuICAgICAgICAjICovXG4gICAgICAgIFV0aWxzLnNhdmVSZWNvcmRzVG9GaWxlID0gKCkgLT5cbiAgICAgICAgICBjb3Jkb3ZhLmZpbGUud3JpdGVUZXh0VG9GaWxlKHtcbiAgICAgICAgICAgIHRleHQ6ICAnVGhlIGRhdGUgaXMgJyArIChuZXcgRGF0ZSgpKSxcbiAgICAgICAgICAgIHBhdGg6IGNvcmRvdmEuZmlsZS5leHRlcm5hbERhdGFEaXJlY3RvcnksXG4gICAgICAgICAgICBmaWxlTmFtZTogJ2V4YW1wbGUtZmlsZS50eHQnLFxuICAgICAgICAgICAgYXBwZW5kOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3VjY2VzczogKGZpbGUpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdWNjZXNzISBMb29rIGZvciB0aGUgZmlsZSBhdCBcIiArIGZpbGUubmF0aXZlVVJMKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpXG4gICAgICAgICAgICAgICwgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcblxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gZmV0Y2ggc2NyaXB0LiBFcnJvcjogXCIgKyBlcnJvcilcbiAgICBjYWxsYmFjaygpXG5cbiAgbG9hZFNpbmdsZXRvbnM6ICggY2FsbGJhY2sgKSAtPlxuICAgICMgU2luZ2xldG9uc1xuICAgIHdpbmRvdy52bSA9IG5ldyBWaWV3TWFuYWdlcigpXG4gICAgVGFuZ2VyaW5lLnJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuICAgIFRhbmdlcmluZS51c2VyICAgPSBuZXcgVGFibGV0VXNlcigpXG4gICAgVGFuZ2VyaW5lLm5hdiAgICA9IG5ldyBOYXZpZ2F0aW9uVmlld1xuICAgICAgdXNlciAgIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgIHJvdXRlciA6IFRhbmdlcmluZS5yb3V0ZXJcbiAgICBUYW5nZXJpbmUubG9nICAgID0gbmV3IExvZygpXG4gICAgVGFuZ2VyaW5lLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpXG5cbiAgICAjICBpbml0ICBUYW5nZXJpbmUgYXMgYSBNYXJpb25ldHRlIGFwcFxuICAgIFRhbmdlcmluZS5hcHAgPSBuZXcgTWFyaW9uZXR0ZS5BcHBsaWNhdGlvbigpXG4gICAgVGFuZ2VyaW5lLmFwcC5ybSA9IG5ldyBNYXJpb25ldHRlLlJlZ2lvbk1hbmFnZXIoKTtcblxuICAgIFRhbmdlcmluZS5hcHAucm0uYWRkUmVnaW9ucyBzaXRlTmF2OiBcIiNzaXRlTmF2XCJcbiAgICBUYW5nZXJpbmUuYXBwLnJtLmFkZFJlZ2lvbnMgbWFpblJlZ2lvbjogXCIjY29udGVudFwiXG4gICAgVGFuZ2VyaW5lLmFwcC5ybS5hZGRSZWdpb25zIGRhc2hib2FyZFJlZ2lvbjogXCIjZGFzaGJvYXJkXCJcbiAgICBjYWxsYmFjaygpXG5cbiAgcmVsb2FkVXNlclNlc3Npb246ICggY2FsbGJhY2sgKSAtPlxuXG4gICAgVGFuZ2VyaW5lLnVzZXIuc2Vzc2lvblJlZnJlc2hcbiAgICAgIGVycm9yOiAtPiBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICBzdGFydEJhY2tib25lOiAoIGNhbGxiYWNrICkgLT5cbiAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KClcbiAgICBjYWxsYmFjaygpICMgZm9yIHRlc3RpbmdcblxuICBtb25pdG9yQnJvd3NlckJhY2s6ICggY2FsbGJhY2sgKSAtPlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIChlKSAtPlxuICAgICAgc2VuZFRvID0gQmFja2JvbmUuaGlzdG9yeS5nZXRGcmFnbWVudCgpXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlKHNlbmRUbywgeyB0cmlnZ2VyOiB0cnVlLCByZXBsYWNlOiB0cnVlIH0pXG4gICAgKVxuXG5UYW5nZXJpbmUuYm9vdCA9IC0+XG5cbiAgc2VxdWVuY2UgPSBbXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5oYW5kbGVDb3Jkb3ZhRXZlbnRzXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5iYXNpY0NvbmZpZ1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuY2hlY2tEYXRhYmFzZVxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UudmVyc2lvblRhZ1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZmV0Y2hTZXR0aW5nc1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZ3VhcmFudGVlSW5zdGFuY2VJZFxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZG9jdW1lbnRSZWFkeVxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UubG9hZEkxOG5cbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmxvYWRTaW5nbGV0b25zXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5yZWxvYWRVc2VyU2Vzc2lvblxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2Uuc3RhcnRCYWNrYm9uZVxuIyAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLm1vbml0b3JCcm93c2VyQmFja1xuICBdXG5cbiAgVXRpbHMuZXhlY3V0ZSBzZXF1ZW5jZVxuXG5UYW5nZXJpbmUuYm9vdCgpXG4iXX0=
