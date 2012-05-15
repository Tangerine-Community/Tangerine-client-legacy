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
    
    Assessment.__super__.fetch.call @,
      success: (model) =>
      allSubtests = new Subtests
      allSubtests.fetch
        success: (collection) =>
          @subtests = new Subtests(collection.where { 'assessmentId' : @id } )
          @subtests.maintainOrder()
          options.success @

