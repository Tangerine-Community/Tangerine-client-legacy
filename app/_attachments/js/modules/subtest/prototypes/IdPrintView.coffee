class IdPrintView extends Backbone.View

  className: "id"
  
  initialize: (options) ->

  render: ->
    @$el.html "
      ID
    "
    @trigger "rendered"

