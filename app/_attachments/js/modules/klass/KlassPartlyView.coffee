class KlassPartlyView extends Backbone.View

  events:
    "click .next_part"                : "nextPart"
    "click .prev_part"                : "prevPart"
    "click .back"                     : "back"
    "click .student_subtest"          : "gotoStudentSubtest"
    #"click .part_subtest_report"      : "partSubtestReport"
    #"click .student"                  : "gotoStudentReport"

#  gotoStudentReport: ->
#    Tangerine.router.navigate "report/student/" + $(event.target).attr("data-studentId")
#
#  partSubtestReport: (event) ->
#    id = $(event.target).attr("data-id")
#    Tangerine.router.navigate "report/#{id}", true

    
  back: ->
    Tangerine.router.navigate "class", true

  gotoStudentSubtest: (event) ->
    studentId = $(event.target).attr("data-studentId")
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/result/student/subtest/#{studentId}/#{subtestId}", true

  nextPart: ->
    if @currentPart < @subtestsByPart.length-1
      @currentPart++
      @render()
      Tangerine.router.navigate "class/#{@options.klass.id}/#{@currentPart}"

  prevPart: -> 
    if @currentPart > 1
      @currentPart-- 
      @render()

  initialize: (options) ->
    @currentPart = options.part || 1
    @subtestsByPart = []
    part = 1
    while (byPart=options.subtests.where "part" : part).length != 0
      @subtestsByPart[part] = byPart unless byPart == 0
      @subtestsByPart[part].sort (a,b) -> a.get("name").toLowerCase() > b.get("name").toLowerCase()
      part++
    @totalParts = part - 1


  render: ->

    @table = []

    subtestsThisPart = @subtestsByPart[@currentPart]

    for student, i in @options.students.models
      @table[i] = []

      resultsForThisStudent = new KlassResults @options.results.where "studentId" : student.id

      for subtest, j in subtestsThisPart

        studentResult = resultsForThisStudent.where "subtestId" : subtest.id
        marker        = if studentResult.length == 0 then "?" else "&#x2714;"
        @table[i].push
          "content"   : marker
          "taken"     : studentResult.length != 0
          "studentId" : student.id
          "studentName" : student.get("name")
          "subtestId" : subtest.id

    # make headers
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>"
    for subtest in subtestsThisPart
      gridPage += "<th><div class='part_subtest_report' data-id='#{subtest.id}'>#{subtest.get('name')}</div></th>"
    gridPage += "</tr>"
    for row in @table
      gridPage += "<tr><td><div class='student' data-studentId='#{row[0].studentId}'>#{row[0].studentName}</div></td>"
      for cell, column in row
        gridPage += "<td><div class='student_subtest command' data-taken='#{cell.taken}' data-studentId='#{cell.studentId}' data-subtestId='#{cell.subtestId}'>#{cell.content}</div></td>"
      gridPage += "</tr>"
    gridPage += "</tbody></table>"

    @$el.html "
      <h1>#{t('assessment status')}</h1>
      <h2>#{t('assessment')} #{@currentPart}</h2>
      #{gridPage}<br>
      
      <button class='prev_part command'>#{t('previous')}</button> <button class='next_part command'>#{t('next')}</button><br><br>
      <button class='back navigation'>#{t('back')}</button> 
      "

    @trigger "rendered"