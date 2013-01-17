class LoginView extends Backbone.View

  className: 'login_view'

  events:
    "click button.login" : "login"
    "keypress input"     : "keyHandler"

  initialize: (options) ->
    @user = Tangerine.user
    @user.on "login", @goOn
    @user.on "pass-error", (error) => @passError error
    @user.on "name-error", (error) => @nameError error

  goOn: ->
    Tangerine.router.navigate "", true

  render: =>

    nameName = Tangerine.settings.contextualize
      server: "User name"
      mobile: "Enumerator name"
      klass : "Teacher name"

    width = $('#content').width()
    parentWidth = $('#content').offsetParent().width()
    @oldWidth = 100 * width / parentWidth

    $("#content").css "width", "100%"

    @$el.html "
      <img src='images/tangerine_logo.png' id='login_logo'>
      <label for='name'>#{nameName}</label>
      <div id='name_message' class='messages'></div>
      <input type='text' id='name'>
      <label for='pass'>#{t('password')}</label>
      <div id='pass_message' class='messages'></div>
      <input id='pass' type='password'>
      <button class='login'>#{t('login')}</button>
    "

    @nameMsg = @$el.find("#name_message")
    @passMsg = @$el.find("#pass_message")

    @trigger "rendered"

  onClose: ->
    $("#content").css "width", @oldWidth + "%"

  keyHandler: (event) ->
    if event.which
      if event.which != 13
        return true
      else
        @login()
    else
      return true

  login: (event) ->
    name = @$el.find("#name")
    pass = @$el.find("#pass")

    @clearErrors()
    @nameError("Please enter a name.") if name.val() == ""
    @passError("Please enter a password.") if pass.val() == ""

    if @errors == 0
      @user.login name.val(), pass.val()

  passError: (error) -> 
    @errors++
    @passMsg.html error
    @$el.find("#pass").focus()

  nameError: (error) -> 
    @errors++
    @nameMsg.html error
    @$el.find("#name").focus()

  clearErrors: ->
    @nameMsg.html ""
    @passMsg.html ""
    @errors = 0
