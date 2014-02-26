class UserEditView extends Backbone.EditView
  
  initialize: ->
    @models = new Backbone.Collection Tangerine.user

  render: ->
    @$el.html "
      <h1>Edit user</h1>

      <table>
        <tr>
          <th>First Name</th>
          <td>#{@getEditable(Tangerine.user, { key : 'first', escape : true },'My first name', 'untitled step')}</td>
        </tr>
        <tr>
          <th>Last name</th>
          <td>#{@getEditable(Tangerine.user, { key : 'last', escape : true },'Last name', 'My last name')}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>#{@getEditable(Tangerine.user, { key : 'email', escape : true },'Email', 'me@provider.com')}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td>#{@getEditable(Tangerine.user, { key : 'phone', escape : true },'Phone number', '000')}</td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>#{@getEditable(Tangerine.user, { key : 'gender', escape : true },'Gender', 'male or female')}</td>
        </tr>
      </table>
    "
    @trigger "rendered"