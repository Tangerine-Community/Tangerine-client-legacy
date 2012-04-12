class Navigation extends Backbone.View

  el : '#navigation'

  events :
    'click span#collect_link' : 'collect'
    'click span#manage_link'  : 'manage'
    'click span#logout_link'  : 'logout'

  initialize: (options) =>
    @render()

    @user   = options.user
    @router = options.router

    @user.on 'change', @handleMenu
    @user.trigger 'change'
    @router.on 'all', @handleNavigation


  render: ->
    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png'>
    <span id='version'></span>
    <nav id='main_nav'>
      <span id='collect_link' class='nav_link'>COLLECT</span>
      <span id='manage_link' class='nav_link'>MANAGE</span>
    </nav>
    <div id='session_info'>
      <div id='student_id_box'>
        Student ID <div id='current-student-id'>none</div>
      </div>
      <div id='enumerator_box'>
        Enumerator <span id='logout_link' class='nav_link'>LOGOUT</span>
        <div id='enumerator'></div>
      </div>
    </div>
    "

  collect: -> @router.navigate 'assessments', true
  manage: -> @router.navigate 'manage', true
  logout: -> @router.navigate 'logout', true
  
  # Admins get a manage button 
  # triggered on user changes
  # @TODO this might not be the right place for this. Another View?
  handleMenu: =>
    
    $('#enumerator').html @user.get 'name'
    
    # @todo put version number someplace
    #$.ajax {method: 'GET', dataType: 'text', url: 'version', success: (a, b, c) -> $("#corner_logo").attr("title", c.responseText)

    $( '#collect_link, #manage_link' ).hide()
    
    @user.verify
      isAdmin: ->
        $( '#manage_link' ).show()
      isUser: ->
        $( '#navigation' ).show()
        $( '#collect_link' ).show()
      unregistered: ->
        $( '#navigation' ).hide()


  # Hide and show navigation pane
  # Triggered on page changes
  # @TODO this method breaks easily. Need new way to check.
  handleNavigation: ->
    $('#current-student-id').html "none"
    managePages = ["manage", "edit"]
    collectPages = ["assessments", "assessment/"]
    href = window.location.hash.toLowerCase().substr(1)
    if _.any(managePages, ( e ) -> href.substr(0,e.length).indexOf(e) != -1)
      $("nav#main_nav span").removeClass("border_on")
      $("#manage_link").addClass("border_on")
    else if _.any(collectPages, ( e ) -> href.substr(0,e.length).indexOf(e) != -1)
      $("nav#main_nav span").removeClass("border_on")
      $("#collect_link").addClass("border_on")  
    else
      $("nav#main_nav span").removeClass("border_on")
      $("#manage_link").addClass("border_on")  


  
  