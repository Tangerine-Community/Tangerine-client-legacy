class Assessment extends Backbone.Model

  url: 'assessment'

  initialize: (options={}) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests
    @getResultCount()

  getResultCount: =>
    $.ajax "#{Tangerine.config.address.local.host}:#{Tangerine.config.address.port}/#{Tangerine.config.address.cloud.dbName}/_design/#{Tangerine.config.address.designDoc}/_view/resultCount",
      type: "GET"
      dataType: "json"
      data: 
        group       : true
        group_level : 1
        key         : JSON.stringify(@id)
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

  updateFromServer: ( dKey = @id.substr(-5, 5) ) =>

    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g," ").split(/\s+/))

    @trigger "status", "import lookup"
    $.ajax "#{Tangerine.config.address.cloud.host}/#{Tangerine.config.address.cloud.dbName}/_design/#{Tangerine.config.address.designDoc}/_view/byDKey",
      type: "POST"
      dataType: "jsonp"
      data: keys: dKeys
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id
        $.couch.replicate(
          "#{Tangerine.config.address.cloud.host}/#{Tangerine.config.address.cloud.dbName}",
          Tangerine.config.address.local.dbName,
            success: => 
              @trigger "status", "import success"
              try
                @fetch
                  success: => @trigger "update"
                  error: => console.log "error fetching after update"
              catch e
                console.log "error fetching after update"
                console.log e
            error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          ,
            doc_ids: docList
        )

    false

  duplicate: (assessmentAttributes, subtestAttributes, questionAttributes, callback) ->

    originalId = @id

    newModel = @clone()
    newModel.set assessmentAttributes
    newId = Utils.guid()

    newModel.save
      "_id"          : newId
      "assessmentId" : newId
    ,
      success: ->
        questions = new Questions
        questions.fetch
          key: @id
          success: ( questions ) =>
            subtests = new Subtests
            subtests.fetch
              key: originalId
              success: ( subtests ) =>
                filteredSubtests = subtests.models
                subtestIdMap = {}
                newSubtests = []
                # link new subtests to new assessment
                for model, i in filteredSubtests
                  newSubtest = model.clone()
                  newSubtest.set "assessmentId", newModel.id
                  newSubtestId = Utils.guid()
                  subtestIdMap[newSubtest.id] = newSubtestId
                  newSubtest.set "_id", newSubtestId
                  newSubtests.push newSubtest


                # update the links to other subtests
                for model, i in newSubtests
                  gridId = model.get( "gridLinkId" )
                  if ( gridId || "" ) != ""
                    model.set "gridLinkId", subtestIdMap[gridId]
                  model.save()

                newQuestions = []
                # link questions to new subtest
                for question in questions.models
                  newQuestion = question.clone()
                  oldId = newQuestion.get "subtestId"
                  newQuestion.set "assessmentId", newModel.id
                  newQuestion.set "_id", Utils.guid() 
                  newQuestion.set "subtestId", subtestIdMap[oldId]
                  newQuestions.push newQuestion
                  newQuestion.save()
                callback newModel

  destroy: ->

    # remove children
    assessmentId = @id
    subtests = new Subtests
    subtests.fetch
      key: assessmentId
      success: (collection) -> collection.pop().destroy() while collection.length != 0
    questions = new Questions
    questions.fetch
      key: @id
      success: (collection) -> collection.pop().destroy() while collection.length != 0

    # remove model
    super()

  isActive: -> return not @isArchived()

  isArchived: ->
    archived = @get("archived")
    return archived == "true" or archived == true

