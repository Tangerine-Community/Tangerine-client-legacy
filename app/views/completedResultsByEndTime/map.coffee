(doc) ->
  if doc.collection is 'result'
    if subtest.prototype is "complete"
      emit subtest.data.end_time,null
     
