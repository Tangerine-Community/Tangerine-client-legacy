class AssessmentListView extends Backbone.View

  events:
    'submit form'                  : 'newAssessmentSave'
    'click .new_assessment_save'   : 'newAssessmentSave'
    'click .new_assessment_cancel' : 'newAssessmentHide'
    'click .new_assessment'        : 'newAssessmentShow'
    'click .import'                : 'import'


  import: ->
    Tangerine.router.navigate "import", true

  initialize:(options) ->
    @isAdmin = Tangerine.user.isAdmin()
    console.log "is admin " + @isAdmin
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
        collection.each (model) ->
          if Tangerine.context.server
            if ~Tangerine.user.groups.indexOf(model.get("group"))
              groupCollection.push model
          else
            groupCollection.push model
          
        @collection = new Assessments groupCollection
        @collection.on "add remove", @render

        if Tangerine.context.server
          @public = new Assessments collection.where { group : "public" }
        else
          @public = null
        @render()

  render: =>
    # clean up
    @closeViews()
    @views = []

    html = "
      <h1>Assessments</h1>
      "
    if @isAdmin
      html += "
        <button class='new_assessment command'>New</button><button class='import command'>Import</button>
        <form class='new_assessment_form'>
          <input type='text' class='new_assessment_name' placeholder='Assessment Name'>
          <button class='new_assessment_save'>Save</button>
          <button class='new_assessment_cancel'>Cancel</button>
        </form>
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

    if @isAdmin && Tangerine.context.server

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

    @trigger "rendered"

  # Making a new assessment
  newAssessmentShow:  -> @$el.find('.new_assessment_form').show(250); false
  newAssessmentHide:  -> @$el.find('.new_assessment_form').fadeOut(250); false
  newAssessmentValid: -> 
    return false if @$el.find('.new_assessment_name').val() != ""

  newAssessmentSave: =>
    if @newAssessmentValid
      newAssessment = new Assessment
        'name' : @$el.find('.new_assessment_name').val()
        'group' : Tangerine.user.groups[0]
      newAssessment.save()
      @collection.add newAssessment
      Utils.midAlert "#{@$el.find('.new_assessment_name').val()} saved"
    else
      Utils.midAlert "<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>"
    return false

  # ViewManager
  closeViews: ->
    _.each @views, (view) -> view.close()

  onClose: ->
    @closeViews()
