class TutorMenuView extends Backbone.View

  className : "TutorMenuView"

  events:
    "click .tab"	: 'handleTabClick'

  i18n: ->
    @text =
      "title"      : t('TutorMenuView.title')
      "workflows"   : t('TutorMenuView.tabs.workflows')
      "sync"       : t('TutorMenuView.tabs.sync')
      "schools"    : t('TutorMenuView.tabs.schools')

  initialize: (options) =>
    @[key] = value for key, value of options
    @i18n()


  handleTabClick: ( event ) =>
    @$el.find('.tab').removeClass('selected')
    @$el.find('.tab-panel').hide()
    
    #determine which tab was clicked and begin navigation
    $target = $(event.target)
    id = $target.attr('data-id')
    Tangerine.router.navigate "tutor-menu/"+id , false
    @displayTab(id)


  displayTab: ( selectedTab = 'workflows') ->
    @$el.find('#tab-'+selectedTab).addClass('selected')
    @$el.find('#panel-'+selectedTab).show()


  render: =>
    @$el.html "
      <h1>#{@text.title}</h1>
      <div class='tab_container'>
        <div id='tab-workflows' class='tab mode first' data-id='workflows'>#{@text.workflows}</div>
        <div id='tab-sync' class='tab mode' data-id='sync'>#{@text.sync}</div>
        <div id='tab-schools' class='tab mode last' data-id='schools'>#{@text.schools}</div>
      </div>
      <section id='panel-workflows' class='tab-panel' style='display:none;'>
        <div id='workflows'></div>
      </section>
      <section id='panel-sync' class='tab-panel' style='display:none;'>
        <div id='sync-manager'></div>
        <div style='margin-bottom:12px; padding-bottom: 12px; border-bottom: 1px solid #eee;'></div>
        <div id='bandwidth-test'></div>
      </section>
      <section id='panel-schools' class='tab-panel' style='display:none;'>
        <div id='school-list'></div>
        <div style='margin-bottom:12px; padding-bottom: 12px; border-bottom: 1px solid #eee;'></div>
        <div id='valid-observations'></div>
      </section>
    "
    unless @WorkflowMenuView?
      instRef = @
      (workflows = new Workflows).fetch
        success: ->
          if workflows.length > 0
            feedbacks = new Feedbacks feedbacks
            feedbacks.fetch
              success: ->
                instRef.WorkflowMenuView = new WorkflowMenuView
                  workflows : workflows
                  feedbacks : feedbacks
                instRef.WorkflowMenuView.setElement(instRef.$el.find("#panel-workflows #workflows"))
                instRef.WorkflowMenuView.render("loading")
                return 
            return

    unless @syncManagerView?
      @syncManagerView = new SyncManagerView
      @syncManagerView.setElement(@$el.find("#panel-sync > #sync-manager"))
      @listenTo @syncManagerView, "complete-sync", =>
        @workflows.fetch
          error: $.noop
          success: =>
            console.log(@workflows)
            @WorkflowMenuView.updateWorkflows()
      @syncManagerView.render()

    unless @bandwidthCheckView?
      @bandwidthCheckView = new BandwidthCheckView
      @bandwidthCheckView.setElement(@$el.find("#panel-sync > #bandwidth-test"))
      @bandwidthCheckView.render()

    unless @validObservationView?
      @validObservationView = new ValidObservationView
      @validObservationView.setElement(@$el.find("#panel-schools > #valid-observations"))
      @validObservationView.render("loading")

    unless @schoolListView?
      @schoolListView = new SchoolListView
        validObservationView : @validObservationView
      @schoolListView.setElement(@$el.find("#panel-schools > #school-list"))
      @schoolListView.render("loading")

    
    #init the tabs by showing the selected tabs
    @displayTab(@selectedTab)

    @trigger "rendered"