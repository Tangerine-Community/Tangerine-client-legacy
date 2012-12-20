class ProgressView extends Backbone.View

  INDIVIDUAL : 1
  AGGREGATE  : 2

  className : "ProgressView"
  events:
    'click .back'          : 'goBack'
    'click .select_itemType' : 'selectItemType'

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
      "week"     : null

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

        @benchmarkScore[itemType] = @subtests.get(result.get("subtestId")).get("benchmarkScore") || 60

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
        key = itemType.name.toLowerCase()
        pointsByItemType[key] = [] if not pointsByItemType[key]? 
        pointsByItemType[key].push [i+1, itemType.itemsPerMinute]
    @flotData      = []
    @benchmarkData = []
    i = 0

    for name, data of pointsByItemType
      key = name.toLowerCase()
      @flotData[key]  = {
        "data"  : data
        "label" : name.titleize()
        "key"   : key
        "lines" :
          "show" : true
        "points" :
          "show" : true
      }

      #
      # Draw a line from the first result to the benchmark of the last
      #
      firstResultInItemType = data[0][1]
      @benchmarkData[key] = {
        "label" : "Progress benchmark"
        "data" : [
          [1,          firstResultInItemType]
          [@partCount, @benchmarkScore[key]]
        ]
        "lines" :
          "show"  : true
          "color" : "green"
      }

    @renderReady = true
    @render()

  render: ->
    if not @renderReady then return
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
    html = "<table class='tabular'>"
    for row, i in @rows
      # skip if selected row doesn't have any of the selected item type
      continue if !~_.pluck(row.itemTypes, "key").indexOf(@selected.itemType) 
      html += "<tr><th>#{@subtestNames[i][@selected.itemType]}</th><tr><tr>"
      for itemType in row.itemTypes
        if itemType.key != @selected.itemType then continue
        html += "<td>#{itemType.name} correct</td><td>#{itemType.correct}/#{itemType.attempted}</td>"
        html += "<td>#{itemType.name} per minute</td><td>#{itemType.itemsPerMinute}</td>"
    html += "</table>"
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
        "tickFormatter" : ( num ) => "<button class='xtick' data-index='#{num}'>#{@subtestNames[num-1][@selected.itemType]}</button>"
      "grid" :
        "markings" :
          "color"  : "#ffc"
          "xaxis"  : 
            "to"   : @selected.week + 0.5
            "from" : @selected.week - 0.5

    displayData = [ @flotData[@selected.itemType], @benchmarkData[@selected.itemType] ]
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
    