class Assessment extends Backbone.Model

  url: 'assessment'

  defaults:
    name       : "Untitled"
    group      : "default"
    
  initialize: (options={}) ->
    # this collection doesn't get saved
    # changes update the subtest view, it keeps order
    @subtests = new Subtests

  # Hijacked success() for later
  # fetchs all subtests for the assessment
  fetch: (options) ->
    options.name = Utils.cleanURL options.name if options.name?
    allAssessments = new Assessments  
    allAssessments.fetch
      success: (collection) =>
        results = collection.where
          "name"  : options.name

        for assessment in results
          if Tangerine.context.server
            if (~Tangerine.user.groups.indexOf(assessment.get("group")) )
              @constructor assessment.attributes
          else
            @constructor assessment.attributes
            
        allSubtests = new Subtests
        allSubtests.fetch
          success: (collection) =>
            @subtests = new Subtests(collection.where { 'assessmentId' : @id } )
            @subtests.maintainOrder()
            options.success @

  # this is for the subtest edit back button, probably a better way
  superFetch: (options) =>
    # point of failure: this could break if coffeescript changes it's conventions
    Assessment.__super__.fetch.call @,
      success: (model) =>
        allSubtests = new Subtests
        allSubtests.fetch
          success: (collection) =>
            @subtests = new Subtests(collection.where { 'assessmentId' : @id } )
            @subtests.maintainOrder()
            options.success @
  
  duplicate: (assessmentAttributes, subtestAttributes, questionAttributes, callback) ->
    originalId = @id
    newModel = @clone()

    newModel.set assessmentAttributes

    ##newModel.set "group", Tangerine.user.groups[0]
    newModel.set "_id", Utils.guid()

    newModel.save()

    questions = new Questions
    questions.fetch
      success: ( questions ) =>
        filteredQuestions = questions.where { "assessmentId" : originalId }
      
        subtests = new Subtests
        subtests.fetch
          success: ( subtests ) =>
        
            filteredSubtests = subtests.where { "assessmentId" : originalId }
            subtestIdMap = {}
            newSubtests = []
            # link new subtests to new assessment
            for model, i in filteredSubtests
              newSubtest = model.clone()
              newSubtest.set "assessmentId", newModel.id
              newSubtestId = Utils.guid()
              subtestIdMap[newSubtest.get("_id")] = newSubtestId
              newSubtest.set "_id", newSubtestId
              newSubtests.push newSubtest

            # update the links to other subtests
            for model, i in newSubtests
              gridId = model.get( "gridLinkId" )
              if ( gridId || "" ) != ""
                model.set "gridLinkId", subtestIdMap[gridId]
              model.save()

            # link questions to new subtest
            for question in filteredQuestions
              newQuestion = question.clone()
              oldId = newQuestion.get "subtestId"
              newQuestion.set "assessmentId", newModel.id
              newQuestion.set "_id", Utils.guid() 
              newQuestion.set "subtestId", subtestIdMap[oldId]
              newQuestion.save()

            callback()



