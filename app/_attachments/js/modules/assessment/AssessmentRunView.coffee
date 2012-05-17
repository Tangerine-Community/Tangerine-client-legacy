class AssessmentRunView extends Backbone.View
  
  initialize: (options) ->
    @abortAssessment = false
    @index = 0
    @model = options.model
    @result = new Result
      assessmentId : @model.id
      assessmentName : @model.get "name"
      starttime : (new Date()).getTime()

    @subtestViews = []
    @model.subtests.sort()
    @model.subtests.each (model) =>
      @subtestViews.push new SubtestRunView 
        model  : model
        parent : @
    resultView = new ResultView
        model          : @result
        assessment     : @model
        assessmentView : @
    resultView.on "assessment:restart", @restart
    @subtestViews.push resultView
        
  render: ->
    currentView = @subtestViews[@index]
    
    if @model.subtests.length == 0
      @$el.append "<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>"
    else
      @$el.html "
        <h1>#{@model.get 'name'}</h1>
        <div id='progress'></div>
      "
      @$el.find('#progress').progressbar value : ((@index+1)/(@model.subtests.length+1)*100)
      currentView.render()
      @$el.append currentView.el

    @trigger "rendered"

  onClose: ->
    for view in @subtestViews
      view.close()
    @result.clear()
    $("#current_student_id").fadeOut(250, -> $(@).html(""))
    $("#current_student").fadeOut(250)
    
  abort: ->
    @abortAssessment = true
    @next()

  restart: =>
    alert 'assessment restart not implemented'

  next:->
    currentView = @subtestViews[@index]
    if currentView.isValid()
      @result.add
        name : currentView.model.get "name"
        data : currentView.getResult()
        subtestId : currentView.model.id
        sum : currentView.getSum()
      currentView.close()
      @index++ unless @abortAssessment == true
      @index = @subtestViews.length-1 if @abortAssessment == true
      @render()
      window.scrollTo 0, 0
    else
      currentView.showErrors()