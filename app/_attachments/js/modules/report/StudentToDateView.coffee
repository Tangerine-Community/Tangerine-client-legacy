class StudentToDateView extends Backbone.View

  events:
    "click .xtick" : "changeCurrentIndex"

  changeCurrentIndex: (event) ->
    $target = $(event.target)
    @currentIndex = parseInt($target.attr("data-index"))
    @processResults()
    @readyFlot()
    @afterRender()

  bucketize: (bucketList) ->
    result = []
    for bucket in bucketList
      result[bucket]= []
    return result

  initialize: (options) ->
    milisecondsPerPart = 604800000
    @currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart)
    @currentIndex = @currentPart if not @currentIndex?

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
    @subtestsByResultsBucket = []
    @resultsByBucketByPart = {}
    for subtests, i in subtestsByPart
      if subtests == undefined then continue
      for subtest in subtests
        if @resultsByBucketByPart[subtest.get("resultBucket")] == undefined
          @resultsByBucketByPart[subtest.get("resultBucket")]  = []
          @subtestsByResultsBucket[subtest.get("resultBucket")]  = []
        @resultsByBucketByPart[subtest.get("resultBucket")][i] = options.results.where({"subtestId" : subtest.id, "klassId" : options.klass.id, "studentId": options.studentId})
        @subtestsByResultsBucket[subtest.get("resultBucket")].push subtest

    @bucketList = _.keys(@resultsByBucketByPart)

    @resultsByPart = []

    for subtests, i in subtestsByPart
      if not subtests? then continue
      for subtest, j in subtests
        if @resultsByPart[i]?
          @resultsByPart[i] = @resultsByPart[i].concat options.results.where({"subtestId" : subtest.id})
        else
          @resultsByPart[i] = options.results.where({"subtestId" : subtest.id})

    @processResults()
    @readyFlot()

  processResults: ->
    @percentagesByStudent = []

    # count correct in each bucket
    @flotArrays = @bucketize @bucketList
    for bucketKey, bucket of @resultsByBucketByPart
      for part, results of bucket
        percentages = []
        for result in results
          basicStats = @getBasicStats result 
          percentages.push basicStats.percentCorrect
        if results.length > 0
          @flotArrays[bucketKey].push [parseInt(part), Math.ave.apply(this, percentages)]
          if parseInt(part) == @currentIndex
            @percentagesByStudent[bucketKey] = percentages
    console.log @percentagesByStudent

    @warnings = Tangerine.ReportWarnings["StudentToDateView"]
      percentages : @percentagesByStudent
      studentName : @options.student.get("name")
      

  readyFlot: ->

    # should we use lines or dots
    bucketType = @bucketize @bucketList
    for bucketKey, subtests of @subtestsByResultsBucket
      if subtests[0]?.get?("timer") > 0 && _.flatten(@resultsByBucketByPart[subtests[0].get('resultBucket')]).length > 1
        bucketType[bucketKey] = "lines"
      else
        bucketType[bucketKey] = "points"


    @flotData = []
    for bucket, flotArray of @flotArrays

      # get rid of anything that hasn't happened yet
      flotArray = _.reject flotArray, (arr) => arr[0] > @currentPart

      # add one (linepoint) at the same level, just offscreen so that it's a line
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
        tickFormatter : (num) -> "<button class='command xtick' data-index='#{num}'>#{num}</button>"
      "grid" :
        "markings" : [
          "color" : "#ffc"
          "xaxis" : 
            "to" : @currentIndex  + 0.5
            "from": @currentIndex - 0.5
        ]

  getBasicStats: (result) ->

    correctItems = 0
    totalItems   = 0

    for item in result.get("subtestData").items
      correctItems++ if item.itemResult == "correct"
      totalItems++

    percentCorrect = (correctItems / totalItems) * 100

    return {
      "percentCorrect" : percentCorrect
      "correctItems" : correctItems
      "totalItems" : totalItems
      "studentId" : result.get "studentId"
    }
            
  render: ->
    @$el.html "
      <h1>#{t('student progress report')}</h1>
      <h2>#{@options.student.get('name')}</h2>
      <div id='chart' style='width:450px; height:300px;'></div>
      <div id='warnings'></div>
    "

    @trigger "rendered"

    lineColor = "#BDDC93"

  afterRender: =>
    warningsHTML = ""
    if @warnings.length > 0 
      warningsHTML = "<div class='warnings'>
        <b>Warning</b><br>"
      for warning in @warnings
        warningsHTML += warning.html
      warningsHTML += "</div>"
      @$el.find("#warnings").html warningsHTML
    else
      @$el.find("#warnings").html ""

    @flotOptions["legend"] = 
      "show"      : true
      
    @plot = $.plot @$el.find("#chart"), @flotData, @flotOptions


