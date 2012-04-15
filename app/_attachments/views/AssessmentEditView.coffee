class AssessmentEditView extends Backbone.View

  el: '#content'

  initialize: (options) =>
    options ?= {}
    @model = options.model
    @config = Tangerine.config.Subtest

  events:
    "click button#back_to_assessments"      : "gotoAssessments"
    "click input#edit-archive"              : "updateArchive"
    "click img.show_delete_subtest_confirm" : "showConfirmDeleteSubtest"
    "click button.delete_subtest_yes"       : "deleteSubtestAffirmative"
    "click button.delete_subtest_cancel"    : "deleteSubtestNegative"
    "click img#add_subtest_form"            : "addSubtestForm"
    "click img.save_this_subtest"           : "saveThisSubtest"
    "click li#save_all_new_subtests"        : "saveAllNewSubtests"
    "change form.newSubtest select": "subtestTypeSelected"

  
  
  render: =>
    @$el.html "
    <button id='back_to_assessments'>Back to Assessments</button>
    <div id='edit_assessment'>
      <h1>#{@model.get("name")}</h1>
      <div>
        <label for='edit-archive'>Archived</label><br>
        <input type='checkbox' id='edit-archive' name='archived' value='#{if @model.get "archived" is true then "checked" else ""}'></input><br/>
      </div>
      <h2>Subtests</h2>
      <ul id='subtest_list'>
        #{
        _.map(@model.get("urlPathsForPages"), (subtestId) => @renderSubtestItem(subtestId) ).join("") 
        }
      </ul>
      <ul id='new_subtest_list'>
        <li><img src='images/icon_add.png' class='icon_add' id='add_subtest_form'></li>
        <li id='save_all_new_subtests'><button>Save All Subtests</button></li>
      </ul>
    </div>
    "
    @makeSortable()

  renderSubtestItem: (subtestId) ->
    "
    <li data-subtest='#{subtestId}' id='#{subtestId}'>
      <img src='images/icon_draggable.png' class='sortable_handle'>
      #{subtestId}
      <a href='#edit/assessment/#{@model.id}/subtest/#{subtestId}'><img class='icon_edit' src='images/icon_edit.png'></a>
      <img class='icon_delete show_delete_subtest_confirm' src='images/icon_delete.png'>
      <span class='delete_confirm'>Are you sure? <button data-subtest='#{subtestId}' class='delete_subtest_yes'>Yes</button><button class='delete_subtest_cancel'>Cancel</button></span>
    </li>
    "

  addSubtestForm: ->
    optionListHTML = ""

    for groupName, optionItems of Tangerine.config.Subtest.subtestOptions
      optionHTML = ""
      for optionName in optionItems
        if _.isObject optionName
          optionHTML += "<option value="+optionName.idValue+">"+optionName.name+"</option>";
        else
          optionHTML += "<option value="+groupName+">"+optionName+"</option>";
      optionListHTML += "<optgroup label='"+groupName+"'>" + optionHTML + "</optgroup>";

    selectFormHTML = "<select name='pageType' class='pageType'>
          <option>Select a type</option>
          #{optionListHTML}
        </select>"
    
    $('ul#new_subtest_list').prepend "
      <li class='new_subtest'>
        <input name='_id' class='_id' type='text' placeholder='Subtest Name'>
        "+selectFormHTML+"
        <img src='images/icon_add.png' class='icon_add save_this_subtest'>
        <img src='images/icon_delete.png' class='parent_remove'>
      </li>"

  updateSaveAllButton: -> if $('li.new_subtest').length > 1 then $("li#save_all_subtests").show() else $("li#save_all_subtests").hide()

  saveAllNewSubtests: ->
    subtests = $("li.new_subtest").each ( index, element ) ->
      @saveNewSubtest
        _id      : $("input._id", element).val()
        pageType : $("select.pageType option:selected", element).val()
        toRemove : element
    
  
  saveThisSubtest: (event) ->
    targetParent = $(event.target).parent()
    @saveNewSubtest
        _id      : $("input._id", targetParent).val()
        pageType : $("select.pageType option:selected", targetParent).val()
        toRemove : targetParent

  saveNewSubtest: ( options ) ->
    _id      = options._id
    pageType = options.pageType
    toRemove = options.toRemove

    subtest = new Subtest
      _id: _id
      pageType: pageType
      #Use the id to start with a nice default for the pageId
      pageId: _id.substring(_id.lastIndexOf(".")+1)

    # apply blank subtest template
    subtest.set _.reduce(
      @config.pageTypeProperties[pageType], 
      (result,property) => result[property] = ""; return result, 
      {}
    )
    
    # apply a more specific template if we have one
    # @TODO there has got to be a better data structure, this algorithm is ugly
    # The problem is it's gotta go option groups too
    specificName = $("select.pageType option:selected", toRemove).html()
    for subtestType, i in @config.subtestOptions[pageType]
      if subtestType.name? 
        if subtestType.name == specificName
          subtest.set subtestType.template
        
    
    
    subtest.save null,
      success: =>
        @model.set
          urlPathsForPages: @model.get("urlPathsForPages").concat([subtest.id])
        @model.save null,
          success: =>
            $("ul#subtest_list").append(@renderSubtestItem(_id)).sortable('refresh')
            $(options.toRemove).remove()
          error: ->
            console.log "assessment save error"
            $(toRemove).append "<span class='error'>Error while updating #{@model.get "name"} <img src='images/icon_close.png' class='parent_remove'></span>"
      error: =>
        console.log "subtest save error"
        $(toRemove).append "<span class='error'>Invalid new subtest <img src='images/icon_close.png' class='parent_remove'></span>"

    @updateSaveAllButton()

    

  showConfirmDeleteSubtest: ( event ) ->
    $(event.target).parent().find(".delete_confirm").fadeIn(250)

  deleteSubtestNegative: ( event ) ->
    $(event.target).parent().fadeOut(250)

  deleteSubtestAffirmative: (event) ->
    subtest_id = $(event.target).attr("data-subtest")
    @model.set
      urlPathsForPages: _.without( @model.get("urlPathsForPages"), subtest_id )
    @model.save null,
      success: ->
        $(event.target).parent().parent().fadeOut(250)
      error: ->
        $("div.message").append "<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>"

  updateArchive: ->
    @model.save { archived: $("#edit-archive").is(":checked") },
      success: ->
        $("#edit-archive").effect "highlight", { color: "#F7C942" }, 2000
        $("div.message").html("Saved").show().fadeOut(3000)
      error: ->
        $("div.message").html("Error saving changes").show().fadeOut(3000)

  subtestTypeSelected: ->
    $("form.newSubtest input[name='_id']").val(@model.id + "." + $("form.newSubtest option:selected").val())

  makeSortable: =>
    $("ul#subtest_list", @el).sortable
      handle : '.sortable_handle'
      update: =>
        @model.set
          urlPathsForPages: (_.map $("li a"), (subtest) ->
            $(subtest).text()
          )
        @model.save null,
          success: ->
            $("ul").effect "highlight", {color: "#F7C942"}, 2000
            $("div.message").html("Saved").show().fadeOut(3000)
          error: ->
            $("div.message").html("Error saving changes").show().fadeOut(3000)

  gotoAssessments: ->
    Tangerine.router.navigate "manage", true

  clearNewSubtest: ->
    $("form.newSubtest input[name='_id']").val("")
    $("form.newSubtest select").val("")
