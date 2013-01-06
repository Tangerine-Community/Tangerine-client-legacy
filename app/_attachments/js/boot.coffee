# This file loads the most basic settings related to Tangerine and kicks off Backbone's router.
#   * The doc `configuration` holds the majority of settings. 
#   * The Settings object contains many convenience functions that use configuration's data.
#   * Templates should contain objects and collections of objects ready to be used by a Factory.
# Also intialized here are: Backbone.js, and jQuery.i18n

# Utils.disableConsoleLog()
# Utils.disableConsoleAssert()

Tangerine = 
  "db_name"    : window.location.pathname.split("/")[1]
  "design_doc" : "tangerine"

# Local tangerine database handle
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
  error   : ->
    console.log "could not fetch configuration"
    console.log arguments

  success : ->
    console.log "fetched configuration doc"
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

      Tangerine.ensureAdmin ->
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

          Tangerine.user.sessionRefresh 
            success: -> 
              Backbone.history.start()


# if admin user doesn't exist in _users database, create it
Tangerine.ensureAdmin = (callback) ->
  if Tangerine.settings.get("context") == "mobile"
    $.couch.login
      name     : "admin"
      password : "password"
      success: ->
        console.log "logged in as admin"
        $.couch.userDb (uDB) =>
          uDB.openDoc "org.couchdb.user:admin",
            success: ->
              console.log "doc exists, great, I'm done"
              $.couch.logout
                success:->
                  console.log "logging myself out now"
                  callback()
                error: ->
                  console.log "Error logging out admin user"
                  console.log arguments
            error: ->
              console.log "there was no doc, trying to make one"
              $.ajax
                url      : "/_users/org.couchdb.user:admin"
                type     : "PUT"
                dataType : "json"
                data : JSON.stringify
                  name     : "admin"
                  password : null
                  roles    : []
                  type     : "user"
                  _id      : "org.couchdb.user:admin"
                success: ( data ) =>
                  console.log "created new user doc, great"
                  $.couch.logout
                    success: -> callback()
                    error: ->
                      console.log "Error logging out admin user"
                      console.log arguments
                error: =>
                  console.log "Error ensuring admin _user doc"
                  console.log arguments
  else
    callback()
