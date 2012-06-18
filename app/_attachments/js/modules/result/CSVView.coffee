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
    @reduceExclusive = options.reduceExclusive
    
    @assessmentId = Utils.cleanURL options.assessmentId
    
    # Do we need Taylor's edits for the Malawi 2012 EGRA?
    # Note, always use reduceExclusive = true for the Malawi 2012 EGRA
    @malawi2012EGRA = false
    if @assessmentId == "b6faf1dcbe0aac8e66fc4607aa2c348b"
      @reduceExclusive = true
      @malawi2012EGRA = true
      console.log "Malawi 2012 May EGRA"
      
      @replaceMapValues = 
        "1" : ["yes", "true", "TRUE", "True", "correct", "checked", "mkazi"] 
        "0" : ["no", "false", "FALSE", "False", "incorrect", "unchecked","mwamuna"]
        "." : ["missing", "na", "Na", "NA", "undefined", "not_asked", "no_response", "skip"]

      @replaceMapKeys = 
        "enumerator" : "admin_name"
        "starttime" : "start_time"
        "endtime" : "end_time"
        "date-and-time:year" : "year"
        "date-and-time:month" : "month"
        "date-and-time:day" : "day"
        "date-and-time:time" : "assess_time"
        "school:province" : "region"
        "school:district" : "district"
        "school:name" : "school"
        "school:school-id" : "school_code"
        "student-consent:participant-consents" : "consent"
        "student-information:school-shift" : "shift"
        "student-information:zaka-zakubadwa" : "age"
        "student-information:mkazi" : "gender"
        "letter-name:autostopped" : "letter_auto_stop"
        "letter-name:last-attempted" : "letter_attempted"
        "letter-name:time-remaining" : "letter_time_remain"
        "letter-name:time-elapsed" : "NOT USED - time_elapsed"
        "syllables:autostopped" : "syllable_sound_auto_stop"
        "syllables:last-attempted" : "syllable_sound_attempted"
        "syllables:time-remaining" : "syllable_sound_time_remain"
        "syllables:time-elapsed" : "NOT USED - time_elapsed"
        "invented-words:autostopped" : "invent_word_auto_stop"
        "invented-words:last-attempted" : "invent_word_attempted"
        "invented-words:time-remaining" : "invent_word_time_remain"
        "invented-words:time-elapsed" : "NOT USED - time_elapsed"
        "oral-passage-reading:autostopped" : "oral_read_auto_stop"
        "oral-passage-reading:last-attempted" : "oral_read_attempted"
        "oral-passage-reading:time-remaining" : "oral_read_time_remain"
        "oral-passage-reading:time-elapsed" : "NOT USED - time_elapsed"
        "student-information:stream:stream" : "section"


      # Look for variable names starting with the left side
      # and turn them into the right side plus a number starting at 1
      @replaceWithNumbering = 
        "initial-sounds" : "pa_init_sound"
        "letter-name:letters-results" : "letter"
        "syllables:letters-results" : "syllable_sound"
        "invented-words:letters-results" : "invent_word"
        "oral-passage-reading:letters-results" : "oral_read_word"
        "reading-comprehension:comp" : "read_comp"
      
      # Only the pupil-context-interview questions need to be 
      # renamed both with a number and letter, for instance 4a
      @abnormalNamingTag = "pupil-context-interview"
      @abnormalNamingReplacement = "exit_interview"
      
      # Used to give letters to exit_interviews
      @alphabetLetters = ["", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"]
      @betweenColonsIgnore = [":lang-spec", ":kodi-kunyumba-kwanu-kuli-zinthu-ngati-izi", ":16b"]
    
    # This is where the real work starts
    
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

            # unfortunate cleaning code
            allSubtests = new Subtests
            allSubtests.fetch 
              success: ( collection ) =>
            
                # create first row
                @surveyColumns = {}
                subtests = collection.where { assessmentId : @assessmentId }

                surveys = collection.where
                  assessmentId : @assessmentId
                  prototype    : "survey" 

                for subtest in surveys
                  subtestName = subtest.attributes.name.toLowerCase().dasherize()
                  @surveyColumns[subtestName] = []
                  for question in allQuestions.where { subtestId : subtest.id }
                    questionVariable = question.attributes.name.toLowerCase().dasherize()
                    if @reduceExclusive? && @reduceExclusive == true && question.attributes.type == "single"
                      @surveyColumns[subtestName].push subtestName + ":" + questionVariable
                      
                    else if question.attributes.type == "single"
                      for option in question.attributes.options
                        valueName = option.value
                        @surveyColumns[subtestName].push subtestName + ":" + questionVariable + ":" + valueName
                    else if question.attributes.type == "multiple"
                      for option in question.attributes.options
                        valueName = option.value
                        @surveyColumns[subtestName].push subtestName + ":" + questionVariable + ":" + valueName
                    else if question.attributes.type == "open"
                      @surveyColumns[subtestName].push subtestName + ":" + questionVariable + ":" + question.attributes.name

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

                      if gridsByName[subtestValue.name]? and _.keys(subtestValue.data.letters_results).length != gridsByName[subtestValue.name].items.length
                        subtestValue.data.letters_results = []
                        for item, i in gridsByName[subtestValue.name].items
                          subtestValue.data.letters_results[i] = {}
                          subtestValue.data.letters_results[i][item] = if ( i < parseInt(subtestValue.data.last_attempted) ) then "checked" else "missing"
                        for markIndex, i in subtestValue.data.mark_record
                          markIndex--
                          key = ""
                          for k, v of subtestValue.data.letters_results[markIndex]
                            key = k
                          subtestValue.data.letters_results[markIndex][key] = if (subtestValue.data.letters_results[markIndex][key] == "checked") then "unchecked" else "checked"
                      

                    if @reduceExclusive? && @reduceExclusive == true
                      for dataKey, dataValue of subtestValue.data
                        if dataKey in @singleQuestions
                          for k, v of dataValue
                            singleResult = k if v == "checked" 
                          subtestValue.data[dataKey] = singleResult
                
                @render()
    
    @disallowedKeys = ["mark_record"]
    @metaKeys = ["enumerator","starttime","timestamp"]
    

  render: ->
    if @results? && @results[0]?
      tableHTML = ""

      resultDataArray = []

      keys = []

      for metaKey in @metaKeys
        keys.push metaKey

      maxIndex = 0
      maxSubtests = -1
      for subtest, i in @results
        subtestLength = subtest.attributes.subtestData.length
        if subtestLength >= maxSubtests
          maxSubtests = subtestLength
          maxIndex = i

      for subtestValue in @results[maxIndex].attributes.subtestData
        subtestName = subtestValue.name.toLowerCase().dasherize()
        if subtestName in _.keys(@surveyColumns)
          keys = keys.concat(@surveyColumns[subtestName])
        else
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
                valueName = dataKey.toLowerCase().dasherize()
                variableName = subtestName + ":" + valueName
                keys.push variableName

      resultDataArray.push keys

      for result, d in @results
        values = []
        for metaKey in @metaKeys
          values.push result.attributes[metaKey]
          
        if result?
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
                        #console.log "1st level: #{variableName}"
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
                      #console.log "2nd level: #{variableName}"
                      valueIndex = keys.indexOf(variableName)
                      if keys.indexOf(variableName) != -1
                        values[valueIndex] = value
                else
                  valueName = dataKey.toLowerCase().dasherize()
                  variableName = subtestName + ":" + valueName
                  #console.log "3rd level: #{variableName}"
                  valueIndex   = keys.indexOf(variableName)
                  values[valueIndex] = dataValue if valueIndex != -1

        resultDataArray.push values
      
      for rowNumber, row of resultDataArray
        
        # Begin Taylor's Edits for Malawi 2012 EGRA May
        if @malawi2012EGRA
          if rowNumber == "0"
            lastNumberedReplace = "**TRASHVALUE**"
            lastAbnormalReplace = "**TRASHVALUE**"
            index = 0
            letterIndex = 0
            for i, key of resultDataArray[0]
              if @replaceMapKeys[key]? # Is it a simple substitute?
                resultDataArray[0][i] = @replaceMapKeys[key]
                index = 0
              else # Or do we need to add numbering?
                for prefixTag, replacement of @replaceWithNumbering
                  if ~key.indexOf(prefixTag)
                    if lastNumberedReplace == prefixTag
                      index++
                    else
                      lastNumberedReplace = prefixTag
                      index = 1
                    resultDataArray[0][i] = replacement + index.toString()
                if ~key.indexOf(@abnormalNamingTag)
                  
                  if lastNumberedReplace != @abnormalNamingTag
                    index = 0
                    lastNumberedReplace = @abnormalNamingTag
                    
                  indexFirstColon = key.indexOf(":")
                  indexLastColon = key.lastIndexOf(":")
                  betweenColons = key.substring(indexFirstColon, indexLastColon)
                  if indexFirstColon == indexLastColon or ~@betweenColonsIgnore.indexOf(betweenColons)
                    index++
                    letterIndex = 0
                  else if betweenColons != lastAbnormalReplace
                    letterIndex = 1
                    index++
                    lastAbnormalReplace = betweenColons
                  else
                    letterIndex++
                    index++ if letterIndex == 1
                  resultDataArray[0][i] = @abnormalNamingReplacement + 
                    index.toString() + @alphabetLetters[letterIndex]
                  
                  
                  
          else
            for i, value of resultDataArray[rowNumber]
              for mapKey, mapValue of @replaceMapValues
                if _.isBoolean(value) # Handle values that pretend to be a boolean
                  value = value.toString()
                if ~mapValue.indexOf(value) # Can we convert it?
                  resultDataArray[rowNumber][i] = mapKey
        
        # End Taylor's Edits for Malawi 2012 EGRA May

      for row, i in resultDataArray
        tableHTML += "<tr>"
        count = 0
        for index in [0..row.length-1]
          tableHTML += "<td>#{row[index]}</td>"
          count++
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