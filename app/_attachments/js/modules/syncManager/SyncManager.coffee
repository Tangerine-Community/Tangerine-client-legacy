class SyncManager extends Backbone.Model

  url : "log"

  initialize: ->
    @set "_id" : "SyncManagerLog"

class SyncManagerView extends Backbone.View

  className : "SyncManagerView"

  events:
    'click .upload'   : 'upload'
    'click .sync-old' : 'syncOldSetup'

  RESULT_CHUNK_SIZE : 50

  syncOldSetup: ->

    @updateSyncOldProgress message: "Starting"
    $.ajax
      url: Tangerine.settings.urlSession "group"
      dataType: "jsonp"
      success: (response) =>
        unless response.userCtx.name is "uploader-"+Tangerine.settings.get("groupName")
          alert "Logging in to server. Please sync again."
          Tangerine.user.ghostLogin "uploader-"+Tangerine.settings.get("groupName"), Tangerine.settings.get("upPass")
          return
        @updateSyncOldProgress message: "Fetching result ids"

        $.ajax
          url: Tangerine.settings.urlView("group", "tripsAndUsers")
          dataType: "jsonp"
          data:
            keys:
              JSON.stringify([Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers")))
          error: =>
            alert "Error syncing"
            @updateSyncOldProgress message: "Error fetching result ids"
          success: (data) =>

            resultIds = data.rows.map (el) -> el.id

            @updateSyncOldProgress message: "Building replication job"
            @resultChunks = []

            tripCount = 0
            tempResults = []

            for index in [0..resultIds.length] by @RESULT_CHUNK_SIZE
              @resultChunks.push resultIds.slice( index, index + @RESULT_CHUNK_SIZE )

            @resultChunkCount = @resultChunks.length

            console.log @resultChunks

            @syncOldReplicate()

  syncOldReplicate: ->

    syncError = false

    doOne = =>

      percentageDone = ((@resultChunkCount - @resultChunks.length) / @resultChunkCount) * 100

      @updateSyncOldProgress percentage: percentageDone

      if @resultChunks.length is 0

        Utils.sticky "There was an error during syncing, please try again." if syncError

      else

        docIds = @resultChunks.pop()

        $.couch.replicate Tangerine.settings.urlDB("group"), Tangerine.db_name,
          {
            success : ->
              doOne()
            error: ->
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
    @userLogKey = "sunc-#{Tangerine.user.name()}"
    @messages = []
    @sunc = []
    @toSync = 0
    @update => @render()



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



  updateSyncable: (callback) =>
    Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
      key     : Tangerine.user.name()
      success : ( response ) =>
        @syncable = _( _( response.rows ).pluck( "value" ) ).uniq()
        callback()

  updateSunc: ( callback ) =>
    @log.fetch
      error   : => @log.save null, success: => callback()
      success : => callback()

  updateCounts: ( callback ) =>
    @sunc = @log.getArray(@userLogKey)
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
                saveObject = {}
                saveObject[@userLogKey] = @sunc
                @log.save saveObject,
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
      <table>
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
