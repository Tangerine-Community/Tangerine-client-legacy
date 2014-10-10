class WorkflowMenuView extends Backbone.View

  className : "WorkflowMenuView"

  events:
    "click .workflow-new"    : 'new'
    "click .workflow-delete" : "delete"
    "click .workflow-run"    : "run"
    "click .workflow-edit"   : "edit"
    'click .remove-resume'   : 'removeResume'

  removeResume: (event) ->

    $target = $(event.target)
    workflowId = $target.attr("data-workflowId")
    tripId     = $target.attr("data-tripId")
    return unless confirm "Are you sure you want to remove the option to resume this workflow?"

    incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete") || {}

    incomplete[workflowId] = _(incomplete[workflowId]).without tripId

    Tangerine.user.setPreferences "tutor-workflows", "incomplete", incomplete, =>
      @updateWorkflows()

  new: ->
    guid = Utils.guid()
    Tangerine.router.navigate "workflow/edit/#{guid}", false
    workflow = new Workflow "_id" : guid
    view = new WorkflowEditView workflow : workflow
    vm.show view

  delete: (event) ->
    $target = $(event.target)
    workflowId = $target.parent("li").attr('id')
    name = @workflows.get(workflowId).get('name')
    if confirm "Are you sure you want to delete workflow #{name}?"
      @workflows.get(workflowId).destroy
        success: =>
          @render()

  initialize: (options) ->
    @[key] = value for key, value of options


  render: ->

    if Tangerine.settings.get("context") isnt "server"
      return @renderMobile()

    htmlWorkflows = ""

    for workflow in @workflows.models
      
      csvUrl = "/_csv/workflow/#{Tangerine.db_name}/#{workflow.id}"
      
      feedback = @feedbacks.get(workflow.id+"-feedback")

      if feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<a href='#feedback/#{workflow.id}'>feedback</a>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:15px;'>
          #{workflow.get('name')}
          <br>
          <a href='#workflow/run/#{workflow.id}'>run</a>
          #{feedbackHtml}
          <a href='#workflow/edit/#{workflow.id}'>edit</a>
          <a href='#{csvUrl}'>csv</a>
          <span class='workflow-delete link'>delete</span>
        </li>
        "

    @$el.html "
      <h1>Workflows</h1>
      <button class='workflow-new command'>New</button>
      <ul class='workflow-menu'>#{htmlWorkflows}</ul>
    "


  renderMobile: =>

    @$el.html "
      <h1>Tutor menu</h1>
      <ul class='workflow-menu'></ul>
      <div id='sync-manager' class='SyncManagerView'></div>
      <div id='school-list' class='SchoolListView'>pre</div>
      <div id='valid-observations' class='ValidObservationView'>pre</div>
      <div id='bandwidth-test'></div>
    "

    @updateWorkflows()

    unless @schoolListView?
      @schoolListView = new SchoolListView
      @schoolListView.setElement(@$el.find("#school-list"))
      @schoolListView.render("loading")

    unless @validObservationView?
      @validObservationView = new ValidObservationView
      @validObservationView.setElement(@$el.find("#valid-observations"))
      @validObservationView.render("loading")

    unless @syncManagerView?
      @syncManagerView = new SyncManagerView
      @syncManagerView.setElement(@$el.find("#sync-manager"))
      @listenTo @syncManagerView, "complete-sync", =>
        @workflows.fetch
          success: =>
            @updateWorkflows()
      @syncManagerView.render()

    unless @bandwidthCheckView?
      @bandwidthCheckView = new BandwidthCheckView
      @bandwidthCheckView.setElement(@$el.find("#bandwidth-test"))
      @bandwidthCheckView.render()
    
    @trigger "rendered"

  updateWorkflows: ->

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    htmlWorkflows = ""

    for workflow in @workflows.models
      continue if workflow.id in hiddenWorkflows

      feedback = @feedbacks.get(workflow.id+"-feedback")

      if feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<button class='command'><a href='#feedback/#{workflow.id}'>Feedback</a></button>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:25px;'>
          <section>
            <a href='#workflow/run/#{workflow.id}' class='workflow-button-link'>#{workflow.get('name')}</a>
            #{feedbackHtml}
            <div id='resume-workflow-#{workflow.id}'></div>
          </section>
        </li>
        "
    @$el.find(".workflow-menu").html htmlWorkflows

    @renderResumeInfo()

  renderResumeInfo: ->

      incompleteWorkflows = Tangerine.user.getPreferences('tutor-workflows', 'incomplete') || {}

      for workflowId, tripIds of incompleteWorkflows
        if tripIds.length isnt 0
          for tripId in tripIds
            Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
              key: tripId
              include_docs : true
              success: (data) =>
                first = data.rows[0].doc
                timeAgo = moment(first.updated).fromNow()
                @$el.find("#resume-workflow-#{first.workflowId}").append "
                  <a href='#workflow/resume/#{first.workflowId}/#{first.tripId}'><button class='command'>Resume</button></a> #{timeAgo} <button class='command remove-resume' data-workflowId='#{first.workflowId}' data-tripId='#{first.tripId}'>X</button><br>
                "


# bit of a crap shoot this one
# it will find _a_ school list
# determines the zone as the one most visited
class SchoolListView extends Backbone.View

  events: 
    "click .schools-left" : "toggleSchoolList"
    "change .county-select" : "updateCounty"
    "change .zone-select" : "updateZone"

  updateZone: ->
    @selected = true
    @currentZone.name   = @$el.find(".zone-select").val()
    @currentZone.county = @$el.find(".county-select").val()
    @updateTrips()

  updateCounty: ->
    @selected = true
    @currentZone.county = @$el.find(".county-select").val()
    @currentZone.name = Object.keys(@geography[@currentZone.county])[0]
    @updateTrips()

  updateTrips: ->
    Utils.execute [
      @fetchTrips
      @render
    ], @


  toggleSchoolList: ->
    @$el.find(".school-list").toggle()

  initialize: ->

    @geography       = {}
    @visited         = {}
    @schools         = { left : [] , done : []}
    @currentZone     = { name : 'No data' }
    @locationSubtest = {}
    @selected        = false

    Utils.execute [
      @fetchLocations
      @fetchTrips
      @render
    ], @

  fetchLocations: ( callback = $.noop ) ->
    subtestIndex = 0
    limit = 1

    checkSubtest = =>

      Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
        key   : "subtest"
        skip  : subtestIndex
        limit : limit
        success: (response) =>
          return alert "Failed to find locations" if response.rows.length is 0
          
          @locationSubtest = response.rows[0].value

          if @locationSubtest.prototype? && @locationSubtest.prototype is "location"
            @makeTree(@locationSubtest.locations, @geography)
            callback?()
          else
            subtestIndex++
            checkSubtest()
      )
    checkSubtest()

  makeTree: (rows, tree) ->

    makeBranch = (fragment, node) ->
      if fragment.length is 0
        return {}
      else
        next = fragment.shift()
        node[next] = {} unless node[next]?
        makeBranch fragment, node[next]

    for row in rows
      makeBranch(row, tree)

  fetchTrips: (callback = $.noop) ->

    d = new Date()
    year  = d.getFullYear()
    month = 6#d.getMonth()

    trips = new TripResultCollection
    trips.fetch 
      resultView : "tutorTrips"
      queryKey   : "year#{year}month#{month}"
      success: =>

        rows = []
        zones = {}
        for trip in trips.models
          
          # count which zones are most common
          zoneName        = trip.get("Zone")
          zones[zoneName] = {
            count  : 0
            county : trip.get("County")
          } unless zones[zoneName]?
          zones[zoneName].count++

          # skip unless they belong
          continue unless trip.get("enumerator") in [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
          row = []
          for level in @locationSubtest.levels
            row.push trip.get(level)
          rows.push row

        @visited = {}
        @makeTree rows, @visited

        if rows.length is 0

          unless @selected
            @currentZone.county = Object.keys(@geography)[0]
            @currentZone.name   = Object.keys(@geography[@currentZone.county])[0]

          @schools.done = []
          @schools.all  = Object.keys(@geography[@currentZone.county][@currentZone.name]).sort()
          @schools.left = schools.all

        else

          unless @selected
            @currentZone.count = 0
            for zoneName, zoneProperties of zones
              count  = zoneProperties.count
              county = zoneProperties.county
              if count > @currentZone.count
                @currentZone.county = county
                @currentZone.name   = zoneName
                @currentZone.count  = count

          if @visited[@currentZone.county]? and @visited[@currentZone.county][@currentZone.name]?
            @schools.done = Object.keys(@visited[@currentZone.county][@currentZone.name]).sort()
          else
            @schools.done = []
          @schools.all  = Object.keys(@geography[@currentZone.county][@currentZone.name]).sort()
          @schools.left = _(@schools.all).difference(@schools.done)

        callback?()

  render: (status) ->

    if status is "loading"
      @$el.html "<section><h2>School List</h2><p>Loading...</p></section>"
      return

    countySelect = "<select class='county-select'>"
    for county in Object.keys(@geography)
      selected = if county is @currentZone.county then "selected='selected'" else ''
      countySelect += "<option value='#{_.escape(county)}' #{selected}>#{county}</option>"
    countySelect += "</select>"


    zoneSelect = "<select class='zone-select'>"
    for zone in Object.keys(@geography[@currentZone.county])
      selected = if zone is @currentZone.name then "selected='selected'" else ''
      zoneSelect += "<option value='#{_.escape(zone)}' #{selected}>#{zone}</option>"
    zoneSelect += "</select>"
        
    
    @$el.html "
      <section>
        <h2>School list</h2>
        <table class='class_table'>
          <tr><th>County</th><td>#{countySelect}</td></tr>
          <tr><th>Zone</th><td>#{zoneSelect}</td></tr>
          <tr><th>Schools remaining</th><td><button class='schools-left command'>#{@schools.left.length}</button></td></tr>
        </table>
        
        <table class='class_table school-list start-hidden'>
          <tr><td><b>Remaining</b></td></tr>
          #{("<tr><td>#{school}</td></tr>" for school in @schools.left).join('')}
        </table>

        <table class='class_table school-list start-hidden'>
          <tr><td><b>Done</b></td></tr>
          #{("<tr><td>#{school}</td></tr>" for school in @schools.done).join('')}
        </table>
      </section>
    "



class ValidObservationView extends Backbone.View

  initialize: ->
    @validCount = {
      thisMonth : 0
      lastMonth : 0
    }

    @tripIds = {}

    Utils.execute [
      @fetchTripIds 
    ], @

  fetchTripIds: (callback = $.noop) ->
    d = new Date()
    year  = d.getFullYear()
    month = 6

    Utils.execute [
      (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          key     : "year#{year}month#{month}"
          reduce  : false
          success : (response) =>
            @tripIds.thisMonth = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          key     : "year#{year}month#{month-1}"
          reduce  : false
          success : (response) =>
            @tripIds.lastMonth = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        users = [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
        Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
          keys    : users
          reduce  : false
          success : (response) =>
            @tripIds.thisUser = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        bestPractices = "00b0a09a-2a9f-baca-2acb-c6264d4247cb"
        fullPrimr     = "c835fc38-de99-d064-59d3-e772ccefcf7d"
        workflowKeys = [bestPractices, fullPrimr].map (el) -> "workflow-#{el}"
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          keys    : workflowKeys
          reduce  : false
          success : (response) =>
            @tripIds.theseWorkflows = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        @tripIds.final = {
          thisMonth : _.intersection(@tripIds.thisMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
          lastMonth : _.intersection(@tripIds.lastMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
        }

        callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/spirtRotut",
          group   : true
          keys    : @tripIds.final.thisMonth
          success : (response) =>
            validTrips = response.rows.filter (row) ->
              minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
              result = minutes >= 20
              return result

            @validCount.thisMonth = validTrips.length
            callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/spirtRotut",
          group   : true
          keys    : @tripIds.final.lastMonth
          success : (response) =>
            validTrips = response.rows.filter (row) ->
              minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
              result = minutes >= 20
              return result
            @validCount.lastMonth = validTrips.length
            callback?()

      , @render
      ], @

  render: (status) ->
    if status is "loading"
      @$el.html "<section><h2>Valid Observations</h2><p>Loading...</p></section>"
      return

    @$el.html "
      <section>
        <h2>Valid Observations</h2>
        <table class='class_table'><tr><th></th><th>Observations</th><th>Compensation</th></tr>
          <tr><th>This month</th><td>#{@validCount.thisMonth} </td><td>#{Math.commas(@validCount.thisMonth*1500)} KES</td></tr>
          <tr><th>Previous month</th><td>#{@validCount.lastMonth} </td><td>#{Math.commas(@validCount.lastMonth*1500)} KES</td></tr>
        </table>
      </section>
    "



