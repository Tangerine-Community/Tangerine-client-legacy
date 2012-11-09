class SubtestEditView extends Backbone.View

  className: "subtest_edit"
    
  events:
    'click .back_button'         : 'goBack'
    'click .save_subtest'        : 'save'

    'click .edit_enumerator'     : 'editEnumerator'
    'click .enumerator_done'     : 'doneEnumerator'
    'click .enumerator_cancel'   : 'cancelEnumerator'

    'click .edit_student'        : 'editStudent'
    'click .student_done'        : 'doneStudent'
    'click .student_cancel'      : 'cancelStudent'

    'click .edit_transition_comment'        : 'editTransitionComment'
    'click .transition_comment_done'        : 'doneTransitionComment'
    'click .transition_comment_cancel'      : 'cancelTransitionComment'

  editEnumerator: ->
    @$el.find(".enumerator_help_preview, .edit_enumerator, .enumerator_save_buttons").fadeToggle(250)
    @$el.find("textarea#enumerator_help").html(@model.escape("enumeratorHelp") || "").cleditor()

  doneEnumerator: ->
    if @model.save( "enumeratorHelp" : @$el.find("textarea#enumerator_help").val(), wait : true )
      @cancelEnumerator()
    else
      console.log ("save error")

  cancelEnumerator: ->
    $preview = $("div.enumerator_help_preview")
    $preview.html @model.get("enumeratorHelp") || ""
    $preview.fadeIn(250)
    @$el.find("button.edit_enumerator, .enumerator_save_buttons").fadeToggle(250)
    cleditor = @$el.find("#enumerator_help").cleditor()[0]
    cleditor.$area.insertBefore(cleditor.$main)
    cleditor.$area.removeData("cleditor")
    cleditor.$main.remove()

  editStudent: ->
    @$el.find(".student_dialog_preview, .edit_student, .student_save_buttons").fadeToggle(250)
    @$el.find("textarea#student_dialog").html(@model.escape("studentDialog") || "").cleditor()

  doneStudent: ->
    if @model.save( "studentDialog" : @$el.find("textarea#student_dialog").val(), wait : true )
      @cancelStudent()
    else
      console.log ("save error")

  cancelStudent: ->
    $preview = $("div.student_dialog_preview")
    $preview.html @model.get("studentDialog") || ""
    $preview.fadeIn(250)
    @$el.find("button.edit_student, .student_save_buttons").fadeToggle(250)
    cleditor = @$el.find("#student_dialog").cleditor()[0]
    cleditor.$area.insertBefore(cleditor.$main)
    cleditor.$area.removeData("cleditor")
    cleditor.$main.remove()

  editTransitionComment: ->
    @$el.find(".transition_comment_preview, .edit_transition_comment, .transition_comment_save_buttons").fadeToggle(250)
    @$el.find("textarea#transition_comment").html(@model.escape("transitionComment") || "").cleditor()

  doneTransitionComment: ->
    if @model.save( "transitionComment" : @$el.find("textarea#transition_comment").val(), wait : true )
      @cancelTransitionComment()
    else
      console.log ("save error")

  cancelTransitionComment: ->
    $preview = $("div.transition_comment_preview")
    $preview.html @model.get("transitionComment") || ""
    $preview.fadeIn(250)
    @$el.find("button.edit_transition_comment, .transition_comment_save_buttons").fadeToggle(250)
    cleditor = @$el.find("#transition_comment").cleditor()[0]
    cleditor.$area.insertBefore(cleditor.$main)
    cleditor.$area.removeData("cleditor")
    cleditor.$main.remove()



  onClose: ->
    @prototypeEditor.close?()

  initialize: ( options ) ->
    @model = options.model
    @assessment = options.assessment
    @config = Tangerine.config.subtest
    
    @prototypeViews  = Tangerine.config.prototypeViews
    @prototypeEditor = new window[@prototypeViews[@model.get 'prototype']['edit']]
      model: @model
      parent: @
    @prototypeEditor.on "edit-save", => @save options:editSave:true
      
  goBack: =>
    Tangerine.router.navigate "edit/"+@model.get("assessmentId"), true

  save: (event) ->
    prototype = @model.get("prototype")
    @model.set
      name           : @$el.find("#subtest_name").val()
      enumeratorHelp : @$el.find("#enumerator_help").val()
      studentDialog  : @$el.find("#student_dialog").val()
      transitionComment : @$el.find("#transition_comment").val()
      skippable      : @$el.find("#skip_radio input:radio[name=skippable]:checked").val() == "true"

    @prototypeEditor.save?()

    if @prototypeEditor.isValid? && @prototypeEditor.isValid() == false && event?.options?.editSave != true
      Utils.midAlert "There are errors on this page"
      @prototypeEditor.showErrors?()
    else
      if @model.save()
        Utils.midAlert "Subtest Saved"
        setTimeout @goBack, 1000 unless event?.options?.editSave == true
      else
        console.log "save error"
        Utils.midAlert "Save error"

  render: ->
    assessmentName = @assessment.escape "name"
    name      = @model.escape "name"
    prototype = @model.get "prototype"
    help      = @model.get("enumeratorHelp") || ""
    dialog    = @model.get("studentDialog")  || ""
    transitionComment = @model.get("transitionComment")  || ""
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Assessment</th>
          <td>#{assessmentName}</td>
        </tr>
      </table>
      <button class='save_subtest command'>Done</button>
      <div id='subtest_edit_form' class='edit_form'>
        <div class='label_value'>
          <label for='subtest_name'>Name</label>
          <input id='subtest_name' value='#{name}'>
        </div>
        <div class='label_value'>
          <label for='subtest_prototype' title='This is a basic type of subtest. (e.g. Survey, Grid, Location, Id, Consent). This property is set in assessment builder when you add a subtest. It is unchangeable.'>Prototype</label><br>
          <div class='info_box'>#{prototype}</div>
        </div>
        <div class='label_value'>
          <label>Skippable</label><br>
          <div class='menu_box'>
            <div id='skip_radio' class='buttonset'>
              <label for='skip_true'>Yes</label><input name='skippable' type='radio' value='true' id='skip_true' #{'checked' if skippable}>
              <label for='skip_false'>No</label><input name='skippable' type='radio' value='false' id='skip_false' #{'checked' if not skippable}>
            </div>
          </div>
        </div>
        <div class='label_value'>
          <label for='enumerator_help' title='If text is supplied, a help button will appear at the top of the subtest as a reference for the enumerator. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Enumerator help <button class='edit_enumerator command'>Edit</button></label>
          <div class='info_box_wide enumerator_help_preview'>#{help}</div>
          <textarea id='enumerator_help' class='confirmation'>#{help}</textarea>
          <div class='enumerator_save_buttons confirmation'>
            <button class='enumerator_done command'>Save</button> <button class='enumerator_cancel command'>Cancel</button>
          </div>
        </div>
        <div class='label_value'>
          <label for='student_dialog' title='Generally this is a script that will be read to the student. If you are pasting from word it is recommended to paste into a plain text editor first, and then into this box.'>Student Dialog <button class='edit_student command'>Edit</button></label>
          <div class='info_box_wide student_dialog_preview'>#{dialog}</div>
          <textarea id='student_dialog' class='confirmation'>#{dialog}</textarea>
          <div class='student_save_buttons confirmation'>
            <button class='student_done command'>Save</button> <button class='student_cancel command'>Cancel</button>
          </div>
        </div>
        <div class='label_value'>
          <label for='transition_comment' title='This will be displayed with a grey background above the next button, similar to the student dialog text. If you are pasting from Word it is recommended to paste into a plain text editor first, and then into this box.'>Transition Comment <button class='edit_transition_comment command'>Edit</button></label>
          <div class='info_box_wide transition_comment_preview'>#{transitionComment}</div>
          <textarea id='transition_comment' class='confirmation'>#{transitionComment}</textarea>
          <div class='transition_comment_save_buttons confirmation'>
            <button class='transition_comment_done command'>Save</button> <button class='transition_comment_cancel command'>Cancel</button>
          </div>
        </div>

      </div>
      <div id='prototype_attributes'></div>

      <button class='save_subtest command'>Done</button>
      "

    @prototypeEditor.setElement @$el.find('#prototype_attributes')
    @prototypeEditor.render?()
    
    @trigger "rendered"


