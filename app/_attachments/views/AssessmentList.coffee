class AssessmentListView extends Backbone.View

  initialize: ->

  el: '#content'

  templateTableRow: Handlebars.compile "
    <tr>
      <td class='assessment-name'>
        <a href='#assessment/{{id}}'>{{name}}</a>
      </td>
      <td class='number-completed-by-current-enumerator'>
        <a href='#results/{{id}}/{{enumerator}}'>{{number_completed}}</a>
      </td>
    </tr>
  "

  render: =>
    @$el.html "
      <div id='message'></div>
      <table id='assessments' class='tablesorter'>
        <thead>
          <tr>
            <th>Assessment Name</th><th>Number Collected</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    "

    assessmentCollection = new AssessmentCollection()
    assessmentCollection.fetch
      success: =>

        archivedAssessments = []
        assessmentDetails = {}
        assessmentCollection.each (assessment) =>
          if assessment.get("archived") is true
            archivedAssessments.push(assessment.get "_id")
          else
            assessmentDetails[assessment.get "_id"] =
              id : assessment.get "_id" 
              name : assessment.get "name"
              enumerator : Tangerine.user.get "name"
              number_completed : 0

        resultCollection = new ResultCollection()
        resultCollection.fetch
          success: =>
            resultCollection.each (result) =>
              if (result.get("enumerator") == Tangerine.user.get("name")) && (_.indexOf(archivedAssessments, result.get("assessmentId")) ==-1)
                assessmentDetails[result.get("assessmentId")]["number_completed"] += 1

            _.each assessmentDetails, (value,key) =>
              @$el.find("#assessments tbody").append @templateTableRow value

            $('table').tablesorter()
