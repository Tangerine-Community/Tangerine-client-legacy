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
        assessmentDetails = {}
        assessmentCollection.each (assessment) =>
          return if assessment.get("archived") is true
          assessmentDetails[assessment.get "_id"] =
            id : assessment.get "_id" 
            name : assessment.get "name"
            enumerator : Tangerine.user.get "name"
            number_completed : 0

        resultCollection = new ResultCollection()
        resultCollection.fetch
          success: =>
            resultCollection.each (result) =>
              return unless result.get("enumerator") is Tangerine.user.get("name")
              assessmentDetails[result.get "assessmentId" ]["number_completed"]+=1

            _.each assessmentDetails, (value,key) =>
              console.log "value"
              console.log value
              @$el.find("#assessments tbody").append @templateTableRow value

            $('table').tablesorter()
