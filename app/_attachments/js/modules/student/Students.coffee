class Students extends Backbone.Collection

  model: Student
  url: "student"

  comparator: ->
    @get("name")
