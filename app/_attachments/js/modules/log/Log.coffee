# this object forces itself to be a singleton
class Log extends Backbone.Model

  url: "log"

  initialize: ->
    @ensure() if @get("_id") != @calcName()
    d = new Date()
    @set 
      "year"  : d.getFullYear()
      "month" : d.getMonth()
      "date"  : d.getDate()
      "user"  : Tangerine.user.name

  ensure: (callback) ->
    @set "_id", @calcName()

    # continue old log if possible
    @fetch
      success: (model, response, options) =>
        callback?()
      error: (model, xhr, options ) =>
        @save
          success:=>
            callback?()

  #
  # Log using these four functions
  #

  # larger application functions
  app: ( code = "", details = "" ) ->
    if ~Tangerine.settings.get("log").indexOf("app")
      Tangerine.log.add
        "type"      : "app"
        "code"      : code
        "details"   : details
        "timestamp" : (new Date()).getTime()

  # communications with databases
  db: ( code = "", details = "" ) ->
    if ~Tangerine.settings.get("log").indexOf("db")
      Tangerine.log.add
        "type"      : "db"
        "code"      : code
        "details"   : details
        "timestamp" : (new Date()).getTime()

  # specific UI interactions
  ui: ( code = "", details = "" ) ->
    if ~Tangerine.settings.get("log").indexOf("ui")
      Tangerine.log.add
        "type"      : "ui"
        "code"      : code
        "details"   : details
        "timestamp" : (new Date()).getTime()

  # errors, handled or otherwise
  err: ( code = "", details = "" ) ->
    if ~Tangerine.settings.get("log").indexOf("err")
      Tangerine.log.add
        "type"      : "err"
        "code"      : code
        "details"   : details
        "timestamp" : (new Date()).getTime()

  # requires that THIS, @, is up to date. 
  # has a side effect, it saves
  add: ( logEvent ) ->
    logEvents = @getArray("logEvents")
    logEvents.push logEvent
    @set "logEvents", logEvents
    @ensure =>
      Tangerine.log.save()

  calcName: ->
    d = new Date()
    user = if Tangerine.user.name? then Tangerine.user.name else "not-signed-in"
    return hex_sha1 "#{user}_#{d.getFullYear()}-#{d.getMonth()}-#{d.getDate()}"

class Logs extends Backbone.Collection
  url: "log"
  model: Log
  comparator: (model) -> return model.get "timestamp"

class LogView extends Backbone.View

  initialize: (options) ->
    @logs = options.logs.models

  render: ->

    html = ""
    for log in @logs
      for k, v of log.attributes
        continue if k in ["_rev", "_id", "collection", "hash", "updated", "logEvents"] 
        html += "<b>#{k}</b> #{v}<br><br>"
      for oneEvent in log.attributes.logEvents
        for k, v of oneEvent
          if k == "timestamp" then v = (new Date(parseInt(v))).toString()
          html += "<b>#{k}</b> #{v}<br>"
        html += "<br>"

    @$el.html html
    
    @trigger "rendered"
