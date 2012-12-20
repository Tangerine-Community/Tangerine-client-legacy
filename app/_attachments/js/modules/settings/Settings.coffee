# handles settings that are group specific
class Settings extends Backbone.Model

  url : "settings"

  initialize: ->

    @config = Tangerine.config
    @on "all", => @update()


  update: =>

    groupHost = @get "groupHost"
    groupName = @get "groupName"

    local      = @config.get "local"
    port       = @config.get "port"
    designDoc  = @config.get "designDoc"
    prefix     = @config.get "groupDBPrefix"
    subnetBase = @config.get("subnet").base

    @location =
      local:
        url : "#{local.host}:#{port}/"
        db  : "/#{local.dbName}/"
      group:
        url : "#{groupHost}:#{port}/"
        db  : "#{groupHost}:#{port}/#{prefix}#{groupName}/"
      subnet : 
        url : ("http://#{subnetBase}.#{x}:#{port}/"                 for x in [0..255])
        db  : ("http://#{subnetBase}.#{x}:#{port}/#{local.dbName}/" for x in [0..255])
      satellite : 
        url : ("#{subnetBase}.#{x}:#{port}/"                       for x in [0..255])
        db  : ("#{subnetBase}.#{x}:#{port}/#{prefix}#{groupName}/" for x in [0..255])

    @couch = 
      view : "_design/#{designDoc}/_view/"
      show : "_design/#{designDoc}/_show/"
      list : "_design/#{designDoc}/_list/"

  urlHost: ( location )       -> "#{@location[location].url}"
  urlDB  : ( location )       -> "#{@location[location].db}"
  urlView: ( location, view ) -> "#{@location[location].db}#{@couch.view}#{view}"
  urlList: ( location, list ) -> "#{@location[location].db}#{@couch.show}#{list}"
  urlShow: ( location, show ) -> "#{@location[location].db}#{@couch.list}#{show}"

  # these two are a little weird. I feel like subnetAddress should be a class with properties IP, URL and index
  urlSubnet: ( ip ) -> 
    port   = @config.get "port"
    dbName = @config.get("local").dbName
    "http://#{ip}:#{port}/#{dbName}"
  subnetIP: ( index ) ->
    base = @config.get("subnet").base
    "#{base}.#{index}"





