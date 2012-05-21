# little janky, no model
class CSVView extends Backbone.View

  initialize: ( options ) ->
    
    @assessmentId = Utils.cleanURL options.assessmentId
    allResults = new Results
    allResults.fetch
      success: (collection) =>
        @results = collection.where {assessmentId : @assessmentId}
        @render()
    
    @disallowedKeys = ["mark_record"]
    @metaKeys = ["enumerator","starttime","timestamp"]
    

  render: ->
    if @results?
      tableHTML = ""

      resultDataArray = []

      keys = []

      for metaKey in @metaKeys
        keys.push metaKey


      for subtestValue, i in @results[0].attributes.subtestData
        subtestName =  subtestValue.name.toLowerCase().dasherize()
        for dataKey, dataValue of subtestValue.data
          if !(dataKey in @disallowedKeys)
            if _.isObject(dataValue)
              questionVariable = dataKey.toLowerCase().dasherize()
              for key, value of dataValue
                valueName = key
                variableName = subtestName + ":" + questionVariable + ":" + valueName
                keys.push variableName
            else
              valueName = dataKey
              variableName = subtestName + ":" + valueName
              keys.push variableName

      resultDataArray.push keys


      for result in @results
        values = []
        for metaKey in @metaKeys
          values.push result.attributes[metaKey]
          
        for subtestKey, subtestValue of result.attributes.subtestData
          subtestName =  subtestValue.name.toLowerCase().dasherize()
          for dataKey, dataValue of subtestValue.data
            if !(dataKey in @disallowedKeys)
              if _.isObject(dataValue)
                questionVariable = dataKey.toLowerCase().dasherize()
                for key, value of dataValue
                  valueName = key
                  variableName = subtestName + ":" + questionVariable + ":" + valueName
                  if keys.indexOf(variableName) == -1
                    console.log "error, inconsistency\n#{variableName} not in first row"
                  values.push value
              else
                valueName = dataKey
                variableName = subtestName + ":" + valueName
                if keys.indexOf(variableName) == -1
                  console.log "error, inconsistency\n#{variableName} not in first row"
                values.push dataValue

        resultDataArray.push values
    

      for row in resultDataArray
        tableHTML += "<tr>"
        for key, value of row
          tableHTML += "<td>#{value}</td>"
        tableHTML += "</tr>"

      tableHTML = "<table>#{tableHTML}</table>"
      @$el.html tableHTML
      @csv = @$el.table2CSV { delivery : "value" }

      @$el.html "
        <div id='csv_view'>
        <h1>Result CSV</h1>
        <textarea>#{@csv}</textarea><br>
        <a href='data:text/octet-stream;base64,#{Base64.encode(@csv)}' download='#{@assessmentId}.csv'>Download file</a>
        (Right click and click <i>Save Link As...</i>)
        </div>
        "

    @trigger "rendered"