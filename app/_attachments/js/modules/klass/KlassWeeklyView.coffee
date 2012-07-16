class KlassWeeklyView extends Backbone.View

  events:
    "click .student_subtest" : 'gotoStudentSubtest'
    "click .next_week" : "nextWeek"
    "click .prev_week" : "prevWeek"
    "click .subtest" : "subtest"

  subtest: (event) ->
    id = $(event.target).attr("data-id")
    Tangerine.router.navigate "report/#{id}", true

  gotoStudentSubtest: (event) ->
    studentId = $(event.target).attr("data-studentId")
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/result/student/subtest/#{studentId}/#{subtestId}", true

  nextWeek: -> @currentWeek++; @render()
  prevWeek: -> @currentWeek--; @render()

  initialize: (options) ->
    @currentWeek = options.week || 1
    @subtestsByWeek = []
    week = 1
    while (byWeek=options.subtests.where "week" : week).length != 0
      @subtestsByWeek[week] = byWeek
      week++
    @totalWeeks = week - 1

  render: ->
    gridPage = "<table class='info_box_wide '><tbody><tr><th></th>"
    @options.students.each (student) ->
      gridPage += "<th>#{student.get("name")}</th>"
    gridPage += "</tr>"

    subtestsThisWeek = @subtestsByWeek[@currentWeek]

    for subtest, i in subtestsThisWeek

      gridPage += "<tr>"
      resultsForThisSubtest = new KlassResults @options.results.where "subtestId" : subtest.id
      gridPage += "<td><div class='subtest' data-id='#{subtest.id}'>#{subtest.get('name')}</div></td>"
      @options.students.each (student) ->

        studentResult = resultsForThisSubtest.where "studentId" : student.id
        marker = if studentResult.length == 0 then "?" else "O"
        gridPage += "<td><div class='student_subtest command' data-taken='true' data-studentId='#{student.id}' data-subtestId='#{subtest.id}'>#{marker}</div></td>"

      gridPage += "</tr>"

    gridPage += "</tbody></table>"

    html = "
      <h1>Class Status</h1>
      <h2>Week #{@currentWeek}</h2>
      #{gridPage}<br>
      
      <button class='prev_week command'>Previous</button> <button class='next_week command'>Next</button> 
      "

    @$el.html html

    @trigger "rendered"