class StudentToDateView extends Backbone.View

  events:
    "click .back" : "goBack"

  goBack: ->
    history.back()

  initialize: (options) ->

    milisecondsPerPart = 604800000
    @currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart)

    @range = (i for i in [1..@currentPart])

    subtestsByPart = []

    for subtest in options.subtests
      subtestPart = subtest.get("part")

      if subtestsByPart[subtestPart]?
        subtestsByPart[subtestPart].push subtest 
      else
        subtestsByPart[subtestPart] = [subtest]

    subtestsByResultsBucket = []
    resultsByBucketByPart = {}

    for subtests, i in subtestsByPart
      if subtests == undefined then continue
      for subtest in subtests

        if resultsByBucketByPart[subtest.get("resultBucket")] == undefined
          resultsByBucketByPart[subtest.get("resultBucket")]  = []
          subtestsByResultsBucket[subtest.get("resultBucket")]  = []

        resultsByBucketByPart[subtest.get("resultBucket")][i] = options.results.where({"subtestId" : subtest.id})
        subtestsByResultsBucket[subtest.get("resultBucket")].push subtest.get("items")

    # should we use lines or dots
    bucketType = []
    for bucketKey, subtests of subtestsByResultsBucket
      bucketType[bucketKey] = null
      if _.union.apply(this, (element.length for element in subtests)).length == 1
        bucketType[bucketKey] = "lines"
      else
        bucketType[bucketKey] = "points"



    flotArrays = []

    for bucketKey, bucket of resultsByBucketByPart

      for part, result of bucket

        if flotArrays[bucketKey] == undefined then flotArrays[bucketKey] = []
        if result? && result[0]? && result[0].get?
          correctItems = 0
          totalItems   = 0
          for item in result[0].get("subtestData").items
            correctItems++ if item.itemResult == "correct"
            totalItems++
          percentCorrect = (correctItems / totalItems) * 100
          flotArrays[bucketKey].push [parseInt(part), percentCorrect]
        else
          flotArrays[bucketKey].push [parseInt(part), 0]


    @flotData = []
    for bucket, flotArray of flotArrays

      flotArray = _.reject flotArray, (arr) =>
        arr[0] > @currentPart

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
      <button class='navigation back'>#{t('back')}</button>
      <h1>#{t('student progress report')}</h1>
      <div id='chart' style='width:450px; height:300px;'></div>
    "

    @trigger "rendered"

    lineColor = "#BDDC93"

  afterRender: =>
    
    $.plot @$el.find("#chart"), @flotData, @flotOptions

