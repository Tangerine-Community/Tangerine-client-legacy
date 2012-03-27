class AssessmentListView extends Backbone.View
  initialize: ->

  el: $('#content')

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
    @el.html "
      <h1>Collect</h1>
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
        assessmentDetails = {}
        assessmentCollection.each (assessment) =>
          return if assessment.get("archived") is true
          assessmentDetails[assessment.get "_id"] =
            id : assessment.get "_id"
            name : assessment.get "name"
            enumerator : $.enumerator
            number_completed : 0

        resultCollection = new ResultCollection()
        resultCollection.fetch
          success: =>
            resultCollection.each (result) =>
              return unless result.get("enumerator") is $.enumerator
              assessmentDetails[result.get "assessmentId" ]["number_completed"]+=1

            _.each assessmentDetails, (value,key) =>
              @el.find("#assessments tbody").append @templateTableRow value

            $('table').tablesorter()
