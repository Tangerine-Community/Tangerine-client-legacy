class RegisterTeacherView extends Backbone.View

  events :
    'click .register' : 'register'

  initialize: ( options ) ->
    @model = options.model

  register: ->
    @model.set
      name     : @$el.find("#name").val()
      school   : @$el.find("#school").val()
      village  : @$el.find("#village").val()
      district : @$el.find("#district").val()
      region   : @$el.find("#region").val()
    @model.save()
    

  render: ->
    @$el.html "
    <h1>Register</h1>
    <div class='label_value'>
      <label for='role'>Role</label>
      <input id='role'>
    </div>
    <div class='label_value'>
      <label for='name'>Name</label>
      <input id='name'>
    </div>
    <div class='label_value'>
      <label for='school'>School</label>
      <input id='school'>
    </div>
    <div class='label_value'>
      <label for='school'>Village</label>
      <input id='school'>
    </div>
    <div class='label_value'>
      <label for='district'>District</label>
      <input id='district'>
    </div>
    <div class='label_value'>
      <label for='region'>Region</label>
      <input id='region'>
    </div>
    <button class='register'>Register</button>
    "
    @trigger "rendered"

