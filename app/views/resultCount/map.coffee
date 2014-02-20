( doc ) ->

  return unless doc.collection is 'result'

  emit doc.assessmentId, 1
