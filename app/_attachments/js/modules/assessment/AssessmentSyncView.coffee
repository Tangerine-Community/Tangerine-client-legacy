class AssessmentSyncView extends Backbone.View

  className: "AssessmentSyncView"

  events: 
    "click .back" : "goBack"
    "click .show_details" : "showDetails"
    "click .keep" : "keep"
    "click .show_login" : "showLogin"
    "click .login" : "login"
    "click .download" : "download"
    "click .upload" : "upload"

  download: =>

    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/,"//#{@user}:#{@pass}@")
    localDB = Tangerine.settings.urlDB("local")

    @getDocIds ( docIds ) =>

      $.couch.replicate( 
        groupDB, #from
        localDB, #to
          success: (response)=>
            Utils.midAlert "Download success" 
            @updateConflicts() 
          error: (a, b)      => Utils.midAlert "Pull Error<br>#{a} #{b}"
        ,
          doc_ids: docIds
      )


  upload: =>

    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/,"//#{@user}:#{@pass}@")
    localDB = Tangerine.settings.urlDB("local")

    @getDocIds ( docIds ) =>

      $.couch.replicate( 
        localDB, # from
        groupDB, # to
          success: (response)=> 
            Utils.midAlert "Upload success"
            @updateConflicts() 
          error: (a, b)      => Utils.midAlert "Pull Error<br>#{a} #{b}"
        ,
          doc_ids: docIds
      )

  getDocIds: (callback) =>

    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/,"//")
    targetDB = Tangerine.settings.urlDB("local")

    localDKey = Tangerine.settings.urlView("local", "byDKey")
    groupDKey = (Tangerine.settings.location.group.db+Tangerine.settings.couch.view + "byDKey").replace(/\/\/(.*)@/,"//")

    $.ajax 
      url: groupDKey
      type: "GET"
      dataType: "jsonp"
      data: keys: JSON.stringify([@dKey])
      error: (a, b) => Utils.midAlert "Pull error<br>#{a} #{b}" 
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id

        $.ajax 
          url: localDKey
          type: "POST"
          contentType: "application/json"
          dataType: "json"
          data: JSON.stringify(keys:[@dKey])
          error: (a, b) => Utils.midAlert "Pull error<br>#{a} #{b}"
          success: (data) =>
            for datum in data.rows
              docList.push datum.id

            docList = _.uniq(docList)

            callback docList


  showLogin: ->
    @$el.find("#user").val("")
    @$el.find("#pass").val("")
    @$el.find(".login_box").toggleClass "confirmation"
    @$el.find(".show_login").toggle()

  onVerifySuccess: =>
    clearTimeout @timer
    @connectionVerified = true
    @$el.find("#connection").html("Ok")
    @$el.find(".show_login").toggle()

    @$el.find(".loads").removeClass("confirmation")


  login: ->
    @user = @$el.find("#user").val()
    @pass = @$el.find("#pass").val()


    @timer = setTimeout @verifyTimeout, 20 * 1000

    $.ajax 
      url: Tangerine.settings.urlView("group", "byDKey").replace(/\/\/(.*)@/,"//#{@user}:#{@pass}@")
      dataType: "jsonp"
      data: keys: ["testtest"]
      timeout: 5000
      success: => @onVerifySuccess()

    @$el.find(".login_box").toggleClass "confirmation"
    @$el.find(".show_login").toggle()

  verifyTimeout: =>
    @$el.find("#connection").html @loginButton(status:"<br>Failed. Try loging in.")
    @$el.find(".loads").addClass("confirmation")


  keep: (event) ->

    @deletedCount = 0
    @toDeleteCount = 0
    $target = $(event.target)

    docId  = $target.attr("data-docId")
    docRev = $target.attr("data-docRev")

    docsById = _.indexBy "_id", @loadedDocs

    onComplete = (response) =>
      @deletedCount++
      @updateConflicts() if @deletedCount == @toDeleteCount

    @toDeleteCount++ unless doc._rev == docRev for doc in docsById[docId]

    for doc in docsById[docId]

      continue if doc._rev == docRev

      Tangerine.$db.removeDoc
        "_id"  : doc._id
        "_rev" : doc._rev
      ,
        success: (response) => onComplete response
        error: (a, b) =>
          Utils.alert "Error<br>#{a}<br>#{b}"

  showDetails: (event) ->
    $target = $(event.target)
    docRev = $target.attr("data-docRev")
    @$el.find("#table_#{docRev}").toggleClass "confirmation"

  initialize: (options) ->
    @assessment = options.assessment
    @docList = []

    @dKey = @assessment.id.substr(-5, 5)

    @connectionVerified = false

    @readyTemplates()

  goBack: ->
    Tangerine.router.navigate "", true

  render: ->

    name = @assessment.getEscapedString("name")

    connectionBox = "
      <div class='info_box grey'>
        Server connection<br>
        <span id='connection'>#{@loginButton({status:""})}</span>
      </div>
    " if Tangerine.settings.get("context") != "server"

    @$el.html "

      <button class='back navigation'>Back</button>

      <h1>Assessment Sync</h1>

      <h2>#{name}</h2>

      #{connectionBox || ""}
      <br>
      <div class='loads confirmation'>
        <div class='menu_box'>
          <button class='command upload'>Upload</button><br>
          <button class='command download'>Download</button>
        </div>
      </div>
      <h2>Conflicts</h2>
      <div id='conflicts'></div>

    "

    @updateConflicts()

    @trigger "rendered"

  updateConflicts: ->

    Utils.working true
    Tangerine.$db.view "#{Tangerine.design_doc}/conflictsByDKey",
      error: (a, b) -> Utils.midAlert "Error<br>#{a}<br>#{b}"; Utils.working false
      success: (response) =>
        Utils.working false

        if response.rows.length == 0
          @$el.find("#conflicts").html "<div class='grey'>None</div>"
          return

        @loadedDocs = []

        rows = _.pluck(response.rows, "value")

        onComplete = (oneDoc) =>
          @loadedDocs.push oneDoc
          total = rows.length
          return unless @loadedDocs.length == total

          html = ""
          docsById = _.indexBy "_id", @loadedDocs

          docCount = 1
          for docId, doc of docsById

            html += "
              <b>Document Conflict #{docCount} #{doc[0].collection.capitalize()}</b>
            "

            combined = {}
            for rev in doc
              for key, value of rev
                combined[key] = [] if not combined[key]?
                combined[key].push JSON.stringify(value)

            differences = []
            for key, value of combined
              differences.push(key) if _.uniq(value).length > 1

            for rev in doc
              presentables = {}
              for key, value of rev
                continue if key in ['_rev', '_id','hash','updated','editedBy', "assessmentId", "curriculumId"]
                presentables[key] = value
              html += "
              <div class='menu_box'>
                <table class='conflict_table'>
                  <tr><td><b>#{rev.name}</b></td><td><button class='command keep' data-docId='#{rev._id}' data-docRev='#{rev._rev}'>Keep</button></td></tr>
                  <tr><th>Updated</th><td>#{rev.updated}</td></tr>
                  <tr><th>Edited by</th><td>#{rev.editedBy}</td></tr>
                </table>
                <button class='command show_details' data-docRev='#{rev._rev}'>Show details</button>
                <table class='confirmation conflict_table' id='table_#{rev._rev}'>
                "
              for key, value of presentables
                hKey =
                  if key in differences
                    "<b class='conflict_key'>#{key}</b>"
                  else
                    key
                html += "<tr><th>#{hKey}</th><td>#{JSON.stringify(value)}</td></tr>"
              html += "
                </table>
              </div>
              
              "


            docCount++
          
          @$el.find("#conflicts").html html

        for row in rows
          $.ajax 
            url: "/#{Tangerine.db_name}/#{row._id}?rev=#{row._rev}"
            type: "get"
            dataType: "json"
            success: (doc) -> onComplete doc


        return


    return {}

  onClose: ->
    clearTimeout @timer

  readyTemplates: ->
    @loginButton = _.template("{{status}}
    <button class='command show_login'>Login</button><br>
    <div class='confirmation login_box'>
      <div>
        <label for='user'>Username</label><input id='user' type='text'><br>
        <label for='pass'>Password</label><input id='pass' type='password'>
        <button class='command login'>Login</button>
      </div>
    </div>
  ")
