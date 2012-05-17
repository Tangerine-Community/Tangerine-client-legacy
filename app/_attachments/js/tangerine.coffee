class Router extends Backbone.Router
  routes:
    'login'   : 'login'
    'logout'  : 'logout'
    'account' : 'account'

    'test' : 'test'

    'setup' : 'setup'

    ''            : 'assessments'
    'assessments' : 'assessments'
    
    'dashboard' : 'dashboard' 

    'edit-id/:id'   : 'editId'
    'run/:name'     : 'run'
    'edit/:name'    : 'edit'
    'results/:name' : 'results'
    'import'        : 'import'
    
    'subtest/:id' : 'editSubtest'
    
    'question/:id' : 'editQuestion'

  test: ->
    ass = new Assessment
    ass.fetch
      name:"Example English EGRA May 2011"
      success:(model)->
        console.log "result of all that"
        console.log model

  #
  # Device
  #
  setup: ->
    Tangerine.device.fetch
      success: (model) ->
        view = new DeviceView
          model: model
        vm.show view

  # Just an assessment list but interesting idea
  # uses nested views
  dashboard: ->
    Tangerine.user.verify
      isAdmin: ->
        dashboard = new DashboardView
        vm.show dashboard
      isUser: ->
        Tangerine.router.navigate "assessments", true

  #
  # Assessment
  #

  import: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new AssessmentImportView
        vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  assessments: ->
    Tangerine.user.verify
      isRegistered: ->
        assessments = new AssessmentListView
        vm.show assessments
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  editId: (id) ->
    id = Utils.cleanURL id
    Tangerine.user.verify
      isAdmin: ->
        assessment = new Assessment
          _id: id
        assessment.superFetch
          success : ( model ) ->
            console.log "model name"
            console.log model.attributes.name
            console.log model
            view = new AssessmentEditView model: model
            vm.show view
          error: (details) ->
            name = Utils.cleanURL name
            view = new ErrorView
              message : "There was an error loading the assessment '#{name}'"
              details : details
            vm.show view
      isUser: ->
        Tangerine.router.navigate "", true
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  edit: (name) ->
    Tangerine.user.verify
      isAdmin: ->    
        assessment = new Assessment
        assessment.fetch
          name : name
          success : ( model ) ->
            view = new AssessmentEditView model: model
            vm.show view
          error: (details) ->
            name = Utils.cleanURL name
            view = new ErrorView
              message : "There was an error loading the assessment '#{name}'"
              details : details
            vm.show view
      isUser: ->
        Tangerine.router.navigate "", true
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true


  run: (name) ->
    Tangerine.user.verify
      isRegistered: ->
        assessment = new Assessment
        assessment.fetch
          name : name
          success : ( model ) ->
            view = new AssessmentRunView model: model
            vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  # maybe this one can take the id instead
  # since it doesn't use the assessment
  results: (name) ->
    Tangerine.user.verify
      isRegistered: ->
        assessment = new Assessment
        assessment.fetch
          name : name
          success : ( model ) ->
            view = new ResultsView 
              assessment : model
            vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  #
  # Subtests
  #
  editSubtest: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        subtest = new Subtest _id : id
        subtest.fetch
          success: (model, response) ->
            view = new SubtestEditView
              model : model
            vm.show view
      isUser: ->
        Tangerine.router.navigate "", true
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  #
  # Question
  #
  editQuestion: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        id = Utils.cleanURL id
        question = new Question _id : id
        question.fetch
          success: (model, response) ->
            view = new QuestionEditView
              model : model
            vm.show view
      isUser: ->
        Tangerine.router.navigate "", true
      isUnregistered: ->
        Tangerine.router.navigate "login", true


  #
  # User
  #
  login: ->
    Tangerine.user.verify
      isRegistered: ->
        Tangerine.router.navigate "", true
      isUnregistered: ->
        view = new LoginView
        vm.show view

  logout: ->
    Tangerine.user.logout()
    Tangerine.router.navigate "login", true


  account: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new AccountView model : Tangerine.user
        vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true


$ ->
  #
  # Start the application
  #

  window.vm = new ViewManager()

  # Singletons
  Tangerine.router = new Router()
  Tangerine.user   = new User()
  Tangerine.nav    = new NavigationView
    user   : Tangerine.user
    router : Tangerine.router

  Backbone.history.start()

