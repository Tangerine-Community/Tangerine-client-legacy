class Settings extends Backbone.Model

  url: "settings"
  
  save: ->
    super(arguments)
    Tangerine.settings = @.attributes