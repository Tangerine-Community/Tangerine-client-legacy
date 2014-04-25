(doc) ->

  return unless doc.collection is "result"
  return unless doc.tripId

  #
  # early escapes
  #

  updated = doc.updated #"Thu Mar 06 2014 11:00:00 GMT+0300 (EAT)"
  docTime = new Date(updated)
  sMin = updated.substr(0,16) + "07:00:00" + updated.substr(-15)
  sMax = updated.substr(0,16) + "14:00:00" + updated.substr(-15)
  min = new Date(sMin)
  max = new Date(sMax)

  validTime = min < docTime < max
  return unless validTime

  result = {}

  #
  # by month
  #

  year  = docTime.getFullYear()
  month = docTime.getMonth() + 1
  result.month = month


  #
  # by Zone, County, subject, class
  #

  result.minTime = doc.startTime || doc.start_time || doc.subtestData.start_time
  result.maxTime = doc.startTime || doc.start_time || doc.subtestData.start_time

  for subtest in doc.subtestData

    result.minTime = if subtest.timestamp < result.minTime then subtest.timestamp else result.minTime
    result.maxTime = if subtest.timestamp > result.maxTime then subtest.timestamp else result.maxTime

    if subtest.prototype is "location"

      for label, i in subtest.data.labels
        zoneIndex   = i if label is "Zone"
        countyIndex = i if label is "County"
        schoolIndex = i if label is "SchoolName"

      zoneKey   = subtest.data.location[zoneIndex]
      countyKey = subtest.data.location[countyIndex]
      schoolKey = subtest.data.location[schoolIndex]

      result.zone   = zoneKey   if subtest.data.location[zoneIndex]?
      result.county = countyKey if subtest.data.location[countyIndex]?
      result.school = schoolKey if subtest.data.location[schoolIndex]?

    else if subtest.prototype is "survey"

      result.subject = subtest.data.subject if subtest.data.subject?
      result.class   = subtest.data.class   if subtest.data.class?


  #
  # items per minute
  #

  # handle a class result
  if doc.subtestData.items?

    totalItems   = doc.subtestData.items.length
    correctItems = 0
    for item in doc.subtestData.items
      correctItems++ if item.itemResult is "correct"

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
