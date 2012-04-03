class Navigation extends Backbone.View
  
  el : "#navigation"
  
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
      <a id='collect_link' href='#assessments'>COLLECT</a>
      <a id='manage_link' href='#manage'>MANAGE</a>
    </nav>
    <div id='session_info'>
      <div id='student_id_box'>
        Student ID <div id='current-student-id'>none</div>
      </div>
      <div id='enumerator_box'>
        Enumerator <a id='logout_link' href='#logout'>LOGOUT</a>
        <div id='enumerator'></div>
      </div>
    </div>
    ";
  
  
  
  # Admins get a manage button 
  # triggered on user changes
  # @TODO this might not be the right place for this. Another View?
  handleMenu: =>
    @user.verify()
    
    $("#enumerator").html @user.get "name"
    
    # The order of the if statements is important. Maybe it shouldn't be.
    # admin user
    if @user.isAdmin()
      $( "#main_nav a" ).hide()
      $( "#navigation" ).show()
      $( "#collect_link, #manage_link, #logout_link" ).show()

    #not logged in
    else if not @user.isVerified()
      $( "#navigation" ).hide()

    #regular user
    else
      $( "#main_nav a" ).hide()
      $( "#navigation" ).show()
      $( "#collect_link, #logout_link" ).show()

  # Hide and show navigation pane
  # Triggered on page changes
  # @TODO this method breaks easily. Need new way to check.
  handleNavigation: ->
    if window.location.href.toLowerCase().indexOf("assessment") != -1
      $("nav#main_nav a").removeClass("border_on")
      $("#collect_link").addClass("border_on")    
    if window.location.href.toLowerCase().indexOf("manage") != -1
      $("nav#main_nav a").removeClass("border_on")
      $("#manage_link").addClass("border_on")

  