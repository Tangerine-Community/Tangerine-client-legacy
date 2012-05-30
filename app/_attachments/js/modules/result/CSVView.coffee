# little janky, no model
class CSVView extends Backbone.View

  events:
    'click .option_reduce' : 'toggleReduce'
  
  toggleReduce: (event) ->
    value = $(event.target).val()
    @reduceExclusive = if value == "true" then true else false
    @initialize
      assessmentId : @assessmentId

  initialize: ( options ) ->
    
    @assessmentId = Utils.cleanURL options.assessmentId
    allResults = new Results
    allResults.fetch
      success: (collection) =>
        @results = collection.where {assessmentId : @assessmentId}

        allQuestions = new Questions
        allQuestions.fetch
          success: (collection) =>
            questions = collection.where {assessmentId : @assessmentId}
            @singleQuestions = []

            for q in questions
              if q.attributes.type == "single"
                @singleQuestions.push q.attributes.name

            console.log @singleQuestions

            # unfortunate cleaning code
            allSubtests = new Subtests
            allSubtests.fetch 
              success: ( collection ) =>
            
                # get all subtests that are grids in this assessment
                grids = collection.where
                  assessmentId : @assessmentId
                  prototype    : "grid"
                gridsByName = {}
                for grid in grids
                  gridsByName[grid.attributes.name] = grid.attributes

                for result in @results
                  for subtestKey, subtestValue of result.attributes.subtestData
                
                    if subtestValue.data.letters_results?
                      newGridData = []
                      if _.keys(subtestValue.data.letters_results).length != gridsByName[subtestValue.name].items.length
                        subtestValue.data.letters_results = []
                        for item, i in gridsByName[subtestValue.name].items
                          subtestValue.data.letters_results[i] = {}
                          subtestValue.data.letters_results[i][item] = if ( i < parseInt(subtestValue.data.last_attempted) ) then "correct" else "missing"
                        for markIndex, i in subtestValue.data.mark_record
                          markIndex--
                          key = ""
                          for k, v of subtestValue.data.letters_results[markIndex]
                            key = k
                          subtestValue.data.letters_results[markIndex][key] = if (subtestValue.data.letters_results[markIndex][key] == "correct") then "incorrect" else "correct"


                    if @reduceExclusive != undefined && @reduceExclusive != null && @reduceExclusive != false
                      for dataKey, dataValue of subtestValue.data
                        if ~@singleQuestions.indexOf(dataKey)
                          for k, v of dataValue
                            singleResult = k if v == "checked" 
                          subtestValue.data[dataKey] = singleResult

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

                # this clause mark_record fix
                if _.isObject(value) 
                  for k, v of value
                    valueName = k
                    variableName = subtestName + ":" + questionVariable + ":" + valueName
                    keys.push variableName
                else
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
                itemCount = 0
                for key, value of dataValue
                  if _.isObject(value)
                    for k, v of value
                      valueName    = k
                      variableName = subtestName + ":" + questionVariable + ":" + valueName
                      valueIndex   = keys.indexOf(variableName)
                      firstIndex = null
                      for key, keyIndex in keys
                        if ~key.indexOf(subtestName + ":" + questionVariable) && firstIndex == null
                          firstIndex = keyIndex
                      values[firstIndex + itemCount] = v
                    itemCount++
                  else
                    valueName = key
                    variableName = subtestName + ":" + questionVariable + ":" + valueName
                    valueIndex = keys.indexOf(variableName)
                    if keys.indexOf(variableName) == -1

                    else
                      values[valueIndex] = value
              else
                valueName = dataKey
                variableName = subtestName + ":" + valueName
                valueIndex = keys.indexOf(variableName)
                if valueIndex == -1
                  #console.log "error, inconsistency\n#{variableName} not in first row"
                else
                  values[valueIndex] = dataValue
                #values.push dataValue

        resultDataArray.push values
    

      for row in resultDataArray
        tableHTML += "<tr>"
        for key, value of row
          tableHTML += "<td>#{value}</td>"
        tableHTML += "</tr>"

      tableHTML = "<table>#{tableHTML}</table>"
      @$el.html tableHTML
      @csv = @$el.table2CSV { delivery : "value" }

      checkedString = "checked='checked'"

      @$el.html "
        <div id='csv_view'>
        <h1>Result CSV</h1>
        <h2>Options</h2>
        <div class='menu_box'>
          <label>Reduce exclusive</label>
          <div id='output_options'>
            <label for='reduce_on'>On</label>
            <input class='option_reduce' name='reduce' type='radio' value='true' id='reduce_on' #{checkedString if @reduceExclusive}>
            <label for='reduce_off'>Off</label>
            <input class='option_reduce' name='reduce' type='radio' value='false' id='reduce_off' #{checkedString if !@reduceExclusive}>
          </div>
        </div>
        <textarea>#{@csv}</textarea><br>
        <a href='data:text/octet-stream;base64,#{Base64.encode(@csv)}' download='#{@assessmentId}.csv'>Download file</a>
        (Right click and click <i>Save Link As...</i>)
        </div>
        "
      @$el.find("#output_options").buttonset()

    @trigger "rendered"