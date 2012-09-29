class AssessmentListElementView extends Backbone.View

  tagName : "li"

  events:
    'click .edit'                      : 'gotoEdit'
    'click .results'                   : 'gotoResults'
    'click .run'                       : 'gotoRun'
    'click .print'                     : 'gotoPrint'
    'click .assessment_menu_toggle'    : 'assessmentMenuToggle'
    'click .admin_name'                : 'assessmentMenuToggle'
    'click .assessment_delete'         : 'assessmentDeleteToggle'
    'click .assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .assessment_delete_confirm' : 'assessmentDelete'
    'click .copy'                      : 'copyToGroup'
    'click .duplicate'                 : 'duplicate'
    'click .archive'                   : 'archive'
    'click .update'                    : 'update'

  initialize:(options) ->
    @parent = options.parent
    @isAdmin = Tangerine.user.isAdmin()
    @isPublic = options.isPublic
    @model = options.model

  gotoEdit: -> Tangerine.router.navigate "edit/#{@model.id}", true
  gotoResults: -> Tangerine.router.navigate "results/#{@model.id}", true
  gotoRun: -> Tangerine.router.navigate "run/#{@model.id}", true
  gotoPrint: -> Tangerine.router.navigate "print/#{@model.id}", true

  duplicate: ->
    newName = "Copy of " + @model.get("name")
    @model.duplicate { name : newName }, null, null, =>
      @render()
      @parent.refresh()

  update: ->
    @model.updateFromServer()
    @model.on "status", (message) =>
      if message == "import success"
        Utils.midAlert "Updated"
        @parent.refresh()
      else if message == "import error"
        Utils.midAlert "Update failed"
        @parent.refresh()
      
  archive: ->
    result = @$el.find(".archive :selected").val() == "true"
    if result == true
      @$el.find(".admin_name").addClass "archived_assessment"
    else
      @$el.find(".admin_name").removeClass "archived_assessment"
    
    @model.save
      archived : result
    return true

  copyToGroup: ->
    @model.duplicate {group:@parent.group}, null, null, =>
      @render()
      @parent.refresh()

  assessmentMenuToggle: ->
    @$el.find('.assessment_menu_toggle').toggleClass 'icon_down'
    @$el.find('.assessment_menu').fadeToggle(250)

  assessmentDeleteToggle: -> @$el.find(".assessment_delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  assessmentDelete: ->
    # remove from collection
    @$el.fadeOut 250, => 
      @parent.collection.remove @model
      @model.destroy()

          
  render: ->
    selected        = " selected='selected' "

    archiveClass    = if (@model.get('archived') == true or @model.get('archived') == 'true') then " archived_assessment" else ""
    copyButton      = "<button class='copy command'>Copy to group</button>"
    toggleButton    = "<span class='assessment_menu_toggle icon_ryte'> </span>"
    deleteButton    = "<img class='assessment_delete link_icon' title='Delete' src='images/icon_delete.png'>"
    deleteConfirm   = "<span class='assessment_delete_confirm'><div class='menu_box'>Confirm <button class='assessment_delete_yes command_red'>Delete</button> <button class='assessment_delete_cancel command'>Cancel</button></div></span>"
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>"
    editButton      = "<img class='link_icon edit' title='Edit' src='images/icon_edit.png'>"
    updateButton    = "<img class='link_icon update' title='Update' src='images/icon_sync.png'>"
    printButton     = "<button class='print'>Print</button>"

    downloadKey     = "<span class='small_grey'>Download key <b>#{@model.id.substr(-5,5)}</b></span>"
    
    resultsButton   = "<img class='link_icon results' title='Results' src='images/icon_results.png'>"
    runButton       = "<img class='link_icon run' title='Run' src='images/icon_run.png'>"
    name            = "<span class='name clickable '>#{@model.get('name')}</span>"
    adminName       = "<span class='admin_name clickable #{archiveClass}'>#{@model.get('name')}</span>"
    resultCount     = "<span class='resultCount'>#{@model.get('resultCount') || '0'} results</span>"
    archiveSwitch   = "
    <select class='archive'>
      <option value='false' #{if @model.get('archived') == false then selected else ''}>Active</option>
      <option value='true'  #{if @model.get('archived') == true  then selected else ''}>Archived</option>
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
              #{duplicateButton}
              #{deleteButton}
              #{downloadKey}
              #{deleteConfirm}
              #{printButton}
            </div>
          "
    # enumerator user
    else
      html = "<div>#{runButton}#{name} #{resultsButton}</div>"

    @$el.html html
