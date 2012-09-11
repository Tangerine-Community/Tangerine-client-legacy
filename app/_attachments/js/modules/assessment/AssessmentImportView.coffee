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


  import: ->
    @importList = {}
    dKey = @$el.find("#d_key").val()
    @$el.find(".status").fadeIn(250)
    @$el.find("#progress").html "Looking for #{dKey}"

    $.ajax
      type: "GET"
      url: "http://tangerine.iriscouch.com/tangerine/_design/tangerine/_view/byDKey?keys=[%22#{dKey}%22]"
      dataType: "jsonp" 
      success: (data) =>
        @docsRemaining = data.rows.length
        for row in data.rows
          doc = row.value
          console.log doc.collection
          Tangerine.$db.openDoc doc._id,
            async: false
            success: (oldDoc) =>
              newDoc = doc
              doc._rev = oldDoc._rev
              Tangerine.$db.saveDoc newDoc,
                async: false
                success: (data) =>
                  @updateProgress newDoc.collection 
                error: =>
                  @updateProgress newDoc.collection + " save error"
              ,
                async: false
            error  : =>
              newDoc = doc
              Tangerine.$db.saveDoc newDoc,
                async: false
                success: =>
                  @updateProgress newDoc.collection 
                error: =>
                  @updateProgress newDoc.collection + " save error"
              ,
                async: false

              if arguments[2] == "deleted"
                Tangerine.$db.compact
                  complete: =>
                    Tangerine.$db.saveDoc doc,
                      success: =>
                      error: =>
                        console.log arguments
                  error: =>

          , 
            async: false
            revs_info: true
      error: =>
        updateProgress null, "Download key not found. Please check and try again."

  showProgress: (status, info) ->
    if status == "good"
      @$el.find("#progress").html "Import successful <h3>Imported</h3>"
      # this next step is just a test to see everything is there...
      # maybe it doesn't need to. Kind of impressive though.
      Tangerine.$db.view Tangerine.config.address.designDoc + "/byDKey",
        keys: [dKey]
        success: (data) =>
          questions = 0
          assessments = 0
          subtests = 0
          assessmentName = ""
          for datum in data.rows
            doc = datum.value
            subtests++ if doc.collection == 'subtest'
            questions++ if doc.collection == 'question'  
            assessmentName = doc.name if doc.collection == 'assessment'
          @$el.find("#progress").append "
            <div>#{assessmentName}</div>
            <div>Subtests - #{subtests}</div>
            <div>Questions - #{questions}</div>"
        error: (a, b ,c) ->
          @$el.find("#progress").html "<div>Error after data imported</div><div>#{a}</div><div>#{b}"
    else if status == "bad"
      @$el.find("#progress").html "<div>Import error</div>#{arguments.join(',')}"

  

  updateProgress: (key) ->
    @docsRemaining--
    if @importList[key]?
      @importList[key]++
    else
      @importList[key] = 1
    progressHTML = "<table>"
    for key, value of @importList
      progressHTML += "<tr><td>#{key.titleize().pluralize()}</td><td>#{value}</td></tr>"
    
    if @docsRemaining > 0
      progressHTML += "<tr><td>Documents remaining</td><td>#{@docsRemaining}</td></tr>"
    else
      progressHTML += "<tr><td colspan='2'>Import Successful</td></tr>"

    progressHTML += "</table>"
    
    @$el.find("#progress").html progressHTML

  render: ->
    @$el.html "
    <button class='back navigation'>Back</button>

    <h1>Tangerine Central Import</h1>
    <div class='question'>
      <label for='d_key'>Download key</label>
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
