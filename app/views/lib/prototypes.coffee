utils = require("views/lib/utils")
pair        = utils.pair
exportValue = utils.exportValue

pairsLocation = ( subtest ) ->
  for label, i in subtest.data.labels
    row.push pair(label, subtest.data.location[i])


pairsDatetime = ( subtest, datetimeSuffix ) ->
  months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

  if ~months.indexOf(subtest.data.month.toLowerCase())
    monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
  else
    monthData = subtest.data.month

  row.push pair("year#{datetimeSuffix}",        subtest.data.year)
  row.push pair("month#{datetimeSuffix}",       monthData)
  row.push pair("date#{datetimeSuffix}",        subtest.data.day)
  row.push pair("assess_time#{datetimeSuffix}", subtest.data.time)

pairsObservation = ( subtest ) ->
  for observations, i in subtest.data.surveys
  observationData = observations.data
  for surveyVariable, surveyValue of observationData
    if surveyValue is Object(surveyValue) # multiple type question
      for optionKey, optionValue of surveyValue
        row.push pair("#{surveyVariable}_#{optionKey}_#{i+1}", exportValue(optionValue))
    else # single type question or open
      row.push pair("#{surveyVariable}_#{i+1}", exportValue(surveyValue))


pairsGrid = ( subtest ) ->

  log "subtest exists? #{subtest?}"

  row = []

  variableName = subtest.data.variable_name
  row.push pair("#{variableName}_auto_stop",                  subtest.data.auto_stop)
  row.push pair("#{variableName}_time_remain",                subtest.data.time_remain)
  row.push pair("#{variableName}_attempted",                  subtest.data.attempted)
  row.push pair("#{variableName}_item_at_time",               subtest.data.item_at_time)
  row.push pair("#{variableName}_time_intermediate_captured", subtest.data.time_intermediate_captured)

  for item, i in subtest.data.items
    row.push pair("#{variableName}#{i+1}", exportValue(item.itemResult))

  return row

pairsSurvey = ( subtest ) ->

  for surveyVariable, surveyValue of subtest.data
  if surveyValue is Object(surveyValue) # multiple type question
    for optionKey, optionValue of surveyValue
      row.push pair("#{surveyVariable}_#{optionKey}", exportValue(optionValue))
  else # single type question or open
    row.push pair(surveyVariable, exportValue(surveyValue)) # if open just show result, otherwise translate not_asked



pairsGps = (subtest) ->

  row.push pair("latitude",         subtest.data.lat )
  row.push pair("longitude",        subtest.data.long )
  row.push pair("accuracy",         subtest.data.acc )
  row.push pair("altitude",         subtest.data.alt )
  row.push pair("altitudeAccuracy", subtest.data.altAcc )
  row.push pair("heading",          subtest.data.heading )
  row.push pair("speed",            subtest.data.speed )
  row.push pair("timestamp",        subtest.data.timestamp )


if typeof(exports) == "object"
  exports.pairsGrid = pairsGrid
