class AssessmentDataEntryView extends Backbone.View

  events: 
    "change #subtest_select" : "updateCurrent"
    'click .prev_subtest'    : 'prevSubtest'
    'click .next_subtest'    : 'nextSubtest'
    'click .save' : 'saveResult'

  prevSubtest: ->
    select = document.getElementById("subtest_select")
    select.selectedIndex = select.selectedIndex - 1
    @updateCurrent()
    

  nextSubtest: ->
    select = document.getElementById("subtest_select")
    select.selectedIndex = select.selectedIndex + 1
    @updateCurrent()

  initialize: (options) ->
    # assessment
    @[key] = value for key, value of options
    @result = new Result
      assessmentId : @assessment.id
      dataEntry    : true
    @views = []
    @viewsBySubtestId = {}

  render: ->

    selector = "
      <button class='prev_subtest'>&lt;</button>
      <select id='subtest_select'>
        #{("<option data-subtestId='#{subtest.id}' #{if i is 0 then "selected='selected'" else ''}>#{subtest.get("name")}</option>" for subtest, i in @assessment.subtests.models).join('')}
      </select> 
      <button class='next_subtest'>&gt;</button>
      <br>
    "

    subtests = "
      <section id='current_subtest'>
        #{("<div id='#{subtest.id}' class='confirmation subtest_container'></div>" for subtest in @assessment.subtests.models).join('')}
      </section>
    "

    @$el.html "
      <a href='#assessments'><button class='navigation'>Back</button></a><br>

      <h1>#{@assessment.escape("name")}</h1>

      #{selector}
      <button class='command save'>Save</button> <small class='small_grey last_saved'></small>
      #{subtests}
    "

    for subtest in @assessment.subtests.models
      prototype = subtest.get("prototype")
      @["#{prototype}Init"](subtest)


    @$subEl = @$el.find("#current_subtest")

    @updateCurrent()

    @result.set "subtestData", (@subtestDataObject(view.model) for view in @views)

    @trigger "rendered"

  updateCurrent: ->

    @saveResult()

    @subtestId = @$el.find("#subtest_select option:selected").attr("data-subtestId")
    @$subEl.find(".subtest_container").hide()
    @$subEl.find("##{@subtestId}").show()
    @subtest = @assessment.subtests.get(@subtestId)
    @trigger "rendered"


  saveResult: ->

    return unless @subtest?

    @result.insert @subtestDataObject(@subtest)

    @result.save null,
      success: =>
        console.log "got here"
        @$el.find(".last_saved").html "Last saved: " + moment(new Date(@result.get('updated'))).format('MMM DD HH:mm')
      error: =>
        console.log "save error"
        console.log arguments

  subtestDataObject: (subtest) ->

    view = @viewsBySubtestId[subtest.id]

    return {
      name        : subtest.get "name"
      data        : view.getResult()
      subtestHash : subtest.get "hash"
      subtestId   : subtest.id
      prototype   : subtest.get "prototype"
      sum         : view.getSum()
    }

  gridInit: (subtest) ->
    view = new GridRunView 
      model     : subtest
      dataEntry : true
    @addRenderView view, subtest

  surveyInit: (subtest) ->
    view = new SurveyRunView 
      model: subtest
      parent:
        gridWasAutostopped: -> return false
    @addRenderView view, subtest

  locationInit: (subtest) ->
    view = new LocationRunView 
      model: subtest
    @addRenderView view, subtest

  datetimeInit: (subtest) ->
    view = new DatetimeRunView 
      model: subtest
    @addRenderView view, subtest

  idInit: (subtest) ->
    view = new IdRunView 
      model: subtest
    @addRenderView view, subtest

  consentInit: (subtest) ->
    view = new ConsentRunView 
      model: subtest
    @addRenderView view, subtest

  addRenderView: (view, subtest) ->
    $element = @$el.find("##{subtest.id}")
    view.setElement $element
    view.render()
    @viewsBySubtestId[subtest.id] = view
    
    @views.push view
