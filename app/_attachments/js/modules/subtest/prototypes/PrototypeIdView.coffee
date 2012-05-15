class PrototypeIdView extends Backbone.View

  className: "id"
  
  events:
    'click #generate' : 'generate'
    'change #student_id' : 'setValidator'
  
  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
    @validator = new CheckDigit

  render: ->
    @$el.html "
    <form>
      <label for='student_id'>Random Identifier</label>
      <input id='student_id' name='student_id'>
      <button id='generate' class='command'>Generate</button>
      <div class='messages'></div>
    </form>"
    @trigger "rendered"

  getSum: ->
    correct   : 1
    incorrect : 0
    missing   : 0
    total     : 1

  setValidator: ->
    @validator.set @$el.find('#student_id').val()

  isValid: ->
    @setValidator()
    return false if not @validator.isValid()
    @updateNavigation()
    
  showErrors: ->
    @$el.find(".messages").html @validator.getErrors().join(", ")

  generate: ->
    @$el.find(".messages").empty()
    @$el.find('#student_id').val @validator.generate()
    false

  updateNavigation: ->
    Tangerine.nav.setStudent @$el.find('#student_id').val()