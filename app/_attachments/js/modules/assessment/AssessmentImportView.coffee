class AssessmentImportView extends Backbone.View

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'

  initialize: ->

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
    dKey = @$el.find("#d_key").val()
    @$el.find(".status").fadeIn(250)
    @$el.find("#progress").html "Looking for #{dKey}"

    $.ajax
      type: "GET"
      url: "http://tangerine.iriscouch.com/tangerine/_design/tangerine/_view/byDKey?keys=[%22#{dKey}%22]"
      dataType: "jsonp" 
      success: (data) =>
        console.log data
        for doc in data.rows
          doc = doc.value
          Tangerine.$db.openDoc doc._id,
            success: (oldDoc) =>
              console.log "work with this:"
              console.log data
              doc._rev = oldDoc._rev
              Tangerine.$db.saveDoc doc,
                success: =>
                  console.log "overwrote old doc"
                error: =>
                  console.log "could not overwrite old doc"
                  console.log arguments
            error  : =>
              console.log "no doc there: arguments[2]"
              if arguments[2] == "deleted"
                console.log "trying to undelete"
                Tangerine.$db.compact
                  complete: =>
                    console.log "compacted database"
                    Tangerine.$db.saveDoc doc,
                      success: =>
                        console.log "saved brand new doc"
                      error: =>
                        console.log "could not save brand new doc"
                        console.log arguments
                  error: =>
                    console.log "could not compact"

              else
                Tangerine.$db.saveDoc doc,
                  success: =>
                    console.log "saved brand new doc"
                  error: =>
                    console.log "could not save brand new doc"
                    console.log arguments
          , 
            async: false
            revs_info: true
      error: (a,b) =>
        @$el.find("#progress").html "<div>Import error</div><div>#{a}</div><div>#{b}"
    return

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
