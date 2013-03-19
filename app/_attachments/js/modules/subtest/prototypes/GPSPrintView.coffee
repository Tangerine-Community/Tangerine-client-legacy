class GPSPrintView extends Backbone.View

  className: "gps"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    return if @format is "stimuli" or @format is "backup"

    if @format is "content"
      @$el.html "Capture GPS location"

    @trigger "rendered"
