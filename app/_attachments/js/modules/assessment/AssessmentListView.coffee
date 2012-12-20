class AssessmentListView extends Backbone.View

  events:
    'keypress .new_name' : 'newSave'
    'click .new_save'    : 'newSave'
    'click .new_cancel'  : 'newToggle'
    'click .new'         : 'newToggle'
    'click .import'      : 'import'
    'click .groups'      : 'gotoGroups'

  gotoGroups: -> Tangerine.router.navigate "groups", true
  import:     -> Tangerine.router.navigate "import", true

  initialize:(options) ->
    @assessments = options.assessments
    @group       = options.group
    @curricula   = options.curricula
    @curriculaListView = new CurriculaListView
      "curricula" : options.curricula
    @isAdmin = Tangerine.user.isAdmin()
    @views = []
    @publicViews = []
    @sections = [@group, "public"]
    @groupViews = []

    if Tangerine.settings.get("context") == "server"
      # coffeescript nightmare, single line possible, but don't do it
      for group in @sections
        view = new AssessmentsView
          "group"          : group
          "allAssessments" : @assessments
          "parent"         : @
        @groupViews.push view
    else if Tangerine.settings.get("context") == "mobile"
      @listView = new AssessmentsView
        "group"          : false # all
        "allAssessments" : @assessments
        "parent"         : @

  refresh: =>
    @curricula.fetch
      success: ( collection ) =>
        curricula = new Curricula collection.where "group" : @group
        @curriculaListView.curricula = curricula
        @curriculaListView.render()
        
    @assessments = new Assessments
    @assessments.fetch
      success: (assessments) =>
        for view, i in @groupViews
          assessmentCount = assessments.where({"group":@sections[i],"archived":false}).length
          groupName = if @sections[i] == "public" then "Public" else @sections[i]          
          @$el.find(".header_#{view.cid}").html "#{groupName} (#{assessmentCount})"
          view.allAssessments = assessments
          view.refresh true

  render: =>
    newButton    = "<button class='new command'>New</button>"
    importButton = "<button class='import command'>Import</button>"
    groupsButton = "<button class='navigation groups'>Groups</button>"

    html = "
      #{if Tangerine.settings.get("context") == "server" then groupsButton else ""}
      <h1>Assessments</h1>
    "
    if @isAdmin
      html += "
        #{if Tangerine.settings.get("context") == "server" then newButton else "" }
        #{if Tangerine.settings.get("context") == "mobile" then importButton else ""}

        <div class='new_form confirmation'>
          <div class='menu_box_wide'>
            <input type='text' class='new_name' placeholder='Name'>
            <select id='new_type'>
              <option value='assessment'>Assessment</option>
              <option value='curriculum'>Curriculum</option>
            </select><br>
            <button class='new_save command'>Save</button> <button class='new_cancel command'>Cancel</button>
          </div>
        </div>
      "

    @$el.html html

    if Tangerine.settings.get("context") == "server"
      for view, i in @groupViews
        assessmentCount = @assessments.where({"group":@sections[i],"archived":false}).length
        groupName = if @sections[i] == "public" then "Public" else @sections[i]          
        @$el.append "<h2 class='header_#{view.cid}'>#{groupName} (#{assessmentCount})</h2><ul id='group_#{view.cid}' class='assessment_list'></ul>"
        view.setElement(@$el.find("#group_#{view.cid}"))
        view.render()
      @$el.append("<div id='curricula_container'></div>")
      @curriculaListView.setElement(@$el.find("#curricula_container"))
      @curriculaListView.render()
        
    else if Tangerine.settings.get("context") == "mobile"
      @$el.append "<ul class='assessment_list'></ul>"
      @listView.setElement(@$el.find("ul.assessment_list"))
      @listView.render()
    
    @trigger "rendered"

    return

  # Making a new assessment
  newToggle: -> @$el.find('.new_form, .new').fadeToggle(250); false

  newSave: (event) =>

    # this handles ambiguous events
    # the idea is to support clicks and the enter key
    # logic:
    # it it's a keystroke and it's not enter, act normally, just a key stroke
    # if it's a click or enter, process the form

    if event.type != "click" && event.which != 13
      return true

    name    = @$el.find('.new_name').val()
    newType = @$el.find("#new_type option:selected").val()
    newId   = Utils.guid()

    if name.length == 0
      Utils.midAlert "<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>"
      return false

    if newType == "assessment"
      newObject = new Assessment
        "name"         : name
        "group"        : @group
        "_id"          : newId
        "assessmentId" : newId
        "archived"     : false
    else if newType == "curriculum"
      newObject = new Curriculum
        "name"         : name
        "group"        : @group
        "_id"          : newId
        "curriculumId" : newId

    newObject.save null,
      success : => 
        @refresh() 
        @$el.find('.new_form, .new').fadeToggle(250, => @$el.find('.new_name').val(""))
        Utils.midAlert "#{name} saved"
      error: =>
        @refresh() 
        @$el.find('.new_form, .new').fadeToggle(250, => @$el.find('.new_name').val(""))
        Utils.midAlert "Please try again. Error saving."


    return false

  # ViewManager
  closeViews: ->
    @curriculaListView.close?()
    for view in @groupViews
      view.close()

  onClose: ->
    @closeViews()
