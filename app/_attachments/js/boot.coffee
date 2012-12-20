# This file loads the most basic settings related to Tangerine.
# it downloads a majority of them from JSON docs in _docs
#   * Config, TangerineSettings(Default), and Templates
#   * Config holds things that will not change
#   * Tangerine Settings holds things that are specific to each instance of tangerine
#   * Group Settings hold things that are specific to each Group
#   * Templates should contain objects and collections of objects ready to be used by a Factory.
# Including those necessary for: Backbone.js, and jQuery.i18n

# Utils.disableConsoleLog()
# Utils.disableConsoleAssert()

Tangerine = 
  "db_name"    : "tangerine"
  "design_doc" : "ojai"

# global tangerine database handle
Tangerine.$db = $.couch.db(Tangerine.db_name)

# Backbone configuration
Backbone.couch_connector.config.db_name   = Tangerine.db_name
Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc
Backbone.couch_connector.config.global_changes = false

# set underscore's template engine to accept handlebar-style variables
_.templateSettings = interpolate : /\{\{(.+?)\}\}/g

# Grab our system config doc
Tangerine.config = new Config "_id" : "configuration"
Tangerine.config.fetch
  error   : -> console.log arguments
  success : ->

    # get our Tangerine settings
    Tangerine.settings = new Settings "_id" : "settings"
    Tangerine.settings.fetch
      success: ->
        Tangerine.onSettingsLoad()
      error: ->
        Tangerine.settings.set Tangerine.config.getDefault "settings"

        Tangerine.settings.save null,
          error: ->
            console.log arguments
          success: ->
            Tangerine.onSettingsLoad()


Tangerine.onSettingsLoad = ->
  $.i18n.init "lng" : Tangerine.settings.get "language"
  window.t = $.t # give us a nice handle

  # Template files for ease of use in grids
  Tangerine.templates = new Template "_id" : "templates"
  Tangerine.templates.fetch
    success: ->

      $ ->
        # Start the application

        window.vm = new ViewManager()

        # Singletons
        # Tangerine.log    = new Log()
        Tangerine.router = new Router()
        Tangerine.user   = new User()
        Tangerine.nav    = new NavigationView
          user   : Tangerine.user
          router : Tangerine.router

        Tangerine.user.fetch
          success : -> Backbone.history.start()
          error   : -> Backbone.history.start()

