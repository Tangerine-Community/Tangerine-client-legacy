class Assessments extends Backbone.Collection
  model: Assessment
  url: '/assessment'

  initialize: (options) ->
    if options?.group then @group = options.group
  