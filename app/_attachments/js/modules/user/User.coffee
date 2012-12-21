# Eventually we'll make Backbone.User based on this.
# $.couch.session needs to be async: false
class User extends Backbone.Model

  url: 'user'

  initialize: (options) ->
    @roles = []
    @dbAdmins = []
    @name = null

  signup: ( name, pass ) ->
    $.couch.signup { name : name }, pass,
      success: =>
        if @intent == "login"
          @intent = "retry_login"
          @login name, pass
        else
          @trigger "created"
      error: ( status, error, message ) =>
        if @intent == "login"
          @trigger "pass-incorrect"
        else
          @trigger "user-taken"

  login: ( name, pass ) ->
    $.couch.login
      name     : name
      password : pass
      success: ( user ) =>
        @name   = name
        @roles  = user.roles
        @clearAttempt()
        @trigger "login"
      error: ( status, error, message ) =>
        if @intent == "retry_login"
          @trigger "error", message
        else 
          @intent = "login"
          @signup name, pass

  sessionRefresh: (callbacks) ->
    $.couch.session
      success: (response) =>
        if response.userCtx.name?
          @name  = response.userCtx.name
          @roles = response.userCtx.roles
          @fetch
            success: ->
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

  isAdmin: -> '_admin' in @roles or @name in @dbAdmins

  logout: ->
    $.couch.logout
      success: =>
        $.cookie "AuthSession", null
        @name  = null
        @roles = []
        @clear()
        @trigger "logout"
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
              @dbAdmins = securityDoc?.admins?.names || []
              @attributes = userDoc
              callbacks.success?.apply(@, arguments)
              @trigger 'group-refresh'
            , {async:false}
        error: =>
          callbacks.error?.apply(@, arguments)
        , {async:false}



  ###
  
  Groups
  
  ###

  joinGroup: (group) ->
    oldGroups = @get("groups") || []
    if !~oldGroups.indexOf(group)
      newGroups = oldGroups.concat [group]

      $.ajax
        "type" : "GET"
        'url'  : Tangerine.config.address.robbert.url
        'data' : 
          "action" : "new_group"
          "user"   : @name
          "group"  : group
        dataType: "jsonp"
        success: =>
          @save({"groups" : newGroups}, { success: => @trigger "group-join" }, async:false)
        error: (error) =>
          alert "Error creating group\n\n#{error[1]}\n#{error[2]}"

  leaveGroup: (group) ->
    oldGroups = @get("groups") || []
    if ~oldGroups.indexOf(group)
      newGroups = _.without oldGroups, group
      @save({"groups" : newGroups}, {success:=>@trigger("group-leave")}, async:false)
