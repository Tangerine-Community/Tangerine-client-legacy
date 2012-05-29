class Student extends Backbone.Model

  url : "student"

  defaults :
    gender  : "Not entered"
    age     : "Not entered"
    name    : "Not entered"
    klassId : null

  initialize: ->

class Students extends Backbone.Collection

  model: Student
  url: "student"

class StudentEditView extends Backbone.View

  events:
    'click .done' : 'done'
    'click .back' : 'back'

  initialize: ( options ) ->
    @student = options.student
    @klasses = options.klasses

  done: ->
    klassId = @$el.find("#klass_select option:selected").attr("data-id")
    klassId = null if klassId == "null"
    @student.set
      name    : @$el.find("#name").val()
      gender  : @$el.find("#gender").val()
      age     : @$el.find("#age").val()
      klassId : klassId
    @student.save()
    @back()

  back: ->
    window.history.back()

  render: ->
    name   = @student.get("name")   || ""
    gender = @student.get("gender") || ""
    age    = @student.get("age")    || ""

    klassId = @student.get("klassId")
    html = "
    <h1>Edit Student</h1>
    <button class='back navigation'>Back</button><br>
    <div class='info_box'>
      <div class='label_value'>
        <label for='name'>Name</label>
        <input id='name' value='#{name}'>
      </div>
      <div class='label_value'>
        <label for='gender'>Gender</label>
        <input id='gender' value='#{gender}'>
      </div>
      <div class='label_value'>
        <label for='age'>Age</label>
        <input id='age' value='#{age}'>
      </div>
      <div class='label_value'>
        <label for='klass_select'>Class</label>
        <select id='klass_select'>"
    html += "<option data-id='null' #{if klassId == null then "selected='selected'"}>None</option>"
    for klass in @klasses.models
      html += "<option data-id='#{klass.id}' #{if klass.id == klassId then "selected='selected'"}>#{klass.get 'year'} - #{klass.get 'grade'} - #{klass.get 'stream'}</option>"

    html += "
        </select>
      </div>
      <button class='done command'>Done</button>
    </div>
    "
    
    @$el.html html
    @trigger "rendered"


#class StudentResult extends Backbone.Model
#  url : "student_result"

class KlassAssessments extends Backbone.Collection

  model : Assessment
  url   : 'assessment'

  comparator: ( model ) ->
    model.get "week"

class KlassMenuView extends Backbone.View

  events:
    'click .registration' : 'gotoKlasses'

  gotoKlasses: ->
    Tangerine.router.navigate "classes", true

  initialize: ( options ) ->

  render: ->
    @$el.html "
    
    <button class='collect command'>Collect</button>
    <button class='manage command'>Manage</button>
    <button class='reports command'>Reports</button>
    <button class='advice command'>Advice</button>
    <button class='registration command'>Class Registration</button>
    
    "
    @trigger "rendered"


class Klass extends Backbone.Model
  url : "klass"

  defaults :
    startTime : -1
  
  initialize: ->
    # get students
    # get assessment collection


class KlassView extends Backbone.View

  initialize: ( options ) ->
    @klass = options.klass
    @assessments = @klass.assessments
    @results     = []
    allAssessments = new KlassAssessments
    allAssessments.fetch
      success: (assessmentCollection) =>
        @assessments = assessmentCollection.where { klassId : @klass.id }
        results = new Results
        results.fetch
          success: (resultCollection) =>
            for assessment in @assessments
              assessment.results = resultCollection.where { assessmentId : assessment.id }
            @render()

  render: ->
    year   = @klass.get("year")   || ""
    grade  = @klass.get("grade")  || ""
    stream = @klass.get("stream") || ""
    html = "
    <h1>Class: #{stream}</h1>
    <div>
      Year: #{year}<br>
      Grade: #{grade}
    </div>
    <ul class='assessment_list'>"
    for assessment in @assessments
      html += "<li data-id='#{assessment.id}'>#{assessment.get 'name'} - #{assessment.get('results')?.length}</li>"
    html += "</ul>"

    @$el.html html
    @trigger "rendered"

class KlassEditView extends Backbone.View

  events: 
    'click .back'                    : 'back'
    'click .save'                    : 'basicInfoSave'
    'click .basic_info_edit'         : 'basicInfoEdit'
    'click .add_student'             : 'addStudentToggle'
    'click .add_student_cancel'      : 'addStudentToggle'
    'click .add_student_add'         : 'addStudent'
    'click .register_student'        : 'registerStudentToggle'
    'click .register_student_cancel' : 'registerStudentToggle'
    'click .register_student_save'   : 'registerStudent'
  
  
  addStudentToggle:      -> @$el.find(".add_student_form, .add_student").toggle()
  registerStudentToggle: -> @$el.find(".register_student_form, .register_student").toggle()

  addStudent: ->
    studentId = @$el.find("#add_student_select option:selected").attr("data-id")
    newStudent = @allStudents.get studentId
    newStudent.set
      klassId : @klass.id
    newStudent.save()
    @students.add newStudent
    @addStudentToggle()
    
  
  registerStudent: =>
    @students.create
      name    : @$el.find("#register_student_name").val()
      gender  : @$el.find("#register_student_gender").val()
      age     : @$el.find("#register_student_age").val()
      klassId : @klass.id
    , wait : true
    @registerStudentToggle()
    @$el.find("#register_student_form input").val()
    

  basicInfoEdit: ->
    @$el.find(".basic_info").toggle()
  
  basicInfoSave: ->
    inputs = @$el.find("#startDate").val().split("/")
    newDate = new Date()
    newDate.setFullYear(inputs[0])
    newDate.setMonth(inputs[1])
    newDate.setDate(inputs[2])

    @klass.set
      year      : @$el.find("#year").val()
      grade     : @$el.find("#grade").val()
      stream    : @$el.find("#stream").val()
      startTime : newDate.getTime()

    @klass.save()
    @render()

  back: ->
    window.history.back()
    
  initialize: ( options ) ->
    @klass       = options.klass
    @students    = options.students
    @allStudents = options.allStudents

    @students.on "add remove change", @renderStudents

    @views = []


  closeViews: ->
    for view in @views
      view.close()
    @views = []

  renderStudents: =>
    $ul = $("<ul>").addClass("student_list")

    @closeViews()
    for student in @students.models
      view = new StudentListElementView
        student : student
        students : @students
      @views.push view
      view.render()
      view.on "change", @renderStudents
      $ul.append view.el

    @$el.find("#student_list_wrapper").html $ul
    
    studentOptionList = "<option disabled='disabled' selected='selected'>(Name) - (Age)</option>"
    for student in @allStudents.models
      isInClass = false
      for double in @students.models
        if double.id == student.id then isInClass = true
      if not isInClass
        studentOptionList += "<option data-id='#{student.id}'>#{student.get 'name'} - #{student.get 'age'}</option>"

    @$el.find("#add_student_select").html studentOptionList

  render: ->

    year      = @klass.get("year")   || ""
    grade     = @klass.get("grade")  || ""
    stream    = @klass.get("stream") || ""
    startDate = new Date(@klass.get("startDate"))

    @$el.html "
    <button class='back navigation'>Back</button>
    <h1>Class Editor</h1>
    <h2>Basic info</h2>
    <div class='info_box basic_info'>
      <div class='label_value'>
        <label for='year'>Year</label> #{year}
      </div>
      <div class='label_value'>
        <label for='grade'>Grade</label> #{grade}
      </div>
      <div class='label_value'>
        <label for='stream'>Stream</label> #{stream}
      </div>
      <div class='label_value'>
        <label for='start_time'>Start date</label> #{startTime.getFullYear()+"/"+(startTime.getMonth()+1)+"/"+startTime.getDate()}
      </div>
      <button class='basic_info_edit command'>Edit</button>
    </div>
    <div class='menu_box basic_info confirmation'>
      <div class='label_value'>
        <label for='year'>Year</label>
        <input id='year' value='#{year}'>
      </div>
      <div class='label_value'>
        <label for='grade'>Grade</label>
        <input id='grade' value='#{grade}'>
      </div>
      <div class='label_value'>
        <label for='stream'>Stream</label>
        <input id='stream' value='#{stream}'>
      </div>
      <div class='label_value'>
        <label for='start_date'>Start</label>
        <input id='startDate' value='#{startTime.getFullYear()+"/"+(startTime.getMonth()+1)+"/"+startTime.getDate()}'>
      </div>
      
      <div class='menu_box'>
        <button class='save command'>Save</button>
      </div>
    </div>
    
    <h2>Students</h2>
    <div id='student_list_wrapper'></div>
    <button class='add_student command'>Add student</button>
    <div class='add_student_form menu_box confirmation'>
      <div class='label_value'>
        <label for='add_student_select'>Select a student</label>
        <select id='add_student_select'>
        </select>
      </div>      
      <button class='add_student_add command'>Add</button><button class='add_student_cancel command'>Cancel</button>
    </div>


    <button class='register_student command'>Register students</button>
    <div class='register_student_form menu_box confirmation'>
      <h2>Register New Student</h2>
      <div class='label_value'>
        <label for='register_student_name'>Name</label>
        <input id='register_student_name' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_gender'>Gender</label>
        <input id='register_student_gender' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_age'>Age</label>
        <input id='register_student_age' value=''>
      </div>
      <button class='register_student_save command'>Save</button>
      <button class='register_student_cancel command'>Cancel</button>
    </div>
    "

    @renderStudents()

    @trigger "rendered"

class StudentListElementView extends Backbone.View

  tagName : "li"
  className: "student_list_element"

  events :
    'click .results'       : 'results'
    'click .edit'          : 'edit'
    'click .remove'        : 'toggleRemove'
    'click .remove_cancel' : 'toggleRemove'
    'click .remove_delete' : 'removeStudent'
  
  initialize: (options) ->
    @student = options.student
    @students = options.students
  
  results: -> Tangerine.router.navigate "student/results/" + @student.id, true
  edit:    -> Tangerine.router.navigate "student/edit/" + @student.id, true
  toggleRemove: -> @$el.find(".remove_confirm, .remove").toggle()
  removeStudent: -> 
    @student.set(klassId : null).save()
    @students.remove(@student)

  render: ->
    @$el.html "
      #{@student.get 'name'}
      #{@student.get 'gender'}
      #{@student.get 'age'}
      <button class='results command'>Results</button>
      <button class='edit command'>Edit</button>
      <button class='remove command'>Remove</button>
      <div class='remove_confirm confirmation'>Remove student? <button class='remove_delete command'>Remove</button><button class='remove_cancel command'>cancel</button></div>
    "


class KlassesView extends Backbone.View

  initialize: ( options ) ->
    @views = []
    @klasses = options.klasses
    @klasses.on "add remove change", @render

  events :
    'click .add'        : 'toggleAddForm'
    'click .cancel'     : 'toggleAddForm'
    'click .save'       : 'saveNewKlass'
    'click .goto_class' : 'gotoKlass'

  saveNewKlass: ->
    @klasses.create
      year   : @$el.find("#year").val()
      grade  : @$el.find("#grade").val()
      stream : @$el.find("#stream").val()
      startTime : (new Date()).getTime()

  gotoKlass: (event) ->
    Tangerine.router.navigate "class/edit/"+$(event.target).attr("data-id")

  toggleAddForm: ->
    @$el.find("#add_form, .add").toggle()
    @$el.find("#year").focus()

  renderKlasses: ->
    @closeViews()

    $ul = $("<ul>").addClass("klass_list")

    for klass in @klasses.models
      view = new KlassListElementView
        klass : klass
      view.render()
      @views.push view
      $ul.append view.el

    @$el.append $ul

  render: =>
    html = "
      <h1>Classes</h1>
      <div id='klass_list_wrapper'>
      </div>
      <div id='add_form' class='confirmation menu_box'>
        <div class='label_value'>
          <label for='year'>Year</label>
          <input id='year'>
        </div>
        <div class='label_value'>
          <label for='grade'>Grade</label>
          <input id='grade'>
        </div>
        <div class='label_value'>
          <label for='stream'>Stream</label>
          <input id='stream'>
        </div>
        <button class='command save'>Save</button><button class='command cancel'>Cancel</button>
      </div>
      <div id='klass_list_wrapper'></div>
      <button class='add command'>Add</button>
    "
    
    @$el.html html
    
    @renderKlasses()
    
    @trigger "rendered"

  closeViews: ->
    for view in @views?
      view.close()

  onClose: ->
    @closeViews()

class KlassListElementView extends Backbone.View

  tagName: "li"

  events:
    'click .edit'          : 'edit'
    'click .results'       : 'results'
    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'
  
  initialize: (options) ->
    console.log @
  
  edit: ->
    Tangerine.router.navigate "class/edit/" + @options.klass.id, true

  results: ->
    Tangerine.router.navigate "class/results/" + @options.klass.id, true
      
  toggleDelete: -> @$el.find(".delete_confirm").toggle()
  
  delete: ->
    @options.klass.collection.get(@options.klass).destroy()
  
  render: ->
    klass = @options.klass
    @$el.html "
      #{klass.get 'year'} - #{klass.get 'grade'} - #{klass.get 'stream'}<br>
      <button class='results command'>Show</button>
      <button class='results command'>Results</button>
      <button class='edit command'>Edit</button>
      <button class='delete command'>Delete</button>
      <div class='delete_confirm confirmation'>Are you sure? <button class='delete_delete'>Delete</button><button class='delete_cancel'>Cancel</button></div>
    "

class Klasses extends Backbone.Collection
  model : Klass
  url   : 'klass'

class RegisterTeacherView extends Backbone.View

  events :
    'click .register' : 'register'

  initialize: ( options ) ->
    @model = options.model

  register: ->
    @model.set
      name     : @$el.find("#name").val()
      school   : @$el.find("#school").val()
      village  : @$el.find("#village").val()
      district : @$el.find("#district").val()
      region   : @$el.find("#region").val()
    @model.save()
    

  render: ->
    @$el.html "
    <h1>Register</h1>
    <div class='label_value'>
      <label for='name'>Name</label>
      <input id='name'>
    </div>
    <div class='label_value'>
      <label for='school'>School</label>
      <input id='school'>
    </div>
    <div class='label_value'>
      <label for='school'>Village</label>
      <input id='school'>
    </div>
    <div class='label_value'>
      <label for='district'>District</label>
      <input id='district'>
    </div>
    <div class='label_value'>
      <label for='region'>Region</label>
      <input id='region'>
    </div>
    <button class='register'>Register</button>
    "
    @trigger "rendered"

