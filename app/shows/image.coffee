(doc, req) ->
  
  if doc.collection isnt "result" then return {
    "code": "404"
  }
  
  for subtest in doc.subtestData
    if subtest.prototype is "camera"
      return {
        "headers" :
          "Content-Type" : "image/png"
          "Content-Disposition" : "inline; filename=\"photo.png\""
        "base64" : subtest.data.imageBase64
      }

  return {
    "code": "404"
  }