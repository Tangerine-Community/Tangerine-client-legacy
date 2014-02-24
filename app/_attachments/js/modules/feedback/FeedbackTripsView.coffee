class FeedbackTripsView extends Backbone.View

  events: ->

    "change #county" : "onCountySelectionChange"
    "change #zone"   : "onZoneSelectionChange"
    "change #school" : "onSchoolSelectionChange"

    "click .show-feedback"    : "showFeedback"
    "click .show-lesson-plan" : "showLessonPlan"

    "click .hide-feedback"    : "hideFeedback"
    "click .hide-lesson-plan" : "hideLessonPlan"

  initialize: (options) ->
    @[key] = value for key, value of options

    @subViews = []

    @trips = new TripResultCollection
    @trips.fetch 
      resultsView : "resultsByWorkflowId"
      queryKey    : @workflow.id
      success: => 
        @isReady = true
        @render()

  hideLessonPlan: (event) ->

    $target = $(event.target)

    $target.toggle()
    $target.siblings().toggle()

    tripId = $target.attr("data-tripId")
    @$el.find(".#{tripId}-lesson").empty()


  showLessonPlan: (event) ->

    $target = $(event.target)

    $target.toggle()
    $target.siblings().toggle()

    tripId = $target.attr("data-tripId")
    trip   = @trips.get(tripId)

    $lessonContainer = @$el.find(".#{tripId}-lesson")

    @$el.find(".#{tripId}-lesson").html "<img class='loading' src='images/loading.gif'>"

    lessonView = new LessonView
    lessonView.setElement $lessonContainer


    subject = ({"word": "2", "english_word" : "1"})[trip.get("subject")]
    grade   = trip.get("class")
    week    = trip.get("week")
    day     = trip.get("day")

    lessonView.lesson.fetch subject, grade, week, day, =>
      lessonView.render()
      # Another hack brought to you by Mike to fix buggy audio controls, probably caused by invalid html on the lesson TODO
      console.log "Replacing audio controls with buttons"
      $("audio").attr("controls",false)
      $("audio").after("<button onClick='$(this).prev().prev()[0].pause();'>Pause</button>")
      $("audio").after("<button onClick='$(this).prev()[0].play();'>Play</button>")
    
    @subViews.push lessonView


  hideFeedback: (event) ->

    $target = $(event.target)

    $target.toggle()
    $target.siblings().toggle()

    tripId = $target.attr("data-tripId")
    @$el.find(".#{tripId}").empty()


  showFeedback: (event) ->
    $target = $(event.target)

    $target.toggle()
    $target.siblings().toggle()


    tripId = $target.attr("data-tripId")

    trip = @trips.get(tripId)
    
    view = new FeedbackRunView
      trip     : trip
      feedback : @feedback

    view.render()

    @subViews.push view

    @$el.find(".#{tripId}").empty().append view.$el

  onClose: ->
    for view in @subViews
      view.close()

  render: =>

    if @isReady and @trips.length > 0
      @$el.html " 
        <h1>Feedback</h1>
        <p>No visits yet.</p>
      "
      @trigger "rendered"
    return unless @trips?.length > 0

    tripsByCounty = @trips.indexBy("County")
    counties = _(@trips.pluck("County")).chain().compact().uniq().value().sort()
    countyOptions = ("<option value='#{county}'>#{county} (#{tripsByCounty[county]?.length || 0})</option>" for county in counties).join('')
    countyOptions = "<option disabled='disabled' selected='selected'>Select a county</option>" + countyOptions

    html = "
      <h1>Feedback</h1>
      <h2>Visits</h2>
      <div id='county-selection'>
        <label for='county'>County</label>
        <select id='county'>
          #{countyOptions}
        </select>
      </div>
      
      <div id='zone-selection'>
        <label for='zone'>Zone</label>
        <select id='zone'>
          <option disabled='disabled' selected='selected'></option>
        </select>
      </div>

      <div id='school-selection'>
        <label for='school'>School</label>
        <select id='school'>
          <option disabled='disabled' selected='selected'></option>
        </select>
      </div>
      <br>
      <div id='feedback-list'>

      </div>
    "

    @$el.html html

    @trigger "rendered"

  onCountySelectionChange: (event) ->

    selectedCounty = $(event.target).val()
    tripsByCounty  = @trips.indexBy("County")

    zones = _(tripsByCounty[selectedCounty]).chain().map((a)->a.attributes['Zone']).compact().uniq().value().sort()

    zoneOptions = ''
    for zone in zones
      countInZone = tripsByCounty[selectedCounty]?.map?((a)->a.get("Zone")).filter((a)->a is zone)?.length || 0
      zoneOptions += "<option value='#{zone}'>#{zone} (#{countInZone})</option>"
    zoneOptions = "<option disabled='disabled' selected='selected'>Select a zone</option>" + zoneOptions


    @$el.find("#zone").html zoneOptions

    tripsByCounty[selectedCounty]?.map?((a)-> a.get("Zone")).filter?
    ((a)->a==zone).length || 0

  onZoneSelectionChange: ( event ) ->
    selectedZone = $(event.target).val()
    tripsByZone  = @trips.indexBy("Zone")

    schools = _(tripsByZone[selectedZone]).chain().map((a)->a.attributes['SchoolName']).compact().uniq().value().sort()

    schoolOptions = ''
    for school in schools
      countInSchool = tripsByZone[selectedZone]?.map?((a)->a.get("SchoolName")).filter((a)->a is school)?.length || 0
      schoolOptions += "<option value='#{school}'>#{school} (#{countInSchool})</option>"
    schoolOptions = "<option disabled='disabled' selected='selected'>Select a school</option>" + schoolOptions

    @$el.find("#school").html schoolOptions

    tripsByZone[selectedZone]?.map?((a)-> a.get("SchoolName")).filter?
    ((a)->a==zone).length || 0


  onSchoolSelectionChange: ( event ) ->

    selectedSchool   = @$el.find("#school").val()
    selectedZone   = @$el.find("#zone").val()
    selectedCounty = @$el.find("#county").val()

    selectedTrips = @trips.where
      County : selectedCounty
      Zone   : selectedZone
      SchoolName : selectedSchool

    selectedTrips = selectedTrips.sort((a,b)->b.get('start_time')-a.get('start_time'))

    feedbackHtml = "
    <style>
      .tablesorter td{
        border: gray solid 1px;
      }
      table#feedback-table{
        font-size: 90%;
      }
      .table#feedback-table button{
        font-size: 50%;
      }
      
    </style>
    <table id='feedback-table' class='tablesorter'>
      <thead>
      <tr>
        <th>School Name</th>
        <th>Subject</th>
        <th>Class</th>
        <th>Stream</th>
        <th>Observation Start Time</th>
        <th>&nbsp;</th>
      </tr>
      </thead>
      <tbody>
    "
    for trip,index in selectedTrips
      console.log trip
      tripId = trip.get('tripId')
      feedbackHtml += "
        <tr>
          <td>#{trip.get("SchoolName")}</td>
          <td id='subject-#{index}'>#{
            console.log trip.get "subject"
            switch trip.get "subject"
              when "english_word"
                "English"
              when "word"
                "Kiswahili"
              when "operation"
                "Mathematics"
              when "3"
                "Mother Tongue"
          }
          </td>
          <td>#{trip.get("class")}</td>
          <td>#{trip.get("stream")}</td>
          <td>#{moment(trip.get("start_time")).format("MMM-DD HH:mm")}</td>
          <td>
            <button class='command show-feedback' data-tripId='#{tripId}'>Show feedback</button>
            <button class='command hide-feedback' data-tripId='#{tripId}' style='display:none;'>Hide feedback</button>
          </td>
          <td>
            <button class='command show-lesson-plan' data-tripId='#{tripId}'>Show lesson plan</button>
            <button class='command hide-lesson-plan' data-tripId='#{tripId}' style='display:none;'>Hide lesson plan</button>
          </td>
        </tr>
        <tr>
          <td colspan='6' class='#{tripId}'></td>
        </tr>
        <tr>
          <td colspan='6' class='#{tripId}-lesson'></td>
        </tr>
      "
    feedbackHtml += "</tbody></table>"

    @$el.find("#feedback-list").html feedbackHtml
    $("table.tablesorter").tablesorter()


