class AssessmentListView extends Backbone.View

  events:
    'keypress .new_assessment_name' : 'newAssessmentSave'
    'click .new_assessment_save'    : 'newAssessmentSave'
    'click .new_assessment_cancel'  : 'newAssessmentToggle'
    'click .new_assessment'         : 'newAssessmentToggle'
    'click .import'                 : 'import'
    'click .groups'                 : 'gotoGroups'

  gotoGroups: ->
    Tangerine.router.navigate "groups", true

  import: ->
    Tangerine.router.navigate "import", true

  initialize:(options) ->
    @group = options.group
    @curriculaListView = new CurriculaListView
      "curricula" : options.curricula
    @isAdmin = Tangerine.user.isAdmin()
    @views = []
    @publicViews = []
    @refresh()
  
  refresh: ->
    allAssessments = new Assessments
    allAssessments.fetch
      success: (collection) =>
        # maybe this isn't the best place for a filter
        # only applies to this list
        groupCollection = []
        collection.each (model) =>
          if Tangerine.settings.context == "server"
            if model.get("group") == @group
              groupCollection.push model
          else
            groupCollection.push model
          
        @collection = new Assessments groupCollection
        @collection.on "add remove", @render

        if Tangerine.settings.context == "server"
          @public = new Assessments collection.where { group : "public" }
        else
          @public = null
        @render()

  # @TODO This can be refactored easily
  # Take the two portions that make assessment lists, and make it one view that you can give options.
  render: =>
    @closeViews()
    @views = []

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
        <h2>Group assessments</h2>
      "
    
    @$el.html html

    if @collection?.models?.length > 0
      groupList = $('<ul>').addClass('assessment_list')
      for assessment in @collection?.models
        oneView = new AssessmentListElementView
          model  : assessment
          parent : @
        @views.push oneView
        oneView.render()
        groupList.append oneView.el

      @$el.append groupList
    else
      @$el.append "<p class='grey'>No assessments yet. Click <b>new</b> to start making one.</p>"

    if @isAdmin && Tangerine.settings.context == "server"

      @$el.append "<h2>Public assessments</h2>"

      if @public?.models?.length > 0
        publicList = $('<ul>').addClass('public_list assessment_list')
        for assessment in @public?.models
          oneView = new AssessmentListElementView
            model    : assessment
            parent   : @
            isPublic : true
          @publicViews.push oneView
          oneView.render()
          publicList.append oneView.el
      else
        @$el.append "<p>No assessments available.</p>"

      @$el.append publicList
      if @options.curricula.length != 0
        @curriculaListView.render()
        @$el.append "<h2>Curricula</h2>"
        @$el.append @curriculaListView.el

    @trigger "rendered"

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
        'name'         : name
        'group'        : @group
        '_id'          : newId
        'assessmentId' : newId
      
      newAssessment.save()
      @collection.add newAssessment
      Utils.midAlert "#{name} saved"
    else
      Utils.midAlert "<span class='error'>Could not save <img src='images/icon_close.png' class='clear_message'></span>"
    return false

  # ViewManager
  closeViews: ->
    @curriculaListView.close?()
    for view in @views
      view.close()

  onClose: ->
    @closeViews()
