class AssessmentsMenuView extends Backbone.View

  events:
    'keypress .new_assessment_name' : 'newAssessmentSave'
    'click .new_assessment_save'    : 'newAssessmentSave'
    'click .new_assessment_cancel'  : 'newAssessmentToggle'
    'click .new_assessment'         : 'newAssessmentToggle'
    'click .import'                 : 'import'
    'click .groups'                 : 'gotoGroups'

  gotoGroups: -> Tangerine.router.navigate "groups", true

  import:     -> Tangerine.router.navigate "import", true

  initialize: (options) ->

    @assessments = options.assessments
    @group       = options.group

    @assessments.each (assessment) =>
      assessment.on "new", @addToCollection

    @isAdmin = Tangerine.user.isAdmin()

    @sections = [@group, "public"]
    @sections.pop() if @group == "public"

    @curriculaListView = new CurriculaListView
      "curricula" : options.curricula

    @groupViews = []

    if Tangerine.settings.context == "server"
      # coffeescript nightmare, single line possible, but don't do it
      for group in @sections
        view = new AssessmentsView
          "group"       : group
          "homeGroup"   : @group
          "assessments" : @assessments
          "parent"      : @
        @groupViews.push view
    else if Tangerine.settings.context == "mobile"
      @listView = new AssessmentsView
        "group"       : false # all
        "homeGroup"   : @group
        "assessments" : @assessments
        "parent"      : @

  render: =>
    newButton    = "<button class='new_assessment command'>New</button>"
    importButton = "<button class='import command'>Import</button>"
    groupsButton = "<button class='navigation groups'>Groups</button>"


    html = "
      #{if Tangerine.settings.context == "server" then groupsButton else ""}
      <h1>Assessments</h1>
      "
    if @isAdmin
      html += "
        #{if Tangerine.settings.context == "server" then newButton else "" }
        #{if Tangerine.settings.context == "mobile" then importButton else ""}

        <div class='new_assessment_form confirmation'>
          <div class='menu_box_wide'>
            <input type='text' class='new_assessment_name' placeholder='Assessment Name'>
            <button class='new_assessment_save command'>Save</button> <button class='new_assessment_cancel command'>Cancel</button>
          </div>
        </div>
      "

    @$el.html html

    if Tangerine.settings.context == "server"
      for view, i in @groupViews
        view.render()
        @$el.append view.el
        
    else if Tangerine.settings.context == "mobile"
      @listView.render()
      @$el.append @listView.el

    @trigger "rendered"

    return

  addToCollection: (newAssessment) =>
    @assessments.add newAssessment
    newAssessment.on "new", @addToCollection

  # Making a new assessment
  newAssessmentToggle: -> @$el.find('.new_assessment_form, .new_assessment').fadeToggle(250); false

  newAssessmentSave: (event) =>

    # this handles ambiguous events
    # the idea is to support clicks and the enter key
    # logic:
    # it it's a keystroke and it's not enter, act normally, just a key stroke
    # if it's a click or enter, process the form
    
    if event.type != "click" && event.which != 13
      return true
    
    name = @$el.find('.new_assessment_name').val()
  
    if name.length != 0
      newId = Utils.guid()
      newAssessment = new Assessment
      newAssessment.save
        "_id"          : newId
        "assessmentId" : newId
        "archived"     : false

        "name"         : name
        "group"        : @group
      ,
        success : (assessment) =>
          @assessments.add newAssessment
          @$el.find('.new_assessment_form, .new_assessment').fadeToggle(250, => @$el.find('.new_assessment_name').val(""))
          Utils.midAlert "#{name} saved"

    else
      Utils.midAlert "<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>"
    return false

  # ViewManager
  closeViews: ->
    @curriculaListView.close?()
    for view in @groupViews
      view.close()

  onClose: ->
    @closeViews()
