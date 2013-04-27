(doc) ->

  subtest = {}

  if doc.collection is "result"


    clone = `function (item) {
        if (!item) { return item; } // null, undefined values check

        var types = [ Number, String, Boolean ], 
            result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function(type) {
            if (item instanceof type) {
                result = type( item );
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call( item ) === "[object Array]") {
                result = [];
                item.forEach(function(child, index, array) { 
                    result[index] = clone( child );
                });
            } else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    var result = item.cloneNode( true );    
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = clone( item[i] );
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }

        return result;
    }`

    subtestData = doc.subtestData
    keyId = doc.assessmentId

    # turn class results into regular results
    if doc.klassId?

      keyId = doc.klassId

      newData = clone(doc.subtestData)
      newData["variable_name"] = doc.itemType + "_" + doc.reportType + "_" + doc.part + "_"
      subtestData = [ {
        data      : newData
        prototype : doc.prototype
        subtestId : doc.subtestId
      } ]
      
      log "NEW SUBTEST DATA"
      log JSON.stringify(subtestData)

    exportValueMap = {
      "correct" : 1
      "checked" : 1

      "incorrect" : "0"
      "unchecked" : "0"

      "missing"   : "."
      "not_asked" : "."
      
      "skipped"   : 999
    }

    metaKeys = [
      "enumerator"
      "start_time"
      "order_map"
    ]

    exportValue = (databaseValue="no_record") ->
      if exportValueMap[databaseValue]?
        return exportValueMap[databaseValue]
      else
        return String(databaseValue)

    # returns an object {key: value}
    pair = (key, value) ->
      if value == undefined then value = "no_record"
      o = {}
      o[key] = value
      return o

    metaData = []
    # meta columns go first
    for metaKey in metaKeys
      metaData.push pair(metaKey, doc[metaKey]) if doc[metaKey]?

    # a little backwards compatibility
    startTime = doc['starttime'] || doc['start_time']
    metaData.push pair("start_time", startTime)
    metaData.push pair("order_map",  if doc['order_map']? then doc['order_map'].join(",") else "no_record")

    # first "subtest" is always metadata
    bySubtest = {"meta_data" : metaData}

    #
    # Subtest loop
    #
    datetimeCount = 0
    linearOrder = [0..subtestData.length-1]
    orderMap = if doc["order_map"]? then doc["order_map"] else if doc["orderMap"] then doc["orderMap"] else linearOrder

    # go through each subtest in this result
    for rawIndex in linearOrder 
      row = []

      # use the order map for randomized subtests
      subtestIndex = orderMap.indexOf(rawIndex)
      subtest = subtestData[subtestIndex]

      # skip subtests with no data in unfinished assessments
      unless subtest?
        log "skipped empty subtest"
        log doc
        continue 

      unless subtest.data?
        log "skipped subtest with null data"
        log doc
        continue 

      prototype = subtest.prototype

      # each prototype provides different data, handle them accordingly
      if prototype == "id"
        row.push pair("id", subtest.data.participant_id)
      else if prototype == "location"
        for label, i in subtest.data.labels
          row.push pair(label, subtest.data.location[i])
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
        # row.push pair("#{variableName}_correct_per_minute",  subtest.sum.correct_per_minute)

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

      else if prototype == "gps"

        row.push pair("latitude",         subtest.data.lat )
        row.push pair("longitude",        subtest.data.long )
        row.push pair("accuracy",         subtest.data.acc )
        row.push pair("altitude",         subtest.data.alt )
        row.push pair("altitudeAccuracy", subtest.data.altAcc )
        row.push pair("heading",          subtest.data.heading )
        row.push pair("speed",            subtest.data.speed )
        row.push pair("timestamp",        subtest.data.timestamp )

      else if prototype == "complete"
        row.push pair("additional_comments", subtest.data.comment)
        row.push pair("end_time"           , subtest.data.end_time)

      row.push pair("time_stamp_#{rawIndex+1}", subtest.timestamp)

      bySubtest[subtest.subtestId] = row

    emit(keyId, bySubtest)
