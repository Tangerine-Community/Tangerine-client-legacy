(doc, req) ->
  if doc.assessment is req.query.assessment
    return true
  return false
