class AssessmentImportView extends Backbone.View

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'
    'click .verify' : 'verify'
    'click .group_import' : 'groupImport'

  groupImport: ->
    $.ajax 
      url: Tangerine.settings.urlView "group", "assessmentsNotArchived"
      dataType: "jsonp"
      success: (data) =>
        dKeys = _.compact(doc.id.substr(-5, 5) for doc in data.rows).join(" ")
        newAssessment = new Assessment
        newAssessment.on "status", @updateActivity
        newAssessment.updateFromServer dKeys
      error: (a, b) ->
        Utils.midAlert "Import error"

  verify: ->
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  initialize: ->
    @connectionVerified = false
    @timer = setTimeout @verify, 20 * 1000

    # Ensure we have access to the group's documents on the server
    $.ajax 
      url: "http://tangerine.iriscouch.com/group-rti_philippines_2013/_design/ojai/_view/byDKey"
      dataType: "jsonp"
      data: keys: ["testtest"]
      success: =>
        clearTimeout @timer
        @connectionVerified = true
        @render()

    @docsRemaining = 0
    @serverStatus = "checking..."
    $.ajax
      dataType: "jsonp"
      url: Tangerine.settings.urlHost("group")
      success: (a, b) =>
        @serverStatus = "Ok"
        @updateServerStatus()
      error: (a, b) =>
        @serverStatus = "Not available"
        @updateServerStatus()

  updateServerStatus: ->
    @$el.find("#server_connection").html @serverStatus

  back: ->
    Tangerine.router.navigate "", true
    false

  import: =>

    @updateActivity()
    dKey = @$el.find("#d_key").val()

    @newAssessment = new Assessment
    @newAssessment.on "status", @updateActivity

    if Tangerine.settings.get("context") == "server"
      @newAssessment.updateFromTrunk dKey
    else
      @newAssessment.updateFromServer dKey

    @activeTaskInterval = setInterval @updateFromActiveTasks, 3000


  updateFromActiveTasks: =>
    $.couch.activeTasks
      success: (tasks) => 
        for task in tasks
          if task.type.toLowerCase() == "replication"
            if not _.isEmpty(task.status) then @activity = task.status
            @updateProgress()


  updateActivity: (status, message) =>

    @$el.find(".status").fadeIn(250)

    @activity = ""
    if status == "import lookup"
      @activity = "Finding assessment"
    else if status == "import success"
      clearInterval @activeTaskInterval
      @activity = "Import successful"
      @updateProgress()
      Utils.askToLogout()
    else if status == "import error"
      clearInterval @activeTaskInterval
      @activity = "Import error: #{message}"

    @updateProgress()

  updateProgress: (key) =>

    if key?
      if @importList[key]?
        @importList[key]++
      else
        @importList[key] = 1
  
    progressHTML = "<table>"

    for key, value of @importList
      progressHTML += "<tr><td>#{key.titleize().pluralize()}</td><td>#{value}</td></tr>"

    if @activity?
      progressHTML += "<tr><td colspan='2'>#{@activity}</td></tr>"

    progressHTML += "</table>"

    @$el.find("#progress").html progressHTML

  render: ->

    groupImport = "
      <button class='command group_import'>Group import</button>
    " if Tangerine.settings.get("context") != "server"

    if not @connectionVerified 
      importStep = "
        <section><p>Please wait while your connection is verified.</p>
          <button class='command verify'>Try now</button>
          <p><small>Note: If verification fails, press back to return to previous screen and please try again when internet connectivity is better.</small></p>
        </section>
      "
    else
      importStep = "
        <div class='question'>
          <label for='d_key'>Download keys</label>
          <input id='d_key' value=''>
          <button class='import command'>Import</button> #{groupImport || ""}<br>
          <small>Server connection: <span id='server_connection'>#{@serverStatus}</span></small>
        </div>
        <div class='confirmation status'>
          <h2>Status<h2>
          <div class='info_box' id='progress'></div>
        </div>
      "

    @$el.html "

      <button class='back navigation'>Back</button>

      <h1>Tangerine Central Import</h1>

      #{importStep}

    "

    @trigger "rendered"
