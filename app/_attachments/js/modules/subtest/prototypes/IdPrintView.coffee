class IdPrintView extends Backbone.View

  className: "id"
  
  initialize: (options) ->

  render: ->
    return if @format is "stimuli"
    @$el.html "
      ID
    "
    @trigger "rendered"

