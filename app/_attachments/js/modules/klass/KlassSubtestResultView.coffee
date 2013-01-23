class KlassSubtestResultView extends Backbone.View

  className: "KlassSubtestResultView"

  events: 
    "click .run"           : "gotoRun"
    "click .back"          : "back"
    "click .show_itemized" : "showItemized"

  initialize: (options) ->
    @result = options.result
    @previous = options.previous

  showItemized: -> @$el.find(".itemized").fadeToggle()
  gotoRun: -> Tangerine.router.navigate "class/run/#{@options.student.id}/#{@options.subtest.id}", true
  back: -> Tangerine.router.navigate "class/#{@options.student.get("klassId")}/#{@options.subtest.get("part")}", true

  render: ->
    subtestItems = @options.subtest.get("items")

    resultHTML = "<br>"
    taken      = ""

    if @result.length != 0
      @result = @result[0]

      correctItems = @result.get "correct"
      totalItems   = @result.get "total"

      percentageCorrect = (correctItems / totalItems) * 100

      ###
      if percentageCorrect < (parseFloat(Tangerine.settings.generalThreshold)*100)
        resultHTML += "<div class='info_box'><b>Warning</b><br>Student's #{Math.decimals(percentageCorrect,2)}% score is less than threshold of #{Math.decimals(Tangerine.settings.generalThreshold*100, 2)}%</div><br>"
      ###
      resultHTML += "<button class='command show_itemized'>#{t('itemized results')}</button><table class='itemized confirmation'><tbody><tr><th>Item</th><th>Result</th></tr>"
      for datum, i in @result.get("subtestData").items
        resultHTML += "<tr><td>#{datum.itemLabel}</td><td>#{t(datum.itemResult)}</td></tr>"
      resultHTML += "</tbody></table><br>"

      timestamp = new Date @result.get("startTime")

      taken += "
        <tr>
          <td><label>Taken last</label></td><td>#{timestamp.getFullYear()}/#{timestamp.getMonth()+1}/#{timestamp.getDate()}</td>
        </tr>
      "

      taken += "
        <tr>
          <td><label>Previous attempts</label></td><td>#{@previous}</td>
        </tr>
      " if @previous > 0

    runButton = "
      <div class='menu_box'>
        <img src='images/icon_run.png' class='run'>
      </div><br>
    " if not @result? || @result.get?("reportType") != "progress"

    @$el.html "
      <h1>Result</h1>
      <table><tbody>
        <tr>
          <td><label>Assessment</label></td>
          <td>#{@options.subtest.get("part")}</td>
        </tr>
        <tr>
          <td><label>Student</label></td>
          <td>#{@options.student.escape("name")}</td>
        </tr>
        <tr>
          <td><label>Subtest</label></td>
          <td>#{@options.subtest.escape("name")}</td>
        </tr>
        #{taken}
      </tbody></table>
      #{resultHTML}
      #{runButton || ""}
      <button class='navigation back'>Back</button>
    "

    @trigger "rendered"