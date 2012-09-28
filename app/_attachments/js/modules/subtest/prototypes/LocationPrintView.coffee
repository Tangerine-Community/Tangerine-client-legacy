class LocationPrintView extends Backbone.View

  events:
    "click .school_list li" : "autofill"
    "keyup input"  : "showOptions"
    "click .clear" : "clearInputs"

  initialize: (options) ->
    
    @model  = @options.model
    @parent = @options.parent
    
    @levels = @model.get("levels")       || []
    @locations = @model.get("locations") || []

    if @levels.length == 1 && @levels[0] == ""
      @levels = []
    if @locations.length == 1 && @locations[0] == ""
      @locations = []

    @haystack = []

    for location, i in @locations
      @haystack[i] = []
      for locationData in location
        @haystack[i].push locationData.toLowerCase()

    
    template = "<li data-index='{{i}}'>"
    for level, i in @levels
      template += "{{level_#{i}}}"
      template += " - " unless i == @levels.length-1
    template += "</li>"
    
    @li = _.template(template)


  render: ->
    schoolListElements = ""

    html = "
      <button class='clear command'>Clear</button>
      ";

    for level, i in @levels
      html += "
        <div class='label_value'>
          <label for='level_#{i}'>#{level}</label><br>
          <input data-level='#{i}' id='level_#{i}' value=''>
        </div>
        <div id='autofill_#{i}' class='autofill' style='display:none'>
          <h2>Select one from autofill list</h2>
          <ul class='school_list' id='school_list_#{i}'>
          </ul>
        </div>
    "

    @$el.html html

    @trigger "rendered"

