class Log extends Backbone.Model

  url: "log"

  #
  # Log using these four functions
  #

  # larger application functions
  app: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("app")
    @add
      "type"      : "app"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # communications with databases
  db: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("db")
    @add
      "type"      : "db"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # specific UI interactions
  ui: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return if !~Tangerine.settings.get("log").indexOf("ui")
    @add
      "type"      : "ui"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # errors, handled or otherwise
  err: ( code = "", details = "" ) ->
    return if Tangerine.settings.get("context") == "server"
    return !~Tangerine.settings.get("log").indexOf("err")
    @add
      "type"      : "err"
      "code"      : code
      "details"   : details
      "timestamp" : (new Date()).getTime()

  # requires that THIS, @, is up to date. 
  # has a side effect, it saves
  add: ( logEvent ) ->
    d = new Date()
    name = "not-signed-in"
    name = Tangerine.user.name unless not Tangerine.user.name?
    @unset "_rev"
    @save 
      "_id"       : @calcName()
      "year"      : d.getFullYear()
      "month"     : d.getMonth()
      "date"      : d.getDate()
      "timestamp" : d.getTime()
      "user"      : name
      "event"     : logEvent

  calcName: ->
    d = new Date()
    user = "not-signed-in"
    user = Tangerine.user.name unless not Tangerine.user.name?
    return hex_sha1 "#{user}_#{d.getTime()}"

class Logs extends Backbone.Collection
  url: "log"
  model: Log
  comparator: (model) -> return model.get("timestamp")

class LogView extends Backbone.View

  className : "LogView"

  initialize: (options) ->
    @logs = options.logs

  render: =>
    html = "
      <h1>Logs</h1>
      <table><tr>
        <th>User</th>
        <th>Code</th>
        <th>Details</th>
        <th>Time</th>
      </tr>
      "


    @logs.each (log) =>
      return if not log.get("event")? 
      ev = log.get "event"
      name = log.get("user")
      code = ev.code
      details = ev.details
      time = (new Date(parseInt(ev.timestamp))).toString()

      html += "
      <tr>
        <td>#{name}</td>
        <td>#{code}</td>
        <td>#{details}</td>
        <td>#{time}</td>
      </tr>
      "

    @$el.html html
    
    @trigger "rendered"
