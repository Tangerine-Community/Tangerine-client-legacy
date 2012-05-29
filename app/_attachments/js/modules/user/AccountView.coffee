class AccountView extends Backbone.View

  events:
    "click .klass" : "gotoKlass"
  
  gotoKlass: ->
    Tangerine.router.navigate "class", true

  initialize: ( options ) ->
    @model = options.model
  
  render: ->
    @$el.html "
      <h2>Account</h2>
      <button class='klass'>Tangerine Class</button>
      <div class='label_value'>
        <label>Name</label>
        <p>#{@model.name}</p>
      </div>
      <div class='label_value'>
        <label>Roles</label>
        <p>#{@model.roles.join(", ")}</p>
      </div>
      <div class='label_value'>
        <label>Group</label>
        <p>#{@model.groups.join(", ")}</p>
      </div>
      <button class='command confirmation'>Report a bug</button>
      <div class='confirmation' id='bug'>
        <label for='where'>What broke?
        <input id='where' placeholder='where'>
        <label for='where'>What happened?
        <input id='where' placeholder='what'>
        <label for='where'>What should have happened?
        <input id='should' placeholder='should'>
        <button>Send</button>
      </div>
      "
    @trigger "rendered"
