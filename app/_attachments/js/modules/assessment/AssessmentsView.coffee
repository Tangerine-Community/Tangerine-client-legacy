class AssessmentsView extends Backbone.View

  tagName   : "ul"
  events : 
    "click .hidden_toggle" : "toggleHidden"

  toggleHidden: ->
    $container = @$el.find(".hidden_container")
    if $container.is(":visible")
      $container.fadeOut(150)
      @$el.find(".hidden_toggle").html "Show"
    else
      $container.fadeIn(150)
      @$el.find(".hidden_toggle").html "Hide"
    

  initialize: (options) ->
    @group = options.group
    @allAssessments = options.allAssessments
    @parent         = options.parent
    @refresh()

  refresh: (doRender=false) ->
    if @group == false
      @assessments = @allAssessments
    else
      @assessments = new Assessments @allAssessments.where( { "group" : @options.group, "archived" : false } )
      @hidden      = new Assessments @allAssessments.where( { "group" : @options.group, "archived" : true  } )

    console.log "#{@group}"
    console.log @allAssessments

    @closeViews()
    @assessmentViews = ( new AssessmentListElementView( { "model" : assessment, "parent" : @ } ) for assessment in @assessments.models )
    @hiddenViews = ( new AssessmentListElementView( { "model" : assessment, "parent" : @ } ) for assessment in @hidden.models )
    if doRender then @render()

  render: ->
    if @assessmentViews.length == 0
      @$el.html "<p class='grey'>No assessments yet. Click <b>new</b> to start making one.</p>"
    else
      for view in @assessmentViews
        view.render()
        @$el.append view.el

      if @hiddenViews.length != 0
        @$el.append "<h2>Archived (#{@hiddenViews.length}) <button class='command hidden_toggle'>Show</button></h2><div class='hidden_container confirmation'></div>"
        for view in @hiddenViews
          view.render()
          @$el.find(".hidden_container").append view.el


    @trigger "rendered"

  closeViews: ->
    if @assessmentViews?
      for view in @assessmentViews
        view.close()

  onClose: ->
    @closeViews()