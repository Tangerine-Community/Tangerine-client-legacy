class Assessment extends Backbone.Model

  url: '/assessment'

  defaults:
    name     : "Untitled"
    group    : "default"
    author   : "admin"
    subtests : []

  initialize: (options) ->
    @set
      name     : options?.name     ? @defaults.name
      group    : options?.group    ? @defaults.group
      author   : options?.author   ? @defaults.author
      subtests : options?.subtests ? @defaults.subtests

  fetch: (options) ->
    super(options)
    subtests

  