class AccountView extends Backbone.View

  events:
    'click .leave'       : 'leaveGroup'
    'click .join_cancel' : 'joinToggle'
    'click .join'        : 'joinToggle'
    'click .join_group'  : 'join'
    'click .back'        : 'goBack'
    'click #mode_buttons input' : 'changeMode'


  changeMode: (event) ->
    settings = new Settings "_id" : "TangerineSettings"
    settings.fetch
      success: (settingsModel) =>
        settingsModel.set
          "context" : $(event.target).val()
        settingsModel.save()

  goBack: ->
    window.history.back()

  joinToggle: ->
    @$el.find(".join, .join_confirmation").fadeToggle(0)
    @$el.find("#group_name").val ""

  join: ->
    group = @$el.find("#group_name").val().databaseSafetyDance()
    return if group.length == 0
    @user.joinGroup group, =>
      @joinToggle()

  leaveGroup: (event) ->
    group = $(event.target).parent().attr('data-group')
    @user.leaveGroup group

  initialize: ( options ) ->
    @user = options.user
    @user.on "group-join group-leave group-refresh", @renderGroups
  
  renderGroups: =>
    html = "<ul>"
    for group in (@user.get("groups") || [])
      html += "<li data-group='#{_.escape(group)}'>#{group} <button class='command leave'>Leave</button></li>"
    html += "</ul>"
    @$el.find("#group_wrapper").html html

  
  render: ->

    groupSection = "
      <section>
        <div class='label_value'>
          <label>Groups</label>
          <div id='group_wrapper'></div>
          <button class='command join'>Join or create a group</button>
          <div class='confirmation join_confirmation'>
            <div class='menu_box'>
              <input id='group_name' placeholder='Group name'>
              <div class='small_grey'>Please be specific.<br>
              Good examples: malawi_jun_2012, mike_test_group_2012, egra_group_aug-2012<br>
              Bad examples: group, test, mine</div><br>
              <button class='command join_group'>Join Group</button>
              <button class='command join_cancel'>Cancel</button>
            </div>
          </div>
        </section>
    " if Tangerine.settings.get("context") == "server"
    html = "
      <button class='back navigation'>Back</button>
      <h1>Account</h1>
      <a href='#settings' class='navigation'><button class='navigation'>Settings</button></a>
      <section>
        <div class='label_value'>
          <label>Name</label>
          <div>#{@user.name}</div>
        </div>
      </section>
      #{groupSection || ""}
      </div><br>
      <!--button class='command confirmation'>Report a bug</button>
      <div class='confirmation' id='bug'>
        <label for='where'>What broke?
        <input id='where' placeholder='where'>
        <label for='where'>What happened?
        <input id='where' placeholder='what'>
        <label for='where'>What should have happened?
        <input id='should' placeholder='should'>
        <button>Send</button>
      </div-->
      "
    @$el.html html
    @renderGroups()

    @trigger "rendered"
