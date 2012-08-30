class Router extends Backbone.Router
  routes:
    'login'    : 'login'
    'register' : 'register'
    'logout'   : 'logout'
    'account'  : 'account'

    'transfer' : 'transfer'

    'class'          : 'klass'
    'class/edit/:id' : 'klassEdit'
    'class/student/:studentId'        : 'studentEdit'
    'class/student/report/:studentId' : 'studentReport'

    'class/:id/:part' : 'klassPartly'
    'class/:id'       : 'klassPartly'

    'class/run/:studentId/:subtestId' : 'runSubtest'

    'class/result/student/subtest/:studentId/:subtestId' : 'studentSubtest'

    'curricula'         : 'curricula'
    'curriculum/:id'    : 'curriculum'
    'curriculum/import' : 'curriculumImport'

    'settings' : 'settings'

    '' : 'landing'

    'groups' : 'groups'

    'assessments'        : 'assessments'
    'assessments/:group' : 'assessments'

    'run/:id'       : 'run'
    
    'restart/:id'   : 'restart'
    'edit/:id'      : 'edit'
    'csv/:id'       : 'csv'
    'results/:name' : 'results'
    'import'        : 'import'
    
    'subtest/:id' : 'editSubtest'

    'question/:id' : 'editQuestion'

    'report/partByStudent/:subtestId' : 'partByStudent'
    'report/studentToDate/:studentId' : 'studentToDate'
    'report/classToDate/:klassId'     : 'klassToDate'

  landing: ->
    if Tangerine.settings.context == "server"
      Tangerine.router.navigate "groups", true
    else if Tangerine.settings.context == "mobile"
      Tangerine.router.navigate "assessments", true
    else if Tangerine.settings.context == "class"
      Tangerine.router.navigate "class", true

  groups: ->
    Tangerine.user.verify
      isAdmin: ->
        groups = Tangerine.user.get("groups")
        if groups.length == 1 && window.location.hash == ""
          Tangerine.router.navigate "assessments/#{groups[0]}", true
        else
          view = new GroupsView
          vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  curricula: ->
    Tangerine.user.verify
      isRegistered: ->
        curricula = new Curricula
        curricula.fetch
          success: (collection) ->
            view = new CurriculaView
              "curricula" : collection
            vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  curriculum: (curriculumId) ->
    Tangerine.user.verify
      isRegistered: ->
        curriculum = new Curriculum "_id" : curriculumId
        curriculum.fetch
          success: ->
            allSubtests = new Subtests
            allSubtests.fetch
              success: ->
                subtests = allSubtests.where "curriculumId" : curriculumId
                allParts = (subtest.get("part") for subtest in subtests)
                partCount = Math.max.apply Math, allParts 
                view = new CurriculumView
                  "curriculum" : curriculum
                  "subtests" : subtests
                  "parts" : partCount
                vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true


  curriculumImport: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new CurriculumImportView
        vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  klass: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new KlassMenuView
        vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  klass: ->
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

  klassPartly: (klassId, part=null) ->
    Tangerine.user.verify
      isRegistered: ->
        klass = new Klass "_id" : klassId
        klass.fetch
          success: ->
            curriculum = new Curriculum "_id" : klass.get("curriculumId")
            curriculum.fetch
              success: ->
                allStudents = new Students
                allStudents.fetch
                  success: (collection) ->
                    students = new Students ( collection.where( "klassId" : klassId ) )

                    allResults = new KlassResults
                    allResults.fetch
                      success: (collection) ->
                        results = new KlassResults ( collection.where( "klassId" : klassId ) )

                        allSubtests = new Subtests
                        allSubtests.fetch
                          success: (collection ) ->
                            subtests = new Subtests ( collection.where( "curriculumId" : klass.get("curriculumId") ) )

                            view = new KlassPartlyView
                              "part"       : part
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
    if group == null && Tangerine.settings.context == "server"
      Tangerine.router.navigate "groups", true
    else
      Tangerine.user.verify
        isRegistered: ->
          curricula = new Curricula
          curricula.fetch
            success: ->
              assessments = new AssessmentListView
                "curricula" : curricula
                "group"     : group
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

  run: (id) ->
    Tangerine.user.verify
      isRegistered: ->
        assessment = new Assessment
          "_id" : id
        assessment.fetch
          success : ( model ) ->
            view = new AssessmentRunView model: model
            vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

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

  partByStudent: (subtestId) ->
    Tangerine.user.verify
      isRegistered: ->
        subtest = new Subtest "_id" : subtestId
        subtest.fetch
          success: ->
            allResults = new Results
            allResults.fetch
              success: (collection) ->
                results = collection.where "subtestId" : subtest.id
                
                students = new Students
                students.fetch
                  success: ->
                    view = new PartByStudentView
                      "students"   : students
                      "subtest"    : subtest
                      "results"    : results
                    vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  klassToDate: (klassId) ->
    Tangerine.user.verify
      isRegistered: ->
        klass = new Klass "_id" : klassId
        klass.fetch
          success: ->
            allStudents = new Students
            allStudents.fetch
              success: (studentCollection) ->
                students = studentCollection.where "klassId" : klassId
                studentCount = students.length
                allSubtests = new Subtests
                allSubtests.fetch
                  success: (subtestCollection) ->
                    subtests = subtestCollection.where "curriculumId" : klass.get("curriculumId")
                    allResults = new Results
                    allResults.fetch
                      success: (results) ->
                        view = new KlassToDateView
                          "studentCount" : studentCount
                          "results"  : results
                          "subtests" : subtests
                          "klass"    : klass
                        vm.show view
      isUnregistered: ->
        Tangerine.router.navigate "login", true

  studentToDate: (studentId) ->
    Tangerine.user.verify
      isRegistered: ->
        student = new Student "_id" : studentId
        student.fetch
          success: ->
            klass = new Klass "_id" : student.get("klassId")
            klass.fetch
              success: ->
                allSubtests = new Subtests
                allSubtests.fetch
                  success: (subtestCollection) ->
                    subtests = subtestCollection.where "curriculumId" : klass.get("curriculumId")
                    allResults = new Results
                    allResults.fetch
                      success: (results) ->
                        view = new StudentToDateView
                          "results"  : results
                          "subtests" : subtests
                          "klass" : klass
                        vm.show view
      isUnregistered: ->
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

  account: ->
    Tangerine.user.verify
      isRegistered: ->
        view = new AccountView user : Tangerine.user
        vm.show view
      isUnregistered: (options) ->
        Tangerine.router.navigate "login", true

  settings: ->
    Tangerine.user.verify
      isRegistered: ->
        settings = new Settings "_id" : "TangerineSettings"
        settings.fetch
          success: (settings) ->
            view = new SettingsView
              "settings" : settings
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

