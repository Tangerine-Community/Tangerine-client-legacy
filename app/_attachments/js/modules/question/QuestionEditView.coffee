class QuestionEditView extends Backbone.View

  className : "question_list_element"
  tagName   : "li"

  events : 
    'click .edit_button'     : 'toggleEdit'
    'click .save'            : 'save'
    'click .add_option'      : 'addOption'
    'click .delete_option'   : 'showDeleteConfirm'
    'click .delete_cancel'   : 'hideDeleteConfirm'
    'click .delete_delete'   : 'deleteOption'
    'click input:radio'      : 'changeQuestionType'
    'click .delete_question' : 'deleteQuestion'
    'keypress'               : 'hijackEnter'

  toggleEdit: (event) ->
    @isPreview = !@isPreview
    @$el.find(".preview").toggleClass "confirmation"
    @$el.find(".edit_form").toggleClass "confirmation"
    return false
    
  initialize: (options) ->
    # this is for sortable
    @$el.attr 'data-id', @model.id
    
    @parent     = options.parent
    @model      = options.model
    @isPreview  = options.isPreview
    console.log @isPreview

  render: ->
    name            = @model.get("name") || ""
    prompt          = @model.get("prompt") || ""
    hint            = @model.get("hint") || ""
    type            = @model.get "type"
    options         = @model.get "options"
    linkedGridScore = @model.get("linkedGridScore") || 0
    
    checkOrRadio = if type == "multiple" then "checkbox" else "radio"

    if @isPreview
      @$el.html "
        <div class='preview'>
          <img src='images/icon_drag.png' class='sortable_handle'><span>#{prompt}</span> <span>#{name}</span> <button class='edit_button command'>Edit</button>
        </div>
      "
    if not @isPreview
      @$el.html "
        <div class='edit_form question'>
          <button class='edit_button'>Hide edit</button>
          <div class='label_value'>
            <label for='#{@cid}_name'>Data name</label>
            <input id='#{@cid}_name' type='text' value='#{name}'>
          </div>
          <div class='label_value'>
            <label for='#{@cid}_prompt'>Prompt</label>
            <input id='#{@cid}_prompt' type='text' value='#{prompt}'>
          </div>
          <div class='label_value'>
            <label for='#{@cid}_hint'>Hint</label>
            <input id='#{@cid}_hint' type='text' value='#{hint}'>
          </div>
          <div class='label_value'>
            <label for='#{@cid}_linked_grid_score'>Linked grid score</label>
            <input id='#{@cid}_linked_grid_score' type='number' value='#{linkedGridScore}'>
          </div>
          <div class='label_value' id='#{@cid}_question_type' class='question_type'>
            <p>Question Type</p>
            <label for='#{@cid}_single'>single</label>
            <input id='#{@cid}_single' name='#{@cid}_type' type='radio' value='single' #{'checked' if type == 'single'}>
            <label for='#{@cid}_multiple'>multiple</label>
            <input id='#{@cid}_multiple' name='#{@cid}_type'  type='radio' value='multiple' #{'checked' if type == 'multiple'}>
            <label for='#{@cid}_open'>open</label>
            <input id='#{@cid}_open' name='#{@cid}_type'  type='radio' value='open' #{'checked' if type == 'open'}>
          </div>

        <div class='label_value'>
        <label for='#{@cid}_question_template_select'>Fill from template</label>
        <select id='#{@cid}_question_template_select'>
          <option disabled selected>Select template</option>
        </select>"

      if type != "open"
        @$el.append @getOptionList()

      @$el.append "<button class='save command'>Save</button><button class='delete_question command'>Delete</button>
        </div>
        "

      @$el.find("##{@cid}_question_type").buttonset()

      @$el.find(".option_list").sortable
        handle : '.sortable_handle'
        update : (event, ui) =>
          @updateModel()

    @trigger "rendered"



  hijackEnter: (event) -> 
    if event.which == 13
      @$el.find(event.target).blur()
      return false

  changeQuestionType: (event) ->
    $target = $(event.target)
    # list to open
    if ($target.val() != "open" && @model.get("type") == "open") || ($target.val() == "open" && @model.get("type") != "open")
      @model.set "type", $target.val()
      @model.set "options", []
      @render false

  #
  # Saving
  #
  save: ->
    @updateModel()
    # show a message and any we've collected along the way
    if @model.save()
      alertText = "Question Saved"
      if @saveMessage
        alertText += @saveMessage
        @saveMessage = ''
      Utils.midAlert alertText 
    @savedMessage = ""
    window.onbeforeunload = null
    return false
  
  deleteQuestion: ->
    @parent.questions.remove @model
    @model.destroy()
    @parentView.render()
    return false
  
  updateModel: =>
    
    # basics
    @model.set 
      "prompt"          : @$el.find("##{@cid}_prompt").val() 
      "name"            : @$el.find("##{@cid}_name").val()
      "hint"            : @$el.find("##{@cid}_hint").val()
      "linkedGridScore" : @$el.find("##{@cid}_linked_grid_score").val()
      "type"            : @$el.find("##{@cid}_question_type input:checked").val()

    if parseInt(@model.get("linkedGridScore")||0) != 0 && (@parent.get("gridLinkId") || "") == ""
        @saveMessage = "<br><br>Grid scores require<br>a subtest link"

    # options
    options = []
    i = 0
    optionListElements = @$el.find(".option_list li")
    console.log "found options " + optionListElement
    for li in optionListElements
      label = $(li).find(".option_label").val()
      value = $(li).find(".option_value").val()
      if label? || value?
        options[i] =
          label : label
          value : value
        i++
    @model.set "options", options
    false
        
  #
  # Deleting an option
  #
  showDeleteConfirm: (event) -> @$el.find(".delete_confirm_#{@$el.find(event.target).attr('data-index')}").fadeIn(250)
  hideDeleteConfirm: (event) -> @$el.find(".delete_confirm_#{@$el.find(event.target).attr('data-index')}").fadeOut(250)
  deleteOption: (event) ->
    @updateModel()
    options = @model.get "options"
    options.splice @$el.find(event.target).attr('data-index'), 1
    @model.set "options", options
    @model.save()
    @render false
    return false

  #
  # Adding an option
  #
  addOption: ->
    @updateModel()
    options = @model.get "options"
    options.push
      label: ""
      value: ""
    @model.set "options", options
    @$el.find('.option_list').html(@getOptionList()).sortable("refresh")

  getOptionList: ->
    options = @model.get "options" 
    html = ""
    for option, i in options
      html += "
      <li>
        <img src='images/icon_drag.png' class='sortable_handle'>
        <div class='option_label_value'>
          <label class='edit' for='#{@cid}_options.#{i}.label'>Label</label>
          <input id='#{@cid}_options.#{i}.label' value='#{option.label}' placeholder='Option label' class='option_label'><br>
          <label class='edit' for='#{@cid}_options.#{i}.value'>Value</label>
          <input id='#{@cid}_options.#{i}.value' value='#{option.value}' placeholder='Option value' class='option_value'>
        </div>
        <img src='images/icon_delete.png' class='delete_option' data-index='#{i}'>
        <div class='confirmation delete_confirm_#{i}'><button class='delete_delete' data-index='#{i}'>Delete</button><button data-index='#{i}' class='delete_cancel'>Cancel</button></div>
      </li>
      "
    html += "<li><button class='add_option'>Add option</button></li>"




