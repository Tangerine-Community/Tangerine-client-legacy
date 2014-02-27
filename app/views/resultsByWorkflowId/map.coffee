( doc ) ->

  return unless doc.collection is 'result'
  return unless doc.workflowId?
  emit doc.workflowId, doc.tripId