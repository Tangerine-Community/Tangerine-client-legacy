class LoginView extends Backbone.View

  className: 'LoginView'

  events: 
    if Modernizr.touch
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'touchstart .mode'   : 'updateMode'
      'touchstart button'  : 'action'
      'touchstart .recent' : 'showRecent'
      'blur .recent'       : 'blurRecent'
      'keyup #new-name'    : 'checkNewName'
      'touchstart .next'   : 'next'
      'touchstart .verify' : 'verify'
    else
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'click .mode'        : 'updateMode'
      'click button'       : 'action'
      'click .recent'      : 'showRecent'
      'blur .recent'       : 'blurRecent'
      'keyup #new-name'    : 'checkNewName'
      'click .next'        : 'next'
      'click .verify'        : 'verify'

  initialize: (options) ->
    $(window).on('orientationchange scroll resize', @recenter)
    @mode = "login"
    @i18n()
    @users = options.users
    @user = Tangerine.user
    @user.on "login", @goOn
    @user.on "pass-error", (error) => @passError error
    @user.on "name-error", (error) => @nameError error
    @oldBackground = $("body").css("background")
    $("body").css("background", "white")
    $("#footer").hide()

  checkNewName: (event) ->
    $target = $(event.target)
    name = ( $target.val().toLowerCase() || '' )
    if name.length > 4 and name in @users.pluck("name")
      @nameError(@text['error_name_taken'])
    else
      @clearErrors()


  onInputChange: (event) ->
    $target = $(event.target)
    type = $target.attr("type")
    return unless type is 'text' or not type?
    $target.val($target.val().toLowerCase())

  showRecent: ->
    @$el.find("#name").autocomplete(
      source: @user.recentUsers()
      minLength: 0
    ).autocomplete("search", "")

  blurRecent: ->
    @$el.find("#name").autocomplete("close")
    @initAutocomplete()

  initAutocomplete: ->
    @$el.find("#name").autocomplete
      source: @users.pluck("name")

  recenter: => 
    @$el.middleCenter() unless @$el.height() > $(window).height()

  i18n: ->
    @text =
      "login"      : t('LoginView.button.login')
      "sign_up"    : t('LoginView.button.sign_up')

      "user"       : t('LoginView.label.user')
      "teacher"    : t('LoginView.label.teacher')
      "password"   : t('LoginView.label.password')
      "password_confirm" : t('LoginView.label.password_confirm')
      "error_name" : t('LoginView.message.error_name_empty')
      "error_pass" : t('LoginView.message.error_password_empty')
      "error_name_taken" : t('LoginView.message.error_name_taken')

      "challenge_question"     : t('LoginView.label.challenge_question')
      "challenge_response"     : t('LoginView.label.challenge_response')
      "challenge_explaination" : t('LoginView.message.challenge_explaination')

      "first_name" : t('LoginView.label.first_name')
      "last_name"  : t('LoginView.label.last_name')
      "zone_name"  : t('LoginView.label.zone_name')
      "gender"     : t('LoginView.label.gender')
      "phone"      : t('LoginView.label.phone')
      "email"      : t('LoginView.label.email')

  onSelectChange: (event) ->
    $target = $(event.target)
    if $target.val() == "*new"
      @updateMode "signup"
    else 
      @$el.find("#pass").focus()

  goOn: -> Tangerine.router.landing()

  updateMode: (event) ->
    $target = $(event.target)
    @mode = $target.attr('data-mode')
    $target.parent().find(".selected").removeClass("selected")
    $target.addClass("selected")
    $login  = @$el.find(".login")
    $signup = @$el.find(".signup")
    $reset  = @$el.find(".reset")


    switch @mode
      when "login"
        $login.show()
        $signup.hide()
        $reset.hide()
      when "signup"
        $login.hide()
        $signup.show()
        $reset.hide()
      when "reset"
        $login.hide()
        $signup.hide()
        $reset.show()

    @$el.find("input")[0].focus()

  render: =>

    nameName = @text.user
    if Tangerine.settings.get("context") is "klass"
      nameName = @text.teacher

    nameName = nameName.titleize()

    serverHtml = "
      <img src='images/login_logo.png' id='login_logo'>
      <div class='messages name-message'></div>
      <input type='text' id='name' placeholder='#{nameName}'>
      <div class='messages pass-message'></div>
      <input id='pass' type='password' placeholder='#{@text.password}'>
      <button class='login'>#{@text.login}</button>
    "

    tabletHtml = "
      <img src='images/login_logo.png' id='login_logo'>

      <div class='tab_container'>
        <div class='tab mode selected first' data-mode='login'>Login</div><div class='tab mode' data-mode='signup'>Sign up</div><div class='tab mode last' data-mode='reset'>Reset</div>
      </div>

      <div class='login'>
        <section>

          <div class='messages name-message'></div>
          <table><tr>
            <td><input id='name' placeholder='#{nameName}'></td>
            <td><img src='images/icon_recent.png' class='recent clickable'></td>
          </tr></table>

          <div class='messages pass-message'></div>
          <input id='pass' type='password' placeholder='#{@text.password}'>

          <button class='login'>#{@text.login}</button>

        </section>
      </div>

      <div class='signup' style='display:none;'>
        <section>

          <div class='messages name-message'></div>
          <input id='new-name' type='text' placeholder='#{nameName}'>

          <input id='challenge-question' type='text' placeholder='#{@text.challenge_question}' title='#{@text.challenge_explaination}'>

          <input id='challenge-response' type='text' placeholder='#{@text.challenge_response}' title='#{@text.challenge_explaination}'>

          <div class='messages pass-message'></div>
          <input id='new-pass-1' type='password' placeholder='#{@text.password}'>

          <input id='new-pass-2' type='password' placeholder='#{@text.password_confirm}'>


          <input id='first' placeholder='#{@text.first_name}'>
          <input id='last' placeholder='#{@text.last_name}'>
          <input id='zone-name' placeholder='#{@text.zone_name}'>

          <label>
          <select id='gender'>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>

          <input id='phone' placeholder='#{@text.phone}'>
          <input id='email' placeholder='#{@text.email}'>


          <button class='sign-up'>#{@text.sign_up}</button>
        </section>
      </div>

      <div class='reset' style='display:none;'>
        <section class='clearfix'>
          <input id='reset-name' placeholder='#{nameName}'>
          <button class='command next'>Next</button>
        </section>
        <div id='challenge'></div>
      </div>
    "

    @$el.html Tangerine.settings.contextualize
      server: serverHtml
      notServer: tabletHtml

    @initAutocomplete() if Tangerine.settings.get("context") isnt "server"

    @nameMsg = @$el.find(".name-message")
    @passMsg = @$el.find(".pass-message")

    @trigger "rendered" 

  next: ->
    $challenge = @$el.find("#challenge")
    $challenge.html "<img src='images/loading.gif' class='loading'>"

    @resetUser = new TabletUser "_id" : "user-#{@$el.find("#reset-name").val()}"
    @resetUser.fetch
      error: -> $challenge.html "User not found."
      success: =>
        $challenge.html "
          <section class='clearfix'>
            <label for='response'>#{@resetUser.getEscapedString('question')}</label>
            <input id='response' type='text' placeholder='challenge-response'>
            <button class='command verify'>Verify</button>
          </section>
        "

  verify: ->
    response = @$el.find("#response").val()
    salt     = @resetUser.get("salt")

    realResponseHash = @resetUser.get("response")
    challengeHash    = hex_sha1( response + salt )

    if realResponseHash is challengeHash
      newPass = Utils.modalPrompt
        prompt: "Enter a new password"
        pass : true
        callback: (newPass) =>

          newHash = (TabletUser.generateHash newPass, salt)['pass']
          @resetUser.save 
            "pass": newHash

          Utils.sticky "Password reset", null, -> document.location.reload()
    else
      Utils.sticky "That response did not match our records."

  afterRender: =>
    @recenter()

  onClose: =>
    $("#footer").show()
    $("body").css("background", @oldBackground)

  keyHandler: (event) ->

    key =
      ENTER     : 13
      TAB       : 9
      BACKSPACE : 8

    field = $(event.target).attr('id')

    isntIgnoredField = not (
      field is "challenge-question" or 
      field is "challenge-response" or
      field is "response"
    )

    $('.messages').html('')
    char = event.which
    if char? and isntIgnoredField

      isSpecial = 
        char is key.ENTER              or
        event.keyCode is key.TAB       or
        event.keyCode is key.BACKSPACE
      # Allow upper case here but make it so it's not later
      return false if not /[a-zA-Z0-9]/.test(String.fromCharCode(char)) and not isSpecial
      return @action() if char is key.ENTER
    else
      return true

  action: ->
    @login()  if @mode is "login"
    @signup() if @mode is "signup"
    return false

  signup: ->
    name  = ($name  = @$el.find("#new-name")).val().toLowerCase()
    pass1 = ($pass1 = @$el.find("#new-pass-1")).val()
    pass2 = ($pass2 = @$el.find("#new-pass-2")).val()

    errors = []
    if ( first  = ( $first  = @$el.find("#first")     ).val() ).length is 0
      errors.push " - First name cannot be empty"

    if ( last   = ( $last   = @$el.find("#last")      ).val() ).length is 0
      errors.push " - Last name cannot be empty"

    if ( zone   = ( $zone   = @$el.find("#zone-name") ).val() ).length is 0
      errors.push " - Zone name cannot be empty"

    if ( gender = ( $gender = @$el.find("#gender")    ).val() ).length is 0
      errors.push " - Gener cannot be empty"

    if ( phone  = ( $phone  = @$el.find("#phone")     ).val() ).length is 0
      errors.push " - Phone cannot be empty"

    if ( email  = ( $email  = @$el.find("#email")     ).val() ).length is 0
      errors.push " - Email cannot be empty"

    question = ($pass1 = @$el.find("#challenge-question")).val()
    response = ($pass1 = @$el.find("#challenge-response")).val()

    attributes = 
      "question" : question
      "response" : response

      "first"  : first
      "last"   : last
      "zone"   : zone
      "gender" : gender
      "phone"  : phone
      "email"  : email

    @passError(@text.pass_mismatch) if pass1 isnt pass2

    try
      @user.signup name, pass1, attributes
    catch e
      console.log e
      @nameError(e)

  login: ->
    name = ($name = @$el.find("#name")).val()
    pass = ($pass = @$el.find("#pass")).val()

    @clearErrors()

    @nameError(@text.error_name) if name == ""
    @passError(@text.error_pass) if pass == ""

    if @errors == 0
      try 
        @user.login name, pass
      catch e
        @nameError e

    return false

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
