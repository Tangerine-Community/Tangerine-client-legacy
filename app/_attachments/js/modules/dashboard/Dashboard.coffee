class Dashboard extends Backbone.View

  reports: []

  events: 
    "change .preference" : "savePreference"

  savePreference: ->

    for pref in @$(".preference")
      $pref = $(pref)
      prefId = $pref.attr('id')
      if $pref.prop("checked")
        Tangerine.user.setPreference "dashboard", prefId, true
        for report in @reports
          reportId = report.id
          if reportId is prefId
            @subViews[reportId] = new report
            @subViews[reportId].setElement @$("#{reportId}-view").show()
            @subViews[reportId].render()
      else
        Tangerine.user.setPreference "dashboard", prefId, false

    Tangerine.user.save()

  initialize: ->
    @prefs = Tangerine.user.getPreferences("dashboard")

  render: ->

    reportCheckboxesHtml = ""
    placeholdersHtml = ''

    for report in @reports
      reportCheckboxesHtml += "
        <label for='#{report.id}'>#{report.name}</label>
        <input class='preference' id='#{report.id}' type='checkbox' #{if @prefs[report.id] then "checked='checked'" else ''}>
      "
      placeholdersHtml += "<section id='#{report.id}-view' style='display:none;'></section>"

    @$el.html "
      <h1>#{Tangerine.settings.get("groupName")}</h1>
      <button class='nav-button back'><a href='#'>Back</a><button>
      <fieldset>
        <legend>Report types</legend>
        #{reportCheckboxesHtml}
      </fieldset>
      <div id='reports'>
        #{placeholdersHtml}
      </div>
    "

    @trigger "rendered"