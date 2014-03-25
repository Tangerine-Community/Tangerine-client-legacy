(doc) ->

  return unless doc.collection is "result"
  return unless doc.tripId

  #
  # early escapes
  #

  updated = doc.updated
  docTime = new Date(updated) # "Thu Mar 06 2014 11:00:00 GMT+0300 (EAT)"
  min = new Date(updated.substr(0,16) + "07:00:00" + updated.substr(-15))
  max = new Date(updated.substr(0,16) + "14:00:00" + updated.substr(-15))

  validTime = min < docTime < max
  return unless validTime

  #
  # by month
  #

  year  = docTime.getFullYear()
  month = docTime.getMonth() + 1
  emit "year#{year}month#{month}", doc.tripId


  #
  # by Zone, County
  #

  for subtest in doc.subtestData
    
    if subtest.prototype is "location"

      for label, i in subtest.data.labels
        zoneIndex   = i if label is "Zone"
        countyIndex = i if label is "County"

      zoneKey   = "zone-"   + subtest.data.location[zoneIndex]
      countyKey = "#{zoneKey}-county-" + subtest.data.location[countyIndex]

      emit zoneKey,   doc.tripId if subtest.data.location[zoneIndex]?
      emit countyKey, doc.tripId if subtest.data.location[countyIndex]?


  #
  # by enumerator
  #

  emit "user-" + doc.enumerator || doc.editedBy, doc.tripId


  #
  # by workflow
  #

  emit "workflow-" + doc.workflowId, doc.tripId
