class NavigationView extends Backbone.View

  el : '#navigation'

  events :
    'click span#logout_link'  : 'logout'
    'click button'            : 'submenuHandler'
    'click #corner_logo'      : 'logoClick'
    'click #enumerator'       : 'enumeratorClick'
    
  enumeratorClick: -> Tangerine.router.navigate "account", true

  logoClick:-> @router.navigate '', true
  logout: -> @router.navigate 'logout', true

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
    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png'>
    <nav id='submenu'></nav>
    <div id='enumerator_box'>
      #{t('enumerator')} <span id='logout_link'>#{t('logout')}</span>
      <div id='enumerator'></div>
    </div>
    <div id='current_student'>
      Student ID
      <div id='current_student_id'></div>
    </div>
    <div id='version'>
    version <br/>
    <span id='version-uuid'></span><br/>
    #{
      if Tangerine.user.isAdmin && Tangerine.settings.context != "server"
        "<a href='#update'>#{t('update')}</a>"
      else
        ""
    }
    </div>
    "

    $.ajax "version",
      dataType: "text"
      success: (result) ->
        $("#version-uuid").html result
      error:
        $("#version-uuid").html "-"


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
      isRegistered: ->
        $( '#navigation' ).fadeIn(250)
      isUnregistered: ->
        $( '#navigation' ).fadeOut(250)


