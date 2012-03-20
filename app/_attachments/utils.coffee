class MapReduce

  @mapFields: (doc, req) ->

    #recursion!
    concatNodes: (parent,object) ->
      if object instanceof Array
        for value, index in object
          if typeof object != "string"
            concatNodes(parent+"."+index,value)
      else
        typeofobject = typeof object

        if typeofobject == "boolean" or typeofobject == "string" or typeofobject == "number"
          emitDoc = {
            studentID: doc.DateTime?["student-id"]
            fieldname: parent
          }
          if typeofobject == "boolean"
            emitDoc.result = if object then "true" else "false"
          if typeofobject == "string" or typeofobject == "number"
            emitDoc.result = object
          emit doc.assessment, emitDoc
        else
          for key,value of object
            prefix  = (if parent == "" then key else parent + "." + key)
            concatNodes(prefix,value)

    concatNodes("",doc) unless (doc.type? and doc.type is "replicationLog")

  @reduceFields: (keys, values, rereduce) ->
    rv = []
    for key,value of values
      fieldAndResult = {}
      fieldAndResult[value.fieldname] = value.result
      rv.push fieldAndResult
    return rv


  @mapByEnumerator: (doc,req) ->
    emit(doc.enumerator,null) if (doc.enumerator? and doc.timestamp?)

  @countByEnumerator: (keys,values,rereduce) ->
    keys.length

  # Not using this, so removed
  #MapReduce.mapByTimestamp = (doc,req) ->
  #  emit(doc.timestamp,doc) if (doc.enumerator? and doc.timestamp?)

  @mapReplicationLog: (doc,req) ->
    emit(doc.timestamp,doc) if doc.type == "replicationLog"


class Utils

  @resultViewsDesignDocument =
      "_id":"_design/results"
      "language":"javascript"
      "views":
        # Calling toString on a function gets the function definition as a string
        "byEnumerator":
          "map": MapReduce.mapByEnumerator.toString()
          "reduce": MapReduce.countByEnumerator.toString()
        "replicationLog":
          "map": MapReduce.mapReplicationLog.toString()

  @createResultsDatabase: (databaseName) ->
    console.log "trying to create a database"
    $('#message').append "<br/>Logging in as administrator"
    @sudo
      success: ->
        $('#message').append "<br/>Creating database [#{databaseName}]"
        $.couch.db(databaseName).create()

  @createResultViews: (databaseName) ->
    console.log "trying to create result views"
    @sudo
      success: ->
        $('#message').append "<br/>Creating result views in [#{databaseName}]"
        console.log "Good, created design views"
      error: (a,b,c) =>
        console.log ["error",a, b, c]
    @createDesignDocumentViews(databaseName, @resultViewsDesignDocument)

  @createDesignDocumentViews: (databaseName,designDocument) ->
    $.couch.db(databaseName).openDoc designDocument["_id"],
      success: (doc) ->
        designDocument._rev = doc._rev
        $.couch.db(databaseName).saveDoc designDocument,
          success: ->
            $('#message').append "<br/>Views updated for [#{databaseName}]"
      error: ->
        $.couch.db(databaseName).saveDoc designDocument,
          success: ->
            $('#message').append "<br/>Views created for [#{databaseName}]"

  @sudo: (options) ->
    console.log "Logging in..."
    credentials = 
      name: Tangerine.config.user_with_database_create_permission,
      password: Tangerine.config.password_with_database_create_permission
    options = _.extend(options, credentials);
    console.log "login options:"
    console.log options
    $.couch.login options

