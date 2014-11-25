# bit of a crap shoot this one
# it will find _a_ school list
# determines the zone as the one most visited
class SchoolListView extends Backbone.View

  events: 
    "click .schools-left"   : "toggleSchoolList"
    "change .county-select" : "updateCounty"
    "change .zone-select"   : "updateZone"

  updateZone: ->
    @selected = true
    @currentZone.name   = @$el.find(".zone-select").val()
    @currentZone.county = @$el.find(".county-select").val()
    @updateTrips()

  updateCounty: ->
    @selected = true
    @currentZone.county = @$el.find(".county-select").val()
    @currentZone.name = Object.keys(@geography[@currentZone.county])[0]
    @updateTrips()

  updateTrips: ->
    Utils.execute [
      @fetchTrips
      @render
    ], @


  toggleSchoolList: ->
    @$el.find(".school-list").toggle()

  initialize: ->
    @geography       = {}
    @visited         = {}
    @schools         = { left : [] , done : []}

    @selected        = true
    @currentZone     =
      name   : (Tangerine.user.get('location')||{}).Zone
      county : (Tangerine.user.get('location')||{}).County
    @locationSubtest = {}

    Utils.execute [
      @fetchLocations
      @fetchTrips
      @render
    ], @

  fetchLocations: ( callback = $.noop ) ->
    subtestIndex = 0
    limit = 1

    checkSubtest = =>

      Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
        key   : "subtest"
        skip  : subtestIndex
        limit : limit
        success: (response) =>
          return alert "Failed to find locations" if response.rows.length is 0
          
          @locationSubtest = response.rows[0].value

          if @locationSubtest.prototype? && @locationSubtest.prototype is "location"
            
            levels = @locationSubtest.levels
            locationCols = @locationSubtest.locationCols

            levelColMap = []
            for level, i in levels
              levelColMap[i] = _.indexOf locationCols, level

            #map the location data to keep only the 'level' columns
            filteredLocations = _.map(@locationSubtest.locations, (arr) -> (arr[level]) for level in levelColMap )

            @makeTree(filteredLocations, @geography)
            callback?()
          else
            subtestIndex++
            checkSubtest()
      )
    checkSubtest()

  makeTree: (rows, tree) ->

    makeBranch = (fragment, node) ->
      if fragment.length is 0
        return {}
      else
        next = fragment.shift()
        node[next] = {} unless node[next]?
        makeBranch fragment, node[next]

    for row in rows
      makeBranch(row, tree)

  fetchTrips: (callback = $.noop) ->

    d = new Date()
    year  = d.getFullYear()
    month = d.getMonth()

    trips = new TripResultCollection
    trips.fetch
      resultView : "tutorTrips"
      queryKey   : "year#{year}month#{month}"
      success: =>

        rows = []
        zones = {}
        for trip in trips.models
          
          # count which zones are most common
          zoneName        = trip.get("Zone")
          zones[zoneName] = {
            count  : 0
            county : trip.get("County")
          } unless zones[zoneName]?
          zones[zoneName].count++

          # skip unless they belong
          continue unless trip.get("enumerator") in [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
          row = []
          for level in @locationSubtest.levels
            row.push trip.get(level)
          rows.push row

        @visited = {}
        @makeTree rows, @visited

        if rows.length is 0

          unless @selected
            @currentZone.county = Object.keys(@geography)[0]
            @currentZone.name   = Object.keys(@geography[@currentZone.county])[0]

          @schools.done = []
          @schools.all  = Object.keys(@geography[@currentZone.county][@currentZone.name]).sort()
          @schools.left = @schools.all

        else

          unless @selected
            @currentZone.count = 0
            for zoneName, zoneProperties of zones
              count  = zoneProperties.count
              county = zoneProperties.county
              if count > @currentZone.count
                @currentZone.county = county
                @currentZone.name   = zoneName
                @currentZone.count  = count

          if @visited[@currentZone.county]? and @visited[@currentZone.county][@currentZone.name]?
            @schools.done = Object.keys(@visited[@currentZone.county][@currentZone.name]).sort()
          else
            @schools.done = []
          @schools.all  = Object.keys(@geography[@currentZone.county][@currentZone.name]).sort()
          @schools.left = _(@schools.all).difference(@schools.done)

        callback?()

  render: (status) ->

    if status is "loading"
      @$el.html "<section><h2>School List</h2><p>Loading...</p></section>"
      return

    countySelect = "<select class='county-select'>"
    for county in Object.keys(@geography)
      selected = if county is @currentZone.county then "selected='selected'" else ''
      countySelect += "<option value='#{_.escape(county)}' #{selected}>#{county}</option>"
    countySelect += "</select>"


    zoneSelect = "<select class='zone-select'>"
    for zone in Object.keys(@geography[@currentZone.county])
      selected = if zone is @currentZone.name then "selected='selected'" else ''
      zoneSelect += "<option value='#{_.escape(zone)}' #{selected}>#{zone}</option>"
    zoneSelect += "</select>"
        
    
    @$el.html "
      
      <h2>School List</h2>
      <table class='class_table'>
        <tr><th>County</th><td>#{countySelect}</td></tr>
        <tr><th>Zone</th><td>#{zoneSelect}</td></tr>
        <tr><th>Schools remaining</th><td><button class='schools-left command'>#{@schools.left.length}</button></td></tr>
      </table>
      
      <table class='class_table school-list start-hidden'>
        <tr><td><b>Remaining</b></td></tr>
        #{("<tr><td>#{school}</td></tr>" for school in @schools.left).join('')}
      </table>

      <table class='class_table school-list start-hidden'>
        <tr><td><b>Done</b></td></tr>
        #{("<tr><td>#{school}</td></tr>" for school in @schools.done).join('')}
      </table>
      
    "

