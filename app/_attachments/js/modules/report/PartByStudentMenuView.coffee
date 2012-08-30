class WeekByStudentMenuView extends Backbone.View

  events:
    'change .week_selector' : 'gotoWeekByStudentReport'

  gotoWeekByStudentReport: (event) ->
    Tangerine.router.navigate "report/weekByStudent/" + @$el.find(event.target).find(":selected").attr("data-subtestId"), true

  initialize: (options) ->
    @parent    = options.parent
    @klass     = @parent.options.klass
    @curricula = @parent.options.curricula
    milisecondsPerWeek = 604800000
    @currentWeek = Math.round(((new Date()).getTime() - @klass.get("startDate")) / milisecondsPerWeek)
    allSubtests = new Subtests
    allSubtests.fetch
      success: (collection) =>
        subtests = collection.where 
          curriculaId : @curricula.id
        @weeks = []
        for subtest in subtests
          @weeks[subtest.get('week')] = subtest.id
        @ready = true
        @render()

  render: ->
    if (@ready)
      html = "
        <select class='week_selector'>
          <option disabled='disabled' selected='selected'>Select a week</option>
          "
      for subtestId, week in @weeks
        if subtestId?
          flagForCurrent = if @currentWeek == week then "**" else ''
          html += "<option data-subtestId='#{subtestId}'>#{week}#{flagForCurrent}</option>"
      html += "</select>"
          
      @$el.html html
    else
      @$el.html "<img src='images/loading.gif' class='loading'>"