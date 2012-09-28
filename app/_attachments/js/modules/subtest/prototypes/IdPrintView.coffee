class IdPrintView extends Backbone.View

  className: "id"
  
  events:
    'click #generate' : 'generate'
    'change #participant_id' : 'setValidator'
  
  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
    @validator = new CheckDigit

  render: ->
    @$el.html "
    <form>
      <label for='participant_id'>Random Identifier</label>
      <input id='participant_id' name='participant_id'>
      <button id='generate' class='command'>Generate</button>
      <div class='messages'></div>
    </form>"
    @trigger "rendered"

