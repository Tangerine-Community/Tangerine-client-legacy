class IdEditView extends Backbone.View

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  isValid: -> true

  save: -> # do nothing