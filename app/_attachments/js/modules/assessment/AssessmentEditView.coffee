class AssessmentEditView extends Backbone.View

  className : 'assessmentEditView'

  events :
    'click #archive_buttons input' : 'save'
    'click .back'               : 'back'
    'click .new_subtest_button' : 'showNewSubtestForm'
    'click .new_subtest_cancel' : 'hideNewSubtestForm'
    'click .new_subtest_save'   : 'saveNewSubtest'
    'change #basic input' : 'showSave'
    'click .assessment_save' : 'save'

  save: =>
    @updateModel()
    if @model.save() 
      Utils.midAlert "Assessment saved" 
      Tangerine.router.navigate "edit/"+@model.get("name"), true
      @render()

  showSave: -> @$el.find('.assessment_save').fadeIn(250)

  back: ->
    Tangerine.router.navigate "", true

  updateModel: =>
    @model.set
      archived : @$el.find("#archive_buttons input:checked").val()
      name     : @$el.find("#assessment_name").val()
      dKey     : @$el.find("#assessment_d_key").val()
      assessmentId : @model.id


  showNewSubtestForm: -> @$el.find(".new_subtest_form").fadeIn(250)
  hideNewSubtestForm: -> @$el.find(".new_subtest_form").fadeOut(250)
  saveNewSubtest: ->
    # general template
    newAttributes = Tangerine.config.subtestTemplate
    
    # prototype template
    prototypeTemplate = Tangerine.config.prototypeTemplates[@$el.find("#subtest_type_select").val()]
    
    # bit more specific template
    useType = @$el.find("#subtest_type_select :selected").attr 'data-template'
    useTypeTemplate = Tangerine.config.subtestTemplates[@$el.find("#subtest_type_select").val()][useType]

    newAttributes = $.extend newAttributes, prototypeTemplate
    newAttributes = $.extend newAttributes, useTypeTemplate
    newAttributes = $.extend newAttributes,
      name         : @$el.find("#new_subtest_name").val()
      assessmentId : @model.id
      order        : @model.subtests.length
    newSubtest = @model.subtests.create newAttributes
  
  deleteSubtest: (model) =>
    @model.subtests.remove model
    model.destroy()
  
  initialize: (options) ->
    @views = []
    @model = options.model
    @model.subtests.on "change remove", @render

  render: =>
    arch = @model.get('archived')
    archiveChecked    = if (arch == true or arch == 'true') then "checked" else ""
    notArchiveChecked = if archiveChecked then "" else "checked"
    @$el.html "
      <button class='back navigation'>Back</button>
        <h1>Assessment Builder</h1>
      <div id='basic'>
        <label for='assessment_name'>Name</label>
        <input id='assessment_name' value='#{@model.get("name")}'>
        <button class='assessment_save confirmation'>Save</button>

        <label for='assessment_d_key'>Download Key</label>
        <div class='info_box'>#{@model.id.substr(-5,5)}</div>
      </div>

      <div id='archive_buttons'>
        <input type='radio' id='archive_false' name='archive' value='false' #{notArchiveChecked}><label for='archive_false'>Active</label>
        <input type='radio' id='archive_true'  name='archive' value='true'  #{archiveChecked}><label for='archive_true'>Archived</label>
      </div>
      <h2>Subtests</h2>
      <button class='new_subtest_button command'>New</button>
      <div class='new_subtest_form confirmation'>
        <div class='label_value'>
          <label for='new_subtest_type'>Type</label>
          <div id='subtest_type'></div>
        </div>
        <div class='label_value'>
          <label for='new_subtest_name'>Name</label>
          <input type='text' id='new_subtest_name'>
        </div>
        <button class='new_subtest_save command'>Save</button><button class='new_subtest_cancel command'>cancel</button>
      </div>
    "

    # insert a list of templates
    subtestTypeSelect = "<select id='subtest_type_select'>
      <option value='' disabled='disabled' selected='selected'>Please select a subtest type</option>"
    for key, value of Tangerine.config.subtestTemplates
      subtestTypeSelect += "<optgroup label='#{key}'>"
      for subKey, subValue of value
        subtestTypeSelect += "<option value='#{key}' data-template='#{subKey}'>#{subKey}</option>"
      subtestTypeSelect += "</optgroup>"
    subtestTypeSelect += "</select>"
    @$el.find("#subtest_type").html subtestTypeSelect

    # buttonset archive buttons
    @$el.find("#archive_buttons").buttonset()

    
    # render new subtest views
    unorderedList = $('<ul>').attr('id', 'subtest_list')
    @closeViews()
    @views = []
    @model.subtests.sort()
    @model.subtests.each (subtest) =>
      oneView = new SubtestListElementView
        model : subtest
      @views.push oneView
      oneView.render()
      oneView.on "subtest:delete", @deleteSubtest
      unorderedList.append oneView.el
    @$el.append unorderedList
    
    # make it sortable
    @$el.find("#subtest_list").sortable
      handle : '.sortable_handle'
      update : (event, ui) =>
        for id, i in ($(li).attr("data-id") for li in @$el.find("#subtest_list li"))
          @model.subtests.get(id).set({"order":i},{silent:true}).save(null,{silent:true})

    @trigger "rendered"

  onClose: ->
    @closeViews()
    
  closeViews: ->
    for view in @views
      view.close()