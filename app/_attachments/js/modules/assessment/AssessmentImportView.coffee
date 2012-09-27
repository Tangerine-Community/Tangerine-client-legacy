class AssessmentImportView extends Backbone.View

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'

  initialize: ->
    @docsRemaining = 0
    @serverStatus = "checking..."
    $.ajax
      dataType: "jsonp"
      url: Tangerine.config.address.cloud.host+":"+Tangerine.config.address.port+"/"
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
    @updateActivity();
    dKey = @$el.find("#d_key").val()

    @newAssessment = new Assessment
    @newAssessment.on "status", @updateActivity

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
    @$el.html "
    <button class='back navigation'>Back</button>

    <h1>Tangerine Central Import</h1>
    <div class='question'>
      <label for='d_key'>Download keys</label>
      <input id='d_key' value=''>
      <button class='import command'>Import</button><br>
      <small>Server connection: <span id='server_connection'>#{@serverStatus}</span></small>
    </div>

    <div class='confirmation status'>
      <h2>Status<h2>
      <div class='info_box' id='progress'></div>
    </div>

    "
    @trigger "rendered"
