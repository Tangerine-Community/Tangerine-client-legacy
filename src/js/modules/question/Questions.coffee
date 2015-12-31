class Questions extends Backbone.Collection

  initialize: () ->
    console.log("init Question.")
#    Assign the Deferred issued by fetch() as a property
#    @deferred = @fetch();

  model : Question
  url   : "question"

  comparator: (subtest) ->
    subtest.get "order"

  # call this after you load the collection you're going to be working with
  ensureOrder: ->
    test = (model.get("order") for model in @models).join("")
    ordered = (i for model,i in @models).join("")
    if test != ordered
      for subtest, i in @models
        subtest.set "order", i
        subtest.save()
