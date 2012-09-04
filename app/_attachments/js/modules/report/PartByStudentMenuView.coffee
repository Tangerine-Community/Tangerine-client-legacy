class PartByStudentMenuView extends Backbone.View

  events:
    'change .part_selector' : 'gotoPartByStudentReport'

  gotoPartByStudentReport: (event) ->
    Tangerine.router.navigate "report/partByStudent/" + @$el.find(event.target).find(":selected").attr("data-subtestId"), true

  initialize: (options) ->
    @parent    = options.parent
    @klass     = @parent.options.klass
    @curricula = @parent.options.curricula
    milisecondsPerPart = 604800000
    @currentPart = Math.round(((new Date()).getTime() - @klass.get("startDate")) / milisecondsPerPart)
    allSubtests = new Subtests
    allSubtests.fetch
      success: (collection) =>
        subtests = collection.where 
          curriculaId : @curricula.id
        @parts = []
        for subtest in subtests
          @parts[subtest.get('part')] = subtest.id
        @ready = true
        @render()

  render: ->
    if (@ready)
      html = "
        <select class='part_selector'>
          <option disabled='disabled' selected='selected'>Select an assessment</option>
          "
      for subtestId, part in @parts
        if subtestId?
          flagForCurrent = if @currentPart == part then "**" else ''
          html += "<option data-subtestId='#{subtestId}'>#{part}#{flagForCurrent}</option>"
      html += "</select>"
          
      @$el.html html
    else
      @$el.html "<img src='images/loading.gif' class='loading'>"