class LocationPrintView extends Backbone.View


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
    schoolListElements = ""

    @$el.html "
      School Locations<br/>
      Levels: #{@levels}<br/>
      Available Locations:<br/>
      #{@locations.join("<br/>")}<br/>
    "

    @trigger "rendered"

