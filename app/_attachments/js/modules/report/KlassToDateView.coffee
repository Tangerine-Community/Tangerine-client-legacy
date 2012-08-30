class KlassToDateView extends Backbone.View

  initialize: (options) ->
    milisecondsPerPart = 604800000
    @currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart)
    @range = (i for i in [1..@currentPart])

    subtestsByPart = []
    maxPart = 0
    for subtest in options.subtests
      subtestPart = subtest.get?("part")
      maxPart = subtestPart
      if subtestsByPart[subtestPart]?
        subtestsByPart[subtestPart].push subtest 
      else
        subtestsByPart[subtestPart] = [subtest]

    resultsByPart = []

    for subtests, i in subtestsByPart
      if not subtests? then continue
      for subtest, j in subtests
        if resultsByPart[i]?
          resultsByPart[i] = resultsByPart[i].concat options.results.where({"subtestId" : subtest.id})
        else
          resultsByPart[i] = options.results.where({"subtestId" : subtest.id})
      
    @percentageCorrectByPart  = []
    @collectionCompleteByPart = []

    for results, i in resultsByPart
      @collectionCompleteByPart[i] = 0
      @percentageCorrectByPart[i] = 0
      if not results? then continue
      if results.length != 0
        @collectionCompleteByPart[i] = (results.length / (options.studentCount * subtestsByPart.length) ) * 100;

      totalItems = 0
      correctItems = 0
      for result in results
        for item in result.get("subtestData").items
          correctItems++ if item.itemResult == "correct"
          totalItems++

      if totalItems != 0
        @percentageCorrectByPart[i] = (correctItems / totalItems) * 100

  render: ->
    @$el.html "
      <h1>Class to date</h1>
      <div id='chart' style='width:450px; height:300px;'></div>
    "

    @trigger "rendered"

    lineColor = "#BDDC93"

  afterRender: =>
    $.plot(@$el.find("#chart"), [ @collectionCompleteByPart[1..@currentPart], @percentageCorrectByPart[1..@currentPart] ])

