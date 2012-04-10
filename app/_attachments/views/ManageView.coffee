class ManageView extends Backbone.View

  el: '#content'

  events:
    "click button#show_import_from_cloud"    : "showImportFromCloud"
    "click button#import_from_cloud_confirm" : "importFromCloud"
    "click button#import_from_cloud_cancel"  : "hideImportFromCloud"

    "click img#show_new_assessment_form"  : "showNewAssessmentForm"
    "click button#add_new_assessment"     : "addNewAssessment"
    "click button#hide_new_assessment_form"  : "hideNewAssessmentForm"
    "click img.delete_assessment_confirm" : "showConfirmDelete"
    "click button.delete_assessment_yes"  : "deleteAfirmative"
    "click button.delete_assessment_no"   : "deleteNegative"

  initialize: ( options ) ->
    @temp = {}
    @collection = options.collection
    @collection.on "add remove", @updateAssessmentList

  showImportFromCloud: -> $("form#import_from_cloud").show()
  hideImportFromCloud: -> $("form#import_from_cloud").hide()
  importFromCloud: -> Utils.importAssessmentFromIris $("#import_from_cloud_dkey").val()

  render: () =>
    @$el.html "
    <div id='manage'>
      <button id='show_import_from_cloud'>Import assessment</button>
      <form id='import_from_cloud'>
        <label for='import_from_cloud_dkey'>Download key <input type='text' id='import_from_cloud_dkey'></label>
        <button id='import_from_cloud_confirm'>Import</button><button id='import_from_cloud_cancel'>Cancel</button>
      </form>
      <div id='message'></div>
      <h1>Assessments</h1>
      <ul id='assessment_list'></ul>
      <form id='new_assessment'>
        <input type='text' id='new_assessment_name' placeholder='Assessment name'><button id='add_new_assessment'>Add</button><button id='hide_new_assessment_form'>Cancel</button>
        <span id='assessment_name_error'></span>
      </form>
      <img id='show_new_assessment_form' class='icon' src='images/icon_add.png'><br>
    </div>
    "
    @updateAssessmentList()

  updateAssessmentList: =>
    $("#new_assessment_name").val('')
    @temp.html = ""
    @collection.each ( assessment ) =>
      docName       = assessment.get("name")
      console.log "is archived"
      console.log assessment.get("archived")
      archiveStatus = if  assessment.get("archived") then " class='archived_assessment' " else ""
      safeDocName   = docName.toLowerCase().dasherize()

      @temp.html += "
      <li id='#{safeDocName}'><span#{archiveStatus}>#{assessment.get("name")}</span> 
        <a href='#results/#{docName}'><img class='icon' src='images/icon_result.png'></a>
        <a href='#edit/assessment/#{assessment.id}'><img class='icon' src='images/icon_edit.png'></a> 
        <img class='icon_delete delete_assessment_confirm' src='images/icon_delete.png'>
        <span class='delete_confirm'>Are you sure? <button data-docName='#{Tangerine.user.get('name')}.#{docName}'class='delete_assessment_yes'>Yes</button><button class='delete_assessment_no'>No</button></span>
      </li>"
    $("ul#assessment_list").html @temp.html

  showNewAssessmentForm: ->
    $("form#new_assessment", @el).show()
    $("input#new_assessment_name", @el).focus()

  hideNewAssessmentForm: ->
    $("form#new_assessment", @el).hide()

  addNewAssessment: () =>
    name = $('input#new_assessment_name').val()
    if name.match(/[^A-Za-z ]/)
      $('#assessment_name_error').html 'Invalid character for assessment.'
      return
    else
      $('#assessment_name_error').empty()

    assessment = new Assessment
      name: name
      _id: Tangerine.user.get("name") + "." + name
      urlPathsForPages: []
      subtests: []

    assessment.save null,
      success: =>
        console.log "saved assessment, adding to collection"
        @collection.add assessment
        @hideNewAssessmentForm()
      error: ->
        console.log "error saving assessment"
        $('#assessment_name_error').html 'error'
        messages = $("<span class='error'>Invalid new assessment</span>")
        $('button:contains(Add)').after(messages)
        messages.fadeOut (2000), ->
          messages.remove()

  showConfirmDelete: (event) ->
    $(event.target).parent().find(".delete_confirm").fadeIn(250);

  deleteAfirmative: (event) ->
    console.log "trying to get " + $(event.target).attr("data-docName")
    assessment = @collection.get($(event.target).attr("data-docName"))
    assessment.destroy
      success: =>
        @collection.remove(assessment)
        $(event.target).parent().parent().fadeOut(250);
      error: ->
        $(event.target).parent().fadeOut(250);

  deleteNegative: (event) ->
    $(event.target).parent().fadeOut(250);

  updateTangerine: (event) ->
    source = "http://#{Tangerine.cloud.target}/#{Tangerine.config.db_name}"
    target = "http://#{Tangerine.config.user_with_database_create_permission}:#{Tangerine.config.password_with_database_create_permission}@localhost:#{Tangerine.port}/#{Tangerine.config.db_name}"
    $("#content").prepend "<span id='message'>Updating from: #{source}</span>"

    $.couch.replicate source, target,
      success: ->
        $("#message").html "Finished"
        Tangerine.router.navigate "logout", true

  initializeDatabase: (event) ->
    databaseName = $(event.target).attr("href")
    Utils.createResultsDatabase databaseName
    $("#message").html "Database '#{databaseName}' Initialized"
    $(event.target).hide()

