class KlassPartlyView extends Backbone.View

  events:
    "click .next_part"                : "nextPart"
    "click .prev_part"                : "prevPart"
    "click .back"                     : "back"
    "click .student_subtest"          : "gotoStudentSubtest"
    "keyup #current_part"             : "gotoAssessment"
    "keyup #search_student_name"      : "filterStudents"

    #"click .part_subtest_report"      : "partSubtestReport"
    #"click .student"                  : "gotoStudentReport"

#  gotoStudentReport: ->
#    Tangerine.router.navigate "report/student/" + $(event.target).attr("data-studentId")
#
#  partSubtestReport: (event) ->
#    id = $(event.target).attr("data-id")
#    Tangerine.router.navigate "report/#{id}", true

  filterStudents: ->
    val = @$el.find("#search_student_name").val()
    @search = val
    @updateGridPage()

  gotoAssessment: ->
    val = @$el.find("#current_part").val()
    if val == "" then return
    @currentPart = parseInt(val)
    console.log @$el.find("#current_part").val()
    @updateGridPage()

  update: ->
    @render()
    Tangerine.router.navigate "class/#{@options.klass.id}/#{@currentPart}"


  back: ->
    Tangerine.router.navigate "class", true

  gotoStudentSubtest: (event) ->
    studentId = $(event.target).attr("data-studentId")
    subtestId = $(event.target).attr("data-subtestId")
    Tangerine.router.navigate "class/result/student/subtest/#{studentId}/#{subtestId}", true

  nextPart: ->
    if @currentPart < @subtestsByPart.length-1
      @currentPart++
      @update()

  prevPart: -> 
    if @currentPart > 1
      @currentPart-- 
      @update()

  initialize: (options) ->
    @search = ""
    @currentPart = options.part || 1
    @subtestsByPart = []
    part = 1
    while (byPart=options.subtests.where "part" : part).length != 0
      @subtestsByPart[part] = byPart unless byPart == 0
      @subtestsByPart[part].sort (a,b) -> a.get("name").toLowerCase() > b.get("name").toLowerCase()
      part++
    @totalParts = part - 1

  updateGridPage:->
    @$el.find("#grid_container").html @getGridPage()

  getGridPage: ->
    table = []
    subtestsThisPart = @subtestsByPart[@currentPart]
    for student, i in @options.students.models
      table[i] = []

      resultsForThisStudent = new KlassResults @options.results.where "studentId" : student.id

      for subtest, j in subtestsThisPart
        studentResult = resultsForThisStudent.where "subtestId" : subtest.id
        taken = studentResult.length != 0
        
        if ~student.get("name").toLowerCase().indexOf(@search.toLowerCase()) || @search == ""
          table[i].push
            "content"   : if taken then "&#x2714;" else "?"
            "taken"     : taken
            "studentId" : student.id
            "studentName" : student.get("name")
            "subtestId" : subtest.id

    # make headers
    gridPage = "<table class='info_box_wide'><tbody><tr><th></th>"
    for subtest in subtestsThisPart
      gridPage += "<th><div class='part_subtest_report' data-id='#{subtest.id}'>#{subtest.get('name')}</div></th>"
    gridPage += "</tr>"
    for row in table
      if row? && row.length
        gridPage += "<tr><td><div class='student' data-studentId='#{row[0].studentId}'>#{row[0].studentName}</div></td>"
        for cell, column in row
          takenClass = if cell.taken then " subtest_taken" else ""
          gridPage += "<td><div class='student_subtest command #{takenClass}' data-taken='#{cell.taken}' data-studentId='#{cell.studentId}' data-subtestId='#{cell.subtestId}'>#{cell.content}</div></td>"
        gridPage += "</tr>"
    gridPage += "</tbody></table>"

    return gridPage


  render: ->
    
    gridPage = @getGridPage()
    
    @$el.html "
      <h1>#{t('assessment status')}</h1>
      <input id='search_student_name' placeholder='#{t('search student name')}' type='text'>

      <div id='grid_container'>#{gridPage}</div><br>
      <h2>#{t('current assessment')} </h2>
      
      <button class='prev_part command'>&lt;</button> <input type='number' value='#{@currentPart}' id='current_part'> <button class='next_part command'>&gt;</button><br><br>
      <button class='back navigation'>#{t('back')}</button> 
      "

    @trigger "rendered"