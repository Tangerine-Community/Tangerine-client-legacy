class UserEditView extends Backbone.EditView
  
  initialize: ->
    @fetchLocations => @renderSchoolList("data")
    @models = new Backbone.Collection Tangerine.user

  render: ->
    @$el.html "
      <h1>Edit User</h1>

      <p id='message'></p>

      <table>
        <tr>
          <th>TSC/Emp Number</th>
          <td>#{@getEditable(Tangerine.user, { key : 'tscNumber', escape : true },'TSC or Employment Number', 'untitled step')}</td>
        </tr>
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
      <div id='schoolSelector'><p>Loading county and zone list...</p></div>

    "
    @renderSchoolList "dom"

    @trigger "rendered"

  onSelectChange: =>
    location = {}
    rawLocation = @locationView.getResult(true)
    for label, i in rawLocation.labels
      location[label] = rawLocation.location[i]

    if location.County? and location.Zone?
      Tangerine.user.save(location:{County:location.County,Zone:location.Zone},{
        error:   -> Utils.topAlert "User not saved"
        success: -> Utils.topAlert "User location saved"
      })


  # place previous data in select
  selectRendered: =>
    location = Tangerine.user.get("location")
    if location?

      countyIndex = @locationView.levels.indexOf("County")
      zoneIndex   = @locationView.levels.indexOf("Zone")

      county = location.County
      zone   = location.Zone

      if @locationView.$el.find("#level_#{countyIndex} option[value='#{county}']").length is 0

        @$el.find("#message").html "<img src='images/icon_warn.png' title='Warning'> Warning: Location needs to be set again."

      else

        @locationView.$el.find("#level_#{countyIndex}").val county
        @locationView.$el.find("#level_#{countyIndex}").trigger "change"

        if @locationView.$el.find("#level_#{zoneIndex} option[value='#{zone}']").length is 0

          @$el.find("#message").html "<img src='images/icon_warn.png' title='Warning'> Warning: Location needs to be set again."

        else

          @locationView.$el.find("#level_#{zoneIndex}").val zone

    else
      @$el.find("#message").html "<img src='images/icon_warn.png' title='Warning'> Warning: No location saved for user."

  fetchLocations: ( callback = $.noop ) ->
    subtestIndex = 0
    limit = 1

    checkSubtest = =>

      Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
        include_docs : true
        key   : "subtest"
        skip  : subtestIndex
        limit : limit
        error: $.noop
        success: (response) =>
          return alert "Failed to find locations" if response.rows.length is 0
          
          locationSubtest = response.rows[0].doc

          if locationSubtest.prototype? && locationSubtest.prototype is "location"
            @locationSubtest = new Subtest locationSubtest
            @locationView = new LocationRunView model:@locationSubtest, limit:2
            @listenTo @locationView, 'rendered', @selectRendered
            @listenTo @locationView, 'select-change', @onSelectChange
            callback?()
          else
            subtestIndex++
            checkSubtest()
      )
    checkSubtest()

  renderSchoolList: (flag) ->
    requiredFlags = ["dom", "data"]
    @renderSchoolListFlags = [] unless @renderSchoolListFlags?
    @renderSchoolListFlags.push flag
    ready = _(requiredFlags).intersection(@renderSchoolListFlags).length == requiredFlags.length
    return unless ready

    @locationView.setElement @$el.find("#schoolSelector")
    @locationView.render()
    @locationView.$el.find(".clear").remove()
