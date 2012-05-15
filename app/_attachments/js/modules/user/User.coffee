# Eventually we'll make Backbone.User based on this.
# $.couch.session needs to be async: false
class User extends Backbone.Model

  url: 'user'

  default:
    name        : null
    roles       : null
    groups      : ["default"]

  initialize: ->


    # these aren't `set` because we don't want them to save with the model
    # they're handled by couchdb, so we have to load them manually
    @name = @default.name
    @roles = @default.roles
    @groups = []

    # these aren't `set` because they're temporary
    @messages = []
    @temp = {}
    
    # get the current user
    @fetch()

  signup: ( name, pass ) ->
    $.couch.signup { name : name }, pass,
      success: (a, b, c) =>
        if @temp.intent == "login"
          @temp.intent = "retry_login"
          @login @temp.name, @temp.pass
        else
          @addMessage "New user #{temp['name']} created. Welcome to Tangerine."
      error: ( status, error, message ) =>
        if @temp.intent? && @temp.intent == "login"
          @showMessage "Password incorrect, please try again."
        else
          @showMessage "Error username #{@temp.name} already taken. Please try another name."


  login: ( name, pass ) ->
    @temp =
      name : name
      pass : pass
    $.couch.login
      name     : @temp.name
      password : @temp.pass
      success: ( user ) =>
        @name   = @temp.name
        @roles  = []
        @groups = []
        for role in user.roles
          groupName = role.split("group.")
          if $.isArray(groupName) && groupName.length > 1
            @groups.push groupName[1]
          else
            @roles.push role

        @clearAttempt()
        @trigger "change:authentication"
        # any way not to have this here?
        Tangerine.router.navigate "", true
      error: ( status, error, message ) =>
        @name  = @default.name
        @roles = @default.roles
        @groups = @default.groups
        if @temp.intent? && @temp.intent == "retry_login"
          @addMessage message
        else 
          @temp.intent = "login"
          @signup @temp.name, @temp.pass

  # @callbacks Supports isAdmin, isUser, isRegistered, isUnregistered
  verify: ( callbacks ) ->
    if @name == null
      if callbacks?.isUnregistered?
        callbacks.isUnregistered()
        Tangerine.router.navigate "login", true
    else
      callbacks?.isRegistered?()
      if @isAdmin()
        callbacks?.isAdmin?()
      else
        callbacks?.isUser?()

  fetch: (options) ->
    $.couch.session
      success: ( resp ) =>
        if resp.userCtx.name != null
          @id = resp.userCtx.name
          @name = resp.userCtx.name
          @roles = []
          @groups = []
          
          for role in resp.userCtx.roles
            groupName = role.split("group.")
            if $.isArray(groupName) && groupName.length > 1
              @groups.push groupName[1]
            else
              @roles.push role
          @trigger "change:authentication"
      error: ( status, error, reason ) ->
        @trigger "change:authentication"
        throw "#{status} Session Error\n#{error}\n#{reason}"


  isAdmin: ->
    '_admin' in @roles

  logout: ->
    $.couch.logout
      success: =>
        $.cookie "AuthSession", null
        @name  = @default.name
        @roles = @default.roles
        @groups = @default.groups
        @clear()
        @trigger "change:authentication"

  clearAttempt: ->
    @temp = @default.temp
  
  addMessage:    ( content ) -> @set "messages", @get("messages").push content
  showMessage:   ( content ) -> @set "messages", [ content ]
  clearMessages: ( content ) -> @set "messages", [ ]