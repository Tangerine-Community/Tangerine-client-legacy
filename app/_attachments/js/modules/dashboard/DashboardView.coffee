class DashboardView extends Backbone.View

  initialize: ->
    @assessments = new AssessmentList 
      isAdmin : Tangerine.user.isAdmin
      submenu : false
        
    @render()

  render: ->
    @$el.html "
      <h1>dashboard</h1>
      <div id='dash_assessments'></div>
      <div id='dash_user'></div>
      <div id='dash_group'></div>
      "

    @trigger "rendered" 