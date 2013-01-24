# this object forces itself to be a singleton
class Log extends Backbone.Model

  url: "log"

  initialize: ->
    @ensure() if @get("_id") != @calcName()

  ensure: (callback) ->
    d = new Date()
    @set 
      "_id"   : @calcName()
      "year"  : d.getFullYear()
      "month" : d.getMonth()
      "date"  : d.getDate()
      "user"  : Tangerine.user.name

    @save null,
      success: =>
        callback?()
      error: =>
        @fetch
          success: =>
            @save
              succes: =>
                callback?()
          error: =>
            callback?()

  #
  # Log using these four functions
  #

  # larger application functions
  app: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("app")
    Tangerine.log.add
      "type"      : "app"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # communications with databases
  db: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("db")
    Tangerine.log.add
      "type"      : "db"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # specific UI interactions
  ui: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("ui")
    Tangerine.log.add
      "type"      : "ui"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # errors, handled or otherwise
  err: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return !~Tangerine.settings.get("log").indexOf("err")
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
      Tangerine.log.save
       

  calcName: ->
    d = new Date()
    user = if Tangerine.user.name? then Tangerine.user.name else "not-signed-in"
    return hex_sha1 "#{user}_#{d.getFullYear()}-#{d.getMonth()}-#{d.getDate()}"

class Logs extends Backbone.Collection
  url: "log"
  model: Log
  comparator: (model) -> return model.get "timestamp"

class LogView extends Backbone.View

  className : "LogView"

  initialize: (options) ->
    @logs = options.logs
    @logs.on "all", => @render()

  render: =>
    html = ""

    @logs.each (log) =>
      
      html += "<b>User</b> #{log.get("user")}<br><br>"

      html += "<table><tr>"
      for k, v of log.get("logEvents")[0]
        html += "<th>#{k}</th>"
      html += "</tr>"

      for oneEvent in log.get "logEvents"
        html += "<tr>"
        for k, v of oneEvent
          if k == "timestamp" then v = (new Date(parseInt(v))).toString()
          html += "<td>#{v}</td>"
        html += "</tr>"
      html += "</table>"

    @$el.html html
    
    @trigger "rendered"
