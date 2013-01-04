# Eventually we'll make Backbone.User based on this.
# $.couch.session needs to be async: false
class User extends Backbone.Model

  url: 'user'

  initialize: (options) ->
    @roles = []
    @dbAdmins = []
    @name = null

  signup: ( name, pass ) ->
    $.ajax
      url         : Tangerine.config.get("robbert")
      type        : "POST"
      dataType    : "json"
      data :
        action : "new_user"
        auth_u : name
        auth_p : pass
      success: ( data ) =>
        if @intent == "login"
          @intent = "retry_login"
          @login name, pass


  login: ( name, pass, callbacks = {}) =>
    $.couch.login
      name     : name
      password : pass
      success: ( user ) =>
        @name   = name
        @roles  = user.roles
        @clearAttempt()
        @fetch
          success: =>
            callbacks.success?()
            @trigger "login"
      error: ( status, error, message ) =>
        if @intent == "retry_login"
          @trigger "error", message
        else 
          @intent = "login"
          @signup name, pass

  # attempt to restore a user's login state from couch session
  sessionRefresh: (callbacks) =>
    $.couch.session
      success: (response) =>
        if response.userCtx.name?
          @name  = response.userCtx.name
          @roles = response.userCtx.roles
          @fetch
            success: =>
              @trigger "login"
              callbacks['success'].apply(@, arguments)
        else
          callbacks['success'].apply(@, arguments)
      error: ->
        alert "Couch session error.\n\n#{arguments.join("\n")}"

  # @callbacks Supports isAdmin, isUser, isRegistered, isUnregistered
  verify: ( callbacks ) ->
    if @name == null
      if callbacks?.isUnregistered?
        callbacks.isUnregistered()
      else
        Tangerine.router.navigate "login", true
    else
      callbacks?.isRegistered?()
      if @isAdmin()
        callbacks?.isAdmin?()
      else
        callbacks?.isUser?()

  isAdmin: -> @name in @dbAdmins or "_admin" in @roles

  logout: ->
    $.couch.logout
      success: =>
        $.cookie "AuthSession", null
        @name  = null
        @roles = []
        @clear()
        @trigger "logout"
        if Tangerine.settings.context == "server"
          window.location = Tangerine.settings.urlIndex "tangerine"
        else
          Tangerine.router.navigate "login", true

  clearAttempt: ->
    @temp = ""

  ###
    Saves to the `_users` database
    usage: either `@save("key", "value", options)` or `@save({"key":"value"}, options)`
    @override (Backbone.Model.save)
  ###
  save: (keyObject, valueOptions ) ->
    attrs = {}
    if _.isObject keyObject
      attrs = $.extend attrs, keyObject 
      options = valueOptions
    else 
      attrs[keyObject] = value
    # get user DB
    $.couch.userDb (db) =>
      db.saveDoc $.extend(@attributes, attrs)
      options.success?.apply(@, arguments)

  ###
    Fetches user's doc from _users, loads into @attributes
  ###
  fetch: ( callbacks={} ) =>
    $.couch.userDb (db) =>
      db.openDoc "org.couchdb.user:#{@name}",
        success: ( userDoc ) =>
          Tangerine.$db.openDoc "_security",
            success: (securityDoc) =>
              @dbAdmins  = securityDoc?.admins?.names  || []
              @dbReaders = securityDoc?.members?.names || []
              @dbReaders = _.filter(@dbReaders,(a)=>a.substr(0, 8)!="uploader")
              @set userDoc
              callbacks.success?.apply(@, arguments)
              @trigger 'group-refresh'

        error: =>
          callbacks.error?.apply(@, arguments)



  ###
  
  Groups
  
  ###

  joinGroup: (group, callback = {}) ->
    Utils.passwordPrompt (auth_p) =>
        Robbert.request
          action : "new_group"
          group  : group
          auth_u : Tangerine.user.get("name")
          auth_p : auth_p
          success : ( response ) =>
            # @TODO
            # We should not have to log back in here.
            # After Robbert creates a group, THIS session ends.
            # Robbert does not interact with the session.
            if response.status == "success"
              @login @get("name"), auth_p, success:callback
              @trigger "group-join" 
            else
              Utils.midAlert status.message
          error : (error) =>
            Utils.midAlert "Error creating group\n\n#{error[1]}\n#{error[2]}"
            @fetch success:callback

  leaveGroup: (group, callback = {}) ->
    Utils.passwordPrompt ( auth_p ) =>
      Robbert.request
        action : "remove_group" # attempts to leave first, if last person, deletes group
        user   : @get("name")
        group  : group
        auth_u : Tangerine.user.get("name")
        auth_p : auth_p
        success : (response) =>
          # @TODO
          # We should not have to log back in here.
          # After Robbert creates a group, THIS session ends.
          # Robbert does not interact with the session.
          @login @get("name"), auth_p, success:callback

          @trigger "group-leave" is response.status == "success"

        error : (response) =>
          callbacks.error?( response )

