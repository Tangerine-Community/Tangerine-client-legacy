class SyncManager extends Backbone.Model

  url : "log"

  initialize: ->
    @set "_id" : "SyncManagerLog"

  setUserKey: ( userKey ) ->
    @userKey = userKey

  getTrips: -> return @getArray(@userKey)
  setTrips: ( trips ) -> @set(@userKey, trips)

  addTrips: ( someTrips, callback ) ->
    myTrips = @getTrips()
    myTrips = myTrips.concat someTrips
    @setTrips _(myTrips).uniq()
    @save null,
      success: callback,
      error: callback



class SyncManagerView extends Backbone.View

  className : "SyncManagerView"

  events:
    'click .upload'   : 'upload'
    'click .sync-old' : 'syncOldSetup'

  TRIPS_PER_CHUNK : 10

  MAX_RETRIES : 2

  # download previous trips from server
  # server calls
  #   1. check to see if logged in at server
  #   2. get tripIds and resultIds from associated users
  syncOldSetup: ->

    @updateSyncOldProgress message: "Starting"

    sessionUrl = Tangerine.settings.urlSession "group"
    sessionUrl = "http://" + sessionUrl.replace(/http(.*)\@/, '')

    $.ajax
      url: sessionUrl
      dataType: "jsonp"
      success: (response) =>

        unless response.userCtx.name isnt null
          alert "Logging in to server. Please sync again."
          Tangerine.user.ghostLogin "uploader-"+Tangerine.settings.get("groupName"), Tangerine.settings.get("upPass")
          return

        @updateSyncOldProgress message: "Fetching result ids"

        # get tripIds and resultIds from associated users
        $.ajax
          url: Tangerine.settings.urlView("group", "tripsAndUsers")
          dataType: "jsonp"
          data:
            keys:
              JSON.stringify([Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers")))

          error: =>

            alert "Error syncing"
            @updateSyncOldProgress message: "Error fetching trip ids"

          success: (data) =>

            @resultsByTripId = {}

            for result in data.rows
              tripId = result.value
              resultId = result.id
              @resultsByTripId[tripId] = [] unless @resultsByTripId[tripId]
              @resultsByTripId[tripId].push resultId

            @updateSyncOldProgress message: "Building replication job"

            @resultChunks = []
            @tripChunks   = []

            index = 0

            for tripId, resultIds of @resultsByTripId

              resultChunk = [] unless resultChunk?
              resultChunk = resultChunk.concat resultIds

              tripChunk = [] unless tripChunk?
              tripChunk.push tripId

              if index is @TRIPS_PER_CHUNK
                @resultChunks.push resultChunk
                @tripChunks.push   tripChunk
                resultChunk = []
                tripChunk   = []

                index = 0
              else
                index += 1

            @resultChunkCount = @resultChunks.length

            @syncOldReplicate()


  syncOldReplicate: ->

    syncError = false

    retries = 0

    doOne = =>

      percentageDone = ((@resultChunkCount - @resultChunks.length) / @resultChunkCount) * 100

      @updateSyncOldProgress percentage: percentageDone

      if @resultChunks.length is 0

        if syncError
          Utils.sticky "There was an error during syncing, please try again." 

        @update => @render()

      else

        docIds  = @resultChunks.pop()
        tripIds = @tripChunks.pop()

        # try to replicate
        # if it works, reset retries and continue
        # if it doesn't work, push data back to queue and try again
        # if we've tried a bunch of times already, give up and go to next chunk
        $.couch.replicate Tangerine.settings.urlDB("group"), Tangerine.db_name,
          {
            success : =>
              retries = 0
              @log.addTrips tripIds, doOne
            error: ->
              if retries < @MAX_RETRIES
                @resultsChunks.push docIds
                @tripChunks.push tripIds
                retries += 1
                doOne()
              else
                retries = 0
                syncError = true
                doOne()
          },
            doc_ids : docIds

    doOne()

  updateSyncOldProgress: ( options ) ->

    if options.message?
      @$el.find('#sync-old-progress').html "
        <tr>
          <th>Status</th><td>#{options.message}</td>
        </tr>
      "
    else if options.percentage?
      @$el.find('#sync-old-progress').html "
        <tr>
          <th>Complete<th><td>#{parseInt(options.percentage)}%</td>
        </tr>
      "

  initialize: () ->
    @log = new SyncManager
    @log.setUserKey "sunc-#{Tangerine.user.name()}"
    @userLogKey = 
    @messages = []
    @sunc = []
    @toAdd = []
    @toSync = 0
    @update => @render()
    incompleteWorkflows = Tangerine.user.getPreferences('tutor-workflows', 'incomplete') || {}
    @incompleteTrips = []
    for workflowIds, tripIds of incompleteWorkflows
      @incompleteTrips = @incompleteTrips.concat(tripIds)



  update: ( callback ) ->
    todoList = [
      @syncUsers
      @updateSyncable
      @updateSunc
      @updateCounts
      callback
    ]

    doIt = ->
      doNow = todoList.shift()
      doNow => doIt()

    doIt()

  # send tablet user docs to the server
  syncUsers: ( callback ) ->
    tabletUsers = new TabletUsers
    tabletUsers.fetch
      error: -> callback()
      success: ->
        docIds = tabletUsers.pluck "_id"
        $.couch.replicate Tangerine.db_name, Tangerine.settings.urlDB("group"),
          {
            success : ->
              callback()
            error: ->
              callback()
          },
            doc_ids : docIds

  # Counts how many trips are on the tablet from this user and all users previous users
  # removes any trips that are in the incomplete list
  updateSyncable: ( callback ) =>
    Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
      keys    : [Tangerine.user.name()].concat(Tangerine.user.getArray('previousUsers'))
      success : ( response ) =>

        @syncable = _( _( response.rows ).pluck( "value" ) ).uniq()
        # filter out incomplete trips
        if @incompleteTrips.length isnt 0
          @syncable = @syncable.filter((el) => !~@incompleteTrips.indexOf(el))

        callback()

  # get the log of what trips have been synced already
  # if the log doesn't exist yet, make it exist
  updateSunc: ( callback ) =>
    @log.fetch
      error: => @log.save null, success: => callback()
      success: -> callback()

  # update our counts
  updateCounts: ( callback ) =>
    @sunc = @log.getTrips()
    @toSync = @syncable.length - @sunc.length
    callback()


  upload: =>

    @update =>

      tempTrips = _(@syncable).clone()

      doTrip = =>

        currentTrip = tempTrips.shift()
        return unless currentTrip?

        Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
          key     : currentTrip
          success : ( response ) =>
            docIds = _(response.rows).pluck("id")

            $.couch.replicate Tangerine.db_name, Tangerine.settings.urlDB("group"),
            {
              success : =>
                @sunc.push currentTrip
                @sunc = _.uniq(@sunc)
                @log.setTrips @sunc
                @log.save null,
                  success: =>
                    @update =>
                      @render()
                      doTrip()
              error: ->
                Utils.sticky "Upload error. Please try again."
            },
              doc_ids : docIds

      doTrip()



  render: ( statusMessage = '' ) =>

    @$el.html "<h1>Sync manager</h1>
    <section>
      <h2>Results</h2>
      <table class='class_table'>
        <tr>
          <th>Synced results</th><td>#{@sunc.length}</td>
        </tr>
        <tr>
          <th>Left to sync</th><td>#{@toSync}</td>
        </tr>
        <tr>
          <td colspan='2'><button class='upload command'>Upload</button></td>
        </tr>
      </table>
    </section>
    <section>
      <h2>Server results</h2>
      <table id='sync-old-progress'></table>
      <button class='sync-old command'>Sync</button>
    </section>
    "


    return

    @messages.unshift statusMessage
    @messages.pop() if @messages.length > 3
    @$el.html "<small>#{@messages.join("<br>")}</small>"
    @trigger "rendered"

###
class SyncManager extends Backbone.Model

  url : "log"

  initialize: ( options = {} ) =>

    @set "_id" : "SyncManagerLog"

    @db   = options.db
    @ddoc = options.ddoc
  
    @bulkDocs = Tangerine.settings.urlGroupBulkDocs()

    @interval = setInterval @tick, 10e3

  onClose: => clearInterval @interval

  tick: =>
    return unless @go and Tangerine.user.name() isnt null


  update: (callback) =>
    @trigger "status", "Updating"
    @fetchSunc =>
      @fetchSyncable =>
        callback?()

  fetchSunc: (callback) =>
    @fetch 
      error:   => @save null, success: => callback?()
      success: => callback?()

  fetchSyncable: (callback) =>
    @trigger "status", "Finding syncable documents"
    @db.view "#{@ddoc}/tripsAndUsers",
      key     : Tangerine.user.name()
      success : ( response ) =>
        @trigger "status", "found #{response.rows.length}"
        docIds = _(response.rows).pluck("id")

    return

    @db.view "#{@ddoc}/byCollection",
      keys    : ["result"]
      success : ( response ) =>
        @syncable = {}
        for row in response.rows
          @syncable[row.value._id] = row._rev
        callback?()

  online: ( go ) ->
    @go   = go
    @noGo = not go

  syncTrip: ( options = {} ) =>
    console.log "triggering update que visit data"
    @trigger "status", "Queueing visit data"

    tripId = options.tripId
    @db.view "#{@ddoc}/tripsAndUsers",
      keys    : Tangerine.user.name()
      success : ( response ) ->

        @trigger "status", "found #{response.rows.length}"

        docIds = _(response.rows).pluck("id")

        #@.couch.replicate Tangerine.db_name, Tangerine.settings.urlDB("group"), {},
        #  doc_ids : docIds
        #  success : ->



  withTrips: ( callback ) =>
    @db.view "#{@ddoc}/tripsAndUsers",
      keys    : Tangerine.user.name()
      success : ( response ) ->
        trips = []
        for row in response.rows
          trips.push row.value unless row.value in results

        @trips = trips

        callback()

  trySync: ->

    $.ajax 
      type : "post"
      url  : @bulkDocs
      data : JSON.stringify(_(@syncable).keys())
      success: ( response ) ->

        if go
          toSync = @log
###
