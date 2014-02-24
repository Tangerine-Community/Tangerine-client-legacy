( doc ) ->

  return unless doc.collection is 'result'

  if doc.workflowId?
    type = doc.tripId
    id   = doc.workflowId
    # emit by workflowId and user as well
    emit "#{id}-#{doc.enumerator}", type
  else if doc.klassId?
    type = "klass"
    id   = doc.klassId
  else
    type = "assessment"
    id   = doc.assessmentId

  emit id, type
