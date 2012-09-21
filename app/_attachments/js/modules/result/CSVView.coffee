# little janky, no model
class CSVView extends Backbone.View

  initialize: ( options ) ->
  
    @assessmentId = Utils.cleanURL options.assessmentId
    
    allResults = new Results
    allResults.fetch
      key: @assessmentId
      success: (collection) =>
        @results = collection.models
        @render()
    
    @disallowedKeys = ["mark_record"]
    @metaKeys = ["enumerator","starttime","timestamp"]
    

  render: ->
    if @results? && @results[0]?
      tableHTML = ""

      resultDataArray = []

      keys = []

      # make keys for our buckets
      for metaKey in @metaKeys
        keys.push metaKey


      # find the result with the most subtest data
      maxIndex = 0
      maxLength = 0

      for subtest, i in @results
        if subtest.attributes.subtestData.length > maxLength
          maxIndex = i
          maxLength = subtest.attributes.subtestData.length
      
      # build columns
      for subtest in @results[maxIndex].attributes.subtestData
        subtestName = subtest.name.toLowerCase().dasherize()
        prototype = subtest.prototype
        
        # should break these out into classes at some point
        if prototype == "id"
          keys.push "id"
        else if prototype == "datetime"
          keys.push "year", "month", "date", "assess_time"
        else if prototype == "location"
          for label in subtest.data.labels
            keys.push label
        else if prototype == "consent"
          keys.push "consent"
        else if prototype == "grid"
          variableName = subtest.data.variable_name
          keys.push "#{variableName}_auto_stop","#{variableName}_time_remain", "#{variableName}_attempted", "#{variableName}_item_at_time", "#{variableName}_time_intermediate_captured", "#{variableName}_correct_per_minute"
          for item, i in subtest.data.items
            keys.push "#{variableName}#{i+1}"
        else if prototype == "survey"
          for surveyVariable, surveyValue of subtest.data
            if _.isObject(surveyValue)
              for optionKey, optionValue of surveyValue
                keys.push "#{surveyVariable}_#{optionKey}"
            else
              keys.push surveyVariable
        else if prototype == "observation"
          for observations, i in subtest.data.surveys
            observationData = observations.data
            for surveyVariable, surveyValue of observationData
              keys.push "#{surveyVariable}_#{i}"
        else if prototype == "complete"
          keys.push "additional_comments", "end_time", "gps_latitude", "gps_longitude", "gps_accuracy"

      resultDataArray.push keys

      # fill values array with all results
      for result, d in @results
        values = []
        for metaKey in @metaKeys
          values.push result.attributes[metaKey]

        for subtest in result.attributes.subtestData

          prototype = subtest.prototype

          if prototype == "id"
            values[keys.indexOf("id")] = subtest.data.participant_id
          else if prototype == "location"
            for label, i in subtest.data.labels
              values[keys.indexOf(label)] = subtest.data.location[i]
          else if prototype == "datetime"
            months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
            if ~months.indexOf(subtest.data.month.toLowerCase())
              monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
            else
              monthData = subtest.data.month
            values[keys.indexOf("year")]        = subtest.data.year
            values[keys.indexOf("month")]       = monthData
            values[keys.indexOf("date")]        = subtest.data.day
            values[keys.indexOf("assess_time")] = subtest.data.time
            
          else if prototype == "consent"
            values[keys.indexOf("consent")] = subtest.data.consent
          
          else if prototype == "grid"
            variableName = subtest.data.variable_name
            values[keys.indexOf("#{variableName}_auto_stop")]   = subtest.data.auto_stop
            values[keys.indexOf("#{variableName}_time_remain")] = subtest.data.time_remain
            values[keys.indexOf("#{variableName}_attempted")]   = subtest.data.attempted
            values[keys.indexOf("#{variableName}_item_at_time")]   = subtest.data.item_at_time
            values[keys.indexOf("#{variableName}_time_intermediate_captured")]   = subtest.data.time_intermediate_captured
            values[keys.indexOf("#{variableName}_correct_per_minute")]   = subtest.sum.correct_per_minute

            for item, i in subtest.data.items
              if item.itemResult == "correct"
                exportValue = 1
              else if item.itemResult == "incorrect"
                exportValue = 0
              else if item.itemResult == "missing"
                exportValue = "."
              values[keys.indexOf("#{variableName}#{i+1}")] = exportValue

          else if prototype == "survey"
            for surveyVariable, surveyValue of subtest.data
              if _.isObject(surveyValue) # multiple type question
                for optionKey, optionValue of surveyValue
                  if optionValue == "checked"
                    exportValue = 1
                  else if optionValue == "unchecked"
                    exportValue = 0
                  else if optionValue == "not_asked"
                    exportValue = "."
                  values[keys.indexOf("#{surveyVariable}_#{optionKey}")] = exportValue
              else # single type question or open
                exportValue = if surveyValue == "not_asked" then "." else surveyValue # if open just show result, otherwise translate not_asked
                values[keys.indexOf("#{surveyVariable}")] = exportValue

          else if prototype == "observation"
            for observations, i in subtest.data.surveys
              observationData = observations.data
              for surveyVariable, surveyValue of observationData
                
                values[keys.indexOf("#{surveyVariable}_#{i}")] = surveyValue
              

          else if prototype == "complete"
            values[keys.indexOf("additional_comments")] = subtest.data.comment
            values[keys.indexOf("gps_latitude")]  = subtest.data.gps.latitude
            values[keys.indexOf("gps_longitude")] = subtest.data.gps.longitude
            values[keys.indexOf("gps_accuracy")]  = subtest.data.gps.accuracy
            values[keys.indexOf("end_time")] = subtest.data.end_time

        resultDataArray.push values

      # Use table2csv to create a safe csv data
      for row, i in resultDataArray
        tableHTML += "<tr>"
        count = 0
        for index in [0..row.length-1]
          tableHTML += "<td>#{row[index]}</td>"
          count++
        tableHTML += "</tr>"

      @csv = $("<table>#{tableHTML}</table>").table2CSV { "delivery" : "value" }

      # Save
      csvFile = new Backbone.Model
        "_id" : "Tangerine-#{@assessmentId.substr(-5, 5)}.csv"
      csvFile.url = "csv"
      csvFile.fetch
        complete: =>
          csvFile.save
            "csv" : @csv
          , complete : =>
            # point browser to file
            # do it in a new window because otherwise it will cancel the fetching/updating of the file
            window.open("/tangerine/_design/tangerine/_show/csv/Tangerine-#{@assessmentId.substr(-5, 5)}.csv","_blank")

    @trigger "rendered"
