(doc) ->

  archived = doc.archived is true or doc.archived is "true"

  return if archived

  if doc.collection in ["curriculum", "assessment", "workflow", "feedback"]
    emit doc._id, null
