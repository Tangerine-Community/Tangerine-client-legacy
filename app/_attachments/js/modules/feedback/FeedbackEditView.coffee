
class FeedbackEditView extends Backbone.EditView
  
  events : $.extend
    'click  .critique-add'    : "critiqueAdd"
    'click  .critique-remove' : 'critiqueRemove'
  , Backbone.EditView.prototype.events


  removeStep: (event) ->
    $target = $(event.target)
    modelId = $target.attr('data-model-id')
    @workflow.collection.remove(modelId)
    @workflow.save null,
      success: ->
        Utils.topAlert("Step removed")

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

    critiqueList      = ""

    @feedback.collection.each (criqitueModel) =>
      critiqueList += "
        <li>
          <table>

            <tr>
              <th>Name</th>
              <td>#{@getEditable(criqitueModel, { key : 'name', escape : true },'Step name', 'untitled critique')}</td>
            </tr>

            <tr>
              <th>Order</th>
              <td>#{@getEditable(criqitueModel, { key : 'order', isNumber : true },'Order', 'unordered')}</td>
            </tr>

            <tr>
              <th>Template</th>
              <td>#{@getEditable(criqitueModel, { key : 'template', escape : true },'Template', 'none')}</td>
            </tr>

            <tr>
              <th>Feedback Code</th>
              <td>#{@getEditable(criqitueModel, { key : 'processingCode' }, 'Feedback code', 'Feedback code')}</td>
            </tr>

            <tr>
              <td><button class='command critique-remove' data-model-id='#{criqitueModel.id}'>Remove</button></td>
            </tr>
          </table>
        </li>
      "

    html = "
      <h1>#{@getEditable(@feedback, {key:'name', escape:true}, "Feedback name", "Untitled feedback")}</h1>
      <style>
        #stepList li
        {
          margin: 1em 0;
          border-bottom: 1px solid grey;
        }
      </style>
      <div class='menubox'>
        <ul id='stepList'>#{critiqueList}</ul>
      </div>
      <div id='controls'>
        <button class='critique-add command'>Add</button>
      </div>
    "

    @$el.html html

    @trigger "rendered"

  critiqueAdd: -> @feedback.newChild()


