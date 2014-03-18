(doc) ->

  return unless doc.collection is "result"


  #
  # by month
  #

  d = new Date(doc.start_time || doc.startTime)
  year  = d.getFullYear()
  month = d.getMonth() + 1
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

      log "zoneKey #{zoneKey}"

      emit zoneKey,   doc.tripId if subtest.data.location[zoneIndex]?
      emit countyKey, doc.tripId if subtest.data.location[countyIndex]?


  #
  # by enumerator
  #

  emit "user" + doc.enumerator || doc.editedBy, doc.tripId