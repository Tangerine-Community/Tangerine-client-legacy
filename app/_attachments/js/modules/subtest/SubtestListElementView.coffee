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
    @model = options.model
    @group = options.group # for copying
    console.log "subtest list say #{@group}"

    # This is for $.sortable. Don't remove.
    @$el.attr "data-id", @model.id

  openCopyMenu: ->
    $select = @$el.find("copy_select")
    $select.removeClass("confirmation").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>")
    @populateAssessmentSelector()


  render: ->
    subtestName   = @model.get("name")
    prototype     = "[#{@model.get("prototype")}]"
    iconDrag      = "<img src='images/icon_drag.png' title='Drag to reorder' class='sortable_handle'>"
    iconEdit      = "<img src='images/icon_edit.png' title='Edit' class='icon_edit'>"
    iconDelete    = "<img src='images/icon_delete.png' title='Delete' class='icon_delete'>"
    copyIcon      = "<img src='images/icon_copy.png' title='Copy to...' class='icon_copy'><select class='copy_select confirmation'></select>"
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>"
    @$el.html "
      <table><tr>
      <td>#{iconDrag}</td>
      <td>
        #{subtestName}
        #{prototype}
        #{iconEdit}
        #{iconDelete}
        #{deleteConfirm}
      </td>
      </tr></table>
    "

    @trigger "rendered"
