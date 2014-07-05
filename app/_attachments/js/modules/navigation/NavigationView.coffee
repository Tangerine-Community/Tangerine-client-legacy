class NavigationView extends Backbone.View

  el : '#navigation'

  events: if Modernizr.touch then {
    'click div#logout_link'  : 'logout'
    'click button'            : 'submenuHandler'
    'click #corner_logo'      : 'logoClick'
    'click #enumerator'       : 'enumeratorClick'
  } else {
    'click div#logout_link'   : 'logout'
    'click button'            : 'submenuHandler'
    'click #corner_logo'      : 'logoClick'
    'click #enumerator'       : 'enumeratorClick'
  }

  calcWhoAmI: =>
    # who am I
    @whoAmI = Tangerine.settings.contextualize
      klass : @text.teacher
      allElse : @text.user

  enumeratorClick: ->
    if @user.isAdmin() or "class" is Tangerine.settings.get("context")
      Tangerine.router.navigate "account", true

    if @workflows.length isnt 0
      Tangerine.router.navigate "tutor-account", true

  # if we're running a workflow and
  # the index isn't the last or the first
  # then confirm we want to save the trip id to our list of resumable workflows
  confirmWorkflowExit: ->

    view = vm.currentView

    return false unless view instanceof WorkflowRunView

    # only ask if the workflow isn't finished
    return false if view.index is view.workflow.getLength()

    # only ask if the first step is done
    return false if view.index is 0

    return unless confirm("This workflow is incomplete. Do you wish to resume later?\n\nYou may have to renter previously entered data.")

    incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete") || {}
    
    workflowId = view.workflow.id

    incomplete[workflowId] = [] unless incomplete[workflowId]?
    incomplete[workflowId].push view.tripId
    view.steps[view.index].result.save()

    Tangerine.user.setPreferences "tutor-workflows", "incomplete", incomplete

    return true

  # Let the admin user do what they want
  # Ask non-admins if they're sure they want to abandon the assessment
  # if it's a workflow, ask if they'd like to resume later
  logoClick: -> 
    if @user.isAdmin()
      Tangerine.activity = ""
      @confirmWorkflowExit()
      @router.reload()

    else
      if @confirmWorkflowExit()
        Tangerine.activity = ""
        return @router.reload()
      if Tangerine.activity == "assessment run"
        if confirm @text.incomplete_main
          Tangerine.activity = ""
          @router.reload()
      else
          @router.reload()

  logout: ->
    if @user.isAdmin() || Tangerine.settings.get("context") == "server"
      Tangerine.activity = ""
      Tangerine.user.logout()
    else
      if Tangerine.activity == "assessment run"
        if confirm @text.incomplete_logout
          Tangerine.activity = ""
          Tangerine.user.logout()
      else
        if confirm @text.confirm_logout
          Tangerine.activity = ""
          Tangerine.user.logout()

  onClose: -> # do nothing

  initialize: (options) =>

    @i18n()
    @render()

    @user   = options.user
    @router = options.router

    @calcWhoAmI()

    @listenTo @router,        'all', @handleMenu
    @listenTo @user, 'login logout', @handleMenu

    @workflows = new Workflows
    @workflows.fetch()

  i18n: ->
    @text =
      "logout"            : t('NavigationView.button.logout')
      "user"              : t('NavigationView.label.user')
      "teacher"           : t('NavigationView.label.teacher')
      "enumerator"        : t('NavigationView.label.enumerator')
      "student_id"        : t('NavigationView.label.student_id')
      "version"           : t('NavigationView.label.version')
      "account"           : t('NavigationView.help.account')
      "logo"              : t('NavigationView.help.logo')
      "incomplete_logout" : t("NavigationView.message.incomplete_logout")
      "confirm_logout"    : t("NavigationView.message.logout_confirm")
      "incomplete_main"   : t("NavigationView.message.incomplete_main_screen")

  submenuHandler: (event) ->
    vm.currentView.submenuHandler? event

  closeSubmenu: ->
    @$el.find("main_nav").empty()

  render: ->
    @$el.html "
    <img id='corner_logo' src='images/corner_logo.png' title='#{@text.logo}'>
    <div id='logout_link'>#{@text.logout}</div>
    <div id='enumerator_box'>
      <span id='enumerator_label' title='#{@text.account}'>#{@whoAmI}</span>
      <div id='enumerator'>#{Tangerine.user.name() || ""}</div>
    </div>

    <div id='current_student'>
      #{@text.student_id}
      <div id='current_student_id'></div>
    </div>
    <div id='version'>
      #{@text.version} <br>
      <span id='version-uuid'>#{Tangerine.version}</span><br>
    </div>
    "

    # Spin the logo on ajax calls
    $(document).ajaxStart -> 
      if $("#corner_logo").attr("src") isnt "images/spin_orange.gif"
        $("#corner_logo").attr "src", "images/spin_orange.gif"
    $(document).ajaxStop ->
      if $("#corner_logo").attr("src") isnt "images/corner_logo.png"
        $("#corner_logo").attr "src", "images/corner_logo.png"

  setStudent: ( id ) ->
    if id == ""
      @$el.find('#current_student_id').fadeOut(250, (a) -> $(a).html(""))
      @$el.find("#current_student").fadeOut(250)
    else
      @$el.find('#current_student_id').html(id).parent().fadeIn(250)


  # Admins get a manage button 
  # triggered on user changes
  handleMenu: (event) =>
    @calcWhoAmI()

    $("#enumerator_label").html @whoAmI

    $('#enumerator').html @user.name()

    # @TODO This needs fixing
    if ~window.location.toString().indexOf("name=") then @$el.find("#logout_link").hide() else  @$el.find("#logout_link").show()

    @user.verify
      isAuthenticated: =>
        @render()
        $( '#navigation' ).fadeIn(250)
      isUnregistered: =>
        @render()
        $( '#navigation' ).fadeOut(250)


