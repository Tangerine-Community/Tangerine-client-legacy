class AssessmentListElementView extends Backbone.View

  className : "AssessmentListElementView"

  tagName : "li"

  events:
    'click .assessment_menu_toggle'    : 'assessmentMenuToggle'
    'click .admin_name'                : 'assessmentMenuToggle'
    'click .assessment_delete'         : 'assessmentDeleteToggle'
    'click .assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .assessment_delete_confirm' : 'assessmentDelete'
    'click .copy'                      : 'copyToGroup'
    'click .duplicate'                 : 'duplicate'
    'click .archive'                   : 'archive'
    'click .update'                    : 'update'
    'click .result_count'              : 'getResultCount'

  blankResultCount: "-"

  initialize: (options) ->

    # events
    options.model.on "resultCount", @updateResultCount

    #arguments
    @model    = options.model
    @parent   = options.parent
    @group    = options.group
    @homeGroup = options.homeGroup

    @isPublic = options.model.get("group") == "public" && @homeGroup != "public"

    # switches and things
    @resultCount = if @model.resultCount? then @model.resultCount else @blankResultCount
    @resultCount = Math.commas @resultCount
    @isAdmin     = Tangerine.user.isAdmin()

  duplicate: ->
    newName = "Copy of " + @model.get("name")
    @model.duplicate { name : newName }, null, null, (assessment) => 
      @model.trigger "new", assessment

  copyToGroup: ->
    @model.duplicate {group:@homeGroup}, null, null, (assessment) => 
      @model.trigger "new", assessment

  update: ->
    @model.updateFromServer()
    @model.on "status", (message) =>
      if message == "import success"
        Utils.midAlert "Updated"
      else if message == "import error"
        Utils.midAlert "Update failed"

  getResultCount: ->
    return if Tangerine.settings.context == "mobile"
    @$el.find(".result_count").html "Results <b>#{@blankResultCount}</b>"
    @model.getResultCount()

  updateResultCount: =>
    @resultCount = Math.commas @model.resultCount
    @$el.find(".result_count").html "Results <b>#{@resultCount}</b>" 

  archive: ->
    result = @$el.find(".archive :selected").val() == "true"
    if result == true
      @$el.find(".admin_name").addClass "archived_assessment"
    else
      @$el.find(".admin_name").removeClass "archived_assessment"
    
    @model.save
      archived : result
    return true

  assessmentMenuToggle: ->
    @$el.find('.assessment_menu_toggle').toggleClass 'icon_down'
    @$el.find('.assessment_menu').fadeToggle(250)

  assessmentDeleteToggle: -> @$el.find(".assessment_delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  assessmentDelete: =>
    # remove from collection
    @model.destroy()

  render: ->

    isArchived = @model.getBoolean('archived')

    # do not display archived assessments for enumerators
    return if not @isAdmin and isArchived and Tangerine.settings.context == "mobile"


    # commands

    # indicators and variables
    toggleButton     = "<span class='assessment_menu_toggle icon_ryte'> </span>"
    name             = "<span class='name clickable '>#{@model.get('name')}</span>"
    adminName        = "<span class='admin_name clickable #{archiveClass}'>#{@model.get('name')}</span>"
    adminResultCount = "<label class='result_count small_grey no_help' title='Result count. Click to update.'>Results <b>#{@resultCount}</b></label>"
    resultCount      = "<span class='result_count no_help'>Results <b>#{@resultCount}</b></span>"
    archiveClass     = if isArchived then " archived_assessment" else ""
    selected         = " selected='selected'"
      
    # navigation
    editButton      = "<a href='#edit/#{@model.id}'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>"
    runButton       = "<a href='#run/#{@model.id}'><img class='link_icon run' title='Run' src='images/icon_run.png'></a>"
    resultsButton   = "<a href='#results/#{@model.id}'><img class='link_icon results' title='Results' src='images/icon_results.png'></a>"
    printButton     = "<a href='#print/#{@model.id}'><img class='link_icon print' title='Print' src='images/icon_print.png'></a>"

    copyButton      = "<button class='copy command'>Copy to group</button>"
    deleteButton    = "<img class='assessment_delete link_icon' title='Delete' src='images/icon_delete.png'>"
    deleteConfirm   = "<span class='assessment_delete_confirm'><div class='menu_box'>Confirm <button class='assessment_delete_yes command_red'>Delete</button> <button class='assessment_delete_cancel command'>Cancel</button></div></span>"
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>"
    updateButton    = "<img class='link_icon update' title='Update' src='images/icon_sync.png'>"

    downloadKey     = "<span class='download_key small_grey'>Download key <b>#{@model.id.substr(-5,5)}</b></span>"
    archiveSwitch   = "
    <select class='archive'>
      <option value='false' #{if isArchived then selected else ''}>Active</option>
      <option value='true'  #{if isArchived then selected else ''}>Archived</option>
    </select>
    "

    if @isAdmin
      # admin standard
      html = "
        <div>
          #{toggleButton}
          #{adminName}
        </div>
      "
      # Admin on mobile
      if Tangerine.settings.context == "mobile"
        html += "
          <div class='assessment_menu'>
            #{runButton}
            #{resultsButton}
            #{updateButton}
          </div>
        "
      # not on mobile
      else
        # admin and public
        if @isPublic
          html += "
            <div class='assessment_menu'>
              #{copyButton}
            </div>
          "
        # admin and group
        else
          html += "
            <div class='assessment_menu'>
              #{runButton}
              #{resultsButton}
              #{editButton}
              #{printButton}
              #{duplicateButton}
              #{deleteButton}
              #{downloadKey}
              #{deleteConfirm}
              #{adminResultCount}
            </div>
          "
    # enumerator user
    else
      html = "<div>#{runButton}#{name} #{resultsButton}</div>"

    @$el.html html
