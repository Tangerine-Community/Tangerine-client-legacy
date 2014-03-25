class MapView extends Backbone.View

  className : "MapView"

  events:
    "change [name=startTime]": "update"
    "change [name=endTime]": "update"

  update: =>
    @options =
      startTime: $("[name=startTime]").val()
      endTime: $("[name=endTime]").val()

    return if moment(@options.startTime).valueOf() > moment(@options.endTime).valueOf()

    urlOptions = _(@options).map (value,option) ->
      "/#{option}/#{value}"
    .join("")

    Tangerine.router.navigate("map#{urlOptions}", false)
    $("#results").empty()
    @render()

  render: =>
    options = @options
    @startTime = options.startTime
    @endTime = options.endTime

    $("#content").html "
      Start Time:
      <input name='startTime' style='width:auto' type='text' value='#{@startTime}'>
      End Time: 
      <input name='endTime' style='width:auto' type='text' value='#{@endTime}'>
      <br/>
      <br/>
    
      <div id='map'></div>
    
    "
    $("#map").css("height",window.innerHeight)

    L.Icon.Default.imagePath = 'images'
    map = new L.Map('map')
    osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    osm = new L.TileLayer osmUrl,
      minZoom: 1
      maxZoom: 12
      attribution: 'Map data © OpenStreetMap contributors'

    map.setView(new L.LatLng(0, 35),6)
    baseLayers = ['OpenStreetMap.Mapnik', 'Stamen.Watercolor']
    layerControl = L.control.layers.provided(baseLayers).addTo(map)
    markers = L.markerClusterGroup()

    $.ajax
      url: "/#{Tangerine.db_name}/_design/#{Tangerine.design_doc}/_list/geojson/locationsByTripId?startKey=#{moment(@startTime).valueOf()}&endKey=#{moment(@endTime).valueOf()}"
      dataType: "json"
      error: (error) -> console.error JSON.stringify(error)
      success: (result) ->
        geoJsonLayer = L.geoJson result,
          onEachFeature: (feature, layer) ->
            layer.bindPopup(feature.properties.address)
        
        markers.addLayer(geoJsonLayer)
        map.addLayer(markers)
#      map.fitBounds(markers.getBounds())

      @trigger "rendered"
