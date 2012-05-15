class Questions extends Backbone.Collection

  model : Question
  url   : "question"

  comparator: (subtest) ->
    subtest.get "order"
  