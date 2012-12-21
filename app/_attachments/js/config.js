var Tangerine;

Tangerine = {};

Tangerine = {
  "dbName": String(window.location.pathname).split("/")[1],
  "designDoc": "tangerine"
};

Tangerine.$db = $.couch.db(Tangerine.dbName);

Tangerine.$db.openDoc("Config", {
  success: function(data) {
    return Tangerine.config = data;
  }
}, {
  async: false
});

Tangerine.$db.openDoc("TangerineSettings", {
  success: function(data) {
    Tangerine.settings = data;
    $.i18n.init({
      "lng": Tangerine.settings.language
    });
    return window.t = $.t;
  },
  error: function(code) {
    if (code === 404) {
      return Tangerine.$db.openDoc("TangerineSettingsDefault", {
        success: function(doc) {
          doc._id = "TangerineSettings";
          delete doc._rev;
          Tangerine.settings = doc;
          return Tangerine.$db.saveDoc(doc);
        }
      }, {
        async: false
      });
    }
  }
}, {
  async: false
});

Tangerine.$db.openDoc("Templates", {
  success: function(data) {
    return Tangerine.templates = data;
  }
}, {
  async: false
});

Backbone.couch_connector.config.db_name = Tangerine.dbName;

Backbone.couch_connector.config.ddoc_name = Tangerine.designDoc;

Backbone.couch_connector.config.global_changes = false;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
