class DatetimePrintView extends Backbone.View

  className: "datetime"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    return if @format is "stimuli"

    @$el.html "
        DateTime
      "
    @trigger "rendered"
