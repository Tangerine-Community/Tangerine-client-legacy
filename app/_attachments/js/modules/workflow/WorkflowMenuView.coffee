class WorkflowMenuView extends Backbone.View

  events:
    "click .workflow-new"    : 'new'
    "click .workflow-delete" : "delete"
    "click .workflow-run"    : "run"
    "click .workflow-edit"   : "edit"

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


  renderMobile: ->

    htmlWorkflows = ""

    for workflow in @workflows.models
      # HACK by Mike - TODO use roles to show/hide workflows
      if workflow.get("name") isnt "PRIMR" or (workflow.get("name") is "PRIMR" and Tangerine.user.get("name").match(/primr/))
        if feedback? and feedback.get("children")?.length > 0
          feedbackHtml = "<button class='command'><a href='#feedback/#{workflow.id}'>Feedback</a></button>"
        else
          feedbackHtml = ""

        htmlWorkflows += "
          <li id='#{workflow.id}' style='margin-bottom:25px;'>
            <button class='navigation'><a href='#workflow/run/#{workflow.id}'>#{workflow.get('name')}</a></button><br>
            #{feedbackHtml}
          </li>
          "

    @$el.html "
      <h1>Tutor menu</h1>
      <ul class='workflow-menu'>#{htmlWorkflows}</ul>
      <div id='sync-manager' class='SyncManagerView'></div>

    "

    @syncManagerView = new SyncManagerView
    @syncManagerView.setElement(@$el.find("#sync-manager"))
    @syncManagerView.render()

    @trigger "rendered"
