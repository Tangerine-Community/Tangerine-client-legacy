class Assessment extends Backbone.Model

  url: 'assessment'

  initialize: ( options={} ) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests
    # @getResultCount()

  calcDKey: => @id.substr(-5, 5)

  verifyConnection: ( callbacks ) =>
    @timer = setTimeout callbacks.error, 20 * 1000
    $.ajax 
      url: Tangerine.settings.urlView("group", "byDKey")
      dataType: "jsonp"
      data: keys: ["testtest"]
      timeout: 5000
      success: =>
        clearTimeout @timer
        callbacks.success()

  getResultCount: =>
    $.ajax Tangerine.settings.urlView("local", "resultCount")
      type: "POST"
      dataType: "json"
      data: JSON.stringify(
        group       : true
        group_level : 1
        key         : @id
      )
      success: (data) =>
        @resultCount = if data.rows.length != 0 then data.rows[0].value else 0
        @trigger "resultCount"


  # Hijacked success() for later
  # fetchs all subtests for the assessment
  fetch: (options) =>
    oldSuccess = options.success
    options.success = (model) =>
        allSubtests = new Subtests
        allSubtests.fetch
          key: @id
          success: (collection) =>
            @subtests = collection
            @subtests.maintainOrder()
            oldSuccess? @
    Assessment.__super__.fetch.call @, options

  updateFromServer: ( dKey = @calcDKey(), group ) =>

    @lastDKey = dKey
    
    # split to handle multiple dkeys
    dKeys = dKey.replace(/[^a-f0-9]/g," ").split(/\s+/)

    @trigger "status", "import lookup"

    if Tangerine.settings.get("context") == "server"
      sourceDB = "group-" + group
      targetDB = Tangerine.settings.groupDB
    else
      sourceDB = Tangerine.settings.urlDB("group")
      targetDB = Tangerine.settings.urlDB("local")

    localDKey = 
      if Tangerine.settings.get("context") != "server"
        Tangerine.settings.urlView("local", "byDKey")
      else
        Tangerine.settings.location.group.db+Tangerine.settings.couch.view + "byDKey"

    sourceDKey =
      if Tangerine.settings.get("context") != "server"
        Tangerine.settings.urlView("group", "byDKey")
      else
        "/"+sourceDB+"/"+Tangerine.settings.couch.view + "byDKey"

    $.ajax 
      url: sourceDKey,
      type: "GET"
      dataType: "jsonp"
      data: keys: JSON.stringify(dKeys)
      error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
      success: (data) =>

        docsByDKey = {}
        docList = []

        for datum in data.rows
          docsByDKey[datum.key] = [] unless docsByDKey[datum.key]?
          docsByDKey[datum.key].push datum.id
          docList.push datum.id

        $.ajax 
          url: localDKey,
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: JSON.stringify(keys:dKeys)
          error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          success: (data) =>

            for datum in data.rows
              docsByDKey[datum.key] = [] unless docsByDKey[datum.key]?
              docsByDKey[datum.key].push datum.id
              docList.push datum.id

            @totalDocs = _(docList).uniq().length
            @doneDocs = 0

            getNext = =>
              keys = Object.keys(docsByDKey).sort()
              key  = keys.pop()
              docs = docsByDKey[key]
              delete docsByDKey[key]

              docs      = _.uniq docs

              @replication = $.couch.replicate( 
                sourceDB,
                targetDB,
                  success: (response) =>
                    @checkConflicts docs
                    @doneDocs += docs.length
                    @trigger "progress", @doneDocs, @totalDocs

                    if keys.length isnt 0 
                      if @cancelSync
                        @cancelSync = false
                        @trigger "complete", @doneDocs, @totalDocs
                      else
                        getNext() 
                    else
                      @trigger "complete", @doneDocs, @totalDocs
                  error: (a, b)      => 

                    @trigger "status", "import error", "#{a} #{b}"

                    if keys.length isnt 0 
                      if @cancelSync
                        @cancelSync = false
                        @trigger "complete", @doneDocs, @totalDocs
                      else
                        getNext() 

                    else
                      @trigger "complete", @doneDocs, @totalDocs

                ,
                  doc_ids: docs
              )


            getNext()


    false

  cancelReplication: ->

    @replication.success (resp) =>
      replicationId = resp.session_id
      console.log "cancelling this"
      console.log replicationId
      $.ajax 
        url  : "/_replicate"
        type : "POST"
        dataType : "json"
        contentType: "application/json"
        data : 
          replication_id : replicationId
          cancel: true
        success: =>
          console.log "cancelling complete"
          @trigger "complete", @doneDocs, @totalDocs

  # this is pretty strange, but it basically undeletes, tries to replicate again, and then deletes the conflicting (local) version as marked by the first time around.
  checkConflicts: (docList=[], options={}) =>

    @docs = {} unless docs?

    for doc in docList
      do (doc) =>
        Tangerine.$db.openDoc doc,
          open_revs : "all"
          conflicts : true
          error: ->
            console.log "error with #{doc}"
          success: (doc) =>
            if doc.length == 1
              doc = doc[0].ok # couch is weird
              if doc.deletedAt == "mobile"
                $.ajax
                  type: "PUT"
                  dataType: "json"
                  url: "http://localhost:5984/"+Tangerine.settings.urlDB("local") + "/" +doc._id
                  data: JSON.stringify( 
                    "_rev"      : doc._rev
                    "deletedAt" : doc.deletedAt
                    "_deleted"  : false
                  )
                  error: =>
                    #console.log "save new doc error"
                  complete: =>
                    @docs.checked = 0 unless @docs.checked?
                    @docs.checked++
                    if @docs.checked == docList.length
                      @docs.checked = 0
                      if not _.isEmpty @lastDKey
                        @updateFromServer @lastDKey
                        @lastDKey = ""
            else
              docs = doc
              for doc in docs
                doc = doc.ok
                do (doc, docs) =>
                  if doc.deletedAt == "mobile"
                    $.ajax
                      type: "PUT"
                      dataType: "json"
                      url: "http://localhost:5984/"+Tangerine.settings.urlDB("local") + "/" +doc._id
                      data: JSON.stringify( 
                        "_rev"      : doc._rev
                        "_deleted"  : true
                      )
                      error: =>
                        #console.log "Could not delete conflicting version"
                      complete: =>
                        @docs.checked = 0 unless @docs.checked?
                        @docs.checked++
                        if @docs.checked == docList.length
                          @docs.checked = 0
                          if not _.isEmpty @lastDKey
                            @updateFromServer @lastDKey
                            @lastDKey = ""


  updateFromTrunk: ( dKey = @calcDKey() ) =>

    # split to handle multiple dkeys
    dKeys = dKey.replace(/[^a-f0-9]/g," ").split(/\s+/)

    @trigger "status", "import lookup"
    $.ajax 
      url: Tangerine.settings.urlView("trunk", "byDKey")
      dataType: "json"
      contentType: "application/json"
      type: "GET"
      data: 
        keys : JSON.stringify(dKeys)
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id
        $.couch.replicate( 
          Tangerine.settings.trunkDB, 
          Tangerine.settings.groupDB,
            success:      => @trigger "status", "import success"
            error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          ,
            doc_ids: docList
        )

    false

  duplicate: ->

    questions = new Questions
    subtests  = new Subtests

    modelsToSave = []

    oldModel = @

    # general pattern: clone attributes, modify them, stamp them, put attributes in array

    $.extend(true, clonedAttributes = {}, @attributes)

    newId = Utils.guid()

    clonedAttributes._id          = newId
    clonedAttributes.name         = "Copy of #{clonedAttributes.name}"
    clonedAttributes.assessmentId = newId
    
    newModel = new Assessment(clonedAttributes)

    modelsToSave.push (newModel).stamp().attributes


    getQuestions = ->
      questions.fetch
        key: oldModel.id
        success: -> getSubtests()

    getSubtests = ->
      subtests.fetch
        key: oldModel.id
        success: -> processDocs()

    processDocs = ->

      subtestIdMap = {}

      # link new subtests to new assessment
      for subtest in subtests.models
        
        oldSubtestId = subtest.id
        newSubtestId = Utils.guid()

        subtestIdMap[oldSubtestId] = newSubtestId

        $.extend(true, newAttributes = {}, subtest.attributes)
        
        newAttributes._id          = newSubtestId
        newAttributes.assessmentId = newId

        modelsToSave.push (new Subtest(newAttributes)).stamp().attributes

      # update the links to other subtests
      for subtest in modelsToSave
        if subtest.gridLinkId? and subtest.gridLinkId != ""
          subtest.gridLinkId = subtestIdMap[subtest.gridLinkId]

      # link questions to new subtests
      for question in questions.models

        $.extend(true, newAttributes = {}, question.attributes)

        oldSubtestId = newAttributes.subtestId

        newAttributes._id          = Utils.guid() 
        newAttributes.subtestId    = subtestIdMap[oldSubtestId]
        newAttributes.assessmentId = newId

        modelsToSave.push (new Question(newAttributes)).stamp().attributes

      requestData = "docs" : modelsToSave

      $.ajax
        type : "POST"
        contentType : "application/json; charset=UTF-8"
        dataType : "json"
        url : Tangerine.settings.urlBulkDocs()
        data : JSON.stringify(requestData)
        success : (responses) => oldModel.trigger "new", newModel
        error : -> Utils.midAlert "Duplication error"

    # kick it off
    getQuestions()


  destroy: =>

    # get all docs that belong to this assesssment except results
    Tangerine.$db.view Tangerine.design_doc + "/revByAssessmentId",
      keys:[ @id ]
      success: (response) =>
        docs = []
        for row in response.rows
          # only absolutely necessary properties are sent back, _id, _rev, _deleted
          row.value["_deleted"] = true
          row.value["deletedAt"] = Tangerine.settings.get("context")
          docs.push row.value

        requestData = 
          "docs" : docs

        $.ajax
          type: "POST"
          contentType: "application/json; charset=UTF-8"
          dataType: "json"
          url: Tangerine.settings.urlBulkDocs()
          data: JSON.stringify(requestData)
          success: (responses) =>
            okCount = 0
            (okCount++ if resp.ok?) for resp in responses
            if okCount == responses.length
              @collection.remove @id
              @clear()
            else
              Utils.midAlert "Delete error."
          error: ->
            Utils.midAlert "Delete error."
      error: ->
        Utils.midAlert "Delete error."

  isActive: -> return not @isArchived()

  isArchived: ->
    archived = @get("archived")
    return archived == "true" or archived == true

