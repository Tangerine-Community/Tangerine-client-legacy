Tangerine = {}

Tangerine = 
  "db_name"    : "tangerine"
  "design_doc" : "tangerine"

# Grab our config docs
$.couch.db(Tangerine.db_name).openDoc "Config",            { success:(data) -> Tangerine.config    = data }, { async: false }
$.couch.db(Tangerine.db_name).openDoc "TangerineSettings", { success:(data) -> Tangerine.settings  = data }, { async: false }
$.couch.db(Tangerine.db_name).openDoc "Templates",         { success:(data) -> Tangerine.templates = data }, { async: false }

# default address we sync to
Tangerine.config.address.cloud.url = "http://" + 
  Tangerine.config.address.cloud.name + ":" + 
  Tangerine.config.address.cloud.host + 
  Tangerine.config.address.cloud.target + "/" +
  Tangerine.config.address.cloud.db_name

# Backbone configuration
Backbone.couch_connector.config.db_name   = Tangerine.db_name
Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc
Backbone.couch_connector.config.global_changes = false

# initialize i18next.js
$.i18n.init "lng" : Tangerine.settings.language
window.t = $.t # give us a nice handle

# set underscore's template engine to accept handlebar-style variables
_.templateSettings = 
  interpolate : /\{\{(.+?)\}\}/g
