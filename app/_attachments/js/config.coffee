# This file loads the most basic settings related to Tangerine.
# it downloads a majority of them from JSON docs in _docs
#   * Config, TangerineSettings(Default), and Templates
# Including those necessary for: Backbone.js, and jQuery.i18n

Tangerine = {}

Tangerine = 
  "db_name"    : "tangerine"
  "design_doc" : "tangerine"

Tangerine.$db = $.couch.db(Tangerine.db_name)

# Grab our system config doc
Tangerine.$db.openDoc "Config",            { success:(data) -> Tangerine.config    = data }, { async: false }

#
# get our Tangerine settings
#
Tangerine.$db.openDoc "TangerineSettings", {

  # If the doc is there, use the settings
  success:(data) -> Tangerine.settings = data

  # if the docs's there, use default settings, save as normal settings
  error: (code) ->
    if code == 404
      Tangerine.$db.openDoc "TangerineSettingsDefault", {
        success: (doc) ->
          doc._id = "TangerineSettings"
          doc._rev = undefined
          Tangerine.settings = doc
          Tangerine.$db.saveDoc doc
      }, { async: false }
}, { async: false }

# Template files for ease of use in grids
Tangerine.$db.openDoc "Templates",         { success:(data) -> Tangerine.templates = data }, { async: false }

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
