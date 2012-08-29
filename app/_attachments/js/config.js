var Tangerine;

Tangerine = {};

Tangerine = {
  "db_name": "tangerine",
  "design_doc": "tangerine"
};

Tangerine.$db = $.couch.db(Tangerine.db_name);

Tangerine.$db.openDoc("Config", {
  success: function(data) {
    return Tangerine.config = data;
  }
}, {
  async: false
});

Tangerine.$db.openDoc("TangerineSettings", {
  success: function(data) {
    return Tangerine.settings = data;
  },
  error: function(code) {
    if (code === 404) {
      return Tangerine.$db.openDoc("TangerineSettingsDefault", {
        success: function(doc) {
          doc._id = "TangerineSettings";
          doc._rev = void 0;
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

Backbone.couch_connector.config.db_name = Tangerine.db_name;

Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc;

Backbone.couch_connector.config.global_changes = false;

$.i18n.init({
  "lng": Tangerine.settings.language
});

window.t = $.t;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
