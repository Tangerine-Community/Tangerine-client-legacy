var Tangerine;

Tangerine = {
  "db_name": window.location.pathname.split("/")[1],
  "design_doc": "ojai"
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
      return $(function() {
        window.vm = new ViewManager();
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
    }
  });
};
