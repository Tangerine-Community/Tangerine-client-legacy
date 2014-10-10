( doc ) ->

  return unless doc.collection is "result"
  startTime = doc.start_time or doc.startTime
  return unless startTime?

  result =
    resultId         : doc._id
    enumerator       : doc.enumerator or doc.editedBy
    assessmentName   : doc.assessmentName
    assessmentId     : doc.assessmentId
    startTime        : startTime
    tangerineVersion : doc.tangerine_version
    numberOfSubtests : doc.subtestData.length
    workflowId       : doc.workflowId
    tripId           : doc.tripId
    subtests         : []

  result.timestamp = doc.timestamp if doc.timestamp?

  for subtest in doc.subtestData

    result.subtests.push subtest.name if subtest.name
    prototype = subtest.prototype

    if prototype is "id"
      result.participantId = subtest.data.participant_id

    if prototype is "complete"
      result.endTime = subtest.data.end_time       

    if prototype is "location"
      for label, i in subtest.data.labels
       result["Location: #{label}"] = subtest.data.location[i]

  emit doc.assessmentId, result
  emit "time-"+startTime , result
