class LoginView extends Backbone.View

  className: 'LoginView'

  events: if Modernizr.touch then {
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'click .mode'   : 'updateMode' #touchstart
      'click button'  : 'action' #touchstart
      'click .recent' : 'showRecent' #touchstart
      'blur .recent'       : 'blurRecent'
      'keyup #new-name'    : 'checkNewName'
      'click .next'   : 'next' #touchstart
      'click .verify' : 'verify' #touchstart
    } 
  else
    {
      'keypress input'     : 'keyHandler'
      'change input'       : 'onInputChange'
      'change select#name' : 'onSelectChange'
      'click .mode'        : 'updateMode'
      'click button'       : 'action'
      'click .recent'      : 'showRecent'
      'blur .recent'       : 'blurRecent'
      'keyup #new-name'    : 'checkNewName'
      'click .next'        : 'next'
      'click .verify'      : 'verify'
    }

  backButton: -> return false

  initialize: (options) ->
    @usersAug25 = "aballa,abraham musyoka,abraham.,admin,agatha kimani,agnes,agnes nyakundi,alego,allan,allan nyondah,amos  nguti,amos nguti,arap kerich,atis,austine,austine ligare,beatrice  aballa,beatrice aballa,ben,ben kakalukha,ben kakhalukha,benson karanga,benson karanga ,bkaranga,boniface,boniface ngunguu,bpiper,caleb,caleb ouma,caleb ouma.,caleb owiti ouma.,carmen,christine barasa,cotewa,cotewaprimr,cs,dalmas alego,david,david kerich,davidmutuma,demo,dennis,dicksonprimr,dismas,dismas  sikuku,dismas sikuku,dismassikuku,dmwikya,donvan amenya,dorcas,dorcas oduor,doreen,doreen olubendi,ej,eliud atieno,elizabeth atieno,elizabethatieno,emily,emilysimiyu,eunice wanjiru,euphrasiashumila,evelynprimr,faith,felistas  staka,felistas staka,felistasstaka,fnjagi,francis,francis nalimae,francis onyango,francismuli,fred surai,george,george irungu,gregory kitonyi,hannah faith mkoji,hannah mkoji,irungu,isaac cherotich,jane,jane  moses,jane moses,jane primr,janet,janet vijebi,janette vijedi,jepkorir,jepkorir rotich,jepkorirrotich,jeremiah mue,john,john kisongochi,johnson omurwa,jonathan,jonathan kisaka,joseph,joseph sikuku,josephat  tabuka,josephat tabuka,julie ogonya,kerich,kerichdavid,kevin otieno,kevinotieno,kitaka,kkibukho,lawrence obure,linda,linda akach,liz,loponi,lucy,lucy kiviu,lucy kiviu ,lucykiviu,lulu,lutgard loponi,makeni,martha,marthacatherine,martin  kimeu,martin kimeu,mary,marysimiyu,michael ilekyo,michael ilekyo pool,michael ndambuki,mildren,mildrenlangoprimr,muinde,mulandi  john,mulandi john,mvm,nahashon sitati,nahshon sitati,naibei,naomi wanyonyi,nawanga,nenunge,ngamau,ngamau margaret,nicky,njagiprimr,nyambura,obure,obure lawrence,okaka alego,okullo,omurwa,patrick,patrick wagachebo,peter clavers,peter clavers ,philip ongele,phyllis,primr,primr anne njogu,primr benard makeni,primr david mutuma,primr dickson,primr dickson otiangala,primr jane,primr jane ,primr jesse,primr jesse mabongah,primr joseph gatonye,primr kinoti,primr koko,primr mabongah jesse,primr makeni,primr makeni bernard,primr okaka alego,primr okullo,primr robert,primr rowland,primr samuel,primr sarah koko,primranne,primranne njogu,primrarbogast,primrdan,primrdankwayumba,primrdavidmutuma,primrdennis,primrdennismwikya,primrdes,primrdoreenolubendi,primrfrancis,primrisaac,primrjane,primrjgatonye,primrken,primrkinoti,primrlinda,primrlucy,primrmakeni,primrmercy,primrmildren,primrmildrenlango,primrpeterclavers,primrphyllis,primrsally,primrsamuel,primrtabitha,primrtabithanduku,primrthomas,primrthomasmachua,pwandeto,raphael muinde,reuben rutto,reuben rutto kamoet,robert,roseline  wangawi,roseline wangawi,roseline wangawi ,rutto,samprimr,samsonkodande,samuel,samuel m. naibei.,samuel naibei,scott_kipp,shumila,simon kundi,sitati,sitati nahshon,situma,situma meru,skoko,stephen,stephen m wambua,stephen mukithia wambua,stephen nzioki,stephen wambua,surai,tabuka,tabuka.,tangerine,timothy,timothy loki,timothy m loki,timothy situma,undefined,violet akinyi,violetakinyi,wagachebo,wanjiru,wanjiru mukuha,wanjiruo,washington,washington ondoro,wilson kitaka,wycliffe,wycliffe nenunge".split(",")
    # http://databases.tangerinecentral.org/group-tutor_feb_25/_design/ojai/_view/tutorTrips?start_key=%22user-a%22&end_key=%22user-zz%22
    $(window).on('orientationchange scroll resize', @recenter)
    @mode = "login"
    @i18n()
    @users = options.users
    @user = Tangerine.user
    @listenTo @user, "login", @goOn
    @listenTo @user, "pass-error", (error) => @passError error
    @listenTo @user, "name-error", (error) => @nameError error
    @oldBackground = $("body").css("background")
    $("body").css("background", "white")
    $("#footer").hide()

    @fetchLocations => @renderSchoolList("data")

  fetchLocations: ( callback = $.noop ) ->
    subtestIndex = 0
    limit = 1

    checkSubtest = =>

      Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
        key   : "subtest"
        skip  : subtestIndex
        limit : limit
        include_docs : true
        error : $.noop
        success: (response) =>
          if response.rows.length is 0 
            if Tangerine.settings.get("context") isnt "server"
              return alert "Failed to find locations"
            else
              return 
          
          locationSubtest = response.rows[0].doc

          if locationSubtest.prototype? && locationSubtest.prototype is "location"
            @locationSubtest = new Subtest locationSubtest
            @locationView = new LocationRunView model:@locationSubtest, limit:2
            callback?()
          else
            subtestIndex++
            checkSubtest()
      )
    checkSubtest()


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

      "tsc_number"             : t('LoginView.label.tsc_number')
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

  goOn: -> Tangerine.router.landing(true)

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

    if Tangerine.settings.get("verifiableAttribute")
      id = Tangerine.settings.get("verifiableAttribute").underscore().dasherize()
      name = Tangerine.settings.get("verifiableAttributeName")
      verifiableHtml = "
        <label for='#{id}'>#{name}</label>
        <input autocomplete='off' id='#{id}' placeholder='#{name}'>
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

          #{verifiableHtml||''}

          <div class='messages name-message'></div>
          <input autocomplete='off' id='tsc-number' type='text' placeholder='#{@text.tsc_number}'>

          <input autocomplete='off' id='new-name' type='text' placeholder='#{nameName}'>

          <input autocomplete='off' id='challenge-question' type='hidden' value='#{@text.challenge_question}' placeholder='#{@text.challenge_question}' title='#{@text.challenge_explaination}'>

          <input autocomplete='off' id='challenge-response' type='text' placeholder='#{@text.challenge_response}' title='#{@text.challenge_explaination}'>

          <div class='messages pass-message'></div>
          <input autocomplete='off' id='new-pass-1' type='password' placeholder='#{@text.password}'>

          <input autocomplete='off' id='new-pass-2' type='password' placeholder='#{@text.password_confirm}'>


          <input autocomplete='off' id='first' type='text' placeholder='#{@text.first_name}'>
          <input autocomplete='off' id='last' type='text' placeholder='#{@text.last_name}'>

          <div id='schoolSelector'>Loading county and zone list...</div>

          <label>Gender<br>
          <select id='gender'>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>
          </label>
          <br/><br/>

          <input autocomplete='off' id='phone' type='number' placeholder='#{@text.phone}'>
          <input autocomplete='off' id='email' type='text' placeholder='#{@text.email}'>
          <br>
          <!--label for='same-users'>Please merge previous user names with this one</label>
          <select multiple='true' id='same-users'>
            #{("<option value='#{user.get('id')}'>#{user.get('name')}</option>" for user in @users.models || []).join('')}
            #{("<option value='#{user}'>#{user}</option>" for user in @usersAug25).join('')}
          </select-->

          <button class='sign-up'>#{@text.sign_up}</button>
        </section>
      </div>

      <div class='reset' style='display:none;'>
        <section class='clearfix'>
          <div class='messages name-message'></div>
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
    @renderSchoolList "dom"

  renderSchoolList: (flag) ->
    requiredFlags = ["dom", "data"]
    @renderSchoolListFlags = [] unless @renderSchoolListFlags?
    @renderSchoolListFlags.push flag
    ready = _(requiredFlags).intersection(@renderSchoolListFlags).length == requiredFlags.length
    return unless ready

    @locationView.setElement @$el.find("#schoolSelector")
    @locationView.render()
    @locationView.$el.find(".clear").remove()

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
    $(window).off()


  # returns true or false on a key event supressing default behavior on special conditions
  keyHandler: (event) ->

    # define special key codes
    key =
      ENTER     : 13
      TAB       : 9
      BACKSPACE : 8

    # what field are we looking at
    field = $(event.target).attr('id')

    # ignore all these fields
    isntIgnoredField = not (
      field is "challenge-question" or
      field is "challenge-response" or
      field is "response" or
      field is "email" or
      field is "phone"
    )

    # clear messages with every new input
    $('.messages').html('')

    char = event.which

    # only respond to keyboard events and on fields we don't ignore
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
    if @hasVerifiableAttribute
      v = new Vouch
      v.vet
        data:
          group: Tangerine.settings.get("groupName")
          key: @$el.find("##{@verifiableAttributeId()}").val().toLowerCase().replace(/[^a-z0-9']/,'')
        success: =>
          @_signup()
        error: =>
          Utils.sticky "#{@verifiableAttributeName()} not verified."
    else
      return @_signup()


  _signup: ->
    name  = ($name  = @$el.find("#new-name")).val().toLowerCase()
    pass1 = ($pass1 = @$el.find("#new-pass-1")).val()
    pass2 = ($pass2 = @$el.find("#new-pass-2")).val()

    errors = []

    if ( tscNumber  = ( $tscNumber  = @$el.find("#tsc-number")     ).val() ).length is 0
      errors.push " - TSC or Employment number cannot be empty"

    if ( first  = ( $first  = @$el.find("#first")     ).val() ).length is 0
      errors.push " - First name cannot be empty"

    if ( last   = ( $last   = @$el.find("#last")      ).val() ).length is 0
      errors.push " - Last name cannot be empty"

    if ( gender = ( $gender = @$el.find("#gender")    ).val() ).length is 0
      errors.push " - Gener cannot be empty"

    if ( phone  = ( $phone  = @$el.find("#phone")     ).val() ).length is 0
      errors.push " - Phone cannot be empty"


    if ( question = ($question = @$el.find("#challenge-question")).val() ).length is 0
      errors.push " - Challenge question cannot be empty"

    if ( response = ($response = @$el.find("#challenge-response")).val() ).length is 0
      errors.push " - Challenge response cannot be empty"

    email  = ( $email  = @$el.find("#email")     ).val()
      # do nothing
    #  errors.push " - Email cannot be empty"

    location = {}
    rawLocation = @locationView.getResult(true)

    for label, i in rawLocation.labels

      errors.push " - #{label} must be selected" unless rawLocation.location[i]?
      location[label] = rawLocation.location[i]


    previousUsers = ($previousUsers = @$el.find("#same-users")).val()


    attributes =
      "tscNumber" : tscNumber
      "question"  : question
      "response"  : response

      "first"  : first
      "last"   : last
      "location" : location
      "gender" : gender
      "phone"  : phone
      "email"  : email
      "previousUsers" : previousUsers

    if @hasVerifiableAttribute()
      attributes[@verifiableAttribute()] = @$el.find("##{@verifiableAttributeId()}").val()


    return @passError(@text.pass_mismatch) if pass1 isnt pass2

    if errors.length isnt 0

      Utils.sticky "Please correct the following errors<br><br>#{errors.join('<br>')}"

    else
      try
        @user.signup name, pass1, attributes

      catch e
        console.error e
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
    @passMsg.html(error).scrollTo()
    @$el.find("#pass").focus()

  nameError: (error) ->
    @errors++
    @nameMsg.html(error).scrollTo()

    @$el.find("#name").focus()

  clearErrors: ->
    @nameMsg.html ""
    @passMsg.html ""
    @errors = 0

  verifiableAttributeName: ->
    Tangerine.settings.getString("verifiableAttributeName")

  verifiableAttributeId: ->
    Tangerine.settings.getString("verifiableAttribute").underscore().dasherize()

  verifiableAttribute: ->
    Tangerine.settings.getString("verifiableAttribute")

  hasVerifiableAttribute: ->
    Tangerine.settings.getString("verifiableAttribute") != ""

class Vouch

  constructor: ->
    @url = Tangerine.settings.config.get("vouch")

  vet: (options) ->
    $.post( @url, $.param(options.data))
    .complete (res) ->
      if res.status == 200
        return options.success()
      else if res.status == 401
        return options.error()
      else
        Utils.sticky "Verification error. Cannot verify with server."
        console.error arguments
