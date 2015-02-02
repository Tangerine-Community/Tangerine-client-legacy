class TutorAccountView extends Backbone.View

  className: "TutorAccountView"

  events: 
    "click .tab"  : 'handleTabClick'


  initialize: (options) ->
    @[key] = value for key, value of options


  handleTabClick: ( event ) =>
    @$el.find('.tab').removeClass('selected')
    @$el.find('.tab-panel').hide()
    
    #determine which tab was clicked and begin navigation
    $target = $(event.target)
    id = $target.attr('data-id')
    Tangerine.router.navigate "tutor-account/"+id , false
    @displayTab(id)


  displayTab: ( selectedTab = 'edit-user') ->
    @$el.find('#tab-'+selectedTab).addClass('selected')
    @$el.find('#panel-'+selectedTab).show()


  render: ->

    if Tangerine.user.isAdmin()
      manageTab = "<div id='tab-manage-tangerine' class='tab mode first' data-id='manage-tangerine'>Tangerine</div>"
      manageSection = "<section id='panel-manage-tangerine' class='tab-panel' style='display:none;'><div id='manage-tangerine'></div></section>"
      manageTabCSS = " "

    @$el.html "
      <div class='tab_container'>
        #{manageTab||''}
        <div id='tab-edit-user' class='tab mode #{manageTabCSS||'first'}' data-id='edit-user'>User</div>
        <div id='tab-sync-instruments' class='tab mode' data-id='sync-instruments'>Instruments</div>
        <div id='tab-select-workflows' class='tab mode last' data-id='select-workflows'>Workflows</div>
      </div>
      #{manageSection||''}
      <section id='panel-edit-user' class='tab-panel' style='display:none;'>
        <div id='edit-user'></div>
      </section>
      <section id='panel-sync-instruments' class='tab-panel' style='display:none;'>
        <div id='sync-instruments'></div>
      </section>
      <section id='panel-select-workflows' class='tab-panel' style='display:none;'>
        <div id='select-workflows'></div>
      </section>
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

    #init the tabs by showing the selected tabs
    @displayTab(@selectedTab)

    @trigger "rendered"