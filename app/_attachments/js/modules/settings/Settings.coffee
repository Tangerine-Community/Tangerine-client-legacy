# handles settings that are group specific
class Settings extends Backbone.Model

  url : "settings"

  initialize: ->

    @config = Tangerine.config
    @on "all", => @update()


  update: =>
    groupHost = @get "groupHost"
    groupName = @get "groupName"
    groupDDoc = @get "groupDDoc"

    @upUser = "uploader-#{groupName}"
    @upPass = @get "upPass"

    update     = @config.get "update"

    trunk      = @config.get "trunk"
    local      = @config.get "local"
    port       = @config.get "port"

    designDoc  = @config.get "designDoc"

    prefix     = @config.get "groupDBPrefix"

    subnetBase = @config.get("subnet").base


    if Tangerine.settings.get("context") == "mobile"
      splitGroup = groupHost.split("://")
      groupHost = "#{splitGroup[0]}://#{@upUser}:#{@upPass}@#{splitGroup[1]}"

    @location =
      local:
        url : "#{local.host}:#{port}/"
        db  : "/#{local.dbName}/"
      trunk:
        url   : "http://#{trunk.host}:#{port}/"
        db    : "http://#{trunk.host}:#{port}/#{trunk.dbName}/"
      group:
        url   : "#{groupHost}:#{port}/"
        db    : "#{groupHost}:#{port}/#{prefix}#{groupName}/"
      update:
        url   : "http://#{update.login}@#{update.host}:#{port}/"
        db    : "http://#{update.login}@#{update.host}:#{port}/#{update.dbName}/"
      subnet : 
        url : ("http://#{subnetBase}.#{x}:#{port}/"                 for x in [0..255])
        db  : ("http://#{subnetBase}.#{x}:#{port}/#{local.dbName}/" for x in [0..255])
      satellite : 
        url : ("#{subnetBase}.#{x}:#{port}/"                       for x in [0..255])
        db  : ("#{subnetBase}.#{x}:#{port}/#{prefix}#{groupName}/" for x in [0..255])

    @couch = 
      view  : "_design/#{designDoc}/_view/"
      show  : "_design/#{designDoc}/_show/"
      list  : "_design/#{designDoc}/_list/"
      index : "_design/#{designDoc}/index.html"

    @groupCouch = 
      view  : "_design/#{groupDDoc}/_view/"
      show  : "_design/#{groupDDoc}/_show/"
      list  : "_design/#{groupDDoc}/_list/"
      index : "_design/#{groupDDoc}/index.html"


  urlIndex : ( groupName, hash = null ) ->
    groupHost = @get "groupHost"
    port      = @config.get "port"
    prefix    = if groupName != "tangerine" then @config.get "groupDBPrefix" else ""
    hash      = if hash? then "##{hash}" else ""
    return "#{groupHost}:#{port}/#{prefix}#{groupName}/#{@couch.index}#{hash}"

  
  urlHost  : ( location ) -> "#{@location[location].url}"
  
  urlDB    : ( location ) -> 
    if location == "local"
      "#{@location[location].db}".slice(1,-1)
    else
      "#{@location[location].db}".slice(0, -1)


  urlView  : ( location, view ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.view}#{view}"
    else
      "#{@location[location].db}#{@couch.view}#{view}"

  urlList  : ( location, list ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.list}#{list}"
    else
      "#{@location[location].db}#{@couch.list}#{list}"

  urlShow  : ( location, show ) ->
    if location == "group" || Tangerine.settings.get("context") == "server"
      "#{@location[location].db}#{@groupCouch.show}#{show}"
    else
      "#{@location[location].db}#{@couch.show}#{show}"
  
  # these two are a little weird. I feel like subnetAddress should be a class with properties IP, URL and index
  urlSubnet: ( ip ) -> 
    port   = @config.get "port"
    dbName = @config.get("local").dbName
    "http://#{ip}:#{port}/#{dbName}"
  subnetIP: ( index ) ->
    base = @config.get("subnet").base
    "#{base}.#{index}"





