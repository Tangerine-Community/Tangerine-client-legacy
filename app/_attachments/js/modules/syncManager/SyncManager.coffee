class SyncManager extends Backbone.Model

  url : "log"

  initialize: ->
    @set "_id" : "SyncManagerLog"

class SyncManagerView extends Backbone.View

  className : "SyncManagerView"

  events:
    'click .upload' : 'upload'

  initialize: () ->
    @log = new SyncManager
    @messages = []
    @sunc = []
    @toSync = 0
    @update => @render()

  update: ( callback ) ->
    todoList = [
      @updateSyncable
      @updateSunc
      @updateCounts
      callback
    ]

    doIt = ->
      doNow = todoList.shift()
      doNow => doIt()

    doIt()

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
    @sunc = @log.getArray("sunc")
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
                @log.save "sunc": @sunc,
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
    <table>
      <tr>
        <th>Synced results</th><td>#{@sunc.length}</td>
      </tr>
      <tr>
        <th>Left to sync</th><td>#{@toSync}</td>
      </tr>
    </table>
    <button class='upload command'>Upload</button>
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
