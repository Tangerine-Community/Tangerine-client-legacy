class UserEditView extends Backbone.EditView
  
  initialize: ->
    @models = new Backbone.Collection Tangerine.user

  render: ->
    @$el.html "
      <h1>Edit User</h1>

      <p id='message'></p>

      <table>
        <tr>
          <th>TSC/Emp Number</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute:
              key : 'tscNumber'
              escape : true
            name: 'TSC or Employment Number'
            placeholder: 'untitled step'
          }</td>
        </tr>
        <tr>
          <th>First Name</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute: 
              key : 'first'
              escape : true
            name: 'My first name'
            placeholder: 'untitled step'
            }</td>
        </tr>
        <tr>
          <th>Last name</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute: 
              key : 'last'
              escape : true
            name: 'Last name'
            placeholder: 'My last name'
          }</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute: 
              key : 'email'
              escape : true
            name: 'Email'
            placeholder: 'me@provider.com'}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute: 
              key : 'phone'
              escape : true
            name: 'Phone number'
            placeholder:  '000'}</td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>#{@getEditable
            model: Tangerine.user
            attribute: 
              key : 'gender'
              escape : true
            name: 'Gender'
            placeholder: 'male or female'}</td>
        </tr>
      </table>
      <div id='zoneSelector'></div>

    "

    @locView.remove() if @locView?

    if Tangerine.user.has("location")
      loc = Tangerine.user.get("location")
      selected = [loc.county, loc.zone]

    if not Tangerine.user.has("location") or not ( Tangerine.user.get("location").county and Tangerine.user.get("location").zone)
      @$el.find("#message").html "<img src='images/icon_warn.png' title='Warning'> Warning: Location needs to be set for user."


    @locView = new LocView
      levels: ["county", "zone"]
      selected: selected || []
    @locView.setElement @$el.find("#zoneSelector")
    @listenTo @locView, "change", @onSelectChange
    @trigger "rendered"

  onSelectChange: =>
    location = @locView.value()

    if location.county? and location.zone?
      Tangerine.user.save(location:location,{
        error:   -> Utils.topAlert "User not saved"
        success: -> Utils.topAlert "User location saved"
      })





  renderSchoolList: (flag) ->
    requiredFlags = ["dom", "data"]
    @renderSchoolListFlags = [] unless @renderSchoolListFlags?
    @renderSchoolListFlags.push flag
    ready = _(requiredFlags).intersection(@renderSchoolListFlags).length == requiredFlags.length
    return unless ready

    @locationView.setElement @$el.find("#schoolSelector")
    @locationView.render()
    @locationView.$el.find(".clear").remove()
