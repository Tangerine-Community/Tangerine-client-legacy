(doc) ->

  return if doc.archived is true or doc.archived is "true"

  if doc.collection is "curriculum" or
  	doc.collection is "assessment" or
  	doc.collection is "workflow" or
  	doc.collection is "feedback"
    emit doc._id, null
