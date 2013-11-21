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
    htmlWorkflows = ""

    for workflow in @workflows.models
      htmlWorkflows += "
        <li id='#{workflow.id}'>
          #{workflow.get('name')}
          <a href='#workflow/run/#{workflow.id}'>run</a>
          <a href='#workflow/edit/#{workflow.id}'>edit</a>
          <span class='workflow-delete link'>delete</span>
        </li>
        "

    @$el.html "
      <h1>Workflows</h1>
      <button class='workflow-new'>New</button>
      <ul class='workflow-menu'>#{htmlWorkflows}</ul>
    "