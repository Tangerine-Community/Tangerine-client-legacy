class AdminView extends Backbone.View

  className : "AdminView"

#  events:
#    "change #groupBy": "update"

  render: =>
    $.couch.allDbs
      success: (databases) =>
        groups = _(databases).filter (database) ->
          database.match /^group-/


        sortTable = _.after groups.length, ->
          $("table#active-groups").tablesorter
            widgets: ['zebra']
            sortList: [[5,1]]

        @$el.html "
          <button>Replicate from update database to all existing groups (design doc, views, etc)(not yet working TODO)</button>
          <h2>Active Groups</h2>
          <table id='active-groups'>
            <thead>
              #{
                _("Name, Last Complete Result, Total Assessments, Total Results, Version, Last Complete Result Timestamp".split(/,/)).map( (header) ->
                  "<th>#{header}</th>"
                ).join("")
              }
            </thead>
            <tbody>
            </tbody>
          </table>
        "
        
        _(groups).each (group) =>
          groupName = group.replace(/group-/,"")
          $.couch.db(group).view Tangerine.design_doc + "/resultCount"
            group: true
            success: (resultCounts) =>
              groupTotalResults = 0
              groupTotalAssessments = 0
              _(resultCounts.rows).each (resultCount) ->
                groupTotalAssessments += 1
                groupTotalResults += parseInt(resultCount.value)

              @$el.find("#active-groups tbody").append "
                <tr>
                  <td>#{groupName}</td>
                  <td id='#{group}-last-result'></td>
                  <td id='#{group}-total-assessments'>#{groupTotalAssessments}</td>
                  <td id='#{group}-total-results'>#{groupTotalResults}</td>
                  <td id='#{group}-version'></td>
                  <td style='font-size:50%' id='#{group}-last-timestamp'></td>
                  <td>
                    <button onClick='document.location=\"/#{group}/_design/#{Tangerine.design_doc}/index.html#dashboard\"'>Results</button>
                  </td>
                </tr>
              "
              $.couch.db(group).view Tangerine.design_doc + "/completedResultsByEndTime"
                limit: 1
                descending: true
                success: (result) =>
                  if result.rows[0] and result.rows[0].key
                    @$el.find("##{group}-last-timestamp").html result.rows[0].key
                    @$el.find("##{group}-last-result").html moment(result.rows[0].key).fromNow()
                  sortTable()
                error: () =>
                  console.log "Could not retrieve view 'completedResultsByEndTime' for #{group}"
                  sortTable()

              $.ajax "/#{group}/_design/#{Tangerine.design_doc}/js/version.js",
                dataType: "text"
                success: (result) ->
                  $("##{group}-version").html result.match(/"(.*)"/)[1]

        @trigger "rendered"
