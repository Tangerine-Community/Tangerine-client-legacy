class Assessment extends Backbone.Model

  url: '/assessment'

  defaults:
    name   : "Untitled"
    group  : "default"
    author : "admin"

  initialize: ->
    @set
      name   : defaults.name
      group  : defaults.group
      author : defaults.author

  
  