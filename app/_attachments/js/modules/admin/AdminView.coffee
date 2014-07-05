class AdminView extends Backbone.View

  className : "AdminView"

  events:
    "click .update " : "update" 
    'change .select-all' : 'selectAll'
    'click .add'    : 'add'
    'click .delete' : 'delete'
    'click .send' : 'send'
    'click .send-one' : 'sendOne'

  SEND_TIMEOUT: 10 * 60 * 1e3 # ten minutes

  isOkToSend: ->
    if @action is "sending"
      Utils.topAlert "Currently, sending, please try again later."
      return no
    else
      return yes

  updateAction: ( action = 'idle' ) ->
    @action = action

  send: ->
    return unless @isOkToSend()
    
    userIds = []
    @$el.find("input.report-user:checked").each ( index, el ) =>
      userIds.push $(el).attr("data-id")
    return unless confirm "Are you sure you want to send emails to #{userIds.length} user(s)?"
    @updateAction "sending"
    @sendQueue = userIds
    @beginSend()

  sendOne: (event) ->
    return unless @isOkToSend()

    $target = $(event.target)
    @updateAction "sending"
    @sendQueue = [$target.attr('data-id')]
    @beginSend()

  beginSend: ->

    doOne = =>
      if @sendQueue.length is 0
        @action = 'idle'
        @renderUsers()
      else
        userId = @sendQueue.pop()

        user = @users.get(userId)

        url = [
          urlHost = Tangerine.settings.location.group.url.slice(0,-1)
          urlHandler = "_csv"
          urlRoute = "email"
          urlEmail = @users.get(userId).get('email')
          urlDatabase = Tangerine.db_name
          urlWorkflows = "00b0a09a-2a9f-baca-2acb-c6264d4247cb,c835fc38-de99-d064-59d3-e772ccefcf7d"
          urlYear  = @$el.find('#year').val()
          urlMonth = @$el.find('#month').val()
          urlCounty = user.get('county')
        ].join("/") + ( urlFormat = ".json" )


        $.ajax
          type: 'get'
          contentType: "application/json"
          url : url
          timeout: @SEND_TIMEOUT # magic number, ten minutes
          error: -> alert "There was a problem sending. Please try again."
          success: =>
            monthsSent = user.getArray("monthsSent")
            monthStamp = "#{urlYear}-#{@MONTHS[urlMonth]}"
            monthsSent.push monthStamp if !~monthsSent.indexOf(monthStamp) # if not found
            user.save { "monthsSent" : monthsSent },
              error: ->
                doOne()
              success: ->
                doOne()
    doOne()



  add: ->
    reportUser = new ReportUser
    reportUser.save null,
      success: ->
        Tangerine.router.navigate "reportUser/#{reportUser.id}", true

  delete: ( event ) ->

    modelIds = []
    @$el.find("input.report-user:checked").each ( index, el ) =>
      modelIds.push $(el).attr("data-id")

    totalLength = modelIds.length
    userPlural = "user#{if totalLength is 1 then '' else 's'}"
    return unless confirm("Are you sure you want to delete #{totalLength} #{userPlural}")

    deleteOne = =>
      unless modelIds.length is 0
        modelId = modelIds.pop()
        @users.get(modelId).destroy
          success: ->
            deleteOne()
      else
        alert "#{totalLength} #{userPlural} deleted"
        @renderUsers()

    deleteOne()

  selectAll: ( event ) ->
    checked = $(event.target).is(":checked")
    @$el.find("input.report-user").each ( index, el ) -> 
      $(el).prop "checked", checked

  MONTHS: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  initialize: ( options ) ->

    @action = "idle"

    d = new Date
    @thisMonth = d.getMonth() + 1
    @thisYear  = d.getFullYear()

    @users = new ReportUsers
    @users.fetch
      success: => @renderUsers()

  render: =>

    @$el.html "
      <h1>Admin</h1>

      <select id='year'>
        #{("<option value='#{year}' #{if year is @thisYear then 'selected' else ''}>#{year}</option>" for year in [@thisYear-1..@thisYear+1]).join('')}
      </select>
      <select id='month'>
        #{("<option value='#{index}' #{if index is @thisMonth then 'selected="true"' else ''}>#{@MONTHS[index]}</option>"  for index in [1..12]).join('')}
      </select>
      <br>
      <button class='command add'>Add</button> <button class='command delete'>Delete</button>

      <button class='command send'>Send</button>

      <table id='report-users' class='class_table'><tr><td>loading...</td></tr></table>
    "

    @renderUsers()

    @trigger "rendered"

  renderUsers: ->

    html = "
      <tr>
        <th><input type='checkbox' class='select-all'></th>
        <th>County</th>
        <th>Office</th>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
      </tr>
    "

    for user in @users.models

      timestamp = "#{@thisYear}-#{@MONTHS[@thisMonth]}"
      statusClass = if user.getArray('monthsSent').indexOf()
          "class='report-user-not-current'"
        else
          ''

      html += "
        <tr>
          <td><input type='checkbox' class='report-user' data-id='#{user.id}'></td>
          <td>#{user.get('county')}</td>
          <td>#{user.get('title')}</td>
          <td>#{user.get('last')}, #{user.get('first')}</td>
          <td>#{user.get('email')}</td>
          <td #{statusClass}>#{user.getArray('monthsSent').join(', ')}</td>
          <td><a href='#reportUser/#{user.id}'><button class='command'>Edit</button></a><button class='command send-one' data-id='#{user.id}'>Send</button></td>
        </tr>
      "

    html += '</table>'

    @$el.find('#report-users').html html


class ReportUser extends Backbone.Model

  className : "ReportUser"
  url : "report-user"

class ReportUsers extends Backbone.Collection

  model: ReportUser
  url : "report-user"

class ReportUserEditView extends Backbone.EditView

  className: "ReportUserEditView"

  validateOptions: (options) ->
    throw new ReferenceError "#{@className} requires ReportUser" unless options.user
    throw new TypeError "#{@className} expected ReportUser" unless options.user instanceof ReportUser

  # @param options.user ReportUser To be edited
  initialize: ( options ) ->
    @validateOptions options

    @user = options.user
    @models = new Backbone.Collection @user

  render: ->

    @$el.html "
      <button class='nav-button'><a href='javascript:history.back()'>Back<a/></button>

      <h1>Edit user</h1>

      <table class='class_table'>
        <tr>
          <th>Office</th>
          <td>#{@getEditable(@user, { key : 'title', escape : true },'Title', 'Undefined title')}</td>
        </tr>
        <tr>
          <th>Last name</th>
          <td>#{@getEditable(@user, { key : 'last', escape : true },'Last name', 'Undefined last name')}</td>
        </tr>
        <tr>
          <th>First name</th>
          <td>#{@getEditable(@user, { key : 'first', escape : true },'First name', 'Undefined first name')}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>#{@getEditable(@user, { key : 'email', escape : true },'Email', 'example: user@provider.com')}</td>
        </tr>
        <tr>
          <th>County</th>
          <td>#{@getEditable(@user, { key : 'county', escape : true },'County', 'Undefined county')}</td>
        </tr>
      </table>
    "

    @trigger "rendered"