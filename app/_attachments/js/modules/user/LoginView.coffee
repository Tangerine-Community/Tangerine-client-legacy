class LoginView extends Backbone.View

  initialize: (model) ->
    @model = model
    @model.on "change:messages", @renderMessages
  
  el: '#content'

  render: =>
    @$el.html "
      <div id='login_wrapper'>
        <img src='images/tangerine_logo.png'>
        <div id='login_message'></div>
        <form id='login_form'>
          <label for='login_name'>Enumerator Name</label>
          <input id='login_username' name='login_username'>
          <label for='login_password'>Password</label>
          <input id='login_password' name='login_username' type='password'>
          <input id='login_button' type='submit' value='Login'>
        </form>
      </div>
    "

  events:
    "submit form#login_form": "login"

  login: ->
    values = Utils.getValues("#login_form")
    @model.login values["login_username"], values["login_password"]
  
  renderMessages: =>
    messages = @model.get("messages") || []
    html = "<ul>"
    for message in messages
      html += "<li>#{message}</li>"
    html += "</ul>"
    $("#login_message").html html 
    
