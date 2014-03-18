(doc) ->
  return unless doc.collection is "result"
  return unless doc.tripId

  # helper
  filter = (items, ff) ->
    result = []
    for item in items
      result.push(item) if ff(item)
    return result


  result = {}

  #
  # by month
  #

  d = new Date(doc.start_time || doc.startTime)
  year  = d.getFullYear()
  month = d.getMonth() + 1
  result.month = month


  #
  # by Zone, County, subject, class
  #

  for subtest in doc.subtestData

    if subtest.prototype is "location"

      for label, i in subtest.data.labels
        zoneIndex   = i if label is "Zone"
        countyIndex = i if label is "County"

      zoneKey   = subtest.data.location[zoneIndex]
      countyKey = subtest.data.location[countyIndex]

      result.zone   = zoneKey   if subtest.data.location[zoneIndex]?
      result.county = countyKey if subtest.data.location[countyIndex]?

    else if subtest.prototype is "survey"

      result.subject = subtest.data.subject if subtest.data.subject?
      result.class   = subtest.data.class   if subtest.data.class?


  #
  # items per minute
  #

  # handle a class result
  if doc.subtestData.items?
    totalItems   = doc.subtestData.items.length
    correctItems = filter(doc.subtestData.items, (item) -> item.itemResult is "correct").length
    totalTime    = doc.timeAllowed
    timeLeft     = doc.subtestData.time_remain
    result.itemsPerMinute = [( totalItems - ( totalItems - correctItems ) ) / ( ( totalTime - timeLeft ) / ( totalTime ) )]

  #
  # by enumerator
  #

  result.user = doc.enumerator || doc.editedBy


  #
  # number of subtests
  #

  result.subtests = doc.subtestData.length || 1

  emit doc.tripId, result