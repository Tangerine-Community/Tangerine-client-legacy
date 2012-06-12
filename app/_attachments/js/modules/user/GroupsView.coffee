class GroupsView extends Backbone.View

  events:
    'click .account' : 'gotoAccount'
    'click .goto'    : 'gotoGroup'

  gotoAccount: ->
    Tangerine.router.navigate "account", true
  
  gotoGroup: (event) ->
    group = $(event.target).attr("data-group")
    Tangerine.router.navigate "assessments/#{group}", true
    

  render: ->
    groups = Tangerine.user.get("groups")
    
    html = "
      <button class='account navigation'>Account</button>
      <h1>Groups</h1>
    "

    for group, i in groups
      console.log group
      html += "<button class='command goto' data-group='#{group}'>#{group}</button>"

    @$el.html html
    @trigger "rendered"
