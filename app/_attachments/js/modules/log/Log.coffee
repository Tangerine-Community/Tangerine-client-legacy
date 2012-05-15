class Log extends Backbone.Model
  url: "log"
  defaults :
    type      : "none"
    event     : "none"
    timestamp : 0
    user      : "no one"
  
  initialize: (options) ->
    @set
      options   : options
      timestamp : (new Date()).getTime()
      user      : Tangerine.user.name
    @save()