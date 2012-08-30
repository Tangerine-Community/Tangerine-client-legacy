class KlassEditView extends Backbone.View

  events: 
    'click .back'                    : 'back'
    'click .save'                    : 'basicInfoSave'
    'click .basic_info_edit'         : 'basicInfoToggle'
    'click .basic_info_cancel'       : 'basicInfoToggle'
    
    'click .add_student'             : 'addStudentToggle'
    'click .add_student_cancel'      : 'addStudentToggle'
    'click .add_student_add'         : 'addStudent'
    'click .register_student'        : 'registerStudentToggle'
    'click .register_student_cancel' : 'registerStudentToggle'
    'click .register_student_save'   : 'registerStudent'

  addStudentToggle: -> @$el.find(".add_student_form, .add_student").toggle()

  registerStudentToggle: -> 
    @$el.find(".register_student_form, .register_student").toggle()
    # scroll to new form if it's vissible
    if @$el.find(".register_student_form").is(":visible") then @$el.find(".register_student_form").scrollTo()
    @$el.find("#register_student_name ,#register_student_gender, #register_student_age").val("")

  addStudent: ->
    if @$el.find("#add_student_select option:selected").val() == "_none"
      alert ("Please select a student, or cancel.")
    else
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
    

  basicInfoToggle: ->
    @$el.find(".basic_info").toggle()
    
    $basicInfo = $(@$el.find(".basic_info")[1])
    
    if $basicInfo.is(":visible")
      $basicInfo.scrollTo()
      @$el.find("#year").focus()
      
    @$el.find("#year").val(  @klass.get("year")   || "")
    @$el.find("#grade").val( @klass.get("grade")  || "")
    @$el.find("#stream").val(@klass.get("stream") || "")
  
  basicInfoSave: ->
    inputs = @$el.find("#start_date").val().split("/")
    newDate = new Date()
    newDate.setFullYear(parseInt(inputs[0]))
    newDate.setMonth(parseInt(inputs[1]) - 1)
    newDate.setDate(parseInt(inputs[2]))

    @klass.set
      year      : @$el.find("#year").val()
      grade     : @$el.find("#grade").val()
      stream    : @$el.find("#stream").val()
      startDate : newDate.getTime()

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

  onSubviewRendered: =>
    @trigger "subRendered"

  renderStudents: =>
    $ul = $("<ul>").addClass("student_list")

    @closeViews()
    for student in @students.models
      view = new StudentListElementView
        student : student
        students : @students
      @views.push view
      view.on "rendered", @onSubviewRendered
      view.render()
      view.on "change", @renderStudents
      $ul.append view.el

    @$el.find("#student_list_wrapper").html $ul
    
    studentOptionList = "<option value='_none' disabled='disabled' selected='selected'>(#{$.t('name')}) - (#{$.t('age')})</option>"
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
    startDate = new Date(parseInt(@klass.get("startDate")))

    @$el.html "
    <button class='back navigation'>#{t('back')}</button>
    <h1>#{t('class editor')}</h1>
    <h2>#{t('basic info')}</h2>
    <table class='info_box basic_info'>
      <tr><td><label>#{t('year')}</label></td><td>#{year}</td></tr>
      <tr><td><label>#{t('grade')}</label></td><td>#{grade}</td></tr>
      <tr><td><label>#{t('stream')}</label></td><td>#{stream}</td></tr>
      <tr><td><label>#{t('starting date')}</label></td><td>#{startDate.getFullYear()+"/"+(startDate.getMonth()+1)+"/"+startDate.getDate()}</td></tr>
      <tr><td colspan='2'><button class='basic_info_edit command'>#{t('edit')}</button></td></tr>
    </table>
    <div class='basic_info confirmation'>
      <div class='menu_box'>
        <div class='label_value'>
          <label for='year'>#{t('year')}</label>
          <input id='year' value='#{year}'>
        </div>
        <div class='label_value'>
          <label for='grade'>#{t('grade')}</label>
          <input id='grade' value='#{grade}'>
        </div>
        <div class='label_value'>
          <label for='stream'>#{t('stream')}</label>
          <input id='stream' value='#{stream}'>
        </div>
        <div class='label_value'>
          <label for='start_date'>#{t('starting date')}</label>
          <input id='start_date' value='#{startDate.getFullYear()+"/"+(startDate.getMonth()+1)+"/"+startDate.getDate()}'>
        </div>
      
        <button class='save command'>#{t('save')}</button> <button class='basic_info_cancel command'>#{t('cancel')}</button>
      </div>
    </div>
    
    <h2>#{t('students').capitalize()}</h2>
    <div id='student_list_wrapper'></div>
    <button class='add_student command'>#{t('add student')}</button>
    <div class='add_student_form menu_box confirmation'>
      <div class='label_value'>
        <label for='add_student_select'>#{t('add student')}</label><br>
        <select id='add_student_select'>
        </select>
      </div>      
      <button class='add_student_add command'>#{t('add')}</button><button class='add_student_cancel command'>#{t('cancel')}</button>
    </div>


    <button class='register_student command'>#{$.t("register student")}</button>
    <div class='register_student_form menu_box confirmation'>
      <h2>#{t('register student')}</h2>
      <div class='label_value'>
        <label for='register_student_name'>#{t('name')}</label>
        <input id='register_student_name' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_gender'>#{t('gender')}</label>
        <input id='register_student_gender' value=''>
      </div>
      <div class='label_value'>
        <label for='register_student_age'>#{t('age')}</label>
        <input id='register_student_age' value=''>
      </div>
      <button class='register_student_save command'>#{t('save')}</button>
      <button class='register_student_cancel command'>#{t('cancel')}</button>
    </div>
    "

    @trigger "rendered"

    @renderStudents()




