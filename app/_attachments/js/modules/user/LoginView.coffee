class LoginView extends Backbone.View

  className: 'login_view'

  events:
    "click button" : "login"
    "submit form"  : "login"
    "keypress"     : "login"

  initialize: (options) ->
    @model = options.model
    @model.on "change:messages", @renderMessages
    @render()

  render: =>
    @$el.html "
      <img src='images/tangerine_logo.png'>
      <div class='messages'></div>
      <label for='login_username'>Enumerator Name</label>
      <input id='login_username' name='login_username'>
      <label for='login_password'>Password</label>
      <input id='login_password' name='login_username' type='password'>
      <button>Login</button>
    "
    @trigger "rendered"

  login: (event) ->
    if event.which? and event.which == 13
      values = Utils.getValues(@el)
      if values['login_password'] == ""
        @$el.find('#login_password').focus()
        return
      @model.login values["login_username"], values["login_password"]
  
  renderMessages: =>
    messages = @model.get("messages") || []
    html = "<ul>"
    for message in messages
      html += "<li>#{message}</li>"
    html += "</ul>"
    @$el.find(".messages").html html 
    
