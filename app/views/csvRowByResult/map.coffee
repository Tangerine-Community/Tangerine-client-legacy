(doc) ->

  return unless doc.collection is "result"
  log "RESULT"

  utils = require("views/lib/utils")
  clone       = `function (item) { if (!item) { return item; } var types = [ Number, String, Boolean ], result; types.forEach(function(type) { if (item instanceof type) { result = type( item ); } }); if (typeof result == "undefined") { if (Object.prototype.toString.call( item ) === "[object Array]") { result = []; item.forEach(function(child, index, array) { result[index] = clone( child ); }); } else if (typeof item == "object") { if (item.nodeType && typeof item.cloneNode == "function") { var result = item.cloneNode( true ); } else if (!item.prototype) { if (item instanceof Date) { result = new Date(item); } else { result = {}; for (var i in item) { result[i] = clone( item[i] ); } } } else { if (false && item.constructor) { result = new item.constructor(); } else { result = item; } } } else { result = item; } } return result; }`
  exportValue = utils.exportValue
  pair        = utils.pair

  prototypes  = require("views/lib/prototypes")

  pairsGrid        = prototypes.pairsGrid
  pairsSurvey      = prototypes.pairsSurvey
  pairsDatetime    = prototypes.pairsDatetime
  pairsObservation = prototypes.pairsObservation
  pairsGps         = prototypes.pairsGps
  pairsLocation    = prototypes.pairsLocation


  subtestData = doc.subtestData
  keyId       = doc.assessmentId

  isClassResult = doc.klassId?


  # turn class results into regular results
  if isClassResult

    keyId = doc.klassId

    newData               = clone(doc.subtestData)
    newData.subtestId     = doc.subtestId
    newData.variable_name = doc.itemType + "_" + doc.reportType + "_" + doc.part + "_"
    subtestData = [ {
      data      : newData
      prototype : doc.prototype
      subtestId : doc.subtestId
    } ]

    log "ONE KLASS RESULT"
    log JSON.stringify(subtestData)


  ###
  Fix doubles (temporary)
  ###

  doublesIncluded = clone(subtestData)

  subtestData = []
  subtestIds  = []

  for subtest in doublesIncluded
    #log subtest.subtestId + " " + subtestIds.indexOf(subtest.subtestId)
    if subtestIds.indexOf(subtest.subtestId) == -1
      subtestData.push(subtest)
      subtestIds.push(subtest.subtestId)


  bySubtest = []

  ###
  Handle universal fields
  ###

  universal = []

  if isClassResult
    universal.push pair( "studentId", doc['studentId'] )
  else
    universal.push pair( "enumerator", doc['enumerator'] )
    universal.push pair( "start_time", doc['starttime'] || doc['start_time'] )
    universal.push pair( "order_map",  if doc['order_map']? then doc['order_map'].join(",") else "no_record" )

    # first "subtest" is always universal


  bySubtest.push pair("universal", universal)

  #
  # Subtest loop
  #
  datetimeCount = 0
  linearOrder = [0..subtestData.length-1]
  orderMap = if doc["order_map"]? then doc["order_map"] else if doc["orderMap"] then doc["orderMap"] else linearOrder

  timestamps = []

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

    prototype = subtest['prototype']

    # simple prototypes
    if prototype == "id"
      row.push pair("id", subtest.data.participant_id)
    else if prototype == "consent"
      row.push pair("consent", subtest.data.consent)

    else if prototype == "location"
      row = row.concat pairsLocation subtest

    else if prototype == "datetime"
      datetimeSuffix = if datetimeCount > 0 then "_#{datetimeCount}" else ""
      row = row.concat( pairsDatetime( subtest, datetimeSuffix ) )
      datetimeCount++

    else if prototype == "grid"
      row = row.concat pairsGrid subtest, isClassResult

    else if prototype == "survey"
      row = row.concat pairsSurvey subtest

    else if prototype == "observation"
      row = row.concat pairsObservation subtest

    else if prototype == "gps"
      row = row.concat pairsGps subtest

    else if prototype == "complete"
      row = row.concat [
        pair("additional_comments", subtest.data.comment)
        pair("end_time"           , subtest.data.end_time)
      ]

    timestamps.push subtest.timestamp

    bySubtest.push pair(subtest.subtestId, row)

  timestamps = timestamps.sort()

  bySubtest.push "timestamps" : [ pair( "timestamps", timestamps.join(',') )]

  emit(keyId, bySubtest)
