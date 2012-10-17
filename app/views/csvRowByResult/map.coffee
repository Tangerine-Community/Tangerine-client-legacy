(doc) ->
  if doc.collection is "result"

    exportValueMap = {
      "correct" : 1
      "checked" : 1

      "incorrect" : 0
      "unchecked" : 0

      "missing"   : "."
      "not_asked" : "."
      
      "skipped"   : 999
    }

    metaKeys = [
      "enumerator"
      "start_time"
      "order_map"
    ]

    exportValue = (databaseValue) ->
      if exportValueMap[databaseValue]?
        return exportValueMap[databaseValue]
      else
        return databaseValue

    # returns an object {key: value}
    pair = (key, value) ->
      o = {}
      o[key] = value
      return o

    metaData = []
    # meta columns go first
    for metaKey in metaKeys
      metaData.push pair(metaKey, doc[metaKey]) if doc[metaKey]?

    # a little backwards compatibility
    metaData.push pair("start_time", if doc['starttime']? then doc['starttime']? else doc['start_time'])
    metaData.push pair("order_map",  if doc['order_map']? then doc['order_map'].join(",") else "no_record")

    # first "subtest" is always metadata
    bySubtest = [metaData]

    #
    # Subtest loop
    #
    datetimeCount = 0
    orderMap = if doc["order_map"]? then doc["order_map"] else [0..doc.subtestData.length-1]
    # go through each subtest in this result
    for rawIndex in [0..doc.subtestData.length-1]
      row = []

      # use the order map for randomized subtests
      subtestIndex = orderMap.indexOf(rawIndex)
      subtest = doc.subtestData[subtestIndex]

      # skip subtests with no data in unfinished assessments
      continue if not subtest?

      prototype = subtest.prototype

      # each prototype provides different data, handle them accordingly
      if prototype == "id"
        row.push pair("id", subtest.data.participant_id)
      else if prototype == "location"
        for label, i in subtest.data.labels
          row.push pair(label, subtestData.data.location[i])
      else if prototype == "datetime"
        months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
        if ~months.indexOf(subtest.data.month.toLowerCase())
          monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
        else
          monthData = subtest.data.month
        datetimeSuffix = if datetimeCount > 0 then "_#{datetimeCount}" else ""
        row.push pair("year#{datetimeSuffix}",        subtest.data.year)
        row.push pair("month#{datetimeSuffix}",       monthData)
        row.push pair("date#{datetimeSuffix}",        subtest.data.day)
        row.push pair("assess_time#{datetimeSuffix}", subtest.data.time)
        datetimeCount++
      else if prototype == "consent"
        row.push pair("consent", subtest.data.consent)
      
      else if prototype == "grid"
        variableName = subtest.data.variable_name
        row.push pair("#{variableName}_auto_stop",       subtest.data.auto_stop)
        row.push pair("#{variableName}_time_remain",     subtest.data.time_remain)
        row.push pair("#{variableName}_attempted",       subtest.data.attempted)
        row.push pair("#{variableName}_item_at_time",    subtest.data.item_at_time)
        row.push pair("#{variableName}_time_intermediate_captured",    subtest.data.time_intermediate_captured)
        row.push pair("#{variableName}_correct_per_minute",  subtest.sum.correct_per_minute)

        for item, i in subtest.data.items
          row.push pair("#{variableName}#{i+1}", exportValue(item.itemResult))

      else if prototype == "survey"
        for surveyVariable, surveyValue of subtest.data
          if surveyValue is Object(surveyValue) # multiple type question
            for optionKey, optionValue of surveyValue
              row.push pair("#{surveyVariable}_#{optionKey}", exportValue(optionValue))
          else # single type question or open
            row.push pair(surveyVariable, exportValue(surveyValue)) # if open just show result, otherwise translate not_asked

      else if prototype == "observation"
        for observations, i in subtest.data.surveys
          observationData = observations.data
          for surveyVariable, surveyValue of observationData
            if surveyValue is Object(surveyValue) # multiple type question
              for optionKey, optionValue of surveyValue
                row.push pair("#{surveyVariable}_#{optionKey}_#{i+1}", exportValue(optionValue))
            else # single type question or open
              row.push pair("#{surveyVariable}_#{i+1}", exportValue(surveyValue))

      else if prototype == "complete"
        row.push pair("additional_comments", subtest.data.comment)
        row.push pair("end_time"           , subtest.data.end_time)
        if subtest.data.gps?
          row.push pair("gps_latitude",  subtest.data.gps.latitude)
          row.push pair("gps_longitude", subtest.data.gps.longitude)
          row.push pair("gps_accuracy",  subtest.data.gps.accuracy)

      bySubtest.push row
      
    emit(doc.assessmentId, bySubtest)
