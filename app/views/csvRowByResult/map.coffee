(doc) ->
  if doc.collection is "result"

    exportValueMap = {
      "correct" : 1
      "checked" : 1

      "incorrect" : 0
      "unchecked" : 0

      "missing"   : "."
      "not_asked" : "."
    }

    row = {}

    metaKeys = [
      "enumerator"
      "start_time"
      "order_map"
    ]

    exportValue =  (databaseValue) ->
      if exportValueMap[databaseValue]?
        return exportValueMap[databaseValue]
      else
        return databaseValue

# meta columns go first
    for metaKey in metaKeys
      if doc[metaKey]? then row[metaKey] =  doc[metaKey]
# little backwards compatibility
    row["start_time"] = if doc['starttime']? then doc['starttime']? else doc['start_time']

    row["order_map"] =  if doc['order_map']? then doc['order_map']? else "no_record"

# go through each subtest in this result
    for subtest in doc.subtestData
      prototype = subtest.prototype

      # each prototype provides different data, handle them accordingly
      if prototype == "id"
        row["id"] = subtest.data.participant_id
      else if prototype == "location"
        for label, i in subtest.data.labels
          row[label] = subtest.data.location[i]
      else if prototype == "datetime"
        months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
        if ~months.indexOf(subtest.data.month.toLowerCase())
          monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
        else
          monthData = subtest.data.month
        row["year"]        = subtest.data.year
        row["month"]       = monthData
        row["date"]        = subtest.data.day
        row["assess_time"] = subtest.data.time
        
      else if prototype == "consent"
        row["consent"] = subtest.data.consent
      
      else if prototype == "grid"
        variableName = subtest.data.variable_name
        row["#{variableName}_auto_stop"]      = subtest.data.auto_stop
        row["#{variableName}_time_remain"]    = subtest.data.time_remain
        row["#{variableName}_attempted"]      = subtest.data.attempted
        row["#{variableName}_item_at_time"]   = subtest.data.item_at_time
        row["#{variableName}_time_intermediate_captured"]   = subtest.data.time_intermediate_captured
        row["#{variableName}_correct_per_minute"]   = subtest.sum.correct_per_minute

        for item, i in subtest.data.items
          row["#{variableName}#{i+1}"] = exportValue(item.itemResult)

      else if prototype == "survey"
        for surveyVariable, surveyValue of subtest.data
          if surveyValue is Object(surveyValue) # multiple type question
            for optionKey, optionValue of surveyValue
              row["#{surveyVariable}_#{optionKey}"] = exportValue(optionValue)
          else # single type question or open
            row["#{surveyVariable}"] = exportValue(surveyValue) # if open just show result, otherwise translate not_asked

      else if prototype == "observation"
        for observations, i in subtest.data.surveys
          observationData = observations.data
          for surveyVariable, surveyValue of observationData
            if surveyValue is Object(surveyValue) # multiple type question
              for optionKey, optionValue of surveyValue
                row["#{surveyVariable}_#{optionKey}_#{i+1}"] = exportValue(optionValue)
            else # single type question or open
              row["#{surveyVariable}_#{i+1}"] = exportValue(surveyValue)
          

      else if prototype == "complete"
        row["additional_comments"] = subtest.data.comment
        row["end_time"]            = subtest.data.end_time
        if subtest.data.gps?
          row["gps_latitude"]  = subtest.data.gps.latitude
          row["gps_longitude"] = subtest.data.gps.longitude
          row["gps_accuracy"]  = subtest.data.gps.accuracy


    emit(doc.assessmentId,row)
