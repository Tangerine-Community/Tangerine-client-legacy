class SubtestEditView extends Backbone.View

  className: "subtest_edit"
    
  events:
    'click .back_button'         : 'goBack'
    'click .save_subtest'        : 'save'
    'keydown input'              : 'hijackEnter'

  hijackEnter: (event) ->
    if event.which == 13
      @save()

  onClose: ->
    @prototypeEditor.close?()

  initialize: ( options ) ->
    
    @model = options.model
    @config = Tangerine.config.subtest
    
    @prototypeViews  = Tangerine.config.prototypeViews
    @prototypeEditor = new window[@prototypeViews[@model.get 'prototype']['edit']]
      model: @model
      parent: @

  goBack: =>
    Tangerine.router.navigate "edit-id/"+@model.get("assessmentId"), true

  save: ->
    prototype = @model.get("prototype")
    @model.set
      name           : @$el.find("#subtest_name").val()
      enumeratorHelp : @$el.find("#subtest_help").val()
      studentDialog  : @$el.find("#subtest_dialog").val()
      skippable      : @$el.find("#skip_radio input:radio[name=skippable]:checked").val() == "true"

    @prototypeEditor.save?()

    if @model.save()
      Utils.midAlert "Subtest Saved"
      setTimeout @goBack, 1000
    else
      console.log "save error"
      Utils.midAlert "Save error"
      
  # Wow I'm bad at using templates
  render: ->
    name      = Utils.encode @model.get "name"
    prototype = @model.get "prototype"
    help      = @model.get("enumeratorHelp") || ""
    dialog    = @model.get("studentDialog")  || ""
    skippable = @model.get("skippable") == true || @model.get("skippable") == "true"

    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <button class='save_subtest command'>Done</button>
      <div id='subtest_edit_form'>
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
      </div>
      <button class='save_subtest command'>Done</button>"

    @prototypeEditor.setElement @$el.find('#prototype_attributes')
    @prototypeEditor.render?()
    
    @$el.find("#skip_radio").buttonset()
    @trigger "rendered"


