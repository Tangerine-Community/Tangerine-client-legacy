( doc ) ->

  return unless doc.collection is 'result' or not doc.workflowId?
  emit doc.workflowId, doc.tripId