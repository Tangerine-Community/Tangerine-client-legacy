class NavigationView extends Backbone.View

  el : '#navigation'

  events :
    'click span#collect_link' : 'collect'
    'click span#manage_link'  : 'manage'
    'click span#logout_link'  : 'logout'
    'click button'            : 'submenuHandler'

  initialize: (options) =>
    @render()

    @user   = options.user
    @router = options.router

    @user.on 'change', @handleMenu
    @user.trigger 'change'

  submenuHandler: (event) ->
    console.log "trying to handle"
    console.log vm.currentView.submenuHandler?
    vm.currentView.submenuHandler? event

  closeSubmenu: ->
    @$el.find("main_nav").empty()

  render: ->
    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png'>
    <span id='version'></span>
    <nav id='submenu'></nav>
    <div id='enumerator_box'>
      Enumerator <span id='logout_link'>LOGOUT</span>
      <div id='enumerator'></div>
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
        $( '#navigation' ).show()
      isUser: ->
        $( '#navigation' ).show()
      unregistered: ->
        $( '#navigation' ).hide()




  
  