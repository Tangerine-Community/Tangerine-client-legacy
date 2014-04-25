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
    $("#content").on("change", "input", @update)

    L.Icon.Default.imagePath = 'images'
    map = new L.Map('map')
    osm = new L.TileLayer 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 1
      maxZoom: 12
      attribution: 'Map data © OpenStreetMap contributors'

    map.addLayer(osm)

    map.setView(new L.LatLng(0, 35),6)
    baseLayers = ['OpenStreetMap.Mapnik', 'Stamen.Watercolor']
    layerControl = L.control.layers.provided(baseLayers).addTo(map)
    markers = L.markerClusterGroup()

    markers.on 'click', (event) ->
      $.ajax
#        url: "/#{Tangerine.db_name}/_design/#{Tangerine.design_doc}/_view/tutorTrips?key=#{event.layer.feature.properties["Trip Id"]}"
        url: "/#{Tangerine.db_name}/_design/#{Tangerine.design_doc}/_view/spirtRotut?key=\"#{event.layer.feature.properties["Trip Id"]}\""
        dataType: "json"
        error: (error) -> console.error JSON.stringify(error)
        success: (result) ->
          console.log result
          data = result.rows[0].value
          $(".leaflet-popup-content").html "
          School: #{data.school}
          User: #{data.user},
          Subject: #{data.subject},
          #{
            if data.itemsPerMinute?.length > 0
              "Items Per Minute: #{data.itemsPerMinute},"
            else ""
          }
          Start Time: #{event.layer.feature.properties["Start Time"]},
          Duration: #{moment(data.maxTime).diff(data.minTime, "minutes")} min
          "
          # Other items available
          #Class: #{data.class}
          #Zone: #{data.zone}
          #County: #{data.county}


    $.ajax
      url: "/#{Tangerine.db_name}/_design/#{Tangerine.design_doc}/_list/geojson/locationsByTripId?startkey=#{moment(@startTime).valueOf()}&endkey=#{moment(@endTime).valueOf()}"
      dataType: "json"
      error: (error) -> console.error JSON.stringify(error)
      success: (result) ->
        geoJsonLayer = L.geoJson result,
          onEachFeature: (feature, layer) ->
            layer.bindPopup(JSON.stringify feature.properties)
        
        markers.addLayer(geoJsonLayer)
        map.addLayer(markers)
#      map.fitBounds(markers.getBounds())

      @trigger "rendered"
