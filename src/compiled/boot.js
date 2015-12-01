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
  }
};

Tangerine.boot = function() {
  var sequence;
  sequence = [Tangerine.bootSequence.basicConfig, Tangerine.bootSequence.checkDatabase, Tangerine.bootSequence.versionTag, Tangerine.bootSequence.fetchSettings, Tangerine.bootSequence.guaranteeInstanceId, Tangerine.bootSequence.documentReady, Tangerine.bootSequence.loadI18n, Tangerine.bootSequence.handleCordovaEvents, Tangerine.bootSequence.loadSingletons, Tangerine.bootSequence.reloadUserSession, Tangerine.bootSequence.startBackbone];
  return Utils.execute(sequence);
};

Tangerine.boot();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVdBLFNBQVMsQ0FBQyxZQUFWLEdBSUU7RUFBQSxXQUFBLEVBQWMsU0FBQyxRQUFEOztBQUVaOzs7SUFJQSxTQUFTLENBQUMsRUFBVixHQUFtQixJQUFBLE9BQUEsQ0FBUSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQXZCO0lBQ25CLFFBQVEsQ0FBQyxJQUFULEdBQWdCLGFBQWEsQ0FBQyxJQUFkLENBQ2Q7TUFBQSxFQUFBLEVBQUksU0FBUyxDQUFDLEVBQWQ7TUFDQSxLQUFBLEVBQU8sTUFEUDtNQUVBLElBQUEsRUFBTSx3QkFGTjtNQUdBLFdBQUEsRUFDRTtRQUFBLFlBQUEsRUFBZSxJQUFmO09BSkY7S0FEYztJQU9oQixRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUF6QixHQUF1QztJQUd2QyxDQUFDLENBQUMsZ0JBQUYsR0FBcUI7TUFBQSxXQUFBLEVBQWMsZ0JBQWQ7O1dBRXJCLFFBQUEsQ0FBQTs7QUFFQTs7Ozs7Ozs7Ozs7RUFyQlksQ0FBZDtFQW1DQSxhQUFBLEVBQWUsU0FBQyxRQUFEO0FBR2IsUUFBQTtJQUFBLEVBQUEsR0FBSyxTQUFTLENBQUM7V0FFZixFQUFFLENBQUMsR0FBSCxDQUFPLGFBQVAsRUFBc0IsU0FBQyxLQUFELEVBQVEsR0FBUjtNQUVwQixJQUFBLENBQXlCLEtBQXpCO0FBQUEsZUFBTyxRQUFBLENBQUEsRUFBUDs7TUFFQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaO2FBR0EsRUFBRSxDQUFDLEdBQUgsQ0FDRTtRQUFBLEdBQUEsRUFBSyxVQUFBLEdBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUEvQjtRQUNBLEtBQUEsRUFDRTs7QUFBQTs7OztVQUlBLE1BQUEsRUFDRTtZQUFBLEdBQUEsRUFBSyxDQUFDLFNBQUMsR0FBRDtBQUNKLGtCQUFBO2NBQUEsSUFBVSxHQUFHLENBQUMsVUFBSixLQUFrQixRQUE1QjtBQUFBLHVCQUFBOztjQUVBLElBQUcsR0FBRyxDQUFDLFlBQVA7Z0JBQ0UsRUFBQSxHQUFLLEdBQUcsQ0FBQztnQkFFVCxJQUFVLEdBQUcsQ0FBQyxVQUFKLEtBQWtCLE9BQTVCO0FBQUEseUJBQUE7aUJBSEY7ZUFBQSxNQUFBO2dCQUtFLEVBQUEsR0FBSyxHQUFHLENBQUMsYUFMWDs7cUJBT0EsSUFBQSxDQUFLLEVBQUUsQ0FBQyxNQUFILENBQVUsQ0FBQyxDQUFYLEVBQWEsQ0FBYixDQUFMLEVBQXNCLElBQXRCO1lBVkksQ0FBRCxDQVdKLENBQUMsUUFYRyxDQUFBLENBQUw7V0FMRjtVQWtCQSxZQUFBLEVBQ0U7WUFBQSxHQUFBLEVBQU0sQ0FBRSxTQUFDLEdBQUQ7QUFFTixrQkFBQTtjQUFBLElBQUEsQ0FBYyxHQUFHLENBQUMsVUFBbEI7QUFBQSx1QkFBQTs7Y0FFQSxJQUFBLENBQUssR0FBRyxDQUFDLFVBQVQsRUFBcUIsSUFBckI7Y0FHQSxJQUFHLEdBQUcsQ0FBQyxVQUFKLEtBQWtCLFNBQXJCO3VCQUNFLElBQUEsQ0FBSyxVQUFBLEdBQVcsR0FBRyxDQUFDLFlBQXBCLEVBREY7ZUFBQSxNQUlLLElBQUcsR0FBRyxDQUFDLFVBQUosS0FBa0IsVUFBckI7dUJBQ0gsSUFBQSxDQUFLLFdBQUEsR0FBWSxHQUFHLENBQUMsU0FBckIsRUFERztlQUFBLE1BR0EsSUFBRyxHQUFHLENBQUMsVUFBSixLQUFrQixRQUFyQjtnQkFDSCxNQUFBLEdBQVM7a0JBQUEsR0FBQSxFQUFNLEdBQUcsQ0FBQyxHQUFWOztnQkFDVCxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQWhCLENBQXdCLFNBQUMsT0FBRDtrQkFDdEIsSUFBRyxPQUFPLENBQUMsU0FBUixLQUFxQixJQUF4QjtvQkFBa0MsTUFBTSxDQUFDLGFBQVAsR0FBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUF0RTs7a0JBQ0EsSUFBRyxPQUFPLENBQUMsU0FBUixLQUFxQixVQUF4QjsyQkFBd0MsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUF0RTs7Z0JBRnNCLENBQXhCO2dCQUdBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLEdBQUcsQ0FBQzt1QkFDdkIsSUFBQSxDQUFLLFNBQUEsR0FBVSxHQUFHLENBQUMsWUFBbkIsRUFBbUMsTUFBbkMsRUFORzs7WUFkQyxDQUFGLENBc0JMLENBQUMsUUF0QkksQ0FBQSxDQUFOO1dBbkJGO1NBRkY7T0FERixDQTZDQyxDQUFDLElBN0NGLENBNkNPLFNBQUE7QUFHTCxZQUFBO1FBQUEsVUFBQSxHQUFhO1FBRWIsS0FBQSxHQUFRLFNBQUE7QUFFTixjQUFBO1VBQUEsZ0JBQUEsR0FBbUIsQ0FBQyxNQUFBLEdBQVMsVUFBVixDQUFxQixDQUFDLEtBQXRCLENBQTRCLENBQUMsQ0FBN0I7aUJBRW5CLENBQUMsQ0FBQyxJQUFGLENBQ0U7WUFBQSxRQUFBLEVBQVUsTUFBVjtZQUNBLEdBQUEsRUFBSyxjQUFBLEdBQWUsZ0JBQWYsR0FBZ0MsT0FEckM7WUFFQSxLQUFBLEVBQU8sU0FBQyxHQUFEO2NBQ0wsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFjLEdBQWpCO3VCQUNFLEVBQUUsQ0FBQyxHQUFILENBQU87a0JBQUMsS0FBQSxFQUFNLGFBQVA7aUJBQVAsQ0FBNkIsQ0FBQyxJQUE5QixDQUFvQyxTQUFBO3lCQUFHLFFBQUEsQ0FBQTtnQkFBSCxDQUFwQyxFQURGOztZQURLLENBRlA7WUFLQSxPQUFBLEVBQVMsU0FBQyxHQUFEO2NBQ1AsVUFBQTtxQkFFQSxFQUFFLENBQUMsUUFBSCxDQUFZLEdBQUcsQ0FBQyxJQUFoQixFQUFzQixTQUFDLEtBQUQsRUFBUSxHQUFSO2dCQUNwQixJQUFHLEtBQUg7QUFDRSx5QkFBTyxLQUFBLENBQU0sMENBQUEsR0FBMkMsS0FBakQsRUFEVDs7dUJBRUEsS0FBQSxDQUFBO2NBSG9CLENBQXRCO1lBSE8sQ0FMVDtXQURGO1FBSk07ZUFrQlIsS0FBQSxDQUFBO01BdkJLLENBN0NQO0lBUG9CLENBQXRCO0VBTGEsQ0FuQ2Y7RUF1SEEsVUFBQSxFQUFZLFNBQUUsUUFBRjtJQUNWLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxNQUFiLENBQW9CLG9CQUFBLEdBQXFCLFNBQVMsQ0FBQyxPQUEvQixHQUF1QyxHQUF2QyxHQUEwQyxTQUFTLENBQUMsWUFBcEQsR0FBaUUsUUFBckY7V0FDQSxRQUFBLENBQUE7RUFGVSxDQXZIWjtFQStIQSxhQUFBLEVBQWdCLFNBQUUsUUFBRjtJQUNkLFNBQVMsQ0FBQyxRQUFWLEdBQXlCLElBQUEsUUFBQSxDQUFTO01BQUEsS0FBQSxFQUFRLFVBQVI7S0FBVDtXQUN6QixTQUFTLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQ0U7TUFBQSxPQUFBLEVBQVMsUUFBVDtNQUNBLEtBQUEsRUFBTyxTQUFBO2VBQ0wsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFuQixDQUF3QixTQUFTLENBQUMsUUFBUSxDQUFDLFFBQTNDLEVBQ0U7VUFBQSxLQUFBLEVBQU8sU0FBQTtZQUNMLE9BQU8sQ0FBQyxLQUFSLENBQWMsU0FBZDttQkFDQSxLQUFBLENBQU0saUNBQU47VUFGSyxDQUFQO1VBR0EsT0FBQSxFQUFTLFFBSFQ7U0FERjtNQURLLENBRFA7S0FERjtFQUZjLENBL0hoQjtFQTRJQSxtQkFBQSxFQUFxQixTQUFFLFFBQUY7SUFDbkIsSUFBQSxDQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsWUFBdkIsQ0FBUDthQUNFLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBbkIsQ0FDRTtRQUFBLFlBQUEsRUFBZSxLQUFLLENBQUMsU0FBTixDQUFBLENBQWY7T0FERixFQUdFO1FBQUEsS0FBQSxFQUFPLFNBQUE7aUJBQUcsS0FBQSxDQUFNLGdDQUFOO1FBQUgsQ0FBUDtRQUNBLE9BQUEsRUFBUyxRQURUO09BSEYsRUFERjtLQUFBLE1BQUE7YUFPRSxRQUFBLENBQUEsRUFQRjs7RUFEbUIsQ0E1SXJCO0VBc0pBLGFBQUEsRUFBZSxTQUFFLFFBQUY7V0FBZ0IsQ0FBQSxDQUFFLFNBQUE7YUFJL0IsUUFBQSxDQUFBO0lBSitCLENBQUY7RUFBaEIsQ0F0SmY7RUE0SkEsUUFBQSxFQUFVLFNBQUUsUUFBRjtXQUNSLElBQUksQ0FBQyxJQUFMLENBQ0U7TUFBQSxXQUFBLEVBQWMsT0FBZDtNQUNBLEdBQUEsRUFBYyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFVBQXZCLENBRGQ7TUFFQSxRQUFBLEVBQWMsU0FBUyxDQUFDLE9BRnhCO0tBREYsRUFJRSxTQUFDLEdBQUQsRUFBTSxDQUFOO01BQ0EsTUFBTSxDQUFDLENBQVAsR0FBVzthQUNYLFFBQUEsQ0FBQTtJQUZBLENBSkY7RUFEUSxDQTVKVjtFQXFLQSxtQkFBQSxFQUFxQixTQUFFLFFBQUY7SUFFbkIsUUFBUSxDQUFDLGdCQUFULENBQTBCLGFBQTFCLEVBRUksU0FBQTtNQUNFLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixRQUExQixFQUFxQyxTQUFBO2VBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUI7TUFBdEIsQ0FBckM7TUFDQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsU0FBQTtlQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO01BQXRCLENBQXJDOztBQUVBOzs7Ozs7YUFRQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsWUFBMUIsRUFBd0MsU0FBUyxDQUFDLFlBQWxELEVBQWdFLEtBQWhFO0lBWkYsQ0FGSixFQWdCSSxLQWhCSjtXQW1CQSxRQUFBLENBQUE7RUFyQm1CLENBcktyQjtFQTRMQSxjQUFBLEVBQWdCLFNBQUUsUUFBRjtJQUVkLE1BQU0sQ0FBQyxFQUFQLEdBQWdCLElBQUEsV0FBQSxDQUFBO0lBQ2hCLFNBQVMsQ0FBQyxNQUFWLEdBQXVCLElBQUEsTUFBQSxDQUFBO0lBQ3ZCLFNBQVMsQ0FBQyxJQUFWLEdBQXVCLElBQUEsVUFBQSxDQUFBO0lBQ3ZCLFNBQVMsQ0FBQyxHQUFWLEdBQXVCLElBQUEsY0FBQSxDQUNyQjtNQUFBLElBQUEsRUFBUyxTQUFTLENBQUMsSUFBbkI7TUFDQSxNQUFBLEVBQVMsU0FBUyxDQUFDLE1BRG5CO0tBRHFCO0lBR3ZCLFNBQVMsQ0FBQyxHQUFWLEdBQXVCLElBQUEsR0FBQSxDQUFBO0lBQ3ZCLFNBQVMsQ0FBQyxPQUFWLEdBQXdCLElBQUEsT0FBQSxDQUFBO0lBR3hCLFNBQVMsQ0FBQyxHQUFWLEdBQW9CLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBQTtJQUNwQixTQUFTLENBQUMsR0FBRyxDQUFDLEVBQWQsR0FBdUIsSUFBQSxVQUFVLENBQUMsYUFBWCxDQUFBO0lBRXZCLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQWpCLENBQTRCO01BQUEsT0FBQSxFQUFTLFVBQVQ7S0FBNUI7SUFDQSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFqQixDQUE0QjtNQUFBLFVBQUEsRUFBWSxVQUFaO0tBQTVCO0lBQ0EsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBakIsQ0FBNEI7TUFBQSxlQUFBLEVBQWlCLFlBQWpCO0tBQTVCO1dBQ0EsUUFBQSxDQUFBO0VBbEJjLENBNUxoQjtFQWdOQSxpQkFBQSxFQUFtQixTQUFFLFFBQUY7V0FFakIsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFmLENBQ0U7TUFBQSxLQUFBLEVBQU8sU0FBQTtlQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUFBO01BQUgsQ0FBUDtNQUNBLE9BQUEsRUFBUyxRQURUO0tBREY7RUFGaUIsQ0FoTm5CO0VBc05BLGFBQUEsRUFBZSxTQUFFLFFBQUY7SUFDYixRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWpCLENBQUE7V0FDQSxRQUFBLENBQUE7RUFGYSxDQXROZjs7O0FBMk5GLFNBQVMsQ0FBQyxJQUFWLEdBQWlCLFNBQUE7QUFFZixNQUFBO0VBQUEsUUFBQSxHQUFXLENBQ1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxXQURkLEVBRVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUZkLEVBR1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUhkLEVBSVQsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUpkLEVBS1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxtQkFMZCxFQU1ULFNBQVMsQ0FBQyxZQUFZLENBQUMsYUFOZCxFQU9ULFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFQZCxFQVFULFNBQVMsQ0FBQyxZQUFZLENBQUMsbUJBUmQsRUFTVCxTQUFTLENBQUMsWUFBWSxDQUFDLGNBVGQsRUFVVCxTQUFTLENBQUMsWUFBWSxDQUFDLGlCQVZkLEVBV1QsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQVhkO1NBY1gsS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFkO0FBaEJlOztBQWtCakIsU0FBUyxDQUFDLElBQVYsQ0FBQSIsImZpbGUiOiJib290LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG4jIFRoaXMgZmlsZSBsb2FkcyB0aGUgbW9zdCBiYXNpYyBzZXR0aW5ncyByZWxhdGVkIHRvIFRhbmdlcmluZSBhbmQga2lja3Mgb2ZmIEJhY2tib25lJ3Mgcm91dGVyLlxuIyAgICogVGhlIGRvYyBgY29uZmlndXJhdGlvbmAgaG9sZHMgdGhlIG1ham9yaXR5IG9mIHNldHRpbmdzLlxuIyAgICogVGhlIFNldHRpbmdzIG9iamVjdCBjb250YWlucyBtYW55IGNvbnZlbmllbmNlIGZ1bmN0aW9ucyB0aGF0IHVzZSBjb25maWd1cmF0aW9uJ3MgZGF0YS5cbiMgICAqIFRlbXBsYXRlcyBzaG91bGQgY29udGFpbiBvYmplY3RzIGFuZCBjb2xsZWN0aW9ucyBvZiBvYmplY3RzIHJlYWR5IHRvIGJlIHVzZWQgYnkgYSBGYWN0b3J5LlxuIyBBbHNvIGludGlhbGl6ZWQgaGVyZSBhcmU6IEJhY2tib25lLmpzLCBhbmQgalF1ZXJ5LmkxOG5cbiMgQW55dGhpbmcgdGhhdCBmYWlscyBiYWQgaGVyZSBzaG91bGQgcHJvYmFibHkgYmUgZmFpbGluZyBpbiBmcm9udCBvZiB0aGUgdXNlci5cblxuIyBVdGlscy5kaXNhYmxlQ29uc29sZUxvZygpXG4jIFV0aWxzLmRpc2FibGVDb25zb2xlQXNzZXJ0KClcblxuVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZSA9XG5cbiAgIyBCYXNpYyBjb25maWd1cmF0aW9uXG5cbiAgYmFzaWNDb25maWcgOiAoY2FsbGJhY2spIC0+XG5cbiAgICAjIyNcbiAgICBQb3VjaCBjb25maWd1cmF0aW9uXG4gICAgIyMjXG5cbiAgICBUYW5nZXJpbmUuZGIgPSBuZXcgUG91Y2hEQihUYW5nZXJpbmUuY29uZi5kYl9uYW1lKVxuICAgIEJhY2tib25lLnN5bmMgPSBCYWNrYm9uZVBvdWNoLnN5bmNcbiAgICAgIGRiOiBUYW5nZXJpbmUuZGJcbiAgICAgIGZldGNoOiAndmlldydcbiAgICAgIHZpZXc6ICd0YW5nZXJpbmUvYnlDb2xsZWN0aW9uJ1xuICAgICAgdmlld09wdGlvbnM6XG4gICAgICAgIGluY2x1ZGVfZG9jcyA6IHRydWVcblxuICAgIEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5pZEF0dHJpYnV0ZSA9ICdfaWQnXG5cbiAgICAjIHNldCB1bmRlcnNjb3JlJ3MgdGVtcGxhdGUgZW5naW5lIHRvIGFjY2VwdCBoYW5kbGViYXItc3R5bGUgdmFyaWFibGVzXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0gaW50ZXJwb2xhdGUgOiAvXFx7XFx7KC4rPylcXH1cXH0vZ1xuXG4gICAgY2FsbGJhY2soKVxuXG4gICAgIyMjXG4gICAgVGFuZ2VyaW5lLmRiLmRlc3Ryb3kgKGVycm9yKSAtPlxuICAgICAgcmV0dXJuIGFsZXJ0IGVycm9yIGlmIGVycm9yP1xuXG4gICAgICBUYW5nZXJpbmUuZGIgPSBuZXcgUG91Y2hEQihcInRhbmdlcmluZVwiKVxuICAgICAgQmFja2JvbmUuc3luYyA9IEJhY2tib25lUG91Y2guc3luY1xuICAgICAgICBkYjogVGFuZ2VyaW5lLmRiXG5cblxuICAgICAgY2FsbGJhY2soKVxuICAgICMjI1xuXG5cbiAgIyBDaGVjayBmb3IgbmV3IGRhdGFiYXNlLCBpbml0aWFsaXplIHdpdGggcGFja3MgaWYgbm9uZSBleGlzdHNcbiAgY2hlY2tEYXRhYmFzZTogKGNhbGxiYWNrKSAtPlxuXG4gICAgIyBMb2NhbCB0YW5nZXJpbmUgZGF0YWJhc2UgaGFuZGxlXG4gICAgZGIgPSBUYW5nZXJpbmUuZGJcblxuICAgIGRiLmdldCBcImluaXRpYWxpemVkXCIsIChlcnJvciwgZG9jKSAtPlxuXG4gICAgICByZXR1cm4gY2FsbGJhY2soKSB1bmxlc3MgZXJyb3JcblxuICAgICAgY29uc29sZS5sb2cgXCJpbml0aWFsaXppbmcgZGF0YWJhc2VcIlxuXG4gICAgICAjIFNhdmUgdmlld3NcbiAgICAgIGRiLnB1dChcbiAgICAgICAgX2lkOiBcIl9kZXNpZ24vI3tUYW5nZXJpbmUuY29uZi5kZXNpZ25fZG9jfVwiXG4gICAgICAgIHZpZXdzOlxuICAgICAgICAgICMjI1xuICAgICAgICAgICAgVXNlZCBmb3IgcmVwbGljYXRpb24uXG4gICAgICAgICAgICBXaWxsIGdpdmUgb25lIGtleSBmb3IgYWxsIGRvY3VtZW50cyBhc3NvY2lhdGVkIHdpdGggYW4gYXNzZXNzbWVudCBvciBjdXJyaWN1bHVtLlxuICAgICAgICAgICMjI1xuICAgICAgICAgIGJ5REtleTpcbiAgICAgICAgICAgIG1hcDogKChkb2MpIC0+XG4gICAgICAgICAgICAgIHJldHVybiBpZiBkb2MuY29sbGVjdGlvbiBpcyBcInJlc3VsdFwiXG5cbiAgICAgICAgICAgICAgaWYgZG9jLmN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGlkID0gZG9jLmN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgICMgRG8gbm90IHJlcGxpY2F0ZSBrbGFzc2VzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIGRvYy5jb2xsZWN0aW9uIGlzIFwia2xhc3NcIlxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWQgPSBkb2MuYXNzZXNzbWVudElkXG5cbiAgICAgICAgICAgICAgZW1pdCBpZC5zdWJzdHIoLTUsNSksIG51bGxcbiAgICAgICAgICAgICkudG9TdHJpbmcoKVxuXG4gICAgICAgICAgYnlDb2xsZWN0aW9uOlxuICAgICAgICAgICAgbWFwIDogKCAoZG9jKSAtPlxuXG4gICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgZG9jLmNvbGxlY3Rpb25cblxuICAgICAgICAgICAgICBlbWl0IGRvYy5jb2xsZWN0aW9uLCBudWxsXG5cbiAgICAgICAgICAgICAgIyBCZWxvbmdzIHRvIHJlbGF0aW9uc2hpcFxuICAgICAgICAgICAgICBpZiBkb2MuY29sbGVjdGlvbiBpcyAnc3VidGVzdCdcbiAgICAgICAgICAgICAgICBlbWl0IFwic3VidGVzdC0je2RvYy5hc3Nlc3NtZW50SWR9XCJcblxuICAgICAgICAgICAgICAjIEJlbG9uZ3MgdG8gcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAgIGVsc2UgaWYgZG9jLmNvbGxlY3Rpb24gaXMgJ3F1ZXN0aW9uJ1xuICAgICAgICAgICAgICAgIGVtaXQgXCJxdWVzdGlvbi0je2RvYy5zdWJ0ZXN0SWR9XCJcblxuICAgICAgICAgICAgICBlbHNlIGlmIGRvYy5jb2xsZWN0aW9uIGlzICdyZXN1bHQnXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gX2lkIDogZG9jLl9pZFxuICAgICAgICAgICAgICAgIGRvYy5zdWJ0ZXN0RGF0YS5mb3JFYWNoIChzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5wcm90b3R5cGUgaXMgXCJpZFwiIHRoZW4gcmVzdWx0LnBhcnRpY2lwYW50SWQgPSBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWRcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QucHJvdG90eXBlIGlzIFwiY29tcGxldGVcIiB0aGVuIHJlc3VsdC5lbmRUaW1lID0gc3VidGVzdC5kYXRhLmVuZF90aW1lXG4gICAgICAgICAgICAgICAgcmVzdWx0LnN0YXJ0VGltZSA9IGRvYy5zdGFydF90aW1lXG4gICAgICAgICAgICAgICAgZW1pdCBcInJlc3VsdC0je2RvYy5hc3Nlc3NtZW50SWR9XCIsIHJlc3VsdFxuXG4gICAgICAgICAgICApLnRvU3RyaW5nKClcbiAgICAgICkudGhlbiAtPlxuXG5cbiAgICAgICAgcGFja051bWJlciA9IDBcblxuICAgICAgICBkb09uZSA9IC0+XG5cbiAgICAgICAgICBwYWRkZWRQYWNrTnVtYmVyID0gKFwiMDAwMFwiICsgcGFja051bWJlcikuc2xpY2UoLTQpXG5cbiAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgdXJsOiBcImpzL2luaXQvcGFjayN7cGFkZGVkUGFja051bWJlcn0uanNvblwiXG4gICAgICAgICAgICBlcnJvcjogKHJlcykgLT5cbiAgICAgICAgICAgICAgaWYgcmVzLnN0YXR1cyBpcyA0MDRcbiAgICAgICAgICAgICAgICBkYi5wdXQoe1wiX2lkXCI6XCJpbml0aWFsaXplZFwifSkudGhlbiggLT4gY2FsbGJhY2soKSlcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXMpIC0+XG4gICAgICAgICAgICAgIHBhY2tOdW1iZXIrK1xuXG4gICAgICAgICAgICAgIGRiLmJ1bGtEb2NzIHJlcy5kb2NzLCAoZXJyb3IsIGRvYykgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsZXJ0IFwiY291bGQgbm90IHNhdmUgaW5pdGlhbGl6YXRpb24gZG9jdW1lbnQ6ICN7ZXJyb3J9XCJcbiAgICAgICAgICAgICAgICBkb09uZSgpXG5cbiAgICAgICAgZG9PbmUoKSAjIGtpY2sgaXQgb2ZmXG5cblxuICAjIFB1dCB0aGlzIHZlcnNpb24ncyBpbmZvcm1hdGlvbiBpbiB0aGUgZm9vdGVyXG4gIHZlcnNpb25UYWc6ICggY2FsbGJhY2sgKSAtPlxuICAgICQoXCIjZm9vdGVyXCIpLmFwcGVuZChcIjxkaXYgaWQ9J3ZlcnNpb24nPiN7VGFuZ2VyaW5lLnZlcnNpb259LSN7VGFuZ2VyaW5lLmJ1aWxkVmVyc2lvbn08L2Rpdj5cIilcbiAgICBjYWxsYmFjaygpXG5cblxuXG4gICMgZ2V0IG91ciBsb2NhbCBUYW5nZXJpbmUgc2V0dGluZ3NcbiAgIyB0aGVzZSBkbyB0ZW5kIHRvIGNoYW5nZSBkZXBlbmRpbmcgb24gdGhlIHBhcnRpY3VsYXIgaW5zdGFsbCBvZiB0aGVcbiAgZmV0Y2hTZXR0aW5ncyA6ICggY2FsbGJhY2sgKSAtPlxuICAgIFRhbmdlcmluZS5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyBcIl9pZFwiIDogXCJzZXR0aW5nc1wiXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLmZldGNoXG4gICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5zYXZlIFRhbmdlcmluZS5kZWZhdWx0cy5zZXR0aW5ncyxcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgYXJndW1lbnRzXG4gICAgICAgICAgICBhbGVydCBcIkNvdWxkIG5vdCBzYXZlIGRlZmF1bHQgc2V0dGluZ3NcIlxuICAgICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG5cblxuICAjIGZvciB1cGdyYWRlc1xuICBndWFyYW50ZWVJbnN0YW5jZUlkOiAoIGNhbGxiYWNrICkgLT5cbiAgICB1bmxlc3MgVGFuZ2VyaW5lLnNldHRpbmdzLmhhcyhcImluc3RhbmNlSWRcIilcbiAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5zYXZlXG4gICAgICAgIFwiaW5zdGFuY2VJZFwiIDogVXRpbHMuaHVtYW5HVUlEKClcbiAgICAgICxcbiAgICAgICAgZXJyb3I6IC0+IGFsZXJ0IFwiQ291bGQgbm90IHNhdmUgbmV3IEluc3RhbmNlIElkXCJcbiAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjaygpXG5cbiAgZG9jdW1lbnRSZWFkeTogKCBjYWxsYmFjayApIC0+ICQgLT5cblxuICAgICMkKFwiPGJ1dHRvbiBpZD0ncmVsb2FkJz5yZWxvYWQgbWU8L2J1dHRvbj5cIikuYXBwZW5kVG8oXCIjZm9vdGVyXCIpLmNsaWNrIC0+IGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG5cbiAgICBjYWxsYmFjaygpXG5cbiAgbG9hZEkxOG46ICggY2FsbGJhY2sgKSAtPlxuICAgIGkxOG4uaW5pdFxuICAgICAgZmFsbGJhY2tMbmcgOiBcImVuLVVTXCJcbiAgICAgIGxuZyAgICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxhbmd1YWdlXCIpXG4gICAgICByZXNTdG9yZSAgICA6IFRhbmdlcmluZS5sb2NhbGVzXG4gICAgLCAoZXJyLCB0KSAtPlxuICAgICAgd2luZG93LnQgPSB0XG4gICAgICBjYWxsYmFjaygpXG5cbiAgaGFuZGxlQ29yZG92YUV2ZW50czogKCBjYWxsYmFjayApIC0+XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwiZGV2aWNlcmVhZHlcIlxuICAgICAgLFxuICAgICAgICAtPlxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJvbmxpbmVcIiwgIC0+IFRhbmdlcmluZS5vbmxpbmUgPSB0cnVlXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIm9mZmxpbmVcIiwgLT4gVGFuZ2VyaW5lLm9ubGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAjIyNcbiAgICAgICAgICAjIFJlc3BvbmRpbmcgdG8gdGhpcyBldmVudCB0dXJucyBvbiB0aGUgbWVudSBidXR0b25cbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwibWVudWJ1dHRvblwiLCAoZXZlbnQpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIm1lbnUgYnV0dG9uXCJcbiAgICAgICAgICAsIGZhbHNlXG4gICAgICAgICAgIyMjXG5cbiAgICAgICAgICAjIHByZXZlbnRzIGRlZmF1bHRcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwiYmFja2J1dHRvblwiLCBUYW5nZXJpbmUub25CYWNrQnV0dG9uLCBmYWxzZVxuXG4gICAgICAsIGZhbHNlXG5cbiAgICAjIGFkZCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBidXQgZG9uJ3QgZGVwZW5kIG9uIHRoZW0gY2FsbGluZyBiYWNrXG4gICAgY2FsbGJhY2soKVxuXG4gIGxvYWRTaW5nbGV0b25zOiAoIGNhbGxiYWNrICkgLT5cbiAgICAjIFNpbmdsZXRvbnNcbiAgICB3aW5kb3cudm0gPSBuZXcgVmlld01hbmFnZXIoKVxuICAgIFRhbmdlcmluZS5yb3V0ZXIgPSBuZXcgUm91dGVyKClcbiAgICBUYW5nZXJpbmUudXNlciAgID0gbmV3IFRhYmxldFVzZXIoKVxuICAgIFRhbmdlcmluZS5uYXYgICAgPSBuZXcgTmF2aWdhdGlvblZpZXdcbiAgICAgIHVzZXIgICA6IFRhbmdlcmluZS51c2VyXG4gICAgICByb3V0ZXIgOiBUYW5nZXJpbmUucm91dGVyXG4gICAgVGFuZ2VyaW5lLmxvZyAgICA9IG5ldyBMb2coKVxuICAgIFRhbmdlcmluZS5zZXNzaW9uID0gbmV3IFNlc3Npb24oKVxuXG4gICAgIyAgaW5pdCAgVGFuZ2VyaW5lIGFzIGEgTWFyaW9uZXR0ZSBhcHBcbiAgICBUYW5nZXJpbmUuYXBwID0gbmV3IE1hcmlvbmV0dGUuQXBwbGljYXRpb24oKVxuICAgIFRhbmdlcmluZS5hcHAucm0gPSBuZXcgTWFyaW9uZXR0ZS5SZWdpb25NYW5hZ2VyKCk7XG5cbiAgICBUYW5nZXJpbmUuYXBwLnJtLmFkZFJlZ2lvbnMgc2l0ZU5hdjogXCIjc2l0ZU5hdlwiXG4gICAgVGFuZ2VyaW5lLmFwcC5ybS5hZGRSZWdpb25zIG1haW5SZWdpb246IFwiI2NvbnRlbnRcIlxuICAgIFRhbmdlcmluZS5hcHAucm0uYWRkUmVnaW9ucyBkYXNoYm9hcmRSZWdpb246IFwiI2Rhc2hib2FyZFwiXG4gICAgY2FsbGJhY2soKVxuXG4gIHJlbG9hZFVzZXJTZXNzaW9uOiAoIGNhbGxiYWNrICkgLT5cblxuICAgIFRhbmdlcmluZS51c2VyLnNlc3Npb25SZWZyZXNoXG4gICAgICBlcnJvcjogLT4gVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcbiAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG5cbiAgc3RhcnRCYWNrYm9uZTogKCBjYWxsYmFjayApIC0+XG4gICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydCgpXG4gICAgY2FsbGJhY2soKSAjIGZvciB0ZXN0aW5nXG5cblxuVGFuZ2VyaW5lLmJvb3QgPSAtPlxuXG4gIHNlcXVlbmNlID0gW1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UuYmFzaWNDb25maWdcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmNoZWNrRGF0YWJhc2VcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLnZlcnNpb25UYWdcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmZldGNoU2V0dGluZ3NcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmd1YXJhbnRlZUluc3RhbmNlSWRcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmRvY3VtZW50UmVhZHlcbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLmxvYWRJMThuXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5oYW5kbGVDb3Jkb3ZhRXZlbnRzXG4gICAgVGFuZ2VyaW5lLmJvb3RTZXF1ZW5jZS5sb2FkU2luZ2xldG9uc1xuICAgIFRhbmdlcmluZS5ib290U2VxdWVuY2UucmVsb2FkVXNlclNlc3Npb25cbiAgICBUYW5nZXJpbmUuYm9vdFNlcXVlbmNlLnN0YXJ0QmFja2JvbmVcbiAgXVxuXG4gIFV0aWxzLmV4ZWN1dGUgc2VxdWVuY2VcblxuVGFuZ2VyaW5lLmJvb3QoKVxuIl19
