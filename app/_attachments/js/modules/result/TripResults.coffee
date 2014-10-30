class TripResultCollection extends Backbone.Collection

  url   : "result"
  model : TripResult

  fetch: ( options = {} ) =>

    throw "Please provide the name of a view that supplies result _ids." unless options.resultView?
    throw "Please provide a query key for the view." unless options.queryKey?

    resultView = options.resultView
    queryKey   = options.queryKey
    reduce     = options['reduce'] || false

    Tangerine.$db.view "#{Tangerine.design_doc}/#{resultView}",
      key     : queryKey
      reduce  : reduce
      success : (response) =>

        resultIds = response.rows.filter( (row) ->
          row.value != "assessment" && row.value != "klass"
        ).map (result) -> result.id


        resultsByTripId = _(response.rows.filter( (row) ->
          row.value != "assessment" && row.value != "klass"
        ).map (result) -> {tripId:result.value,docId:result.id}).indexBy("tripId")

        tripIdByResultId = _(response.rows.filter( (row) ->
          row.value != "assessment" && row.value != "klass"
        ).map (result) -> {tripId:result.value,docId:result.id}).indexBy("docId")

        Tangerine.$db.view "#{Tangerine.design_doc}/csvRows",
          keys : resultIds
          success : (csvRows) =>
            trips = _(csvRows.rows.map (result) -> {cells:result.value,docId:result.id, tripId:tripIdByResultId[result.id][0].tripId}).indexBy("tripId")
            tripModels = []

            for tripId, tripResults of trips
              allCells = []
              attributes = {}

              for result in tripResults

                allCells = allCells.concat result.cells
                for cell in result.cells
                  tryCount = 1
                  tryKey   = cell.key
                  tryValue = cell.value
                  suffix   = ''

                  while true
                    if attributes[tryKey]?
                      tryKey = cell.key + "_#{tryCount}"
                      tryCount++

                    else
                      attributes[tryKey] = tryValue
                      break

              attributes.tripId  = tripId
              attributes._id  = tripId
              attributes.rawData = allCells
              @add new TripResult attributes

            options.success()
