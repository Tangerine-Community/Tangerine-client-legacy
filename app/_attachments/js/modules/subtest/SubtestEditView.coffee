class SubtestEditView extends Backbone.View

  className: "subtest_edit"
    
  events:
    'click .back_button'         : 'goBack'
    'click .save_subtest'        : 'save'
    'keydown'                    : 'hijackEnter'
    'click .add_question'        : 'toggleAddQuestion'
    'click .add_question_cancel' : 'toggleAddQuestion'
    'click .add_question_add'    : 'addQuestion'

  hijackEnter: (event) ->
    if event.which == 13
      @save()

  toggleAddQuestion: =>
    @$el.find("#add_question_form").fadeToggle 250, =>
      if @$el.find("#add_question_form").is(":visible")
        @$el.find("#question_prompt").focus()

      
    return false
  addQuestion: -> 
    newAttributes = $.extend Tangerine.config.questionTemplate,
      subtestId    : @model.id
      assessmentId : @model.get "assessmentId"
      id           : Utils.guid()
      order        : @model.questions.length
      prompt       : @$el.find('#question_prompt').val()
      name         : @$el.find('#question_name').val()

    nq = @model.questions.create newAttributes
    @renderQuestions()
    @$el.find("#add_question_form input").val('')
    return false
#      "options" : _.find( Tangerine.config.optionsTemplates, (template) ->
#        return template.options if template.name == @$el.find("#add_question_select option:selected").val() )
        
        
  closeSubViews: ->
    for subView in @subViews
      subView.close()
  
  onClose: ->
    @closeSubViews()
    @questionsListEdit?.close()
    
  initialize: ( options ) ->
    @subViews = []
    @questionsEditView = null
    @model = options.model
    @config = Tangerine.config.subtest

    if @model.get("prototype") == 'survey'
      @model.questions = new Questions
      @model.questions.fetch
        success: (collection, response) =>
          @model.questions = new Questions(collection.where {subtestId : @model.id })
          @questionsEditView = new QuestionsEditView
            questions : @model.questions
          @model.questions.on "change", @renderQuestions
          @renderQuestions()

  renderQuestions: =>
    @questionsEditView?.render()
    @$el.find("#question_list_wrapper").html @questionsEditView?.el

  goBack: =>
    Tangerine.router.navigate "edit-id/"+@model.get("assessmentId"), true

  save: ->
    prototype = @model.get("prototype")
    @model.set
      name : @$el.find("#subtest_name").val()
      enumeratorHelp : @$el.find("#subtest_help").val()
      studentDialog  : @$el.find("#subtest_dialog").val()
      skippable      : @$el.find("#skip_radio input:radio[name=skippable]:checked").val()

    if prototype == 'grid'
      # validation can be done on models, perhaps there is a better palce to do it
      if /\t|,/.test(@$el.find("#subtest_items").val()) then Utils.topAlert "Please remember<br><br>Grid items are<br>space \" \" delimited"
      @model.set
        timer    : @$el.find("#subtest_timer").val()
        items    : _.compact( @$el.find("#subtest_items").val().split(" ") ) # mild sanitization, happens at read too
        columns  : @$el.find("#subtest_columns").val()
        autostop : @$el.find("#subtest_autostop").val()

    if prototype == 'location'
      @model.set
        "provinceText" : @$el.find("#subtest_province_text").val()
        "districtText" : @$el.find("#subtest_district_text").val()
        "nameText"     : @$el.find("#subtest_name_text").val()
        "schoolIdText" : @$el.find("#subtest_school_id_text").val()

    if prototype == 'survey'
      @model.set
        gridLinkId : @$el.find("#link_select option:selected").val()
      notSaved = []
      for question, i in @model.questions.models
        if not question.save()
          notSaved.push i
      if notSaved.length > 0
        Utils.midAlert "Error<br><br>Questions: <br>#{notSaved.join(', ')}<br>not saved"

    if prototype == 'consent'
      @model.set
        "prompt" : @$el.find("#consent_prompt").val()
    if @model.save()
      Utils.midAlert "Subtest Saved"
      setTimeout @goBack, 500
    else
      Utils.midAlert "Save error"
      
    return false

  # Wow I'm bad at using templates
  render: ->
    name      = @model.get "name"
    prototype = @model.get "prototype"
    help      = @model.get("enumeratorHelp") || ""
    dialog    = @model.get("studentDialog") || ""
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <button class='save_subtest command'>Done</button>
      <form id='subtest_edit_form'>
        <div class='label_value'>
          <label for='subtest_name'>Name</label>
          <input id='subtest_name' value='#{name}'>
        </div>
        <div class='label_value'>
          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent)'>Prototype</label>#{prototype}
        </div>
        <div class='label_value'>
          <label>Skippable</label>
          <div id='skip_radio'>
            <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' #{'checked' if skippable}>
            <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' #{'checked' if not skippable}>
          </div>
        </div>
        <div class='label_value'>
          <label for='subtest_help'>Enumerator help</label>
          <textarea id='subtest_help' class='richtext'>#{help}</textarea>
        </div>
        <div class='label_value'>
          <label for='subtest_dialog'>Student Dialog</label>
          <textarea id='subtest_dialog' class='richtext'>#{dialog}</textarea>
        </div>
        <div id='prototype_attributes'></div>
      </form>
      <button class='save_subtest command'>Done</button>"

    if prototype == "grid"

      timer    = @model.get("timer") || 0
      items    = @model.get("items").join " "
      columns  = @model.get("columns") || 0
      autostop = @model.get("autostop") || 0

      @$el.find("#prototype_attributes").html "
        <div class='label_value'>
          <label for='subtest_items'>Grid Items (space delimited)</label>
          <textarea id='subtest_items'>#{items}</textarea>
        </div>
        <div class='label_value'>
          <label for='subtest_columns'>Columns</label>
          <input id='subtest_columns' value='#{columns}' type='number'>
        </div>
        <div class='label_value'>
          <label for='subtest_autostop'>Autostop</label>
          <input id='subtest_autostop' value='#{autostop}' type='number'>
        </div>
        <div class='label_value'>
          <label for='subtest_timer'>Timer</label>
          <input id='subtest_timer' value='#{timer}' type='number'>
        </div>"

    if prototype == "consent"
      prompt = @model.get("prompt") || ""
      @$el.find("#prototype_attributes").html "
        <div class='label_value'>
          <label for='consent_prompt'>Consent prompt</label>
          <input id='consent_prompt' value='#{prompt}'>
        </div>
      "
      
    if prototype == "survey"
      gridLinkId = @model.get("gridLinkId") || ""
      
#      addQuestionSelect = "<select id='add_question_select'>"
#      for template in Tangerine.config.optionTemplates
#        addQuestionSelect += "<option value='#{template.name}'>#{template.name}</option>"
#      addQuestionSelect += "</select>"
      
      @$el.find("#prototype_attributes").html "
        <div id='grid_link'></div>
        <div id='questions'>
          <h2>Questions</h2>
          <div id='question_list_wrapper'><img class='loading' src='images/loading.gif'></div>
          <button class='add_question command'>Add Question</button>
          <div id='add_question_form' class='confirmation'>
            <div class='menu_box'>
              <h2>New Question</h2>
              <label for='question_prompt'>Prompt</label>
              <input id='question_prompt'>
              <label for='question_name'>Variable name</label>
              <input id='question_name'>
              <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button>
            </div>
          </div> 
        </div>"
      

      @renderQuestions()

      subtests = new Subtests
      subtests.fetch
        success: (collection) =>
          collection = collection.where
            assessmentId : @model.get "assessmentId"
            prototype    : 'grid' # only grids can provide scores

          linkSelect = "
            <div class='label_value'>
              <label for='link_select'>Linked to grid</label>
              <select id='link_select'>
              <option value=''>None</option>"
          for subtest in collection
            linkSelect += "<option value='#{subtest.id}' #{if (gridLinkId == subtest.id) then 'selected' else ''}>#{subtest.get 'name'}</option>"
          linkSelect += "</select></div>"
          @$el.find('#grid_link').html linkSelect


    if prototype == "location"

      provinceText = @model.get("provinceText") || ""
      districtText = @model.get("districtText") || ""
      nameText     = @model.get("nameText") || ""
      schoolIdText = @model.get("schoolIdText") || ""

      @$el.find("#prototype_attributes").html "
        <div class='label_value'>
          <label for='subtest_province_text'>&quot;Province&quot; label</label>
          <input id='subtest_province_text' value='#{provinceText}'>
        </div>
        <div class='label_value'>
          <label for='subtest_district_text'>&quot;District&quot; label</label>
          <input id='subtest_district_text' value='#{districtText}'>
        </div>
        <div class='label_value'>
          <label for='subtest_name_text'>&quot;School Name&quot; label</label>
          <input id='subtest_name_text' value='#{nameText}'>
        </div>
        <div class='label_value'>
          <label for='subtest_school_id_text'>&quot;School ID&quot; label</label>
          <input id='subtest_school_id_text' value='#{schoolIdText}'>
        </div>
      " 

    @$el.find("#skip_radio").buttonset()
    
    @trigger "rendered"

