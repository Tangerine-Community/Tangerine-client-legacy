# bit of a crap shoot this one
# it will find _a_ school list
class SchoolListView extends Backbone.View


  WORKFLOW_NO_BOOKS   : "00b0a09a-2a9f-baca-2acb-c6264d4247cb"
  WORKFLOW_WITH_BOOKS : "c835fc38-de99-d064-59d3-e772ccefcf7d"

  events: 
    "click .schools-left"   : "toggleSchoolList"

  toggleSchoolList: ->
    @$el.find(".school-list").toggle()

  initialize: (options) ->
    @geography       = {}
    @visited         = {}
    @schools         = { left : [] , done : []}
    @validObservationView = options.validObservationView


    if Tangerine.user.has("location")
      @currentLocation = 
        zone   : Tangerine.user.get('location').Zone.toLowerCase()
        county : Tangerine.user.get('location').County.toLowerCase()
    else
      @invalid = true

    @locationSubtest = {}

    @listenTo @validObservationView, "valid-update", ->
      Utils.execute [
        @fetchLocations
        @fetchTrips
        @render
      ], @
    , @


  fetchLocations: ( callback = $.noop ) ->

    return if @invalid

    subtestIndex = 0
    limit = 1

    checkSubtest = =>

      Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
        key   : "subtest"
        skip  : subtestIndex
        limit : limit
        include_docs : true
        error : $.noop
        success: (response) =>

          return alert "Failed to find locations" if response.rows.length is 0
          
          @locationSubtest = response.rows[0].doc

          if @locationSubtest.prototype? && @locationSubtest.prototype is "location"

            
            levels = @locationSubtest.levels
            locationCols = @locationSubtest.locationCols

            levelColMap = []
            for level, i in levels
              levelColMap[i] = _.indexOf locationCols, level

            #map the location data to keep only the 'level' columns
            filteredLocations = @locationSubtest.locations.map (arr) -> arr[level].toLowerCase() for level in levelColMap

            @makeTree(filteredLocations, @geography)

            unless @geography[@currentLocation.county]? and @geography[@currentLocation.county][@currentLocation.zone]?
              @invalid = true
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

    return callback() if @invalid

    d = new Date()
    year  = d.getFullYear()
    month = d.getMonth() + 1

    trips = new TripResultCollection
    trips.fetch
      resultView : "tutorTrips"
      queryKey   : "year#{year}month#{month}"
      success: =>

        rows = []
        zones = {}

        incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete") || {}
        incompleteTrips = []
        for workflowId, tripIds of incomplete
          incompleteTrips = incompleteTrips.concat(tripIds)

        for trip in trips.models

          # skip unless they belong

          isThisTutor = trip.get("enumerator") in [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
          isRightWorkflow = trip.get("workflowId") in [@WORKFLOW_NO_BOOKS, @WORKFLOW_WITH_BOOKS]
          isValid = trip.get("tripId") in @validObservationView.validTrips
          continue unless isThisTutor
          continue unless isRightWorkflow
          continue if trip.get('tripId') in incompleteTrips
          continue unless isValid

          row = []
          for level in @locationSubtest.levels
            row.push trip.get(level).toLowerCase()
          rows.push row

        @visited = {}
        @makeTree rows, @visited

        if @visited[@currentLocation.county]? and @visited[@currentLocation.county][@currentLocation.zone]?
          @schools.done = Object.keys(@visited[@currentLocation.county][@currentLocation.zone]).sort()
        else
          @schools.done = []
        @schools.all  = Object.keys(@geography[@currentLocation.county][@currentLocation.zone]).sort()
        @schools.left = _(@schools.all).difference(@schools.done)

        callback?()

  render: (status) ->

    if @invalid
      return @$el.html "
        <p>School list information unavailable.</p>
        <p>Your user has no location or an invalid location set. You can create a new user, or click your user name to change your location.</p>
      "

    if status is "loading"
      return @$el.html "<h2>School List</h2><p>Loading...</p>"
    
    @$el.html "
      
      <h2>School List</h2>
      <table class='class_table'>
        <tr><th>County</th><td>#{@currentLocation.county}</td></tr>
        <tr><th>Zone</th><td>#{@currentLocation.zone}</td></tr>
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

