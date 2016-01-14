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
  sequence = [Tangerine.bootSequence.basicConfig, Tangerine.bootSequence.checkDatabase, Tangerine.bootSequence.versionTag, Tangerine.bootSequence.fetchSettings, Tangerine.bootSequence.guaranteeInstanceId, Tangerine.bootSequence.documentReady, Tangerine.bootSequence.loadI18n, Tangerine.bootSequence.handleCordovaEvents, Tangerine.bootSequence.loadSingletons, Tangerine.bootSequence.reloadUserSession, Tangerine.bootSequence.startBackbone];
  return Utils.execute(sequence);
};

Tangerine.boot();

//# sourceMappingURL=data:application/json;base64,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cEM7RUFEa0IsQ0FoT3BCOzs7QUFzT0YsU0FBUyxDQUFDLElBQVYsR0FBaUIsU0FBQTtBQUVmLE1BQUE7RUFBQSxRQUFBLEdBQVcsQ0FDVCxTQUFTLENBQUMsWUFBWSxDQUFDLFdBRGQsRUFFVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBRmQsRUFHVCxTQUFTLENBQUMsWUFBWSxDQUFDLFVBSGQsRUFJVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBSmQsRUFLVCxTQUFTLENBQUMsWUFBWSxDQUFDLG1CQUxkLEVBTVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQU5kLEVBT1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQVBkLEVBUVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxtQkFSZCxFQVNULFNBQVMsQ0FBQyxZQUFZLENBQUMsY0FUZCxFQVVULFNBQVMsQ0FBQyxZQUFZLENBQUMsaUJBVmQsRUFXVCxTQUFTLENBQUMsWUFBWSxDQUFDLGFBWGQ7U0FlWCxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQ7QUFqQmU7O0FBbUJqQixTQUFTLENBQUMsSUFBVixDQUFBIiwiZmlsZSI6ImJvb3QuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcbiMgVGhpcyBmaWxlIGxvYWRzIHRoZSBtb3N0IGJhc2ljIHNldHRpbmdzIHJlbGF0ZWQgdG8gVGFuZ2VyaW5lIGFuZCBraWNrcyBvZmYgQmFja2JvbmUncyByb3V0ZXIuXG4jICAgKiBUaGUgZG9jIGBjb25maWd1cmF0aW9uYCBob2xkcyB0aGUgbWFqb3JpdHkgb2Ygc2V0dGluZ3MuXG4jICAgKiBUaGUgU2V0dGluZ3Mgb2JqZWN0IGNvbnRhaW5zIG1hbnkgY29udmVuaWVuY2UgZnVuY3Rpb25zIHRoYXQgdXNlIGNvbmZpZ3VyYXRpb24ncyBkYXRhLlxuIyAgICogVGVtcGxhdGVzIHNob3VsZCBjb250YWluIG9iamVjdHMgYW5kIGNvbGxlY3Rpb25zIG9mIG9iamVjdHMgcmVhZHkgdG8gYmUgdXNlZCBieSBhIEZhY3RvcnkuXG4jIEFsc28gaW50aWFsaXplZCBoZXJlIGFyZTogQmFja2JvbmUuanMsIGFuZCBqUXVlcnkuaTE4blxuIyBBbnl0aGluZyB0aGF0IGZhaWxzIGJhZCBoZXJlIHNob3VsZCBwcm9iYWJseSBiZSBmYWlsaW5nIGluIGZyb250IG9mIHRoZSB1c2VyLlxuXG4jIFV0aWxzLmRpc2FibGVDb25zb2xlTG9nKClcbiMgVXRpbHMuZGlzYWJsZUNvbnNvbGVBc3NlcnQoKVxuXG5UYW5nZXJpbmUuYm9vdFNlcXVlbmNlID1cblxuICAjIEJhc2ljIGNvbmZpZ3VyYXRpb25cblxuICBiYXNpY0NvbmZpZyA6IChjYWxsYmFjaykgLT5cblxuICAgICMjI1xuICAgIFBvdWNoIGNvbmZpZ3VyYXRpb25cbiAgICAjIyNcblxuICAgIFRhbmdlcmluZS5kYiA9IG5ldyBQb3VjaERCKFRhbmdlcmluZS5jb25mLmRiX25hbWUpXG4gICAgQmFja2JvbmUuc3luYyA9IEJhY2tib25lUG91Y2guc3luY1xuICAgICAgZGI6IFRhbmdlcmluZS5kYlxuICAgICAgZmV0Y2g6ICd2aWV3J1xuICAgICAgdmlldzogJ3RhbmdlcmluZS9ieUNvbGxlY3Rpb24nXG4gICAgICB2aWV3T3B0aW9uczpcbiAgICAgICAgaW5jbHVkZV9kb2NzIDogdHJ1ZVxuXG4gICAgQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmlkQXR0cmlidXRlID0gJ19pZCdcblxuICAgICMgc2V0IHVuZGVyc2NvcmUncyB0ZW1wbGF0ZSBlbmdpbmUgdG8gYWNjZXB0IGhhbmRsZWJhci1zdHlsZSB2YXJpYWJsZXNcbiAgICBfLnRlbXBsYXRlU2V0dGluZ3MgPSBpbnRlcnBvbGF0ZSA6IC9cXHtcXHsoLis/KVxcfVxcfS9nXG5cbiAgICBjYWxsYmFjaygpXG5cbiAgICAjIyNcbiAgICBUYW5nZXJpbmUuZGIuZGVzdHJveSAoZXJyb3IpIC0+XG4gICAgICByZXR1cm4gYWxlcnQgZXJyb3IgaWYgZXJyb3I/XG5cbiAgICAgIFRhbmdlcmluZS5kYiA9IG5ldyBQb3VjaERCKFwidGFuZ2VyaW5lXCIpXG4gICAgICBCYWNrYm9uZS5zeW5jID0gQmFja2JvbmVQb3VjaC5zeW5jXG4gICAgICAgIGRiOiBUYW5nZXJpbmUuZGJcblxuXG4gICAgICBjYWxsYmFjaygpXG4gICAgIyMjXG5cbiAgIyBDaGVjayBmb3IgbmV3IGRhdGFiYXNlLCBpbml0aWFsaXplIHdpdGggcGFja3MgaWYgbm9uZSBleGlzdHNcbiAgY2hlY2tEYXRhYmFzZTogKGNhbGxiYWNrKSAtPlxuXG4gICAgIyBMb2NhbCB0YW5nZXJpbmUgZGF0YWJhc2UgaGFuZGxlXG4gICAgZGIgPSBUYW5nZXJpbmUuZGJcblxuICAgIGRiLmdldCBcImluaXRpYWxpemVkXCIsIChlcnJvciwgZG9jKSAtPlxuXG4gICAgICByZXR1cm4gY2FsbGJhY2soKSB1bmxlc3MgZXJyb3JcblxuICAgICAgY29uc29sZS5sb2cgXCJpbml0aWFsaXppbmcgZGF0YWJhc2VcIlxuXG4gICAgICAjIFNhdmUgdmlld3NcbiAgICAgIGRiLnB1dChcbiAgICAgICAgX2lkOiBcIl9kZXNpZ24vI3tUYW5nZXJpbmUuY29uZi5kZXNpZ25fZG9jfVwiXG4gICAgICAgIHZpZXdzOlxuICAgICAgICAgICMjI1xuICAgICAgICAgICAgVXNlZCBmb3IgcmVwbGljYXRpb24uXG4gICAgICAgICAgICBXaWxsIGdpdmUgb25lIGtleSBmb3IgYWxsIGRvY3VtZW50cyBhc3NvY2lhdGVkIHdpdGggYW4gYXNzZXNzbWVudCBvciBjdXJyaWN1bHVtLlxuICAgICAgICAgICMjI1xuICAgICAgICAgIGJ5REtleTpcbiAgICAgICAgICAgIG1hcDogKChkb2MpIC0+XG4gICAgICAgICAgICAgIHJldHVybiBpZiBkb2MuY29sbGVjdGlvbiBpcyBcInJlc3VsdFwiXG5cbiAgICAgICAgICAgICAgaWYgZG9jLmN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGlkID0gZG9jLmN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgICMgRG8gbm90IHJlcGxpY2F0ZSBrbGFzc2VzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIGRvYy5jb2xsZWN0aW9uIGlzIFwia2xhc3NcIlxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWQgPSBkb2MuYXNzZXNzbWVudElkXG5cbiAgICAgICAgICAgICAgZW1pdCBpZC5zdWJzdHIoLTUsNSksIG51bGxcbiAgICAgICAgICAgICkudG9TdHJpbmcoKVxuXG4gICAgICAgICAgYnlDb2xsZWN0aW9uOlxuICAgICAgICAgICAgbWFwIDogKCAoZG9jKSAtPlxuXG4gICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgZG9jLmNvbGxlY3Rpb25cblxuICAgICAgICAgICAgICBlbWl0IGRvYy5jb2xsZWN0aW9uLCBudWxsXG5cbiAgICAgICAgICAgICAgIyBCZWxvbmdzIHRvIHJlbGF0aW9uc2hpcFxuICAgICAgICAgICAgICBpZiBkb2MuY29sbGVjdGlvbiBpcyAnc3VidGVzdCdcbiAgICAgICAgICAgICAgICBlbWl0IFwic3VidGVzdC0je2RvYy5hc3Nlc3NtZW50SWR9XCJcblxuICAgICAgICAgICAgICAjIEJlbG9uZ3MgdG8gcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAgIGVsc2UgaWYgZG9jLmNvbGxlY3Rpb24gaXMgJ3F1ZXN0aW9uJ1xuICAgICAgICAgICAgICAgIGVtaXQgXCJxdWVzdGlvbi0je2RvYy5zdWJ0ZXN0SWR9XCJcblxuICAgICAgICAgICAgICBlbHNlIGlmIGRvYy5jb2xsZWN0aW9uIGlzICdyZXN1bHQnXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gX2lkIDogZG9jLl9pZFxuICAgICAgICAgICAgICAgIGRvYy5zdWJ0ZXN0RGF0YS5mb3JFYWNoIChzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5wcm90b3R5cGUgaXMgXCJpZFwiIHRoZW4gcmVzdWx0LnBhcnRpY2lwYW50SWQgPSBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWRcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QucHJvdG90eXBlIGlzIFwiY29tcGxldGVcIiB0aGVuIHJlc3VsdC5lbmRUaW1lID0gc3VidGVzdC5kYXRhLmVuZF90aW1lXG4gICAgICAgICAgICAgICAgcmVzdWx0LnN0YXJ0VGltZSA9IGRvYy5zdGFydF90aW1lXG4gICAgICAgICAgICAgICAgZW1pdCBcInJlc3VsdC0je2RvYy5hc3Nlc3NtZW50SWR9XCIsIHJlc3VsdFxuXG4gICAgICAgICAgICApLnRvU3RyaW5nKClcblxuICAgICAgKS50aGVuIC0+XG5cbiAgICAgICAgI1xuICAgICAgICAjIExvYWQgUGFja3MgdGhhdCBUcmVlIGNyZWF0ZXMgZm9yIGFuIEFQSywgdGhlbiBsb2FkIHRoZSBQYWNrcyB3ZSB1c2UgZm9yXG4gICAgICAgICMgZGV2ZWxvcG1lbnQgcHVycG9zZXMuXG4gICAgICAgICNcblxuICAgICAgICBwYWNrTnVtYmVyID0gMFxuXG4gICAgICAgICMgUmVjdXJzaXZlIGZ1bmN0aW9uIHRoYXQgd2lsbCBpdGVyYXRlIHRocm91Z2gganMvaW5pdC9wYWNrMDAwWzAteF0gdW50aWxcbiAgICAgICAgIyB0aGVyZSBpcyBubyBsb25nZXIgYSByZXR1cm5lZCBwYWNrLlxuICAgICAgICBkb09uZSA9IC0+XG5cbiAgICAgICAgICBwYWRkZWRQYWNrTnVtYmVyID0gKFwiMDAwMFwiICsgcGFja051bWJlcikuc2xpY2UoLTQpXG5cbiAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgdXJsOiBcImpzL2luaXQvcGFjayN7cGFkZGVkUGFja051bWJlcn0uanNvblwiXG4gICAgICAgICAgICBlcnJvcjogKHJlcykgLT5cbiAgICAgICAgICAgICAgIyBObyBtb3JlIHBhY2s/IFdlJ3JlIGFsbCBkb25lIGhlcmUuXG4gICAgICAgICAgICAgIGlmIHJlcy5zdGF0dXMgaXMgNDA0XG4gICAgICAgICAgICAgICAgIyBNYXJrIHRoaXMgZGF0YWJhc2UgYXMgaW5pdGlhbGl6ZWQgc28gdGhhdCB0aGlzIHByb2Nlc3MgZG9lcyBub3RcbiAgICAgICAgICAgICAgICAjIHJ1biBhZ2FpbiBvbiBwYWdlIHJlZnJlc2gsIHRoZW4gbG9hZCBEZXZlbG9wbWVudCBQYWNrcy5cbiAgICAgICAgICAgICAgICBkYi5wdXQoe1wiX2lkXCI6XCJpbml0aWFsaXplZFwifSkudGhlbiggLT4gY2FsbGJhY2soKSApXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzKSAtPlxuICAgICAgICAgICAgICBwYWNrTnVtYmVyKytcblxuICAgICAgICAgICAgICBkYi5idWxrRG9jcyByZXMuZG9jcywgKGVycm9yLCBkb2MpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyb3JcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhbGVydCBcImNvdWxkIG5vdCBzYXZlIGluaXRpYWxpemF0aW9uIGRvY3VtZW50OiAje2Vycm9yfVwiXG4gICAgICAgICAgICAgICAgZG9PbmUoKVxuXG4gICAgICAgICMga2ljayBvZmYgcmVjdXJzaXZlIHByb2Nlc3NcbiAgICAgICAgZG9PbmUoKVxuXG4gICMgUHV0IHRoaXMgdmVyc2lvbidzIGluZm9ybWF0aW9uIGluIHRoZSBmb290ZXJcbiAgdmVyc2lvblRhZzogKCBjYWxsYmFjayApIC0+XG4gICAgJChcIiNmb290ZXJcIikuYXBwZW5kKFwiPGRpdiBpZD0ndmVyc2lvbic+I3tUYW5nZXJpbmUudmVyc2lvbn0tI3tUYW5nZXJpbmUuYnVpbGRWZXJzaW9ufTwvZGl2PlwiKVxuICAgIGNhbGxiYWNrKClcblxuICAjIGdldCBvdXIgbG9jYWwgVGFuZ2VyaW5lIHNldHRpbmdzXG4gICMgdGhlc2UgZG8gdGVuZCB0byBjaGFuZ2UgZGVwZW5kaW5nIG9uIHRoZSBwYXJ0aWN1bGFyIGluc3RhbGwgb2YgdGhlXG4gIGZldGNoU2V0dGluZ3MgOiAoIGNhbGxiYWNrICkgLT5cbiAgICBUYW5nZXJpbmUuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MgXCJfaWRcIiA6IFwic2V0dGluZ3NcIlxuICAgIFRhbmdlcmluZS5zZXR0aW5ncy5mZXRjaFxuICAgICAgc3VjY2VzczogY2FsbGJhY2tcbiAgICAgIGVycm9yOiAtPlxuICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSBUYW5nZXJpbmUuZGVmYXVsdHMuc2V0dGluZ3MsXG4gICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yIGFyZ3VtZW50c1xuICAgICAgICAgICAgYWxlcnQgXCJDb3VsZCBub3Qgc2F2ZSBkZWZhdWx0IHNldHRpbmdzXCJcbiAgICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuXG4gICMgZm9yIHVwZ3JhZGVzXG4gIGd1YXJhbnRlZUluc3RhbmNlSWQ6ICggY2FsbGJhY2sgKSAtPlxuICAgIHVubGVzcyBUYW5nZXJpbmUuc2V0dGluZ3MuaGFzKFwiaW5zdGFuY2VJZFwiKVxuICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmVcbiAgICAgICAgXCJpbnN0YW5jZUlkXCIgOiBVdGlscy5odW1hbkdVSUQoKVxuICAgICAgLFxuICAgICAgICBlcnJvcjogLT4gYWxlcnQgXCJDb3VsZCBub3Qgc2F2ZSBuZXcgSW5zdGFuY2UgSWRcIlxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKClcblxuICBkb2N1bWVudFJlYWR5OiAoIGNhbGxiYWNrICkgLT4gJCAtPlxuXG4gICAgIyQoXCI8YnV0dG9uIGlkPSdyZWxvYWQnPnJlbG9hZCBtZTwvYnV0dG9uPlwiKS5hcHBlbmRUbyhcIiNmb290ZXJcIikuY2xpY2sgLT4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuICAgIGNhbGxiYWNrKClcblxuICBsb2FkSTE4bjogKCBjYWxsYmFjayApIC0+XG4gICAgaTE4bi5pbml0XG4gICAgICBmYWxsYmFja0xuZyA6IFwiZW4tVVNcIlxuICAgICAgbG5nICAgICAgICAgOiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwibGFuZ3VhZ2VcIilcbiAgICAgIHJlc1N0b3JlICAgIDogVGFuZ2VyaW5lLmxvY2FsZXNcbiAgICAsIChlcnIsIHQpIC0+XG4gICAgICB3aW5kb3cudCA9IHRcbiAgICAgIGNhbGxiYWNrKClcblxuICBoYW5kbGVDb3Jkb3ZhRXZlbnRzOiAoIGNhbGxiYWNrICkgLT5cblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJkZXZpY2VyZWFkeVwiXG4gICAgICAsXG4gICAgICAgIC0+XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIm9ubGluZVwiLCAgLT4gVGFuZ2VyaW5lLm9ubGluZSA9IHRydWVcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwib2ZmbGluZVwiLCAtPiBUYW5nZXJpbmUub25saW5lID0gZmFsc2VcblxuICAgICAgICAgICMjI1xuICAgICAgICAgICMgUmVzcG9uZGluZyB0byB0aGlzIGV2ZW50IHR1cm5zIG9uIHRoZSBtZW51IGJ1dHRvblxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJtZW51YnV0dG9uXCIsIChldmVudCkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibWVudSBidXR0b25cIlxuICAgICAgICAgICwgZmFsc2VcbiAgICAgICAgICAjIyNcblxuICAgICAgICAgICMgcHJldmVudHMgZGVmYXVsdFxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJiYWNrYnV0dG9uXCIsIFRhbmdlcmluZS5vbkJhY2tCdXR0b24sIGZhbHNlXG5cbiAgICAgICwgZmFsc2VcblxuICAgICMgYWRkIHRoZSBldmVudCBsaXN0ZW5lcnMsIGJ1dCBkb24ndCBkZXBlbmQgb24gdGhlbSBjYWxsaW5nIGJhY2tcbiAgICBjYWxsYmFjaygpXG5cbiAgbG9hZFNpbmdsZXRvbnM6ICggY2FsbGJhY2sgKSAtPlxuICAgICMgU2luZ2xldG9uc1xuICAgIHdpbmRvdy52bSA9IG5ldyBWaWV3TWFuYWdlcigpXG4gICAgVGFuZ2VyaW5lLnJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuICAgIFRhbmdlcmluZS51c2VyICAgPSBuZXcgVGFibGV0VXNlcigpXG4gICAgVGFuZ2VyaW5lLm5hdiAgICA9IG5ldyBOYXZpZ2F0aW9uVmlld1xuICAgICAgdXNlciAgIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgIHJvdXRlciA6IFRhbmdlcmluZS5yb3V0ZXJcbiAgICBUYW5nZXJpbmUubG9nICAgID0gbmV3IExvZygpXG4gICAgVGFuZ2VyaW5lLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpXG5cbiAgICAjICBpbml0ICBUYW5nZXJpbmUgYXMgYSBNYXJpb25ldHRlIGFwcFxuICAgIFRhbmdlcmluZS5hcHAgPSBuZXcgTWFyaW9uZXR0ZS5BcHBsaWNhdGlvbigpXG4gICAgVGFuZ2VyaW5lLmFwcC5ybSA9IG5ldyBNYXJpb25ldHRlLlJlZ2lvbk1hbmFnZXIoKTtcblxuICAgIFRhbmdlcmluZS5hcHAucm0uYWRkUmVnaW9ucyBzaXRlTmF2OiBcIiNzaXRlTmF2XCJcbiAgICBUYW5nZXJpbmUuYXBwLnJtLmFkZFJlZ2lvbnMgbWFpblJlZ2lvbjogXCIjY29udGVudFwiXG4gICAgVGFuZ2VyaW5lLmFwcC5ybS5hZGRSZWdpb25zIGRhc2hib2FyZFJlZ2lvbjogXCIjZGFzaGJvYXJkXCJcbiAgICBjYWxsYmFjaygpXG5cbiAgcmVsb2FkVXNlclNlc3Npb246ICggY2FsbGJhY2sgKSAtPlxuXG4gICAgVGFuZ2VyaW5lLnVzZXIuc2Vzc2lvblJlZnJlc2hcbiAgICAgIGVycm9yOiAtPiBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICBzdGFydEJhY2tib25lOiAoIGNhbGxiYWNrICkgLT5cbiAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KClcbiAgICBjYWxsYmFjaygpICMgZm9yIHRlc3RpbmdcblxuICBtb25pdG9yQnJvd3NlckJhY2s6ICggY2FsbGJhY2sgKSAtPlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIChlKSAtPlxuICAgICAgc2VuZFRvID0gQmFja2JvbmUuaGlzdG9yeS5nZXRGcmFnbWVudCgpXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlKHNlbmRUbywgeyB0cmlnZ2VyOiB0cnVlLCByZXBsYWNlOiB0cnVlIH0pXG4gICAgKVxuXG5UYW5nZXJpbmUuYm9vdCA9IC0+XG5cbiAgc2VxdWVuY2UgPSBbXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5iYXNpY0NvbmZpZ1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuY2hlY2tEYXRhYmFzZVxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UudmVyc2lvblRhZ1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZmV0Y2hTZXR0aW5nc1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZ3VhcmFudGVlSW5zdGFuY2VJZFxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuZG9jdW1lbnRSZWFkeVxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UubG9hZEkxOG5cbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmhhbmRsZUNvcmRvdmFFdmVudHNcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmxvYWRTaW5nbGV0b25zXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5yZWxvYWRVc2VyU2Vzc2lvblxuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2Uuc3RhcnRCYWNrYm9uZVxuIyAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLm1vbml0b3JCcm93c2VyQmFja1xuICBdXG5cbiAgVXRpbHMuZXhlY3V0ZSBzZXF1ZW5jZVxuXG5UYW5nZXJpbmUuYm9vdCgpXG4iXX0=
