class AdminView extends Backbone.View

  className : "AdminView"

#  events:
#    "change #groupBy": "update"

  render: =>
    $.couch.allDbs
      success: (databases) =>
        groups = _(databases).filter (database) ->
          database.match /^group-/

        @$el.html "<h2>Active Groups</h2>"
        _(groups).each (group) =>
          $.couch.db(group).view Tangerine.design_doc + "/resultCount"
            group: true
            success: (resultCounts) =>
              @$el.append "
                <h2>#{group.replace(/group-/,"")}</h2>
                <table id='#{group}'>
                  <tr>
                    <td>Version</td><td id='#{group}-version'></td>
                  </tr>
                </table>
                <table>
                  <thead>
                    <th>Assessment</th>
                    <th>Number of Results</th>
                  </thead>
                  #{
                  _(resultCounts.rows).map( (resultCount) ->
                    "
                    <tr>
                      <td class='result-count' id='#{resultCount.key}'>#{resultCount.key}</td><td>#{resultCount.value}</td>
                    </tr>
                    "
                  ).join("")
                  }
                </table>
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
