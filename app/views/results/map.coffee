( doc ) ->

  return unless doc.collection is 'result'

  if doc.workflowId?
    type = doc.tripId
    id   = doc.workflowId
  else if doc.klassId?
    type = "klass"
    id   = doc.klassId
  else
    type = "assessment"
    id   = doc.assessmentId

  emit id, type
