class WorkflowSelectView extends Backbone.View

  events:
    'change input[type=checkbox]' : 'onCheckboxChange'

  initialize: (options) ->
    @[key] = value for key, value of options

    @buttons = []
    unless @workflows?
      @workflows = new Workflows
      @workflows.fetch
        success: =>

          @isReady = true
          @render()

  render: ->

    return unless @isReady and @workflows?

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    htmlWorkflows = ""

    for workflow in @workflows.models
      checkedHtml = "checked='checked'" unless workflow.id in hiddenWorkflows
      htmlWorkflows += "
        <li id='#{workflow.id}' style='margin-bottom:25px;'>
          <input type='checkbox' #{checkedHtml} class='selectable' data-id='#{workflow.id}' id='#{workflow.id}-checkbox'><label for='#{workflow.id}-checkbox'>#{workflow.get('name')}</label>
        </li>
      "

    @$el.html htmlWorkflows

    return
    for workflow in @workflows.models
      button = new ButtonView
        options : [workflow.get('name')]
        mode    : "single"
      button.setElement("##{workflow.id}")
      @buttons.push button

  onClose: ->
    for button in @buttons
      button.close()

  onCheckboxChange: (event) ->
    $target = $(event.target)
    workflowId = $target.attr('data-id')

    return unless workflowId # don't respond to label clicks

    hiddenWorkflows = Tangerine.user.getPreferences("tutor-workflows", "hidden") || []

    isChecked = $target.prop('checked')

    if not isChecked 
      hiddenWorkflows.push workflowId
    else if isChecked
      hiddenWorkflows = hiddenWorkflows.filter (e) -> (e != workflowId)
    
    Tangerine.user.setPreferences "tutor-workflows", "hidden", hiddenWorkflows

