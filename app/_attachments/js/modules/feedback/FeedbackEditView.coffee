
class FeedbackEditView extends Backbone.EditView
  
  events : $.extend
    'click  .critique-add'    : "critiqueAdd"
    'click  .critique-remove' : 'critiqueRemove'
  , Backbone.EditView.prototype.events


  critiqueRemove: (event) ->
    $target = $(event.target)
    modelId = $target.attr('data-model-id')
    @feedback.collection.remove(modelId)
    @feedback.save null,
      success: ->
        Utils.topAlert("Critique removed")

  initialize: (options) ->
    @[key] = value for key, value of options
    @updateEditInPlaceModels()
    @feedback.collection.on "change add remove", =>
      @feedback.collection.sort()
      @updateEditInPlaceModels()
      @render()

  updateEditInPlaceModels: =>
    @models = new Backbone.Collection [@feedback].concat(@feedback.collection.models)

  render: =>

    critiqueList = ""

    @feedback.collection.each (critiqueModel) =>

      critiqueList += "
        <li>
          <table>

            <tr>
              <th>Name</th>
              <td>#{@getEditable(critiqueModel, { key : 'name', escape : true },'Step name', 'untitled critique')}</td>
            </tr>

            <tr>
              <th>Order</th>
              <td>#{@getEditable(critiqueModel, { key : 'order', isNumber : true },'Order', 'unordered')}</td>
            </tr>

            <tr>
              <th>Show notes field</th>
              <td>#{@getEditable(critiqueModel, { key : 'showNotes' }, 'Show notes field', 'true or false')}</td>
            </tr>

            <tr>
              <th>Template</th>
              <td>#{@getEditable(critiqueModel, { key : 'template', escape : true },'Template', 'none')}</td>
            </tr>

            <tr>
              <th>Feedback Code</th>
              <td>#{@getEditable(critiqueModel, { key : 'processingCode', escape: true, coffee: true }, 'Feedback code', 'Feedback code')}</td>
            </tr>

            <tr>
              <th>Show feedback when</th>
              <td>#{@getEditable(critiqueModel, { key : 'when' }, 'Show when code', 'Show when code')}</td>
            </tr>

            <tr>
              <td><button class='command critique-remove' data-model-id='#{critiqueModel.id}'>Remove</button></td>
            </tr>
          </table>
        </li>
      "

    html = "
      <h1>#{@workflow.get('name')} feedback</h1>
      <style>
        #stepList li
        {
          margin: 1em 0;
          border-bottom: 1px solid grey;
        }
      </style>
      <div class='menubox'>
        <div class='menubox'>
          <h3>Display Lesson viewer</h3>
          #{@getEditable(@feedback, { key : 'showLessonPlan' }, 'Lesson viewer status', 'true or false', ((prop)->prop is "true") ) }
        </div>

        <ul id='stepList'>#{critiqueList}</ul>
      </div>
      <div id='controls'>
        <button class='critique-add command'>Add</button>
      </div>
    "

    @$el.html html

    @trigger "rendered"

  critiqueAdd: -> @feedback.newChild()


