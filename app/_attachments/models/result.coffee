class Result extends Backbone.Model
  url: "/result"

  subtestResults: ->
    subtestTypesToSkip = [
      "ConsentPage",
      "TextPage"
    ]
    resultCollection = {}
    _.each @toJSON(),  (result, subtestName) =>
      return if _.contains(subtestTypesToSkip, subtestName)
      resultCollection = _.extend(resultCollection, @summaryData(subtestName,result))
    return resultCollection

  summaryData: (subtestName,result) ->
    unless result.subtestType?
      return switch subtestName
        when "timestamp"
          FinishTime: new Date(result)
        when "enumerator"
          Enumerator: result
        else
          {}
    if result.skipped
      returnValue = {}
      returnValue[subtestName] = "Skipped"
      return returnValue
    return switch result.subtestType
      when "DateTimePage"
        Student: result["student-id"]
        StartTime: new Date("#{result.month} #{result.day}, #{result.year} #{result.time}")
      when "Dictation"
        DictationScore: _.values(result).reduce((sum,n) -> (sum+=n))
      when "SchoolPage"
        School: result.name
      when "StudentIdPage"
        Student: result.student_id
      when "StudentInformationPage"
        gender = result.gender ? result["m--gender"]
        Gender: gender if gender
      when "ToggleGridWithTimer"
        returnValue = {}
        returnValue[subtestName] = Result.GridTemplate(result)
        returnValue
      when "Phonemes"
        Phonemes: _.keys(result).length
      when "UntimedSubtest","UntimedSubtestLinked"
        returnValue = {}
        filteredResult = {}
        for key, value of result
          if key != "subtestType"
            filteredResult[key] = value
        returnValue[subtestName] = Result.CountCorrectIncorrect(filteredResult)
        returnValue
      when "PupilContextInterview"
        PupilContextInterview: _.keys(result).length
      when "ResultsPage"
        Comments: result.resultComment

Result.CountCorrectIncorrect = (result) ->
  return _.values(result).reduce( (memo,result) ->
     memo.itemsCorrect+=1 if result=="Correct"
     memo.attempted+=1
     return memo
  , {itemsCorrect:0,attempted:0})

Result.GridTemplate = (result) ->
  itemsCorrect = 0
  for itemResult,index in result.items
    if index <= result.attempted
      itemsCorrect++ if itemResult
  return {
    itemsCorrect: itemsCorrect
    attempted: result.attempted
    total: result.items.length
  }
