var Tangerine;

Tangerine = {};

Tangerine = {
  "db_name": "tangerine",
  "design_doc": "tangerine"
};

$.couch.db(Tangerine.db_name).openDoc("Config", {
  success: function(data) {
    return Tangerine.config = data;
  }
}, {
  async: false
});

$.couch.db(Tangerine.db_name).openDoc("TangerineSettings", {
  success: function(data) {
    return Tangerine.settings = data;
  }
}, {
  async: false
});

$.couch.db(Tangerine.db_name).openDoc("Templates", {
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
