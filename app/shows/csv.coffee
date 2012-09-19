(doc, req) ->
  return {
    "headers" :
      "Content-Type" : "text/csv"
    "body" : doc.csv
  }