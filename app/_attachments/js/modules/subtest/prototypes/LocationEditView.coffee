class LocationEditView extends Backbone.View

  events: 
    'click .level_comma_to_tab' : 'levelCommaToTab'
    'click .level_tab_to_comma' : 'levelTabToComma'
    'click .location_comma_to_tab' : 'locationCommaToTab'
    'click .location_tab_to_comma' : 'locationTabToComma'


  initialize: ( options ) ->
    @model = options.model
    
  locationTabToComma: -> @$el.find("#location_data").val(String(@$el.find("#location_data").val()).replace(/\t/g,","))
  locationCommaToTab: -> @$el.find("#location_data").val(@$el.find("#location_data").val().replace(/,/g, "\t"))
  levelTabToComma: -> @$el.find("#location_levels").val(String(@$el.find("#location_levels").val()).replace(/\t/g,","))
  levelCommaToTab: -> @$el.find("#location_levels").val(@$el.find("#location_levels").val().replace(/,/g, "\t"))

  save: ->
    levels = @$el.find("#location_levels").val().split(",")
    for level, i in levels
      levels[i] = $.trim(level)
    
    console.log "before"
    console.log locations
    locations = @$el.find("#location_data").val().split("\n")
    for location, i in locations
      locations[i] = location.split(",")
    console.log "after"
    console.log locations
    @model.set
      "levels"    : levels
      "locations" : locations

  render: ->
    levels    = @model.get("levels")    || []
    locations = @model.get("locations") || []

    levels = levels.join(", ")

    locations = locations.join("\n")

    if _.isArray(locations)
      for location, i in locations 
        locations[i] = location.join(", ")

    @$el.html  "
      <div class='label_value'>
        <label for='location_levels'>Geographic Levels <small>(CSV)</small></label>
        <textarea id='location_levels'>#{levels}</textarea>
        <button class='command level_tab_to_comma'>Tabs to Commas</button>
        <button class='command level_tab_to_comma'>Commas to tabs</button>

      </div>
      <div class='label_value'>
        <label for='location_data'>Location data <small>(CSV)</small></label>
        <textarea id='location_data'>#{locations}</textarea><br>
        <button class='command location_tab_to_comma'>Tabs to Commas</button>
        <button class='command location_tab_to_comma'>Commas to tabs</button>

      </div>
    " 

