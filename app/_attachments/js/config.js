var $db, Tangerine;

Tangerine = {};

Tangerine = {
  "db_name": "tangerine",
  "design_doc": "tangerine"
};

$db = $.couch.db(Tangerine.db_name);

$db.openDoc("Config", {
  success: function(data) {
    return Tangerine.config = data;
  }
}, {
  async: false
});

$db.openDoc("TangerineSettings", {
  success: function(data) {
    return Tangerine.settings = data;
  },
  error: function(code) {
    if (a === 404) {
      return $db.openDoc("TangerineSettingsDefault", {
        success: function(doc) {
          doc._id = "TangerineSettings";
          doc._rev = void 0;
          Tangerine.settings = doc;
          return $db.saveDoc(doc);
        }
      }, {
        async: false
      });
    }
  }
}, {
  async: false
});

$db.openDoc("Templates", {
  success: function(data) {
    return Tangerine.templates = data;
  }
}, {
  async: false
});

Tangerine.config.address.cloud.url = "http://" + Tangerine.config.address.cloud.name + ":" + Tangerine.config.address.cloud.host + Tangerine.config.address.cloud.target + "/" + Tangerine.config.address.cloud.db_name;

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
