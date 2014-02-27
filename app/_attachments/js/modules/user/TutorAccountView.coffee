class TutorAccountView extends Backbone.View

  className: "TutorAccountView"

  events: 
    "click .tabs li" : "switchTabs"

  switchTabs: (event) ->
    $target = $(event.target)
    @$el.find(".tabs li").removeClass("selected")
    $target.addClass("selected")
    id = $target.attr('data-id')
    @$el.find(".tab-panel").hide()
    @$el.find("##{id}").show()

  initialize: ->


  render: ->

    if Tangerine.user.isAdmin()
      manageTab = "<li data-id='manage-tangerine'>Manage Tangerine</li>"
      manageSection = "<section class='tab-panel' id='manage-tangerine' style='display:none'></section>"

    @$el.html "
      <div>
        <ul class='tabs'>
          <li data-id='edit-user' class='selected'>Edit User</li>
          <li data-id='sync-instruments'>Sync Instruments</li>
          <li data-id='select-workflows'>Select Workflows</li>
          #{manageTab||''}

        </ul>
        <section class='tab-panel' id='edit-user'></section>
        <section class='tab-panel' id='sync-instruments' style='display:none'></section>
        <section class='tab-panel' id='select-workflows' style='display:none'></section>
        #{manageSection||''}
      </div>
    "

    editUserView = new UserEditView
    editUserView.setElement @$el.find("#edit-user")
    editUserView.render()

    instrumentSyncView = new InstrumentSyncView
    instrumentSyncView.setElement @$el.find("#sync-instruments")
    instrumentSyncView.render()

    workflowSelectView = new WorkflowSelectView
    workflowSelectView.setElement @$el.find("#select-workflows")
    workflowSelectView.render()

    if Tangerine.user.isAdmin()
      accountView = new AccountView
      accountView.setElement @$el.find("#manage-tangerine")
      accountView.render()

    @trigger "rendered"