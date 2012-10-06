class NavigationView extends Backbone.View

  el : '#navigation'

  events: if Modernizr.touch then {
    'touchstart div#logout_link'  : 'logout'
    'touchstart button'            : 'submenuHandler'
    'touchstart #corner_logo'      : 'logoClick'
    'touchstart #enumerator'       : 'enumeratorClick'
  } else {
    'click div#logout_link'  : 'logout'
    'click button'            : 'submenuHandler'
    'click #corner_logo'      : 'logoClick'
    'click #enumerator'       : 'enumeratorClick'
  }

  enumeratorClick: -> Tangerine.router.navigate "account", true

  logoClick:-> 
    if @user.isAdmin()
      Tangerine.activity = ""
      @router.navigate '', true
    else
      if Tangerine.activity == "assessment run"
        if confirm("Assessment not finished. Continue to main screen?")
          Tangerine.activity = ""
          @router.navigate '', true
      else
          @router.navigate '', true

      
  logout: ->
    if @user.isAdmin()
      Tangerine.activity = ""
      @router.navigate 'logout', true
    else
      if Tangerine.activity == "assessment run"
        if confirm("Assessment not finished. Continue to logout?")
          Tangerine.activity = ""
          @router.navigate 'logout', true
      else
        if confirm("Are you sure you want to logout?")
          Tangerine.activity = ""
          @router.navigate 'logout', true

  onClose: ->

  initialize: (options) =>
    @render()

    @user   = options.user
    @router = options.router

    @router.on 'all', @handleMenu
    @user.on   'change:authentication', @handleMenu

  submenuHandler: (event) ->
    vm.currentView.submenuHandler? event

  closeSubmenu: ->
    @$el.find("main_nav").empty()

  render: ->
    updateButton = if Tangerine.user.isAdmin() && Tangerine.settings.context != "server" then "<a href='#update'>#{t('update')}</a>" else ""

    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png'>
    <div id='logout_link'>#{t('logout')}</div>
    <div id='enumerator_box'>
      #{t('enumerator')}
      <div id='enumerator'>#{Tangerine.user.name || ""}</div>
    </div>

    <div id='current_student'>
      Student ID
      <div id='current_student_id'></div>
    </div>
    <div id='version'>
    version <br/>
    <span id='version-uuid'>#{Tangerine.version}</span><br/>
    #{updateButton}
    </div>
    "

    # Spin the logo on ajax calls
    $("body").ajaxStart -> $("#corner_logo").attr "src", "images/spin_orange.gif"
    $("body").ajaxStop ->  $("#corner_logo").attr "src", "images/corner_logo.png"

  setStudent: ( id ) ->
    if id == ""
      @$el.find('#current_student_id').fadeOut(250, (a) -> $(a).html(""))
      @$el.find("#current_student").fadeOut(250)
    else
      @$el.find('#current_student_id').html(id).parent().fadeIn(250)


  # Admins get a manage button 
  # triggered on user changes
  handleMenu: (event) =>
    $('#enumerator').html @user.name
    # @todo put version number someplace
    #$.ajax {method: 'GET', dataType: 'text', url: 'version', success: (a, b, c) -> $("#corner_logo").attr("title", c.responseText)
    
    # @TODO This needs fixing
    if ~window.location.toString().indexOf("name=") then @$el.find("#logout_link").hide() else  @$el.find("#logout_link").show()
    
    @user.verify
      isRegistered: =>
        @render()
        $( '#navigation' ).fadeIn(250)
      isUnregistered: =>
        @render()
        $( '#navigation' ).fadeOut(250)


