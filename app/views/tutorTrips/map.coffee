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
  # by workflow
  #

  emit "workflow-" + doc.workflowId, doc.tripId
