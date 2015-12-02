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
    document.addEventListener("deviceready", function() {
      document.addEventListener("online", function() {
        return Tangerine.online = true;
      });
      document.addEventListener("offline", function() {
        return Tangerine.online = false;
      });

      /*
       * Responding to this event turns on the menu button
      document.addEventListener "menubutton", (event) ->
        console.log "menu button"
      , false
       */
      return document.addEventListener("backbutton", Tangerine.onBackButton, false);
    }, false);
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
      return Tangerine.router.navigate(Backbone.history.getFragment(), {
        trigger: true,
        replace: true
      });
    });
  }
};

Tangerine.boot = function() {
  var sequence;
  sequence = [Tangerine.bootSequence.basicConfig, Tangerine.bootSequence.checkDatabase, Tangerine.bootSequence.versionTag, Tangerine.bootSequence.fetchSettings, Tangerine.bootSequence.guaranteeInstanceId, Tangerine.bootSequence.documentReady, Tangerine.bootSequence.loadI18n, Tangerine.bootSequence.handleCordovaEvents, Tangerine.bootSequence.loadSingletons, Tangerine.bootSequence.reloadUserSession, Tangerine.bootSequence.startBackbone, Tangerine.bootSequence.monitorBrowserBack];
  return Utils.execute(sequence);
};

Tangerine.boot();

//# sourceMappingURL=data:application/json;base64,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QUFTLENBQUMsSUFBVixHQUFpQixTQUFBO0FBRWYsTUFBQTtFQUFBLFFBQUEsR0FBVyxDQUNULFNBQVMsQ0FBQyxZQUFZLENBQUMsV0FEZCxFQUVULFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFGZCxFQUdULFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFIZCxFQUlULFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFKZCxFQUtULFNBQVMsQ0FBQyxZQUFZLENBQUMsbUJBTGQsRUFNVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBTmQsRUFPVCxTQUFTLENBQUMsWUFBWSxDQUFDLFFBUGQsRUFRVCxTQUFTLENBQUMsWUFBWSxDQUFDLG1CQVJkLEVBU1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxjQVRkLEVBVVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxpQkFWZCxFQVdULFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFYZCxFQVlULFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBWmQ7U0FlWCxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQ7QUFqQmU7O0FBbUJqQixTQUFTLENBQUMsSUFBVixDQUFBIiwiZmlsZSI6ImJvb3QuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcbiMgVGhpcyBmaWxlIGxvYWRzIHRoZSBtb3N0IGJhc2ljIHNldHRpbmdzIHJlbGF0ZWQgdG8gVGFuZ2VyaW5lIGFuZCBraWNrcyBvZmYgQmFja2JvbmUncyByb3V0ZXIuXG4jICAgKiBUaGUgZG9jIGBjb25maWd1cmF0aW9uYCBob2xkcyB0aGUgbWFqb3JpdHkgb2Ygc2V0dGluZ3MuXG4jICAgKiBUaGUgU2V0dGluZ3Mgb2JqZWN0IGNvbnRhaW5zIG1hbnkgY29udmVuaWVuY2UgZnVuY3Rpb25zIHRoYXQgdXNlIGNvbmZpZ3VyYXRpb24ncyBkYXRhLlxuIyAgICogVGVtcGxhdGVzIHNob3VsZCBjb250YWluIG9iamVjdHMgYW5kIGNvbGxlY3Rpb25zIG9mIG9iamVjdHMgcmVhZHkgdG8gYmUgdXNlZCBieSBhIEZhY3RvcnkuXG4jIEFsc28gaW50aWFsaXplZCBoZXJlIGFyZTogQmFja2JvbmUuanMsIGFuZCBqUXVlcnkuaTE4blxuIyBBbnl0aGluZyB0aGF0IGZhaWxzIGJhZCBoZXJlIHNob3VsZCBwcm9iYWJseSBiZSBmYWlsaW5nIGluIGZyb250IG9mIHRoZSB1c2VyLlxuXG4jIFV0aWxzLmRpc2FibGVDb25zb2xlTG9nKClcbiMgVXRpbHMuZGlzYWJsZUNvbnNvbGVBc3NlcnQoKVxuXG5UYW5nZXJpbmUuYm9vdFNlcXVlbmNlID1cblxuICAjIEJhc2ljIGNvbmZpZ3VyYXRpb25cblxuICBiYXNpY0NvbmZpZyA6IChjYWxsYmFjaykgLT5cblxuICAgICMjI1xuICAgIFBvdWNoIGNvbmZpZ3VyYXRpb25cbiAgICAjIyNcblxuICAgIFRhbmdlcmluZS5kYiA9IG5ldyBQb3VjaERCKFRhbmdlcmluZS5jb25mLmRiX25hbWUpXG4gICAgQmFja2JvbmUuc3luYyA9IEJhY2tib25lUG91Y2guc3luY1xuICAgICAgZGI6IFRhbmdlcmluZS5kYlxuICAgICAgZmV0Y2g6ICd2aWV3J1xuICAgICAgdmlldzogJ3RhbmdlcmluZS9ieUNvbGxlY3Rpb24nXG4gICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgaW5jbHVkZV9kb2NzIDogdHJ1ZVxuXG4gICAgQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmlkQXR0cmlidXRlID0gJ19pZCdcblxuICAgICMgc2V0IHVuZGVyc2NvcmUncyB0ZW1wbGF0ZSBlbmdpbmUgdG8gYWNjZXB0IGhhbmRsZWJhci1zdHlsZSB2YXJpYWJsZXNcbiAgICBfLnRlbXBsYXRlU2V0dGluZ3MgPSBpbnRlcnBvbGF0ZSA6IC9cXHtcXHsoLis/KVxcfVxcfS9nXG5cbiAgICBjYWxsYmFjaygpXG5cbiAgICAjIyNcbiAgICBUYW5nZXJpbmUuZGIuZGVzdHJveSAoZXJyb3IpIC0+XG4gICAgICByZXR1cm4gYWxlcnQgZXJyb3IgaWYgZXJyb3I/XG5cbiAgICAgIFRhbmdlcmluZS5kYiA9IG5ldyBQb3VjaERCKFwidGFuZ2VyaW5lXCIpXG4gICAgICBCYWNrYm9uZS5zeW5jID0gQmFja2JvbmVQb3VjaC5zeW5jXG4gICAgICAgIGRiOiBUYW5nZXJpbmUuZGJcblxuXG4gICAgICBjYWxsYmFjaygpXG4gICAgIyMjXG5cblxuICAjIENoZWNrIGZvciBuZXcgZGF0YWJhc2UsIGluaXRpYWxpemUgd2l0aCBwYWNrcyBpZiBub25lIGV4aXN0c1xuICBjaGVja0RhdGFiYXNlOiAoY2FsbGJhY2spIC0+XG5cbiAgICAjIExvY2FsIHRhbmdlcmluZSBkYXRhYmFzZSBoYW5kbGVcbiAgICBkYiA9IFRhbmdlcmluZS5kYlxuXG4gICAgZGIuZ2V0IFwiaW5pdGlhbGl6ZWRcIiwgKGVycm9yLCBkb2MpIC0+XG5cbiAgICAgIHJldHVybiBjYWxsYmFjaygpIHVubGVzcyBlcnJvclxuXG4gICAgICBjb25zb2xlLmxvZyBcImluaXRpYWxpemluZyBkYXRhYmFzZVwiXG5cbiAgICAgICMgU2F2ZSB2aWV3c1xuICAgICAgZGIucHV0KFxuICAgICAgICBfaWQ6IFwiX2Rlc2lnbi8je1RhbmdlcmluZS5jb25mLmRlc2lnbl9kb2N9XCJcbiAgICAgICAgdmlld3M6XG4gICAgICAgICAgIyMjXG4gICAgICAgICAgICBVc2VkIGZvciByZXBsaWNhdGlvbi5cbiAgICAgICAgICAgIFdpbGwgZ2l2ZSBvbmUga2V5IGZvciBhbGwgZG9jdW1lbnRzIGFzc29jaWF0ZWQgd2l0aCBhbiBhc3Nlc3NtZW50IG9yIGN1cnJpY3VsdW0uXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgYnlES2V5OlxuICAgICAgICAgICAgbWFwOiAoKGRvYykgLT5cbiAgICAgICAgICAgICAgcmV0dXJuIGlmIGRvYy5jb2xsZWN0aW9uIGlzIFwicmVzdWx0XCJcblxuICAgICAgICAgICAgICBpZiBkb2MuY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgaWQgPSBkb2MuY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgIyBEbyBub3QgcmVwbGljYXRlIGtsYXNzZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgZG9jLmNvbGxlY3Rpb24gaXMgXCJrbGFzc1wiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZCA9IGRvYy5hc3Nlc3NtZW50SWRcblxuICAgICAgICAgICAgICBlbWl0IGlkLnN1YnN0cigtNSw1KSwgbnVsbFxuICAgICAgICAgICAgKS50b1N0cmluZygpXG5cbiAgICAgICAgICBieUNvbGxlY3Rpb246XG4gICAgICAgICAgICBtYXAgOiAoIChkb2MpIC0+XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBkb2MuY29sbGVjdGlvblxuXG4gICAgICAgICAgICAgIGVtaXQgZG9jLmNvbGxlY3Rpb24sIG51bGxcblxuICAgICAgICAgICAgICAjIEJlbG9uZ3MgdG8gcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAgIGlmIGRvYy5jb2xsZWN0aW9uIGlzICdzdWJ0ZXN0J1xuICAgICAgICAgICAgICAgIGVtaXQgXCJzdWJ0ZXN0LSN7ZG9jLmFzc2Vzc21lbnRJZH1cIlxuXG4gICAgICAgICAgICAgICMgQmVsb25ncyB0byByZWxhdGlvbnNoaXBcbiAgICAgICAgICAgICAgZWxzZSBpZiBkb2MuY29sbGVjdGlvbiBpcyAncXVlc3Rpb24nXG4gICAgICAgICAgICAgICAgZW1pdCBcInF1ZXN0aW9uLSN7ZG9jLnN1YnRlc3RJZH1cIlxuXG4gICAgICAgICAgICAgIGVsc2UgaWYgZG9jLmNvbGxlY3Rpb24gaXMgJ3Jlc3VsdCdcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBfaWQgOiBkb2MuX2lkXG4gICAgICAgICAgICAgICAgZG9jLnN1YnRlc3REYXRhLmZvckVhY2ggKHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LnByb3RvdHlwZSBpcyBcImlkXCIgdGhlbiByZXN1bHQucGFydGljaXBhbnRJZCA9IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5wcm90b3R5cGUgaXMgXCJjb21wbGV0ZVwiIHRoZW4gcmVzdWx0LmVuZFRpbWUgPSBzdWJ0ZXN0LmRhdGEuZW5kX3RpbWVcbiAgICAgICAgICAgICAgICByZXN1bHQuc3RhcnRUaW1lID0gZG9jLnN0YXJ0X3RpbWVcbiAgICAgICAgICAgICAgICBlbWl0IFwicmVzdWx0LSN7ZG9jLmFzc2Vzc21lbnRJZH1cIiwgcmVzdWx0XG5cbiAgICAgICAgICAgICkudG9TdHJpbmcoKVxuICAgICAgKS50aGVuIC0+XG5cblxuICAgICAgICBwYWNrTnVtYmVyID0gMFxuXG4gICAgICAgIGRvT25lID0gLT5cblxuICAgICAgICAgIHBhZGRlZFBhY2tOdW1iZXIgPSAoXCIwMDAwXCIgKyBwYWNrTnVtYmVyKS5zbGljZSgtNClcblxuICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICB1cmw6IFwianMvaW5pdC9wYWNrI3twYWRkZWRQYWNrTnVtYmVyfS5qc29uXCJcbiAgICAgICAgICAgIGVycm9yOiAocmVzKSAtPlxuICAgICAgICAgICAgICBpZiByZXMuc3RhdHVzIGlzIDQwNFxuICAgICAgICAgICAgICAgIGRiLnB1dCh7XCJfaWRcIjpcImluaXRpYWxpemVkXCJ9KS50aGVuKCAtPiBjYWxsYmFjaygpKVxuICAgICAgICAgICAgc3VjY2VzczogKHJlcykgLT5cbiAgICAgICAgICAgICAgcGFja051bWJlcisrXG5cbiAgICAgICAgICAgICAgZGIuYnVsa0RvY3MgcmVzLmRvY3MsIChlcnJvciwgZG9jKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYWxlcnQgXCJjb3VsZCBub3Qgc2F2ZSBpbml0aWFsaXphdGlvbiBkb2N1bWVudDogI3tlcnJvcn1cIlxuICAgICAgICAgICAgICAgIGRvT25lKClcblxuICAgICAgICBkb09uZSgpICMga2ljayBpdCBvZmZcblxuXG4gICMgUHV0IHRoaXMgdmVyc2lvbidzIGluZm9ybWF0aW9uIGluIHRoZSBmb290ZXJcbiAgdmVyc2lvblRhZzogKCBjYWxsYmFjayApIC0+XG4gICAgJChcIiNmb290ZXJcIikuYXBwZW5kKFwiPGRpdiBpZD0ndmVyc2lvbic+I3tUYW5nZXJpbmUudmVyc2lvbn0tI3tUYW5nZXJpbmUuYnVpbGRWZXJzaW9ufTwvZGl2PlwiKVxuICAgIGNhbGxiYWNrKClcblxuXG5cbiAgIyBnZXQgb3VyIGxvY2FsIFRhbmdlcmluZSBzZXR0aW5nc1xuICAjIHRoZXNlIGRvIHRlbmQgdG8gY2hhbmdlIGRlcGVuZGluZyBvbiB0aGUgcGFydGljdWxhciBpbnN0YWxsIG9mIHRoZVxuICBmZXRjaFNldHRpbmdzIDogKCBjYWxsYmFjayApIC0+XG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzID0gbmV3IFNldHRpbmdzIFwiX2lkXCIgOiBcInNldHRpbmdzXCJcbiAgICBUYW5nZXJpbmUuc2V0dGluZ3MuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUgVGFuZ2VyaW5lLmRlZmF1bHRzLnNldHRpbmdzLFxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgY29uc29sZS5lcnJvciBhcmd1bWVudHNcbiAgICAgICAgICAgIGFsZXJ0IFwiQ291bGQgbm90IHNhdmUgZGVmYXVsdCBzZXR0aW5nc1wiXG4gICAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuXG4gICMgZm9yIHVwZ3JhZGVzXG4gIGd1YXJhbnRlZUluc3RhbmNlSWQ6ICggY2FsbGJhY2sgKSAtPlxuICAgIHVubGVzcyBUYW5nZXJpbmUuc2V0dGluZ3MuaGFzKFwiaW5zdGFuY2VJZFwiKVxuICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmVcbiAgICAgICAgXCJpbnN0YW5jZUlkXCIgOiBVdGlscy5odW1hbkdVSUQoKVxuICAgICAgLFxuICAgICAgICBlcnJvcjogLT4gYWxlcnQgXCJDb3VsZCBub3Qgc2F2ZSBuZXcgSW5zdGFuY2UgSWRcIlxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKClcblxuICBkb2N1bWVudFJlYWR5OiAoIGNhbGxiYWNrICkgLT4gJCAtPlxuXG4gICAgIyQoXCI8YnV0dG9uIGlkPSdyZWxvYWQnPnJlbG9hZCBtZTwvYnV0dG9uPlwiKS5hcHBlbmRUbyhcIiNmb290ZXJcIikuY2xpY2sgLT4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuICAgIGNhbGxiYWNrKClcblxuICBsb2FkSTE4bjogKCBjYWxsYmFjayApIC0+XG4gICAgaTE4bi5pbml0XG4gICAgICBmYWxsYmFja0xuZyA6IFwiZW4tVVNcIlxuICAgICAgbG5nICAgICAgICAgOiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwibGFuZ3VhZ2VcIilcbiAgICAgIHJlc1N0b3JlICAgIDogVGFuZ2VyaW5lLmxvY2FsZXNcbiAgICAsIChlcnIsIHQpIC0+XG4gICAgICB3aW5kb3cudCA9IHRcbiAgICAgIGNhbGxiYWNrKClcblxuICBoYW5kbGVDb3Jkb3ZhRXZlbnRzOiAoIGNhbGxiYWNrICkgLT5cblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJkZXZpY2VyZWFkeVwiXG4gICAgICAsXG4gICAgICAgIC0+XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIm9ubGluZVwiLCAgLT4gVGFuZ2VyaW5lLm9ubGluZSA9IHRydWVcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwib2ZmbGluZVwiLCAtPiBUYW5nZXJpbmUub25saW5lID0gZmFsc2VcblxuICAgICAgICAgICMjI1xuICAgICAgICAgICMgUmVzcG9uZGluZyB0byB0aGlzIGV2ZW50IHR1cm5zIG9uIHRoZSBtZW51IGJ1dHRvblxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJtZW51YnV0dG9uXCIsIChldmVudCkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibWVudSBidXR0b25cIlxuICAgICAgICAgICwgZmFsc2VcbiAgICAgICAgICAjIyNcblxuICAgICAgICAgICMgcHJldmVudHMgZGVmYXVsdFxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJiYWNrYnV0dG9uXCIsIFRhbmdlcmluZS5vbkJhY2tCdXR0b24sIGZhbHNlXG5cbiAgICAgICwgZmFsc2VcblxuICAgICMgYWRkIHRoZSBldmVudCBsaXN0ZW5lcnMsIGJ1dCBkb24ndCBkZXBlbmQgb24gdGhlbSBjYWxsaW5nIGJhY2tcbiAgICBjYWxsYmFjaygpXG5cbiAgbG9hZFNpbmdsZXRvbnM6ICggY2FsbGJhY2sgKSAtPlxuICAgICMgU2luZ2xldG9uc1xuICAgIHdpbmRvdy52bSA9IG5ldyBWaWV3TWFuYWdlcigpXG4gICAgVGFuZ2VyaW5lLnJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuICAgIFRhbmdlcmluZS51c2VyICAgPSBuZXcgVGFibGV0VXNlcigpXG4gICAgVGFuZ2VyaW5lLm5hdiAgICA9IG5ldyBOYXZpZ2F0aW9uVmlld1xuICAgICAgdXNlciAgIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgIHJvdXRlciA6IFRhbmdlcmluZS5yb3V0ZXJcbiAgICBUYW5nZXJpbmUubG9nICAgID0gbmV3IExvZygpXG4gICAgVGFuZ2VyaW5lLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpXG5cbiAgICAjICBpbml0ICBUYW5nZXJpbmUgYXMgYSBNYXJpb25ldHRlIGFwcFxuICAgIFRhbmdlcmluZS5hcHAgPSBuZXcgTWFyaW9uZXR0ZS5BcHBsaWNhdGlvbigpXG4gICAgVGFuZ2VyaW5lLmFwcC5ybSA9IG5ldyBNYXJpb25ldHRlLlJlZ2lvbk1hbmFnZXIoKTtcblxuICAgIFRhbmdlcmluZS5hcHAucm0uYWRkUmVnaW9ucyBzaXRlTmF2OiBcIiNzaXRlTmF2XCJcbiAgICBUYW5nZXJpbmUuYXBwLnJtLmFkZFJlZ2lvbnMgbWFpblJlZ2lvbjogXCIjY29udGVudFwiXG4gICAgVGFuZ2VyaW5lLmFwcC5ybS5hZGRSZWdpb25zIGRhc2hib2FyZFJlZ2lvbjogXCIjZGFzaGJvYXJkXCJcbiAgICBjYWxsYmFjaygpXG5cbiAgcmVsb2FkVXNlclNlc3Npb246ICggY2FsbGJhY2sgKSAtPlxuXG4gICAgVGFuZ2VyaW5lLnVzZXIuc2Vzc2lvblJlZnJlc2hcbiAgICAgIGVycm9yOiAtPiBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICBzdGFydEJhY2tib25lOiAoIGNhbGxiYWNrICkgLT5cbiAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KClcbiAgICBjYWxsYmFjaygpICMgZm9yIHRlc3RpbmdcblxuICBtb25pdG9yQnJvd3NlckJhY2s6ICggY2FsbGJhY2sgKSAtPlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIChlKSAtPlxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZShCYWNrYm9uZS5oaXN0b3J5LmdldEZyYWdtZW50KCksIHsgdHJpZ2dlcjogdHJ1ZSwgcmVwbGFjZTogdHJ1ZSB9KVxuICAgIClcblxuVGFuZ2VyaW5lLmJvb3QgPSAtPlxuXG4gIHNlcXVlbmNlID0gW1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuYmFzaWNDb25maWdcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmNoZWNrRGF0YWJhc2VcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLnZlcnNpb25UYWdcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmZldGNoU2V0dGluZ3NcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmd1YXJhbnRlZUluc3RhbmNlSWRcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmRvY3VtZW50UmVhZHlcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmxvYWRJMThuXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5oYW5kbGVDb3Jkb3ZhRXZlbnRzXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5sb2FkU2luZ2xldG9uc1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UucmVsb2FkVXNlclNlc3Npb25cbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLnN0YXJ0QmFja2JvbmVcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLm1vbml0b3JCcm93c2VyQmFja1xuICBdXG5cbiAgVXRpbHMuZXhlY3V0ZSBzZXF1ZW5jZVxuXG5UYW5nZXJpbmUuYm9vdCgpXG4iXX0=
