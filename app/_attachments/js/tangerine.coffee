class Router extends Backbone.Router
  routes:
    'login'  : 'login'
    'logout' : 'logout'

    ''          : 'dashboard'
    'dashboard' : 'dashboard'

    'assessment/:name'         : 'assessment'
    'assessment/:name/run'     : 'run'
    'assessment/:name/edit'    : 'edit'
    'assessment/:name/results' : 'results'

    "assessments" : "assessments"

  dashboard: ->
    Tangerine.user.verify
      isAdmin: ->
        dashboard = new DashboardView
        vm.show dashboard
      isUser: ->
        Tangerine.router.navigate "assessments"

  assessments: ->
    Tangerine.user.verify()
    assessments = new AssessmentListView
    vm.show assessments

  login: ->
    loginView = LoginView()
    vm.show loginView

  logout: ->
    Tangerine.user.logout()
    Tangerine.router.navigate "login", true

# Initialization/Detection
$ -> # run after DOM loads

  #
  # Start the application
  #
  
  # Reuse the view objects to stop events from being duplicated (and to save memory)
  

  # Durables
  # Things here should be reused
  Tangerine.router = new Router()
  Tangerine.user   = new User()
  Tangerine.nav = new Navigation
    user   : Tangerine.user
    router : Tangerine.router

  Backbone.history.start()

  #
  # Set up some interface stuff
  #
  
  # ###.clear_message
  # This little guy will fade out and clear him and his parents. Wrap him wisely.
  # `<span> my message <button class="clear_message">X</button>`
  $("#content").on("click", ".clear_message",  null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).empty().show() ) )
  $("#content").on("click", ".parent_remove", null, (a) -> $(a.target).parent().fadeOut(250, -> $(this).remove() ) )

  # Spin the logo on ajax calls
  $(".ajax_loading").ajaxStart -> $("#corner_logo").attr "src", "images/spin_orange.gif"
  $(".ajax_loading").ajaxStop ->  $("#corner_logo").attr "src", "images/corner_logo.png"

  # disposable alerts, this should be moved
  $("#content").on "click",".alert_button", ->
    alert_text = if $(this).attr("data-alert") then $(this).attr("data-alert") else $(this).val()
    Utils.disposableAlert alert_text
  $("#content").on "click", ".disposable_alert", -> 
    $(this).stop().fadeOut 250, ->
      $(this).remove()

