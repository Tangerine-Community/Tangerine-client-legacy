class KlassSubtestEditView extends Backbone.View

  className: "subtest_edit"

  events :
    'click .back_button'         : 'goBack'
    'click .save_subtest'        : 'save'

  onClose: ->
    @prototypeEditor.close?()

  initialize: ( options ) ->
    @model      = options.model
    @curriculum = options.curriculum
    @config     = Tangerine.templates.get "subtest"

    @prototypeViews  = Tangerine.config.get "prototypeViews"
    @prototypeEditor = new window[@prototypeViews[@model.get 'prototype']['edit']]
      model: @model
      parent: @
    @prototypeEditor.on "edit-save", => @save options:editSave:true
      
  goBack: =>
    history.back()

  save: (event) ->

    isEditSave = event?.options?.editSave == true

    prototype = @model.get("prototype")
    @model.set
      name           : @$el.find("#name").val()
      part           : parseInt( @$el.find("#part").val() )
      reportType     : @$el.find("#report_type").val()
      itemType       : @$el.find("#item_type").val()

    @prototypeEditor.save?(
      "options" :
        "isEditSave" : isEditSave
    )
    
    if @prototypeEditor.isValid? && @prototypeEditor.isValid() == false && not isEditSave
      Utils.midAlert "There are errors on this page"
      @prototypeEditor.showErrors?()
    else
      if @model.save()
        Utils.midAlert "Subtest Saved"
        setTimeout @goBack, 1000 unless isEditSave
      else
        console.log "save error"
        Utils.midAlert "Save error"

  render: ->
    curriculumName = @curriculum.escape "name"
    name           = @model.escape "name"
    part           = @model.getNumber "part"
    reportType     = @model.escape "reportType"
    itemType       = @model.escape "itemType"


    @$el.html "
      <button class='back_button navigation'>Back</button><br>
      <h1>Subtest Editor</h1>
      <table class='basic_info'>
        <tr>
          <th>Curriculum</th>
          <td>#{curriculumName}</td>
        </tr>
      </table>
      <button class='save_subtest command'>Done</button>

      <div class='label_value'>
        <label for='name'>Name</label>
        <input id='name' value='#{name}'>
      </div>

      <div class='label_value'>
        <label for='report_type'>Report Type</label>
        <input id='report_type' value='#{reportType}'>
      </div>

      <div class='label_value'>
        <label for='item_type'>Item Type</label>
        <input id='item_type' value='#{itemType}'>
      </div>

      <div class='label_value'>
        <label for='part'>Assessment Number</label><br>
        <input type='number' id='part' value='#{part}'>
      </div>

      <div id='prototype_attributes'></div>

      <button class='save_subtest command'>Done</button>
      "

    @prototypeEditor.setElement @$el.find('#prototype_attributes')
    @prototypeEditor.render?()

    @trigger "rendered"

