# Eventually I want to make this interact more directly through backbone and 
# CouchDB users. The backbone connector doesn't handle all of that unfortunately.
# Note:
#     * Every time it verifies and doesn't work it will send the user to the login page.
#     * The only thing I dont' like about this is the @temp variable. It tends to toss
#       around the thread a bit. It keeps everything in check, no doubt, but it's...inelegant.
class User extends Backbone.Model

  defaults:
    name       : null
    roles      : null
    temp       : {}
    messages   : []

  initialize: ->
    @set 
      name     : @defaults.name
      roles    : @defaults.roles
      messages : @defaults.messages

    @temp = @defaults.temp
    # if the page was reloaded check to see that 
    @verify()

  signup: ( name, pass ) ->
    $.couch.signup { name : name }, pass,
      success: =>
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
    # $.couch callbacks don't have access to parameters for some reason
    @temp =
      name : name
      pass : pass

    $.couch.login
      name     : @temp.name
      password : @temp.pass
      success: ( user ) =>
        @clearAttempt()
        @set 
          name  : user.name
          roles : user.roles
        Tangerine.router.navigate "assessments", true
      error: ( status, error, message ) =>
        if @temp.intent? && @temp.intent == "retry_login"
          @addMessage message
        else 
          @temp.intent = "login"
          @signup @temp.name, @temp.pass

  isVerified: ( options ) ->
    @get('name')?

  # Hacky note. This method requires that $.couch.session be set to async: false
  # Apparently my favorite thing to do is mess with $.couch
  verify: ->
    $.couch.session
      success: ( resp ) =>
        if resp.userCtx.name == null
          result = false
        else
          @set
            name   : resp.userCtx.name
            roles  : resp.userCtx.roles
          result = true
        options?.success resp
        
      error: ( status, error, reason ) ->
        # this is an odd situation to write code for. Don't think it's possible to get here
        console.log ["Session Error", "User does not appear to be logged in. #{error}:<br>#{reason}"]
        # Send them to the login page
        Tangerine.router.navigate "login", true

  isAdmin: ->
    _.indexOf( @get('roles'), '_admin' ) != -1

  logout: ->
    $.couch.logout
      success: =>
        @clear()
        Tangerine.router.navigate "login", true
      error: =>
        
  clearAttempt: ->
    @temp = @defaults.temp
  
  addMessage: ( content ) ->
    messages = @get("messages")
    messages.push content
    @set "messages", messages

  showMessage: ( content ) ->
    @set 'messages', [ content ]

  #@override with nothing
  save: ->
    console.log "User.save not implemented"
  #@override with nothing
  sync: ->
    console.log "User.sync not implemented"