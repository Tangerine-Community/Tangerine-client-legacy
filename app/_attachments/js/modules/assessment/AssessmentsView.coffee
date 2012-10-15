class AssessmentsView extends Backbone.View

  tagName   : "ul"

  initialize: (options) ->
    @group = options.group
    @allAssessments = options.allAssessments
    @parent      = options.parent
    @refresh()

  refresh: (doRender=false) ->
    if @group == false
      @assessments = @allAssessments
    else
      @assessments = new Assessments @allAssessments.where( { "group" : @options.group } )

    @closeViews()
    @assessmentViews = ( new AssessmentListElementView( { "model" : assessment, "parent" : @ } ) for assessment in @assessments.models )
    if doRender then @render()

  render: ->
    if @assessmentViews.length == 0
      @$el.html "<p class='grey'>No assessments yet. Click <b>new</b> to start making one.</p>"
    else
      for view in @assessmentViews
        view.render()
        @$el.append view.el

    @trigger "rendered"

  closeViews: ->
    if @assessmentViews?
      for view in @assessmentViews
        view.close()

  onClose: ->
    @closeViews()