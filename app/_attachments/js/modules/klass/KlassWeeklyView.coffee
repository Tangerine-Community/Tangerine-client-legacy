class KlassWeeklyView extends Backbone.View

  events:
    "click .next_week"                : "nextWeek"
    "click .prev_week"                : "prevWeek"
    "click .back"                     : "back"
    "click .student_subtest"          : "gotoStudentSubtest"
    #"click .week_subtest_report"      : "weekSubtestReport"
    #"click .student"                  : "gotoStudentReport"

#  gotoStudentReport: ->
#    Tangerine.router.navigate "report/student/" + $(event.target).attr("data-studentId")
#
#  weekSubtestReport: (event) ->
#    id = $(event.target).attr("data-id")
#    Tangerine.router.navigate "report/#{id}", true

    
  back: ->
    Tangerine.router.navigate "classes", true

  gotoStudentSubtest: (event) ->
    studentId = $(event.target).attr("data-studentId")
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/result/student/subtest/#{studentId}/#{subtestId}", true

  nextWeek: ->
    if @currentWeek < @subtestsByWeek.length-1
      @currentWeek++
      @render()
      Tangerine.router.navigate "class/#{@options.klass.id}/#{@currentWeek}"

  prevWeek: -> 
    if @currentWeek > 1
      @currentWeek-- 
      @render()

  initialize: (options) ->
    @currentWeek = options.week || 1
    @subtestsByWeek = []
    week = 1
    while (byWeek=options.subtests.where "week" : week).length != 0
      @subtestsByWeek[week] = byWeek unless byWeek == 0
      @subtestsByWeek[week].sort (a,b) -> a.get("name").toLowerCase() > b.get("name").toLowerCase()
      week++
    @totalWeeks = week - 1


  render: ->

    @table = []

    subtestsThisWeek = @subtestsByWeek[@currentWeek]

    for student, i in @options.students.models
      @table[i] = []

      resultsForThisStudent = new KlassResults @options.results.where "studentId" : student.id

      for subtest, j in subtestsThisWeek

        studentResult = resultsForThisStudent.where "subtestId" : subtest.id
        marker        = if studentResult.length == 0 then "?" else "&#x2714;"
        @table[i].push
          "content"   : marker
          "taken"     : studentResult.length != 0
          "studentId" : student.id
          "studentName" : student.get("name")
          "subtestId" : subtest.id

    # make headers
    gridPage = "<table class='info_box_wide '><tbody><tr><th></th>"
    for subtest in subtestsThisWeek
      gridPage += "<th><div class='week_subtest_report' data-id='#{subtest.id}'>#{subtest.get('name')}</div></th>"
    gridPage += "</tr>"
    for row in @table
      gridPage += "<tr><td><div class='student' data-studentId='#{row[0].studentId}'>#{row[0].studentName}</div></td>"
      for cell, column in row
        gridPage += "<td><div class='student_subtest command' data-taken='#{cell.taken}' data-studentId='#{cell.studentId}' data-subtestId='#{cell.subtestId}'>#{cell.content}</div></td>"
      gridPage += "</tr>"
    gridPage += "</tbody></table>"

    @$el.html "
      <h1>#{t('class status')}</h1>
      <h2>#{t('week')} #{@currentWeek}</h2>
      #{gridPage}<br>
      
      <button class='prev_week command'>#{t('previous')}</button> <button class='next_week command'>#{t('next')}</button><br><br>
      <button class='back navigation'>#{t('back')}</button> 
      "

    @trigger "rendered"