class AssessmentListView extends Backbone.View

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
    #@initializeSubmenu()

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
    console.log "test"
    if @isAdmin
      
      $("nav#submenu").html "<button data-submenu='new'>new</button>"

  submenuHandler: (event) ->
    submenu = $(event.target).attr "data-submenu"
    console.log "test"
    console.log submenu
    if submenu == "new"
      @newAssessmentShow()

  # maintain thisness
  render: =>
    @closeViews()
    @views = []

    @$el.html "
      <h2>Assessments</h2>
      <form class='new_assessment_form'>
        <input type='text' class='new_assessment_name' placeholder='Assessment Name'>
        <button class='new_assessment_save'>Save</button>
        <button class='new_assessment_cancel'>Cancel</button>
      </form>
      "

    unorderedList = $('<ul>').addClass('assessment_list')

    for assessment in @collection.models
      oneView = new AssessmentElementView
        model : assessment
      @views.push oneView
      oneView.render()
      unorderedList.append oneView.el

    @$el.append unorderedList

    @trigger "rendered"
  


  closeViews: ->
    _.each @views, (view) -> view.close
    
  onClose: ->
    @closeViews()
