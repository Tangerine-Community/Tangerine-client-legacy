class WorkflowMenuView extends Backbone.View

  className : "WorkflowMenuView"

  events:
    "click .workflow-new"    : 'new'
    "click .workflow-delete" : "delete"
    "click .workflow-run"    : "run"
    "click .workflow-edit"   : "edit"
    'click .remove-resume'   : 'removeResume'

  removeResume: (event) ->

    $target = $(event.target)
    workflowId = $target.attr("data-workflowId")
    tripId     = $target.attr("data-tripId")
    return unless confirm "Are you sure you want to remove the option to resume this workflow?"

    incomplete = Tangerine.user.getPreferences "tutor-workflows", "incomplete"

    incomplete[workflowId] = _(incomplete[workflowId]).without tripId

    Tangerine.user.setPreferences "tutor-workflows", "incomplete", incomplete, =>
      @updateWorkflows()

  new: ->
    guid = Utils.guid()
    Tangerine.router.navigate "workflow/edit/#{guid}", false
    workflow = new Workflow "_id" : guid
    view = new WorkflowEditView workflow : workflow
    vm.show view

  delete: (event) ->
    $target = $(event.target)
    workflowId = $target.parent("li").attr('id')
    name = @workflows.get(workflowId).get('name')
    if confirm "Are you sure you want to delete workflow #{name}?"
      @workflows.get(workflowId).destroy
        success: =>
          @render()

  initialize: (options) ->
    @[key] = value for key, value of options


  render: ->

    if Tangerine.settings.get("context") isnt "server"
      return @renderMobile()

    htmlWorkflows = ""

    for workflow in @workflows.models
      
      csvUrl = "/_csv/workflow/#{Tangerine.db_name}/#{workflow.id}"
      
      feedback = @feedbacks.get(workflow.id+"-feedback")

      if feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<a href='#feedback/#{workflow.id}'>feedback</a>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:15px;'>
          #{workflow.get('name')}
          <br>
          <a href='#workflow/run/#{workflow.id}'>run</a>
          #{feedbackHtml}
          <a href='#workflow/edit/#{workflow.id}'>edit</a>
          <a href='#{csvUrl}'>csv</a>
          <span class='workflow-delete link'>delete</span>
        </li>
        "

    @$el.html "
      <h1>Workflows</h1>
      <button class='workflow-new command'>New</button>
      <ul class='workflow-menu'>#{htmlWorkflows}</ul>
    "


  renderMobile: =>

    @$el.html "
      <h1>Tutor menu</h1>
      <ul class='workflow-menu'></ul>
      <div id='sync-manager' class='SyncManagerView'></div>
    "

    @updateWorkflows()

    unless @syncManagerView?
      @syncManagerView = new SyncManagerView
      @syncManagerView.setElement(@$el.find("#sync-manager"))
      @listenTo @syncManagerView, "complete-sync", =>
        @workflows.fetch
          success: =>
            @updateWorkflows()
      @syncManagerView.render()

    @trigger "rendered"

  updateWorkflows: ->

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    htmlWorkflows = ""

    for workflow in @workflows.models
      continue if workflow.id in hiddenWorkflows

      feedback = @feedbacks.get(workflow.id+"-feedback")

      if feedback? and feedback.get("children")?.length > 0
        feedbackHtml = "<button class='command'><a href='#feedback/#{workflow.id}'>Feedback</a></button>"
      else
        feedbackHtml = ""

      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:25px;'>
          <section>
            <a href='#workflow/run/#{workflow.id}' class='workflow-button-link'>#{workflow.get('name')}</a>
            #{feedbackHtml}
            <div id='resume-workflow-#{workflow.id}'></div>
          </section>
        </li>
        "
    @$el.find(".workflow-menu").html htmlWorkflows

    @renderResumeInfo()

  renderResumeInfo: ->
      incompleteWorkflows = Tangerine.user.getPreferences('tutor-workflows', 'incomplete') || {}

      for workflowId, tripIds of incompleteWorkflows
        if tripIds.length isnt 0
          for tripId in tripIds
            Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
              key: tripId
              include_docs : true
              success: (data) =>
                first = data.rows[0].doc
                timeAgo = moment(first.updated).fromNow()
                @$el.find("#resume-workflow-#{first.workflowId}").append "
                  <a href='#workflow/resume/#{first.workflowId}/#{first.tripId}'><button class='command'>Resume</button></a> #{timeAgo} <button class='command remove-resume' data-workflowId='#{first.workflowId}' data-tripId='#{first.tripId}'>X</button><br>
                "

