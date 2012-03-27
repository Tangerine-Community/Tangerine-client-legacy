class LoginView extends Backbone.View

  initialize: ->
    _

  el: $('#content')

  render: =>
    @el.html "
      <div style='margin:0px auto; width:300px'>
        <img src='images/tangerinelogo300w.png'/>
        <form id='login-form'>
          <label for='name'>Enumerator Name</label>
          <input id='name' name='name'></input>
          <label for='password'>Password</label>
          <input id='password' type='password' name='password'></input>
          <input type='submit' value='Login'></input>
          <div id='message'></div>
        </form>
      </div>
    "

  events:
    "submit form#login-form": "login"

  login: (event) ->
      name = $('#name').val()
      password = $('#password').val()
      $.couch.login
        name: name
        password: password
        success: =>
          @setEnumerator name
        error: (status, error, reason) ->
          $("#message").html "Creating new user" + window.document.cookie
          $.couch.signup( {name: name}, password,
            success: =>
              $.couch.login
                name: name
                password: password
                success: =>
                  @setEnumerator name
            error: (status, error, reason) ->
              if error == "conflict"
                $("#message").html "Either you have the wrong password or '#{$('#name').val()}' has already been used as a valid name. Please try again."
              else
                $("#message").html "#{error}: #{reason}"
          )
      return false

  setEnumerator: (name) ->
    $('#enumerator').html name
    $.enumerator = name
    Tangerine.router.navigate(Tangerine.router.targetroute, true)
    
