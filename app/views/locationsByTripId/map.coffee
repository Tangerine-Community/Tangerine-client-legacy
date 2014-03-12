( doc ) ->

  if doc.collection is 'result' and doc.tripId? and doc.subtestData?.length > 0
    for data in doc.subtestData
      if doc.start_time and data.prototype is 'gps' and data.data.lat? and data.data.long?
        date = new Date(doc.start_time)
        months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        formattedDate = "#{date.getFullYear()}-#{months[date.getMonth()]}-#{date.getDate()} #{date.getHours()}:#{date.getMinutes()}}"
        emit formattedDate, {
          type: 'Feature'
          properties:
            'Trip Id': doc.tripId
            Enumerator: doc.enumerator
            'Start Time': formattedDate
            'Workflow Id': doc.workflowId
          geometry:
            type: 'Point'
            coordinates: [ data.data.long, data.data.lat]
        }
