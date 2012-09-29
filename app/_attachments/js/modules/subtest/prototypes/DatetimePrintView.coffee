class DatetimePrintView extends Backbone.View

  className: "datetime"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->

    @$el.html "
        DateTime
      "
    @trigger "rendered"
