# this object forces itself to be a singleton
class Log extends Backbone.Model

  url: "log"

  initialize: ->

    @app = true
    @ensure()

  #
  # Log using these three functions
  #

  # larger application functions
  app: ( code = "", details = "" ) ->

    @ensure =>
      Tangerine.log.add
        type      : "app"
        "code"    : code
        "details" : details


  # communications with databases
  db: ( code = "", details = "" ) ->
    @ensure =>
      Tangerine.log.add
        type      : "db"
        "code"    : code
        "details" : details


  # specific UI interactions
  ui: ( code = "", details = "" ) ->
    @ensure =>
      Tangerine.log.add
        type      : "ui"
        "code"    : code
        "details" : details


  # errors, handled or otherwise
  err: ( code = "", details = "" ) ->
    @ensure =>
      Tangerine.log.add
        type      : "err"
        "code"    : code
        "details" : details


  # forces singularity, then saves
  ensure: ( callback={} ) ->
    # I have a name that changes every hour
    desiredId = @calcFileName()

    # do we already have a log going?
    if not Tangerine.log?
      # NO, no log yet. See if one exists on the server
      Tangerine.log = @
      Tangerine.log.set "_id" : desiredId
      Tangerine.log.fetch
        success: (model, response, options) =>
          # it was there, we updated ourselves, time to save
          callback?()
        error: (model, xhr, options )->
          # it wasna't there, let's start with this one
          callback?()
    else
      # YES, check to see if it's current
      if Tangerine.log.id == desiredId
        # YES, already existing log is current
        callback?()
      else
        # NO, it's old, make a new one
        Tangerine.log = @
        # Now it's current
        callback?()

  # requires that THIS, @, is up to date. 
  # has a side effect, it saves
  add: ( logEvent ) ->

    return unless logEvent?

    if not @has("time_stamp") or not @has("user")
      @set
        time_stamp : (new Date()).getTime()
        user       : Tangerine.user.get "name"

    logEvents = @get("logEvents")
    logEvents.push logEvent
    @set "logEvents", logEvents
    @save()

  calcFileName: ->
    d = new Date()
    user = if Tangerine.user?.get("name")? then Tangerine.user.get("name") else "not-signed-in"
    return hex_sha1 "#{user}_#{d.getFullYear()}-#{d.getMonth()}-#{d.getDate()}"

class BDLog extends Log
  initialize: ( options ) ->
    logEvent = options.logEvent
    logEvent.type = "db"

class UILog extends Log
  initialize: ( options ) ->
    logEvent = options.logEvent
    logEvent.type = "ui"

class AppLog extends Log
  initialize: ( options ) ->
    logEvent = options.logEvent
    logEvent.type = "app"


class Logs extends Backbone.Collection
  
  url: "log"
  model: Log
  comparator: (model) -> return model.get "time_stamp"


class LogView extends Backbone.View

  initialize: ->
    @allLogs = new Logs
    @allLogs.fetch
      success: (collection) ->
        @logs = collection.where
          user : Tangerine.user.name

  render: ->
    html = "<table><th><td>time</td><td>type</td><td>details</td></th>"
    
    for log in @logs
      html += "<tr><td>#{log.get("timestamp")}</td><td>#{log.get("type")}</td><td>#{log.get("details")}</td></tr>"
    html += "</table>"
    @$el.html html
    @trigger "rendered"
