class PrimrDashboardView extends Backbone.View

  className : "PrimrDashboardView"

  events:
    "change [name=startTime]": "update"
    "change [name=endTime]": "update"
    "change #workflow": "update"
    "change #location-filter": "update"
    "change #groupBy": "update"
    "change #shiftHours": "update"

  loadMissingName: (resultId) ->
    $.couch.db(document.location.pathname.match(/^\/(.*?)\//).pop()).openDoc resultId,
      error: (error) => console.err "Could not open result: #{JSON.stringify error}"
      success: (result) =>
        $.couch.db(document.location.pathname.match(/^\/(.*?)\//).pop()).openDoc result.subtestId,
          error: (error) => console.err "Could not open result: #{JSON.stringify error}"
          success: (result) =>
            $("span.missing-name[data-resultId=#{resultId}]").html result.name


  loadLocationData: (tripId) ->
    locationElement = $("td[data-tripId=#{tripId}]")
    locationElement.html "loading..."
    $.couch.db(document.location.pathname.match(/^\/(.*?)\//).pop()).openDoc locationElement.attr("data-resultId"),
      error: (error) => console.err "Could not open GPS result: #{JSON.stringify error}"
      success: (result) =>
        lat = result.subtestData?[0].data?.lat
        long = result.subtestData?[0].data?.long
        accuracy = result.subtestData?[0].data?.acc
        if lat? and long? and accuracy?
          locationElement.html "<a target='_newtab' href='http://maps.google.com/maps?q=#{lat},#{long}+(My+Point)&z=14&ll=#{lat},#{long}'>#{lat} #{long}</a> +- #{accuracy} meters"
        else
          locationElement.html "No location data available"

  update: =>
    @options =
      startTime: $("[name=startTime]").val()
      endTime: $("[name=endTime]").val()
      groupBy: $("#groupBy").val()
      shiftHours: $("#shiftHours").val()
      workflow: $("#workflow").val()
      location: $("#location-filter").val()

    return if moment(@options.startTime).valueOf() > moment(@options.endTime).valueOf()

    urlOptions = _(@options).map (value,option) ->
      "/#{option}/#{value}"
    .join("")

    Tangerine.router.navigate("primr_dashboard#{urlOptions}", false)
    $("#results").empty()
    @render()

  render: =>
    options = @options
    @groupBy = options.groupBy
    @startTime = options.startTime
    @endTime = options.endTime
    @shiftHours = options.shiftHours || 0
    @workflow = options.workflow || "All"

    $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/dashboardResultsByStartTime",
      startkey: moment(@startTime).valueOf()
      endkey: moment(@endTime).valueOf()
      reduce: false
      success: @renderResults

  renderResults: (result) =>
    tableRows = {}
    dates = {}
    propertiesToGroupBy = {}

    # Find the first possible grouping variable and use it if not defined
    @groupBy = _.keys(result.rows[0].value)[0] unless @groupBy?

    @workflows = ["All"]
    @locations = ["All"]
    workflowTrips = {}

    _.each result.rows, (row) =>
      # Get all possible workflows & locations
      @workflows.push row.value.workflowId
      @locations.push _(row.value).chain().map( (value, key) ->
        return "#{key} -> #{value}" if key.match "Location"
      ).compact().value()

      # Filter out chosen filters
      unless @options.workflow is "All"
        return unless row.value.workflowId is @options.workflow
      unless @options.location is "All"
        [locationProperty, locationValue] = @options.location.split(" -> ")
        return unless row.value[locationProperty] is locationValue
      _.each row.value, (value,key) =>
        propertiesToGroupBy[key] = true

      workflowTrips[row.value.tripId] = [] unless workflowTrips[row.value.tripId]?
      workflowTrips[row.value.tripId].push row.value
    @locations = _(@locations).chain().flatten().sort().uniq(true).value()
    console.log @locations
    @workflows = _(@workflows).uniq()

    _.each workflowTrips, (value,tripId) =>
      leftColumn = value[0][@groupBy]


      sortingDate = if value[0].startTime then moment(value[0].startTime).add("h",@shiftHours).format("YYYYMMDD") else "Unknown"
      displayDate = if value[0].startTime then moment(value[0].startTime).add("h",@shiftHours).format("Do MMM") else "Unknown"
      dates[sortingDate] = displayDate
      tableRows[leftColumn] = {} unless tableRows[leftColumn]?
      tableRows[leftColumn][sortingDate] = [] unless tableRows[leftColumn][sortingDate]?
      tableRows[leftColumn][sortingDate].push "
        <tr>
          <td>#{value[0].enumerator}</td>
          <td>#{
            startTimes = _.pluck(value, "startTime").sort()
            if startTimes.length > 1
              beginning = moment startTimes.shift()
              end = moment startTimes.pop()
              difference = end.diff(beginning, 'minutes')
              "#{beginning.format("HH:mm")} - #{end.format("HH:mm")} (#{difference} minutes)"
            else
              moment(startTimes.pop()).format("HH:mm")
          }
          </td>
          <td class='workflowId'>#{value[0].workflowId}</td>
          <td id='assessment-#{tripId}'>#{
            _(value).map (result) ->
              # TODO when there is no assessment name do a lookup of subtest to get name
              name = result.assessmentName
              if name is undefined
                "<a target='_newtab' href='#result/#{result.resultId}'><span class='missing-name' data-resultId='#{result.resultId}'>Loading...</span></a>"
              else
                "<a target='_newtab' href='#result/#{result.resultId}'>#{result.assessmentName or result.reportType}</a>"
            .join "<br/>"
          }
          </td>
          <td>#{
            _(value).reduce (memo,result) ->
              memo + result.subtests?.length
            , 0
          }
          </td>
          <td class='result-location' data-tripId='#{tripId}' data-resultId='#{
            _(value).find (result) ->
              _.include(result.subtests, "GPS")
            ?.resultId
          }' id='location-#{tripId}'>
          </td>
        </tr>
      "

    @$el.html "
      <h1>#{Tangerine.db_name}</h1>
      Start Time:
      <input name='startTime' style='width:auto' type='text' value='#{@startTime}'>
      End Time: 
      <input name='endTime' style='width:auto' type='text' value='#{@endTime}'>
      <br/>
      <br/>
      Value used for grouping:
      <select id='groupBy'>
        #{
          _.map propertiesToGroupBy, (value,key) =>
            return "" if _( [
              "resultId"
              "startTime"
              "tangerineVersion"
              "numberOfSubtests"
              "tripId"
            ]).include key
            "<option #{if key is @groupBy then "selected='true'" else ''}>
              #{key}
            </option>"
        }
      </select>
      <br/>
      <br/>
      <b>Filters:</b><br/>
      Workflow:
      <select id='workflow'>
      </select>
      <br/>
      Location:
      <select id='location-filter'>
      </select>
      <br/>
      <br/>
      <button onClick='$(\"#advancedOptions\").toggle()'>Advanced Options</button>
      <div style='display:none' id='advancedOptions'>
      Current time in your timezone (#{jstz.determine().name()}) is #{ moment().format("YYYY-MM-DD HH:mm") }<br/>
      Shift time values by <input id='shiftHours' type='number' value='#{@shiftHours}'></input> hours to handle correct timezone.<br/>
      Shifted time: #{ moment().add("h",@shiftHours).format("YYYY-MM-DD HH:mm")}
      <br/>
      </div>

      <table id='results' class='tablesorter'>
        <thead>
          <th>#{@groupBy}</th>
          #{
            _(dates).keys().sort().map( (sortingDate) ->
              "<th class='#{sortingDate}'>#{dates[sortingDate]}</th>"
            ).join("")
          }
        </thead>
        <tbody>
          #{
            _.map(tableRows, (dataForDates, leftColumn) =>
              "<tr>
                <td class='#{@groupBy}'>#{leftColumn}</td>
                #{
                  _(dates).keys().sort().map( (sortingDate) ->
                    "<td class='#{sortingDate}'>
                      #{
                        if dataForDates[sortingDate]
                          "
                            <button class='sort-value' onClick='$(this).siblings().toggle()'>#{dataForDates[sortingDate].length}</button>
                            <div class='result-details' style='display:none'>
                              <table>
                              <thead>
                                <th>Enumerator</th>
                                <th>Time</th>
                                <th>Workflow</th>
                                <th>Assessments</th>
                                <th>Total # Subtests</th>
                                <th>Location</th>
                              </thead>
                              <tbody>
                                #{dataForDates[sortingDate].join("")}
                              </tbody>
                              </table>
                            </div>
                          "
                        else
                          ""
                      }
                    </td>"
                  ).join("")
                }
              </tr>"
            ).join("")
          }
        </tbody>
      </table>
      <div id='resultDetails'>
      </div>
      <style>
        #resultDetails{
          position:absolute;
          background-color:black;
          display:none;
        }
        pre {
          font-size: 75%;
          outline: 1px solid #ccc; 
          padding: 5px; 
          margin: 5px; 
          text-shadow: none;
          overflow-wrap:break-word;
        }
        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
        .key { color: red; }
      </style>
    "

    @$el.find("table#results").tablesorter
      widgets: ['zebra']
      sortList: [[0,0]]
      textExtraction: (node) ->
        sortValue = $(node).find(".sort-value").text()
        if sortValue != ""
          sortValue
        else
          $(node).text()

    @$el.find("select#workflow").html "
      #{
        _.map(@workflows, (workflow) =>
          "<option value='#{workflow}' #{if @options.workflow is workflow then "selected='true'" else ""}>#{workflow}</option>"
        ).join("")
      }
    "

    @$el.find("select#location-filter").html "
      #{
        _.map(@locations, (location) =>
          "<option value='#{location}' #{if @options.location is location then "selected='true'" else ""}>#{location}</option>"
        ).join("")
      }
    "

    _.each @workflows, (workflow) =>
      return unless workflow? # Not sure why we need this, but have undefined workflows which break the dashboard
      
      $.couch.db(Tangerine.db_name).openDoc workflow,
        success: (result) =>
          @$el.find("option[value=#{result._id}]").html result.name
          @$el.find("td.workflowId:contains(#{result._id})").html result.name
        error: (result) =>
          @$el.find("option[value=#{result._id}]").html "Unknown workflow"

    # Detect when a result is opened and load stuff
    observer = new MutationObserver (mutations) =>
      for resultLocationNode in $(mutations[0].target).find(".result-location")
        @loadLocationData $(resultLocationNode).attr("data-tripId")
      for resultLocationNode in $(mutations[0].target).find(".missing-name")
        @loadMissingName $(resultLocationNode).attr("data-resultId")

    for resultDetailNode in @$el.find(".result-details")
      observer.observe resultDetailNode, {attributes: true}
      

    @trigger "rendered"
