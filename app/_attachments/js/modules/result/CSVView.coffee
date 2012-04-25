# little janky, no model
class CSVView extends Backbone.View

  el : "#content"

  initialize: ( options ) ->
    
    @disallowedKeys = ["_id","_rev","collection","assessmentId","subtestType"]
    @metaKeys = ["timestamp","enumerator"]
    
    
    @assessmentId = options.assessmentId
    $.couch.db(Tangerine.config.db_name).view "tangerine/results", 
      keys: [@assessmentId]
      success: ( data ) =>
        withNewLines = JSON.stringify(data)
        withoutNewLines = withNewLines.replace(/\\r\\n|\\n/g, " ")
        console.log withoutNewLines
        @resultData = JSON.parse(withoutNewLines)
        @render()
      error: ( status ) ->
        console.log "error: #{status}"

  render: ->
    results = []
    tableHTML = ""

    resultsName = @resultData.rows[0].key.replace(".", " ").titleize()

    for oneResult in @resultData.rows
      
      filteredData = {}
      metaData = {}
        
      for key, value of oneResult.value
        if _.indexOf( @metaKeys, key ) != -1
          metaData[key] = value
        else if _.indexOf( @disallowedKeys, key ) == -1
          if _.isObject value
            for subKey, subValue of value
              if _.indexOf( @disallowedKeys, subKey ) == -1
                if _.isArray subValue
                  filteredData["#{key}.#{subKey}"] = subValue.join ","
                else
                  filteredData["#{key}.#{subKey}"] = subValue
      
      # This is an extend operation, yes, but jQuery and underscore kept dropping the last variable
      csvRow = {}
      for key, value of metaData
        csvRow[key] = value
      for key, value of filteredData
        csvRow[key] = value

      results.push csvRow
    
    tableHTML += "<tr>"
    for key, value of results[0]
      tableHTML += "<td>#{key}</td>"
    tableHTML += "</tr>"

    for row in results
      tableHTML += "<tr>"
      for key, value of row
        tableHTML += "<td>#{value}</td>"
      tableHTML += "</tr>"

    tableHTML = "<table>#{tableHTML}</table>"
    @$el.html tableHTML
    @csv = @$el.table2CSV { delivery : "value" }

    @$el.html "
      <div id='csv_view'>
      <h1>#{resultsName}</h1>
      <textarea>#{@csv}</textarea><br>
      <a href='data:text/octet-stream;base64,#{Base64.encode(@csv)}' download='#{@assessmentId}.csv'>Download file</a>
      (Right click and click <i>Save Link As...</i>)
      </div>
      "
