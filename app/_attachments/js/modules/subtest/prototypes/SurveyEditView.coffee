class SurveyEditView extends Backbone.View

  events:
    'click .add_question'        : 'toggleAddQuestion'
    'click .add_question_cancel' : 'toggleAddQuestion'
    'click .add_question_add'    : 'addQuestion'

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent
    @model.questions = new Questions
    @model.questions.fetch
      success: (collection, response) =>
        @model.questions = new Questions(collection.where {subtestId : @model.id })
        @model.questions.maintainOrder()
        @questionsEditView = new QuestionsEditView
          questions : @model.questions
        @model.questions.on "change", @renderQuestions
        @renderQuestions()

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
      name         : @$el.find('#question_name').val().replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g,"")

    nq = @model.questions.create newAttributes
    @renderQuestions()
    @$el.find("#add_question_form input").val ''
    return false

  save: ->
    @model.set
      gridLinkId : @$el.find("#link_select option:selected").val()

    # blank out our error queues
    notSaved = []
    emptyOptions = []
    requiresGrid = []

    # check for "errors"
    for question, i in @model.questions.models
      if question.get("type") != "open" && question.get("options").length == 0
        emptyOptions.push i + 1
      if not question.save()
        notSaved.push i
      if question.has("linkedGridScore") && question.get("linkedGridScore") != ""  && question.get("linkedGridScore") != 0 && @model.has("gridLinkId") == "" && @model.get("gridLinkId") == ""
        requiresGrid.push i
        
    # display errors
    if notSaved.length != 0
      Utils.midAlert "Error<br><br>Questions: <br>#{notSaved.join(', ')}<br>not saved"
    if emptyOptions.length != 0
      alert "Warning\n\n#{if emptyOptions.length > 1 then "Questions" else "Question" } #{emptyOptions.join(' ,')} has no options."
    if requiresGrid.length != 0
      alert "Warning\n\n#{if requiresGrid.length > 1 then "Questions" else "Question" } #{requiresGrid.join(' ,')} requires a grid to be linked to this test."


  onClose: ->
    @questionsListEdit?.close()

  renderQuestions: =>
    @$el.find("#question_list_wrapper").empty()
    @questionsEditView?.render()
    @$el.find("#question_list_wrapper").append @questionsEditView?.el

  render: ->
      
#    addQuestionSelect = "<select id='add_question_select'>"
#    for template in Tangerine.config.optionTemplates
#      addQuestionSelect += "<option value='#{template.name}'>#{template.name}</option>"
#    addQuestionSelect += "</select>"

    gridLinkId = @model.get("gridLinkId") || ""

    @$el.html "
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
            <input id='question_name'><br>
            <small>Allowed characters: A-Z, a-z, 0-9, and underscores.</small><br>
            <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button>
          </div>
        </div> 
      </div>"

    @renderQuestions()

    # get linked grid options
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

