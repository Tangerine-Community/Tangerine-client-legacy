class WorkflowRunView extends Backbone.View
  
  events: 
    "click .previous" : "previousStep"
    "click .next" : "nextStep"

  initialize: (options) ->
    @[key] = value for key, value of options
    @index = 0

  render: ->

    stepIndicator = "#{@index+1} of #{@workflow.getLength()+1}"

    @$el.html "
      #{stepIndicator}
      <section id='#{@cid}_current_step'></section>
      <button class='navigation previous'>Previous</button>
      <button class='navigation next'>Next</button>
    "
    @renderStep()
    @trigger "rendered"

  onSubViewDone: =>
    @subViewDone = true
    @nextStep()

  nextStep: ->

    if @subView? and not @subViewDone
      @subView.next()
      return

    oldIndex = @index

    # intentionally lets you go one over
    # handled with "if currentStep is null"
    @index = Math.min( @index+ 1, @workflow.getLength() )

    @render() if oldIndex isnt @index

    @subViewDone = false
    @subView = null

  previousStep: ->

    oldIndex = @index
    @index = Math.max( @index - 1, 0 )
    @render() if oldIndex isnt @index

  renderStep: =>

    currentStep = @workflow.stepModelByIndex @index

    if currentStep is null

      if @index > 0
        @$el.find("##{@cid}_current_step").html "End"

    else if currentStep.getType() is "new"

      @showView new (currentStep.getViewClass())(currentStep.getViewOptions())

    else if currentStep.getType() is "assessment"

      currentStep.fetch
        success: =>
          assessment = currentStep.getTypeModel()
          @showView new AssessmentRunView
            model    : assessment
            workflow : true
            tripId   : Utils.guid()


    else if currentStep.getType() is "curriculum"

      currentStep.fetch
        success: ->
          console.log "This is the test"
          console.log currentStep.getModel()

      @showView new KlassSubtestRunView
        "student"      : student
        "subtest"      : subtest
        "questions"    : questions
        "linkedResult" : linkedResult


    else if currentStep.getType() is "login"

      @$el.find("##{@cid}_current_step").html("<h1>Login - #{currentStep.get('userType')}</h1>")

    else

      @$el.find("##{@cid}_current_step").html("<h1>#{currentStep.name()} - #{currentStep.getType()}</h1>")


  showView: (subView) ->
    @subView = subView
    @subView.setElement @$el.find("##{@cid}_current_step")
    @subView.on "subViewDone save", @onSubViewDone
    @subView.render()
