(doc, req) ->
  if doc.assessmentId is req.query.assessmentId
    return true
  return false
