var Tangerine;

Tangerine = {
  "db_name": window.location.pathname.split("/")[1],
  "design_doc": _.last(String(window.location).split("_design/")).split("/")[0]
};

Tangerine.$db = $.couch.db(Tangerine.db_name);

Backbone.couch_connector.config.db_name = Tangerine.db_name;

Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc;

Backbone.couch_connector.config.global_changes = false;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

Tangerine.config = new Config({
  "_id": "configuration"
});

Tangerine.config.fetch({
  error: function() {
    console.log("could not fetch configuration");
    return console.log(arguments);
  },
  success: function() {
    Tangerine.settings = new Settings({
      "_id": "settings"
    });
    return Tangerine.settings.fetch({
      success: function() {
        return Tangerine.onSettingsLoad();
      },
      error: function() {
        Tangerine.settings.set(Tangerine.config.getDefault("settings"));
        return Tangerine.settings.save(null, {
          error: function() {
            console.log("couldn't save new settings");
            return console.log(arguments);
          },
          success: function() {
            return Tangerine.onSettingsLoad();
          }
        });
      }
    });
  }
});

Tangerine.onSettingsLoad = function() {
  $.i18n.init({
    "lng": Tangerine.settings.get("language")
  });
  window.t = $.t;
  Tangerine.templates = new Template({
    "_id": "templates"
  });
  return Tangerine.templates.fetch({
    success: function() {
      return Tangerine.ensureAdmin(function() {
        return $(function() {
          window.vm = new ViewManager();
          if (Tangerine.settings.get("context") !== "server") {
            document.addEventListener("deviceready", function() {
              return document.addEventListener("backbutton", function(event) {
                if (Tangerine.activity === "assessment run") {
                  if (confirm("Assessment not finished. Continue to main screen?")) {
                    Tangerine.activity = "";
                    return window.history.back();
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              }, false);
            }, false);
          }
          Tangerine.router = new Router();
          Tangerine.user = new User();
          Tangerine.nav = new NavigationView({
            user: Tangerine.user,
            router: Tangerine.router
          });
          return Tangerine.user.sessionRefresh({
            success: function() {
              return Backbone.history.start();
            }
          });
        });
      });
    }
  });
};

Tangerine.ensureAdmin = function(callback) {
  if (Tangerine.settings.get("context") === "mobile" && !Tangerine.settings.has("adminEnsured")) {
    return $.couch.login({
      name: "admin",
      password: "password",
      success: function() {
        var _this = this;
        return $.couch.userDb(function(uDB) {
          return uDB.openDoc("org.couchdb.user:admin", {
            success: function() {
              return $.couch.logout({
                success: function() {
                  Tangerine.settings.save({
                    "adminEnsured": true
                  });
                  return callback();
                },
                error: function() {
                  console.log("error logging out admin user");
                  return console.log(arguments);
                }
              });
            },
            error: function() {
              var _this = this;
              return $.ajax({
                url: "/_users/org.couchdb.user:admin",
                type: "PUT",
                dataType: "json",
                data: JSON.stringify({
                  name: "admin",
                  password: null,
                  roles: [],
                  type: "user",
                  _id: "org.couchdb.user:admin"
                }),
                success: function(data) {
                  Tangerine.settings.save({
                    "adminEnsured": true
                  });
                  return $.couch.logout({
                    success: function() {
                      return callback();
                    },
                    error: function() {
                      console.log("Error logging out admin user");
                      return console.log(arguments);
                    }
                  });
                },
                error: function() {
                  console.log("Error ensuring admin _user doc");
                  return console.log(arguments);
                }
              });
            }
          });
        });
      }
    });
  } else {
    return callback();
  }
};
