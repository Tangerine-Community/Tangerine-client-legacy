class AssessmentListView extends Backbone.View

  tagName   : "ul"

  className : "assessmentList"

  events:
    'submit form'                  : 'newAssessmentSave'
    'click .new_assessment_save'   : 'newAssessmentSave'
    'click .new_assessment_cancel' : 'newAssessmentHide'
    'click .add_assessment'        : 'newAssessmentShow'

  # Making a new assessment
  newAssessmentShow:  -> @$el.find('.new_assessment_form').show(250)
  newAssessmentHide:  -> @$el.find('.new_assessment_form').fadeOut(250)
  newAssessmentValid: -> @$el.find('.new_assessment_name').val() != ""
  newAssessmentSave: ->
    if @newAssessmentValid
      newAssessment = new Assessment
        'name' : @$el.find('.new_assessment_name')
    else
      @$el.find('messages').append "<span class='error'>Error saving changes <img src='images/icon_close.png' class='clear_message'></span>"


  initialize:(options) ->
    @isAdmin = Tangerine.user.isAdmin

    @initializeSubmenu() unless options.submenu == false

    @views = []
    @collection = new Assessments null,
      group : Tangerine.user.group
      comparator : (a, b) ->
        if a.name > b.name then 1 else -1
    @collection.on "change", @render
    @collection.fetch
      success: =>
        # maybe this isn't the best place for a filter
        # only applies to this list
        @collection.filter (a, b, c) -> return -> true
        #; if ! assessment.get('group') || assessment.get('group') == @collection.group then true else false
        @collection.trigger "change"

  initializeSubmenu: ->
    if @isAdmin
      $("nav#main_nav").html "<button data-submenu='new'>new</button>"

  submenuHandler: (event) ->
    submenu = $(event.target).attr "data-submenu"
    if submenu == "new"
      @newAssessmentShow()

  # maintain thisness
  render: =>
    @closeViews()
    @views = []

    @$el.html "
      <form class='new_assessment_form'>
        <input type='text' class='new_assessment_name' placeholder='Assessment Name'>
        <button class='new_assessment_save'>Save</button>
        <button class='new_assessment_cancel'>Cancel</button>
      </form>"

    for assessment in @collection.models
      lastView = new AssessmentElementView
        model : assessment
        isAdmin : @isAdmin
      @views.push lastView
      lastView.render()
      @$el.append lastView.el
    
    @trigger "rendered"
  


  closeViews: ->
    _.each @views, (view) -> view.close
    
  onClose: ->
    @closeViews()
