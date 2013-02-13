class LocationPrintView extends Backbone.View

  className: "LocationPrintView"

  initialize: (options) ->
    
    @model  = @options.model
    @parent = @options.parent
    
    @levels = @model.get("levels")       || []
    @locations = @model.get("locations") || []

    if @levels.length == 1 && @levels[0] == ""
      @levels = []
    if @locations.length == 1 && @locations[0] == ""
      @locations = []



  render: ->
    return if @format is "stimuli"
    schoolListElements = ""

    @$el.html "
      School Locations<br/>
      Levels: #{@levels}<br/>
      Available Locations:<br/>
      #{@locations.join("<br/>")}<br/>
    "

    @trigger "rendered"

