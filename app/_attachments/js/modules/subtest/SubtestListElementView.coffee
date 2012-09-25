class SubtestListElementView extends Backbone.View

  tagName : "li"
  className : "subtest_element"
  events: 
    'click .icon_edit'     : 'edit'
    "click .icon_delete"   : "toggleDeleteConfirm"
    "click .delete_cancel" : "toggleDeleteConfirm"
    "click .delete_delete" : "delete"
    "click .icon_copy"     : "openCopyMenu"

  toggleDeleteConfirm: -> @$el.find(".delete_confirm").fadeToggle(250); false

  delete: -> @trigger "subtest:delete", @model; false

  edit: ->
    Tangerine.router.navigate "subtest/#{@model.id}", true

  initialize: (options) ->
    @model = options.subtest
    @group = options.group # for copying
    console.log "subtest list say #{@group}"

    # This is for $.sortable. Don't remove.
    @$el.attr "data-id", @model.id

  openCopyMenu: ->
    $select = @$el.find("copy_select")
    $select.removeClass("confirmation").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>")
    @fetchAssessments()

  fetchAsse
  ssments: ->
    @groupAssessments = []
    allAssessments = new Assessments
    allAssessments.fetch
      success: (collection) =>
        @groupAssessments = collection.where "group" : @group
        @populateAssessmentSelector()
  
  populateAssessmentSelector: ->
    optionList = ""
    for assessment in @groupAssessments
      optionList += ""
    $select = @$el.find("copy_select").html(optionList)
      
  

  render: ->
    subtestName   = @model.get("name")
    prototype     = "[#{@model.get("prototype")}]"
    iconDrag      = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>"
    iconEdit      = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>"
    iconDelete    = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>"
    copyIcon      = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'><select class='copy_select confirmation'></select>"
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>"
    @$el.html "
      <table><tr>
      <td>#{iconDrag}</td>
      <td>
        #{subtestName}
        #{prototype}
        #{iconEdit}
        #{copyIcon}
        #{iconDelete}
        #{deleteConfirm}
      </td>
      </tr></table>
    "

    @trigger "rendered"
