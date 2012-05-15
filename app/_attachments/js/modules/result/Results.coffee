class Results extends Backbone.Collection

  url : "result"
  model : Result

  comparator: (model) ->
    model.get('timestamp') || 0