Tangerine = {}

Tangerine = 
  "db_name"    : "tangerine"
  "design_doc" : "tangerine"

$db = $.couch.db(Tangerine.db_name)

# Grab our config docs
$db.openDoc "Config",            { success:(data) -> Tangerine.config    = data }, { async: false }
# get our settings
$db.openDoc "TangerineSettings", {
  success:(data) -> Tangerine.settings  = data

  # if the settings aren't there, use default settings, save as normal settings
  error: (code) ->
    if a == 404
      $db.openDoc "TangerineSettingsDefault"
      , {
      success: (doc) ->
        doc._id = "TangerineSettings"
        doc._rev = undefined
        Tangerine.settings = doc
        $db.saveDoc doc
      }, { async: false }
}, { async: false }
$db.openDoc "Templates",         { success:(data) -> Tangerine.templates = data }, { async: false }

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
