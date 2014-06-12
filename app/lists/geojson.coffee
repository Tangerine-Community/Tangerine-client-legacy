(head, req) ->

  #send 
  #  "type"     : "FeatureCollection",
  #  "features" : []"
  
  qWorkflowIds = if req.query.workflowIds then req.query.workflowIds.split(",")
  qStartTime   = if req.query.startTime   then parseInt(req.query.startTime)
  qEndTime     = if req.query.endTime     then parseInt(req.query.endTime)
  qCounty      = if req.query.county      then req.query.county.toLowerCase()

  while row = getRow().value


    unless row.gpsData?
      continue

    if ((row.maxTime - row.minTime) / 1000 / 60) < 20
      continue
    
    if req.query.workflowIds? and not ~qWorkflowIds.indexOf(row.workflowId)
      continue

    valid = false
    
    timeValid = if req.query.startTime? and req.query.endTime?
      qEndTime > row.minTime > qStartTime
    else
      true

    countyValid = if req.query.county?
      (row.county||'').toLowerCase() is qCounty or qCounty is "all"
    else
      true

    if countyValid and timeValid

      if row.gpsData?.properties?
        
        date = new Date(row.minTime)
        months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        startDate = "#{date.getFullYear()}-#{months[date.getMonth()]}-#{date.getDate()} #{date.getHours()}:#{date.getMinutes()}"
        
        duration = Math.round((row.maxTime - row.minTime) / 1000 / 60)

        row.gpsData.properties = [
          { label: "Date",            value: startDate }
          { label: "Subject",         value: { "english_word": "English", "word": "Kiswahili", "operation":"Maths" }[row.subject] }
          { label: "Lesson duration", value: "#{duration} min." }
          { label: "Zone",            value: row.zone }
          { label: "TAC tutor",       value: row.user }
          { label: "Lesson Week",     value: row.week }
          { label: "Lesson Day",      value: row.day }
        ]


      send(JSON.stringify(row.gpsData) + "\n")
      
