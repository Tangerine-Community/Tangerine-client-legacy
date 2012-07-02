class Results extends Backbone.Collection

  url : "result"
  model : Result
  db:
    view: "resultsByAssessmentID"

  comparator: (model) ->
    model.get('timestamp') || 0
