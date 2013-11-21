class WorkflowSteps extends Backbone.ChildCollection
  
  model: WorkflowStep

  comparator: (a, b) ->
    a.get("order") - b.get("order")
