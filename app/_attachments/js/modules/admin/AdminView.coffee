class AdminView extends Backbone.View

  className : "AdminView"

#  events:
#    "change #groupBy": "update"

  render: =>
    $.couch.allDbs
      success: (databases) =>
        groups = _(databases).filter (database) ->
          database.match /^group-/

        @$el.html "
          TODO: <button>Replicate from update database to all existing groups (design doc, views, etc)</button>
          <h2>Active Groups</h2>
        "
        _(groups).each (group) =>
          groupName = group.replace(/group-/,"")
          $.couch.db(group).view Tangerine.design_doc + "/resultCount"
            group: true
            success: (resultCounts) =>
              @$el.append "
                <h2>#{groupName}</h2>
                <table id='#{group}'>
                  <tr>
                    <td>Version</td><td id='#{group}-version'></td>
                  </tr>
                  <tr>
                    <td>Last Result</td><td id='#{group}-last-result'></td>
                  </tr>
                  <tr>
                    <td>Total Assessments</td><td id='#{group}-total-assessments'></td>
                  </tr>
                  <tr>
                    <td>Total Results</td><td id='#{group}-total-results'></td>
                  </tr>
                </table>
                <button onClick='document.location=\"/#{group}/_design/#{Tangerine.design_doc}/index.html#dashboard\"'>#{groupName} Dashboard</button><br/>
                <button onClick='$(\"##{group}-details\").toggle()'>Details</button>
                <table style='display:none' id='#{group}-details'>
                  <thead>
                    <th>Assessment</th>
                    <th>Number of Results</th>
                  </thead>
                  #{
                  _(resultCounts.rows).map( (resultCount) ->
                    "
                    <tr>
                      <td id='#{resultCount.key}'>#{resultCount.key}</td><td class='result-count'>#{resultCount.value}</td>
                    </tr>
                    "
                  ).join("")
                  }
                </table>

              "
              $("##{group}-total-assessments").html @$el.find("table##{group}-details tr").length
              $("##{group}-total-results").html _(@$el.find(".result-count")).reduce(((total, amount) -> total += parseInt($(amount).text())), 0)
              $.couch.db(group).view Tangerine.design_doc + "/completedResultsByEndTime"
                limit: 1
                descending: true
                success: (result) =>
                  if result.rows[0]
                    $("##{group}-last-result").html "
                      <span data-end-time='#{result.rows[0].key}'>#{moment(result.rows[0].key).fromNow()}</span>
                    "

              $.ajax "/#{group}/_design/#{Tangerine.design_doc}/js/version.js",
                dataType: "text"
                success: (result) ->
                  $("##{group}-version").html result.match(/"(.*)"/)[1]

              _.each resultCounts.rows, (row) =>
                return unless row.key?
                $.couch.db(group).openDoc row.key,
                  success: (result) =>
                    $("##{row.key}").html result.name
                  error: (result) =>
                    $("##{row.key}").html "Unknown assessment"
                

        @trigger "rendered"
