class Router extends Backbone.Router
  routes:
    'login'    : 'login'
    'register' : 'register'
    'logout'   : 'logout'
    'account'  : 'account'

    'transfer' : 'transfer'

    ''               : 'klasses'
    'classes'        : 'klasses'
    'class'          : 'klass'
    'class/edit/:id' : 'klassEdit'
    'class/student/:studentId'        : 'studentEdit'
    'class/student/report/:studentId' : 'studentReport'

    'class/:id/:week' : 'klassWeekly'
    'class/:id'       : 'klassWeekly'

    'class/run/:studentId/:subtestId' : 'runSubtest'

    'class/result/student/subtest/:studentId/:subtestId' : 'studentSubtest'

    'setup' : 'setup'

    'groups' : 'groups'

    'assessments'        : 'assessments'
    'assessments/:group' : 'assessments'


    'dashboard' : 'dashboard' 

    'codebook/:id' : 'codebook'

    'restart/:id'   : 'restart'
    'edit/:id'      : 'edit'
    'csv/:id'       : 'csv'
    'results/:name' : 'results'
    'import'        : 'import'
    
    'subtest/:id' : 'editSubtest'
    
    'question/:id' : 'editQuestion'
    
    'report/:id' : 'report'


  groups: ->
    if not Tangerine.context.server
      Tangerine.router.navigate "assessments", true
    else 
      Tangerine.user.verify
        isAdmin: ->
          groups = Tangerine.user.get("groups")
          if groups.length == 1 && window.location.hash = ""
            Tangerine.router.navigate "assessments/#{groups[0]}", true
          else
            view = new GroupsView
            vm.show view
        isUnregistered: ->
          Tangerine.router.navigate "login", true
    

  codebook: (id) ->
    id = Utils.cleanURL(id)

  klass: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new KlassMenuView
        vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  klasses: ->
    Tangerine.user.verify
      isRegistered: ->
        allKlasses = new Klasses
        allKlasses.fetch
          success: ( klassCollection ) ->
            allCurricula = new Curricula
            allCurricula.fetch
              success: ( curriculaCollection ) ->
                view = new KlassesView
                  klasses   : klassCollection
                  curricula : curriculaCollection
                vm.show view

  klassEdit: (id) ->
    Tangerine.user.verify
      isRegistered: ->
        klass = new Klass _id : id
        klass.fetch
          success: ( model ) ->
            allStudents = new Students
            allStudents.fetch
              success: (allStudents) ->
                klassStudents = new Students allStudents.where {klassId : id}
                view = new KlassEditView
                  klass       : model
                  students    : klassStudents
                  allStudents : allStudents

                vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "", true

  klassWeekly: (id, week=null) ->
    Tangerine.user.verify
      isRegistered: ->
        klass = new Klass "_id" : id
        klass.fetch
          success: ->
            curriculum = new Curriculum "_id" : klass.get("curriculumId")
            curriculum.fetch
              success: ->
                allStudents = new Students
                allStudents.fetch
                  success: (collection) ->
                    students = new Students ( collection.where( "klassId" : id ) )

                    allResults = new KlassResults
                    allResults.fetch
                      success: (collection) ->
                        results = new KlassResults ( collection.where( "klassId" : id ) )

                        allSubtests = new Subtests
                        allSubtests.fetch
                          success: (collection ) ->
                            subtests = new Subtests ( collection.where( "curriculumId" : klass.get("curriculumId") ) )

                            view = new KlassWeeklyView
                              "week"       : week
                              "subtests"   : subtests
                              "results"    : results
                              "students"   : students
                              "curriculum" : curriculum
                              "klass"      : klass

                            vm.show view

      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  studentSubtest: (studentId, subtestId) ->
    Tangerine.user.verify
      isRegistered: ->
        allResults = new Results 
        allResults.fetch
          success: (collection) ->
            result = collection.where 
              "subtestId" : subtestId
              "studentId" : studentId
            subtest = new Subtest "_id" : subtestId
            subtest.fetch
              success: ->
                student = new Student "_id" : studentId
                student.fetch
                  success: ->
                    view = new KlassSubtestResultView
                      "result"  : result
                      "subtest" : subtest
                      "student" : student
                    vm.show view

  runSubtest: (studentId, subtestId) ->
    Tangerine.user.verify
      isRegistered: ->
        subtest = new Subtest "_id" : subtestId
        subtest.fetch
          success: ->
            student = new Student "_id" : studentId
            student.fetch
              success: ->
                view = new KlassSubtestRunView
                  "student" : student
                  "subtest" : subtest
                vm.show view

  register: ->
    Tangerine.user.verify
      isUnregistered: ->
        view = new RegisterTeacherView
          user : new User
        vm.show view
      isRegistered: ->
        Tangerine.router.navigate "", true


  #
  # Student
  #

  studentEdit: ( studentId ) ->
    Tangerine.user.verify
      isRegistered: ->
        student = new Student _id : studentId
        student.fetch
          success: (model) ->
            allKlasses = new Klasses
            allKlasses.fetch
              success: ( klassCollection )->
                view = new StudentEditView
                  student : model
                  klasses : klassCollection
                vm.show view

      isUnregistered: ->
        Tangerine.router.navigate "", true

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

  assessments: (group = null) ->
    if group == null && Tangerine.context.server
      Tangerine.router.navigate "groups", true
    else
      Tangerine.user.verify
        isRegistered: ->
          assessments = new AssessmentListView
            group : group
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

  edit: (id) ->
    Tangerine.user.verify
      isAdmin: ->    
        assessment = new Assessment
          "_id" : id
        assessment.fetch
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


  restart: (name) ->
    Tangerine.router.navigate "run/#{name}", true

  results: (id) ->
    Tangerine.user.verify
      isRegistered: ->
        assessment = new Assessment
          "_id" : id
        assessment.fetch
          success : ( model ) ->
            view = new ResultsView 
              assessment : model
            vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  csv: (id) ->
    Tangerine.user.verify
      isAdmin: ->
        view = new CSVView
          assessmentId : id
        vm.show view
      isUser: ->
        errView = new ErrorView
          message : "You're not an admin user"
          details : "How did you get here?"
        vm.show errView

  # Taylor's addition - class summary for single assessment
  # Note that currently reports can only be accessed by URL
  # Example URL: http://localhost:5984/tangerine/_design/tangerine/index.html#report/3893245d0c5104822af8e6855e0000df
  # Add "-0" or "-1" to the end to specify which report to use, where 0 
  # corresponds to first report, 1 to the second, etc.
  report: (id) ->
    Tangerine.user.verify
      isRegistered: ->
        subtest = new Subtest "_id" : id
        subtest.fetch
          success: ->
            allResults = new Results
            allResults.fetch
              success: (collection) ->
                results = collection.where "subtestId" : subtest.id
                
                students = new Students
                students.fetch
                  success: ->
                    view = new ReportView
                      "students"   : students
                      "subtest"    : subtest
                      "results"    : results
                      assessmentId : id
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
        view = new AccountView user : Tangerine.user
        vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  logs: ->
    view = new LogView
    vm.show view

  # Transfer a new user from tangerine-central into tangerine
  transfer: ->
    getVars = Utils.$_GET()
    name = getVars.name
    $.couch.logout
      success: =>
        $.cookie "AuthSession", null
        $.couch.login
          "name"     : name
          "password" : name
          success: ->
            Tangerine.router.navigate ""
            window.location.reload()
          error: ->
            $.couch.signup
              "name" :  name
              "roles" : ["_admin"]
            , name,
            success: ->
              user = new User
              user.save 
                "name"  : name
                "id"    : "tangerine.user:"+name
                "roles" : []
                "from"  : "tc"
              ,
                wait: true
                success: ->
                  $.couch.login
                    "name"     : name
                    "password" : name
                    success : ->
                      Tangerine.router.navigate ""
                      window.location.reload()
                    error : ->
                      view = new ErrorView
                        message : "There was a username collision"
                        details : ""
                      vm.show view


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
  

  Tangerine.user.fetch
    success: ->
      Backbone.history.start()
    error: ->
      Backbone.history.start()

  
