class SubtestEdit extends Backbone.View

  initialize: ->
    @config = Tangerine.config.Subtest

  el: '#content'

  events:
    "click button.delete_subtest_element_cancel"    : 'hideDeleteSubtestElementConfirm'
    "click button.delete_subtest_element_yes"       : 'deleteSubtestElement'
    "click img.delete_subtest_element_show_confirm" : 'showDeleteSubtestElementConfirm'
    "click img.append_subtest_element"              : 'appendSubtestElement'
    'click button#return_to_assessment'             : 'returnToAssessment'
    "click form#subtestEdit button:contains(Save)"  : "save"
    "click button:contains(Import a subtest)"       : "showImportSubtestForm"
    "click button#subtest_import_confirm" : "importSubtest"
    "click button#subtest_import_cancel"  : "hideImportSubtestForm"

  deleteSubtestElement: (event) ->
    parent = $(event.target).parent().parent()
    # I believe this type of thising is out of the "scope" of coffescript
    self = this
    parent.fadeOut 250, ->
      $(this).remove()
      self.save()
      self.render()

  showDeleteSubtestElementConfirm: (event) ->
    $(event.target).parent().find("span.delete_subtest_element_confirm").show(250)

  hideDeleteSubtestElementConfirm: (event) ->
    $(event.target).parent().fadeOut(250)

  returnToAssessment: ->
    Tangerine.router.navigate "edit/assessment/#{@assessment_id}", true

  showImportSubtestForm: ->
    $("#import-from").show()
    @existingSubtests = new SubtestCollection()
    @existingSubtests.fetch
      success: =>
        $("form#import-from select").append @existingSubtests.filter( (subtest) =>
          subtest.get("pageType") is @model.get("pageType")
        ).map( (subtest) ->
          "<option>#{subtest.get "_id"}</option>"
        ).join("")

  hideImportSubtestForm: ->
    $("#import-from").hide()

  importSubtest: ->
    sourceSubtest = @existingSubtests.get $("form#import-from select option:selected").val()
    Utils.disposableAlert "Subtest imported"
    $("#import-from").fadeOut 250
    @populateForm sourceSubtest.toJSON()

  importSubtest: ->
    sourceSubtest = @existingSubtests.get $("form#import-from select option:selected").val()
    Utils.disposableAlert "Subtest imported"
    $("#import-from").fadeOut 250
    @populateForm sourceSubtest.toJSON()

  render: =>
    @$el.html "
      <div id='subtest_edit'>
        <button id='return_to_assessment'>Return to assessment</button>
        <button>Import a subtest</button>

        <div style='display:none' class='message'></div>
        <h1>#{@model.get "pageType"}</h1>

        <form style='display:none' id='import-from'>
          Select an existing subtest and it will fill in all blank elements below with that subtest's contents
          <div>
            <select id='existing-subtests'></select>
          </div>
          <button id='subtest_import_confirm'>Import</button><button id='subtest_import_cancel'>Cancel</button>
        </form>

        #{@subtestEditForm()}
      </div>
      "
    $("textarea.html").cleditor()
    @populateForm @model.toJSON()

  subtestEditForm: ->
    "<form id='subtestEdit'>
      <ul id='subtest_edit_list'>
    " +
        _.chain(@model.attributes)
          .map (value,key) =>

            return null if _.include(@config.ignore, key)

            label = "<label for='#{key}'>#{key.underscore().humanize()}</label>"

            formElement =
              if _.include(@config.htmlTextarea, key)
                "<textarea class='html' id='#{key}' name='#{key}'></textarea>"
              else if _.include(@config.boolean, key)
                "<input id='#{key}' name='#{key}' type='checkbox'></input>"
              else if _.include(@config.number, key)
                "<input id='#{key}' name='#{key}' type='number'></input>"
              else if key is "pageType"
                "<select id='#{key}' name='#{key}'>
                  #{_.map @config.pageTypes, (type) ->
                      "<option value=#{type}>
                        #{type.underscore().humanize()}
                      </option>"
                    .join("")
                  }
                </select>"
              else if _.include(@config.textarea, key)
                "<textarea id='#{key}' name='#{key}'></textarea>"
              else if _.include(@config.object, key) or typeof value is "object"
                label = "" # makes it's own 'label'
                object = {}
                object[key] = value
                "<div id='object_wrapper_#{key}'>#{Utils.json2Form(object)}<img src='images/icon_add.png' class='icon_add append_subtest_element' data-element='#{key}'></div>"
              else
                "<input id='#{key}' name='#{key}' type='text'></input>"

            return "<li>#{label}#{formElement}</li>"

          .compact()
          .value()
        .join("") +
        "
      </ul>
      <button type='button'>Save</button>
    </form>"

  # this is not a deep copy, only one level
  appendSubtestElement: (event) ->
    # what are we copying?
    key = $(event.target).attr("data-element")
    object = @model.attributes[key]

    # is it already an array?
    if _.isArray object
      # get the last element and zero it out
      # @TODO I should be able to grab an empty from the config, no?
      last = @zeroOut _.last(@model.attributes[key])
      object.push(last)
      @model.set key, object
    else
      @model.set key, [object, object]

    object = {}
    object[key] = @model.attributes[key]

    $("div#object_wrapper_#{key}").html Utils.json2Form(object)

  # used by appendSubtestElement
  zeroOut:(last) ->
    # if it's an object, zero out its properties
    if _.isObject last
      # Just in case
      # objects are passed by reference but does that apply here?
      last = _.clone last
      for key, value of last
        last[key] = ""
    else
      last = ""
    last # lastly...

  populateForm: ( subtestAttributes ) ->
    _.each subtestAttributes, ( value, key ) ->
      currentValue = $('#'+key, @el).val()
      # Don't fill in unless it's blank
      if (not currentValue or currentValue is '<br>')
        if key is 'items'
          $('#items', @el).val value.join(' ')
        else if key is 'includeAutostop' and value is 'on'
          $('#includeAutostop', @el).prop("checked", true)
        else if typeof value is 'object'
          $('#'+key, @el).val JSON.stringify value,undefined,2
        else
          $('#'+key, @el).val value

    _.each $("textarea.html", @el).cleditor(), (cleditor) ->
      cleditor.updateFrame()

  save: ->
    result = $('form#subtestEdit').toObject {skipEmpty: false}
    # Clean up stuff form2js missed
    result.items = result.items.split(" ") if result.items
    result.includeAutostop = $('#includeAutostop').prop("checked") if $('#includeAutostop').length
    
    @model.set result
    @model.save null,
      success: ->
        $("form#subtestEdit").effect "highlight", {color: "#F7C942"}, 2000
        $("div.message").html("Saved").show().fadeOut(3000)
      error: ->
        $("div.message").html("Error saving changes").show().fadeOut(3000)
