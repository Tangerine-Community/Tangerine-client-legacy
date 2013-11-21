class Critiques extends Backbone.ChildCollection

  model: Critique

  comparator: (a, b) ->
    a.get("order") - b.get("order")
