class SubtestListElementView extends Backbone.View

  tagName : "li"
  className : "subtestElement"
  events: 
    'click .icon_edit'     : 'edit'
    "click .icon_delete"   : "showDeleteConfirm"
    "click .delete_cancel" : "hideDeleteConfirm"
    "click .delete_delete" : "delete"

  showDeleteConfirm: (event) -> @$el.find(".delete_confirm").show(250); false
  hideDeleteConfirm: (event) -> @$el.find(".delete_confirm").hide(250); false
  delete: -> @trigger "subtest:delete", @model; false

  edit: ->
    Tangerine.router.navigate "subtest/#{@model.id}", true

  initialize: (options) ->
    @model = options.model
    # this is for sortable
    @$el.attr "data-id", @model.id

  render: ->
    subtestName   = @model.get("name")
    prototype     = "[#{@model.get("prototype")}]"
    iconDrag      = "<img src='images/icon_drag.png' class='sortable_handle'>"
    iconEdit      = "<img src='images/icon_edit.png' class='icon_edit'>"
    iconDelete    = "<img src='images/icon_delete.png' class='icon_delete'>"
    deleteConfirm = "<span class='delete_confirm'><button data-subtest='#{@model.id}' class='delete_delete command'>Delete</button><button class='delete_cancel command'>Cancel</button></span>"

    @$el.html "
      #{iconDrag}
      #{subtestName}
      #{prototype}
      #{iconEdit}
      #{iconDelete}
      #{deleteConfirm}
    "

    @trigger "rendered"
