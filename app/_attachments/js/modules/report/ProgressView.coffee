class ProgressView extends Backbone.View

  INDIVIDUAL : 1
  AGGREGATE  : 2

  className : "ProgressView"

  events:
    'click .back'            : 'goBack'
    'click .select_itemType' : 'selectItemType'
    'click .xtick'           : 'selectAssessment'

  # ! - variable name FUBAR
  # assessment = part = week
  selectAssessment: (event) ->
    @selected.week = parseInt($(event.target).attr('data-index'))
    @updateTable()
    @updateFlot()

  selectItemType: (event) ->
    @selected.itemType = $(event.target).attr('data-itemType')
    @updateTable()
    @updateFlot()

  goBack: -> history.go -1

  initialize: (options) ->

    #
    # Arguments and member vars
    #
    @results      = options.results
    @student      = options.student
    @subtests     = options.subtests
    @klass        = options.klass

    # Catch things that "look" "odd"
    if not @klass?          then Utils.log @, "No klass."
    if not @subtests?       then Utils.log @, "No progress type subtests."
    if @results.length == 0 then Utils.log @, "No result data."

    @mode = if @student? then @INDIVIDUAL else @AGGREGATE

    @subtestNames   = {}
    @benchmarkScore = {}
    @rows           = []
    @partCount      = 0
    @flot           = null # for flot
    @lastPart       = Math.max.apply @, _.compact(@subtests.pluck("part"))
    @resultsByPart = []
    @itemTypeList  = {}
    @selected =
      "itemType" : null
      "week"     : 0

    #
    # Find out how many parts belong to the progress report
    # Make a names by pertinentIndex and itemType
    #
    parts = []
    for subtest in @subtests.models
      parts.push subtest.get("part") if !~parts.indexOf(subtest.get("part"))

      # get names
      i = parts.indexOf(subtest.get("part"))
      @subtestNames[i] = {} if not @subtestNames[i]?
      @subtestNames[i][subtest.get("itemType")] = subtest.get("name")

    @partCount = parts.length

    #
    # make the resultsByPart and the itemTypeList
    #
    @resultsByPart = @results.indexBy "part"
    @itemTypeList[result.get("itemType").toLowerCase()] = true for result in @results.models
    @itemTypeList = _.keys(@itemTypeList)

    #
    # Compile data and save to @rows
    # this is for the table
    #

    # iterate through all weeks
    for part in [1..@lastPart]

      if @resultsByPart[part] == undefined then continue # if there's no results for that week, skip it

      # iterate through all itemTypes for this week
      itemTypes = {}
      for result, i in @resultsByPart[part]

        if @mode == @INDIVIDUAL && result.get("studentId") != @student.id then continue

        itemType = result.get("itemType")

        # select first itemType
        @selected.itemType = itemType if not @selected.itemType?

        # push an object
        itemTypes[itemType] = [] if not itemTypes[itemType]?
        itemTypes[itemType].push
          "name"           : itemType.titleize()
          "key"            : itemType
          "correct"        : result.get "correct"
          "attempted"      : result.get "attempted"
          "itemsPerMinute" : result.getCorrectPerSeconds(60)

        @benchmarkScore[itemType] = @subtests.get(result.get("subtestId")).getNumber("scoreTarget")

      # each row is one week/part
      @rows.push
        "part"      : part
        "itemTypes" : (_.values(itemTypes)) # object -> array

    #
    # Aggregate mode averages data across students
    #
    @rows = @aggregate @rows
    
    #
    # Make flot data
    #
    pointsByItemType = {}
    for row, i in @rows
      for itemType in row.itemTypes
        pointsByItemType[itemType.key] = [] if not pointsByItemType[itemType.key]? 
        pointsByItemType[itemType.key].push [i+1, itemType.itemsPerMinute]
    @flotData      = []
    @benchmarkData = []
    i = 0

    for name, data of pointsByItemType
      key = name.toLowerCase()
      @flotData[key] = {
        "data"  : data
        "label" : name.titleize()
        "key"   : key
        "lines" :
          "show" : true
        "points" :
          "show" : true
      }

    #
    # Create benchmark flot graphs
    #
    @flotBenchmark = []
    for itemType, subtests of @subtests.indexBy("itemType")
      dataForBenchmark = []
      for subtest, i in subtests
        dataForBenchmark.push [i+1, subtest.getNumber("scoreTarget")]

      @flotBenchmark[itemType.toLowerCase()] = {
        "label" : "Progress benchmark"
        "data" : dataForBenchmark
        "lines" :
          "show"  : true
          "color" : "green"
      }

    #
    # create warning thresholds
    #
    @warningThresholds = {}
    for itemType, subtests of @subtests.indexBy("itemType")
      @warningThresholds[itemType] = []
      for subtest, i in subtests
        @warningThresholds[itemType.toLowerCase()].push 
          target: subtest.getNumber("scoreTarget")
          spread: subtest.getNumber("scoreSpread")


    @renderReady = true
    @render()

  render: ->
    return if not @renderReady
    $window = $(window)
    win = 
      h : $window.height()
      w : $window.width()
    html = "
      <h1>Progress table</h1>
      <h2>#{if @mode == @INDIVIDUAL then @student.get("name") else ""}</h2>
    "

    #
    # Flot containers
    #
    html += "
      <div id='flot-menu'>
      "
    for key, flotObject of @flotData
      html += "<button class='command select_itemType' data-itemType='#{flotObject.key}'>#{flotObject.label}</button>"

    html += "
      </div>
      <div id='flot-container' style='width: #{window.w*0.8}px; height:300px;'></div>
    "

    #
    # Set the table
    #
    html += "
    <div id='table_container'></div>
    <button class='navigation back'>#{t('back')}</button>
    "

    @$el.html html
    @updateTable()
    @trigger "rendered"

  afterRender: =>
    @updateFlot()

  updateTable: ->

    type = @selected.itemType
    week = @selected.week



    html = "<table class='tabular'>"
    for row, i in @rows
      # skip if selected row doesn't have any of the selected item type
      continue if !~_.pluck(row.itemTypes, "key").indexOf(type)
      html += "<tr><th>#{@subtestNames[i][type]}</th></tr><tr>"
      for itemType in row.itemTypes
        if itemType.key != type then continue
        html += "
          <tr>
            <td>#{itemType.name} correct</td><td>#{itemType.correct}/#{itemType.attempted}</td>
            <td>#{itemType.name} per minute</td><td>#{itemType.itemsPerMinute}</td>
          </tr>
         "
    html += "</table>"

    #
    # Add warning if all students mode
    #

    if week >= @rows.length
      html += "<section>No data for this assessment.</section>"
    else if @mode == @AGGREGATE

      score = 0

      data = if @flotData[type]?
        @flotData[type].data
      else
        []

      for datum in data
        if datum[0] == week+1
          score = datum[1] 

      threshold = @warningThresholds[type][week]

      high = threshold.target + threshold.spread
      low  = threshold.target - threshold.spread
      difference = score - threshold.target

      if score > high
        result = "#{difference} above the benchmark"
        warnings = "Your class is doing well, #{result}, continue with the reading program. Share your and your class’ great work with parents. Reward your class with some fun reading activities such as reading marathons or competitions. However, look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind."
      else if score < low
        result = "#{Math.abs(difference)} below the benchmark"
        warnings = "Your class is performing below the grade-level target, #{result}. Plan for additional lesson time focusing on reading in consultation with your principal. Encourage parents to spend more time with reading materials at home – remind them that you are a team working together to help their children learning to read. Think about organizing other events and opportunities for practice, e.g., reading marathons or competitions to motivate students to read more."
      else
        if difference * -1 == Math.abs(difference)
          adjective = "above"
        else
          adjective = "below"
        result = (score - threshold.score) + " #{adjective} the benchmark"
        warnings = "Your class is in line with expectations, #{result}, continue with the reading program and keep up the good work! Look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind."

      html += "
        <section>
          #{warnings}
        </section>
      "

    @$el.find("#table_container").html html


  updateFlot: =>
    #
    # Flot options
    #
    @flotOptions =
      "xaxis" :
        "min"           : 0.5
        "max"           : @partCount + 0.5
        "ticks"         : ( String( i ) for i in [1..@partCount] )
        "tickDecimals"  : 0
        "tickFormatter" : ( num ) => "<button class='xtick #{if num-1==@selected.week then 'selected' else ''}' data-index='#{num-1}'>#{@subtestNames[num-1][@selected.itemType]}</button>"
      "grid" :
        "markings" :
          "color"  : "#ffc"
          "xaxis"  : 
            "to"   : @selected.week + 0.5
            "from" : @selected.week - 0.5

    displayData = [ @flotData[@selected.itemType], @flotBenchmark[@selected.itemType] ]
    @flot = $.plot @$el.find("#flot-container"), displayData, @flotOptions


  # Takes the results for each itemType and replaces them with an average
  aggregate: (oldRows) ->
    newRows = []
    for row, i in oldRows
      newRows[i] =
        "part"      : row.part
        "itemTypes" : []

      for results in row.itemTypes

        # blank
        mean =
          "name"           : ""
          "key"            : ""
          "correct"        : 0
          "attempted"      : 0
          "itemsPerMinute" : 0

        # add
        for result in results
          mean.name           = result.name
          mean.key            = result.key
          mean.correct        += result.correct
          mean.attempted      += result.attempted
          mean.itemsPerMinute += result.itemsPerMinute

        # divide
        mean.correct        /= results.length
        mean.attempted      /= results.length
        mean.itemsPerMinute /= results.length

        # Round
        mean.correct = Math.round(mean.correct)
        mean.attempted = Math.round(mean.attempted)
        mean.itemsPerMinute = Math.round(mean.itemsPerMinute)

        # replace values in @rows
        newRows[i].itemTypes.push mean

    return newRows

class SortedCollection
  constructor: (options) ->
    @sorted    = []
    @models    = options.models
    @attribute = options.attribute
    