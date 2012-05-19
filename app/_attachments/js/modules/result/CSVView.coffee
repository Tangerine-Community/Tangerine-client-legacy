# little janky, no model
class CSVView extends Backbone.View

  initialize: ( options ) ->
    
    @assessmentId = Utils.cleanURL options.assessmentId
    allResults = new Results
    allResults.fetch
      success: (collection) =>
        @results = collection.where {assessmentId : @assessmentId}
        @render()
    
    @disallowedKeys = ["_id","_rev","collection","assessmentId","subtestType"]
    @metaKeys = ["timestamp","enumerator"]
    

  render: ->
    console.log @results
    if @results?
      tableHTML = ""
    
      resultDataArray = []

      keys = []

      keys.push "enumerator"
      keys.push "starttime"
      keys.push "timestamp"
    
      for subtestValue, i in @results[0].attributes.subtestData
        console.log "before:" + subtestValue.name
        subtestName =  subtestValue.name.toLowerCase().dasherize()
        console.log "after: " + subtestName
        for dataKey, dataValue of subtestValue.data

          if _.isObject(dataValue)

            questionVariable = dataKey.toLowerCase().dasherize()

            for key, value of dataValue
              valueName = key
              variableName = subtestName + ":" + questionVariable + ":" + valueName.toLowerCase().underscore()
              keys.push variableName

          else

            valueName = dataKey
            variableName = subtestName + ":" + valueName
            keys.push variableName

      resultDataArray.push keys

      for result in @results
        values = []
        values.push result.attributes.enumerator
        values.push result.attributes.starttime
        values.push result.attributes.timestamp
        for subtestKey, subtestValue of result.attributes.subtestData
          for dataKey, dataValue of subtestValue.data
            if _.isObject(dataValue)
              for key, value of dataValue
                console.log "pushing shallow #{value}"
                values.push value
            else
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