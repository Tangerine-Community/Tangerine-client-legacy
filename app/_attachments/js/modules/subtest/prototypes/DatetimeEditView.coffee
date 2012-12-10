class DatetimeEditView extends Backbone.View

  initialize: ( options ) ->
    @model = options.model
    @parent = options.parent

  save: -> #do nothing
  
  isValid: -> true