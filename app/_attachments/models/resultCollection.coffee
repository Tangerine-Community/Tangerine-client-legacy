class ResultCollection extends Backbone.Collection

  model: Result

  url: '/result'

  replicate: (target,options) ->
    target = target + "/" + @databaseName
    $("#message").html "Syncing to #{target}"
    replicationLogEntry = new ReplicationLogEntry
      timestamp: new Date().getTime()
      source: @assessmentId
      target: target
    replicationLogEntry.save()

    # TODO TEST that this actually works! (filtered replication!)
    $.couch.replicate Tangerine.databaseName, target,
      filter: Tangerine.design_doc_name + "/resultFilter"
      assessment: @assessmentId
      success: ->
        options.success()
      error: (res) ->
        $("#message").html "Error: #{res}"

  lastCloudReplication: (options) ->
    replicationLogEntryCollection  = new ReplicationLogEntryCollection()
    replicationLogEntryCollection.fetch
      success: ->
        mostRecentReplicationLogEntry = @first() # just for initialization
        replicationLogEntryCollection.each (replicationLogEntry) ->
          return unless replicationLogEntry.source is @assessmentId
          mostRecentReplicationLogEntry = replicationLogEntry if replicationLogEntry.timestamp > mostRecentReplicationLogEntry.timestamp
        options.success(mostRecentReplicationLogEntry)
