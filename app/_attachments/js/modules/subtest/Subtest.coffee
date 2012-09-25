class Subtest extends Backbone.Model

  url: "subtest"

  initialize: (options) ->
    @templates = Tangerine.templates.prototypeTemplates

  loadPrototypeTemplate: (prototype) ->
    for key, value of @templates[prototype]
      @set key, value
    @save()
      
  copyTo: (assessmentId) ->
    newSubtest = @clone()
    newId = Utils.guid()

    if newSubtest.has("surveyAttributes")
      newSubtest.set "surveyAttributes",
        "_id" : newId

    newSubtest.save
      "_id"          : newId
      "assessmentId" : assessmentId
      "order"        : 0
      "gridLinkId"   : ""


    questions = new Questions
    questions.fetch
      key: @.get("assessmentId")
      success: (questionCollection) =>
        subtestQuestions = questionCollection.where "subtestId" : @id
        for question in subtestQuestions
          newQuestion = question.clone()
          newQuestion.save
            "assessmentId" : assessmentId
            "_id"          : Utils.guid() 
            "subtestId"    : newId

        Utils.midAlert "Subtest copied"
