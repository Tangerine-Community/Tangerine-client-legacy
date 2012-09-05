class KlassToDateView extends Backbone.View

  initialize: (options) ->
    milisecondsPerPart = 604800000
    @currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart)
    @range = (i for i in [1..@currentPart])

    # group subtests by part
    subtestsByPart = []
    for subtest in options.subtests
      subtestPart = subtest.get("part")
      if subtestsByPart[subtestPart]?
        subtestsByPart[subtestPart].push subtest 
      else
        subtestsByPart[subtestPart] = [subtest]


    # sort subtests-by-part, by result bucket
    subtestsByResultsBucket = []
    resultsByBucketByPart = {}
    for subtests, i in subtestsByPart
      if subtests == undefined then continue
      for subtest in subtests
        if resultsByBucketByPart[subtest.get("resultBucket")] == undefined
          resultsByBucketByPart[subtest.get("resultBucket")]  = []
          subtestsByResultsBucket[subtest.get("resultBucket")]  = []
        resultsByBucketByPart[subtest.get("resultBucket")][i] = options.results.where({"subtestId" : subtest.id, "klassId" : options.klass.id})
        subtestsByResultsBucket[subtest.get("resultBucket")].push subtest


    # should we use lines or dots
    bucketType = []
    for bucketKey, subtests of subtestsByResultsBucket
      bucketType[bucketKey] = null
      if subtests[0]?.get?("timer") > 0 && _.flatten(resultsByBucketByPart[subtests[0].get('resultBucket')]).length > 1
        bucketType[bucketKey] = "lines"
      else
        bucketType[bucketKey] = "points"


    resultsByPart = []

    for subtests, i in subtestsByPart
      if not subtests? then continue
      for subtest, j in subtests
        if resultsByPart[i]?
          resultsByPart[i] = resultsByPart[i].concat options.results.where({"subtestId" : subtest.id})
        else
          resultsByPart[i] = options.results.where({"subtestId" : subtest.id})
      

    # count correct in each bucket
    flotArrays = []
    for bucketKey, bucket of resultsByBucketByPart
      for part, results of bucket
        if flotArrays[bucketKey] == undefined then flotArrays[bucketKey] = []
        if results
          correctItems = 0
          totalItems   = 0
          for result in results
            for item in result.get("subtestData").items
              correctItems++ if item.itemResult == "correct"
              totalItems++
          percentCorrect = (correctItems / totalItems) * 100
          flotArrays[bucketKey].push [parseInt(part), percentCorrect]




    @flotData = []
    for bucket, flotArray of flotArrays
      flotArray = _.reject flotArray, (arr) => arr[0] > @currentPart
      if bucketType[bucket] == "lines"
        flotArray.push [@currentPart + 1, _.last(flotArray)[1]]

      oneObject = {
        "label" : bucket
        "data" : flotArray
      }
      oneObject[bucketType[bucket]] = 
        "show" : true
        "radius" : 4
        "width" : 4
        

      @flotData.push oneObject


    @flotOptions = 
      "yaxis" : 
        min: 0
        max: 100
        ticks: 10
      "xaxis" :
        min : 0.5
        max : @currentPart + 0.5
        ticks: (String(i) for i in [1..@currentPart])
        tickDecimals : 0

  render: ->
    @$el.html "
      <h1>#{t('class progress report')}</h1>
      <p>This class has #{@options.studentCount} students.</p>
      <div id='chart' style='width:450px; height:300px;'></div>
    "

    @trigger "rendered"

    lineColor = "#BDDC93"

  afterRender: =>
    
    $.plot @$el.find("#chart"), @flotData, @flotOptions

