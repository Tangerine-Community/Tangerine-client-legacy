# This file loads the most basic settings related to Tangerine and kicks off Backbone's router.
#   * The doc `configuration` holds the majority of settings. 
#   * The Settings object contains many convenience functions that use configuration's data.
#   * Templates should contain objects and collections of objects ready to be used by a Factory.
# Also intialized here are: Backbone.js, and jQuery.i18n
# Anything that fails bad here should probably be failing in front of the user.

# Utils.disableConsoleLog()
# Utils.disableConsoleAssert()

Tangerine.bootSequence = 

  # Basic configuration

  basicConfig : (callback) ->

    Tangerine = window.Tangerine

    Tangerine.db_name    = "tangerine"#window.location.pathname.split("/")[1]
    Tangerine.design_doc = "ojai"#_.last(String(window.location).split("_design/")).split("/")[0]

    # Local tangerine database handle
    Tangerine.$db = $.couch.db(Tangerine.db_name)

    # Backbone configuration
    Backbone.couch_connector.config.base_url  = "http://localhost:5984"
    Backbone.couch_connector.config.db_name   = Tangerine.db_name
    Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc
    Backbone.couch_connector.config.global_changes = false

    # set underscore's template engine to accept handlebar-style variables
    _.templateSettings = interpolate : /\{\{(.+?)\}\}/g

    callback()

  # Put this version's information in the footer
  versionTag: ( callback ) ->
    $("#footer").append("<div id='version'>#{Tangerine.version}-#{Tangerine.buildVersion}</div>")
    callback()

  # Grab our system config doc. These generally don't change very often unless
  # major system changes are required. New servers, etc.
  fetchConfiguration: ( callback ) ->

    Tangerine.config = new Config "_id" : "configuration"
    Tangerine.config.fetch
      error   : -> alert "Could not fetch configuration"
      success : callback



  # get our local Tangerine settings
  # these do tend to change depending on the particular install of the 
  fetchSettings : ( callback ) ->
    Tangerine.settings = new Settings "_id" : "settings"
    Tangerine.settings.fetch
      success: callback

      error: ->
        defaultSettings = Tangerine.config.get("defaults")?.settings
        alert "Missing default settings in configuration" unless defaultSettings?

        Tangerine.settings.set defaultSettings # @todo, figure out why save, only calls beforesave
        Tangerine.settings.save null,
          error: -> alert "Could not save default settings"
          success: callback


  # for upgrades
  guaranteeInstanceId: ( callback ) ->
    unless Tangerine.settings.has("instanceId")
      Tangerine.settings.save 
        "instanceId" : Utils.humanGUID()
      ,
        error: -> alert "Could not save new Instance Id"
        success: callback
    else
      callback()

  # load templates
  fetchTemplates: ( callback ) ->
    (Tangerine.templates = new Template "_id" : "templates").fetch
      error: -> alert "Could not load templates."
      success: callback


  # On mobiles, if the admin user doesn't exist, create it.
  # Some tasks require an admin user. Sometimes it secretly does. TabletUser does not use the 
  # CouchDB user authentication, but the server does. So don't do this on the server.
  ensureAdmin: ( callback ) ->
    return callback()
    return callback() if "server" is Tangerine.settings.get("context")
    return callback() if Tangerine.settings.has("adminEnsured")
    
    # try to use the admin user
    $.couch.login
      name     : "admin"
      password : "password"
      success: -> # This will succeed whether logged in or not
        
        # get the user database and see if we have access to the _user doc
        $.couch.userDb (uDB) =>
          uDB.openDoc "org.couchdb.user:admin",
            success: -> # We have access to the user doc
              $.couch.logout
                error: -> alert "Error logging out admin user. Loc1"
                success: ->
                  Tangerine.settings.save
                    "adminEnsured" : true # set flag so we don't go through this every time
                  ,
                    error : -> alert "Error saving adminEnsured settings."
                    success : callback
                
            error: -> # we do not have access, or there is no doc
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
                error: -> alert "Error ensuring admin _user doc"
                success: ( data ) =>
                  Tangerine.settings.save
                    "adminEnsured" : true # set flag so we don't go through this every time
                  ,
                    $.couch.logout
                      error   : -> alert "Error logging out admin user. Loc2"
                      success : callback

                
      
# make sure all users in the _users database have a local user model for future use
# Can be removed if no upgrades are being done. This is for legacy _user support.
  transitionUsers : (callback) ->
    return callback()

    return callback() if "server" is Tangerine.settings.get("context")
    return callback() if Tangerine.settings.has("usersTransitioned")

    # log in as admin to work with _users database
    $.couch.login
      name     : "admin"
      password : "password"
      success: ->
        $.couch.userDb (uDB) =>
          # fetch all _user docs
          uDB.allDocs
            success : (response) ->
              docIds = _.pluck(response.rows, "id").filter (a) -> ~a.indexOf("org.couchdb") # exclude non user type docs

              # this function will transition the users to TabletUsers one at a time
              nextDoc = ->
                id = docIds.pop()
                return finish() unless id?
                uDB.openDoc id,
                  success : (doc) ->
                    teacher   = null
                    name      = doc._id.split(":")[1]
                    teacherId = doc.teacherId
                    
                    # let them use the same password. 
                    # this will break > CouchDB 1.2.0
                    hashes = 
                      if doc.password_sha?
                        pass : doc.password_sha
                        salt : doc.salt
                      else
                        TabletUser.generateHash("password")

                    # Create a teacher doc for the new user
                    # @todo All this should be refactored into the TabletUser model
                    unless teacherId?
                      teacherId = Utils.humanGUID()
                      teacher = new Teacher 
                        "_id"  : teacherId
                        "name" : name
                      
                    if name is "admin"
                      roles = ["_admin"]
                      hashes = TabletUser.generateHash("password")
                    else
                      roles = doc.roles || []
                      
                    newDoc = 
                      "_id"   : TabletUser.calcId(name)
                      "name"  : name
                      "roles" : roles
                      "pass"  : hashes.pass
                      "salt"  : hashes.salt
                      "teacherId"  : teacherId
                      "collection" : "user"

                    #return
                    Tangerine.$db.saveDoc newDoc,
                      error   : nextDoc # show must go on
                      success : ->
                        return nextDoc() unless teacher?

                        teacher.save null,
                          success: nextDoc
                          error: nextDoc

              finish = ->
                Tangerine.settings.save "usersTransitioned" : true,
                  success: ->
                    $.couch.logout
                      success: ->
                        callback()

              nextDoc() # kick it off


  documentReady: ( callback ) -> $ ->

    # add context class to get css to respond to different contexts
    $("body").addClass Tangerine.settings.get "context"

    #$("<button id='reload'>reload me</button>").appendTo("#footer").click -> document.location.reload()

    callback()

  loadI18n: ( callback ) ->

    $.i18n.init 
      "fallbackLng" : false
      "lng"         : Tangerine.settings.get "language"
      "resGetPath"  : "locales/__lng__/translation.json"
    , (t) ->
     window.t = t
     callback()

  handleCordovaEvents: ( callback ) ->

    return callback() if "server" is Tangerine.settings.get("context")

    document.addEventListener "deviceready"
    , ->
      document.addEventListener "online",  -> Tangerine.online = true
      document.addEventListener "offline", -> Tangerine.online = false

      ### 
      # Responding to this event turns on the menu button
      document.addEventListener "menubutton", (event) ->
        console.log "menu button"
      , false
      ###

      # prevents default
      document.addEventListener "backbutton", Tangerine.onBackButton, false

    , false

    # add the event listeners, but don't depend on them calling back
    callback()

  loadSingletons: ( callback ) ->
    # Singletons
    window.vm = new ViewManager()
    Tangerine.router = new Router()
    Tangerine.user   = if "server" is Tangerine.settings.get("context")
        new User()
      else
        new TabletUser()
    Tangerine.nav    = new NavigationView
      user   : Tangerine.user
      router : Tangerine.router
    Tangerine.log    = new Log()
    callback()

  reloadUserSession: ( callback ) ->

    Tangerine.user.sessionRefresh 
      error: -> Tangerine.user.logout()
      success: callback

  startBackbone: ( callback ) ->
    Backbone.history.start()
    callback() # for testing


# callback is used for testing
Tangerine.boot = (callback) ->

  sequence = [
    Tangerine.bootSequence.basicConfig
    Tangerine.bootSequence.versionTag
    Tangerine.bootSequence.fetchConfiguration
    Tangerine.bootSequence.fetchSettings
    Tangerine.bootSequence.guaranteeInstanceId
    Tangerine.bootSequence.fetchTemplates
    Tangerine.bootSequence.ensureAdmin
    Tangerine.bootSequence.transitionUsers
    Tangerine.bootSequence.documentReady
    Tangerine.bootSequence.loadI18n
    Tangerine.bootSequence.handleCordovaEvents
    Tangerine.bootSequence.loadSingletons
    Tangerine.bootSequence.reloadUserSession
    Tangerine.bootSequence.startBackbone
  ]

  sequence.push callback if callback? 

  Utils.execute sequence

console.log window.PRODUCTION
Tangerine.boot() if window.PRODUCTION




