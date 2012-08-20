class KlassToDateView extends Backbone.View

  initialize: (options) ->
    milisecondsPerWeek = 604800000
    @currentWeek = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerWeek)
    @range = (i for i in [1..@currentWeek])

    subtestsByWeek = []
    maxWeek = 0
    for subtest in options.subtests
      subtestWeek = subtest.get?("week")
      maxWeek = subtestWeek
      if subtestsByWeek[subtestWeek]?
        subtestsByWeek[subtestWeek].push subtest 
      else
        subtestsByWeek[subtestWeek] = [subtest]

    resultsByWeek = []

    for subtests, i in subtestsByWeek
      if not subtests? then continue
      for subtest, j in subtests
        if resultsByWeek[i]?
          resultsByWeek[i] = resultsByWeek[i].concat options.results.where({"subtestId" : subtest.id})
        else
          resultsByWeek[i] = options.results.where({"subtestId" : subtest.id})

    @percentageCorrectByWeek  = []
    @collectionCompleteByWeek = []

    for results, i in resultsByWeek
      @collectionCompleteByWeek[i] = 0
      @percentageCorrectByWeek[i] = 0
      if not results? then continue
      if results.length != 0
        @collectionCompleteByWeek[i] = (results.length / (options.studentCount * subtestsByWeek.length) ) * 100;

      totalItems = 0
      correctItems = 0
      for result in results
        if not result.get? then continue
        for itemResult in result.get("subtestData").items
          correctItems++ if itemResult == "correct" 
          totalItems++

      if totalItems != 0
        @percentageCorrectByWeek[i] = (correctItems / totalItems) * 100

  render: ->
    html = "
      <h1>Class to date</h1>
    "
    html += "
    <table id='chart'>
    <caption>Wicked chart</caption>
    <thead>
      <tr>
      "
    html += "<th scope='col'>#{i}</th>" for i in @range
    html += "
    </tr>
    </thead>
    <tbody>
      <tr>
        <th scope='row'>Collection Complete</th>"
    html += "<td>#{@collectionCompleteByWeek[i]}</td>" for i in @range
    html += "
      </tr>
      <tr>
        <th scope='row'>Percentage Correct</th>"
    html += "<td>#{@percentageCorrectByWeek[i]}</td>" for i in @range
    html += "
      </tr>
    </tbody>
    </table>
    "

    @$el.html html

    @trigger "rendered"

    lineColor = "#BDDC93"

  afterRender: ->
    @$el.find('#chart').visualize
      "type" : "line"
    @$el.find('#chart').hide()
