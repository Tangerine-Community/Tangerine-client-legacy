(head, req) ->
  provides 'json', ->
    results = {
      type: "FeatureCollection",
      features: []
    }
    while row = getRow()
      results.features.push row.value

    send(JSON.stringify(results))
