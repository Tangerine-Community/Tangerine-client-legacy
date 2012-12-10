# Displays a group header and a list of assessments
# events
# re-renders on @assessments "add destroy"
#
class AssessmentsView extends Backbone.View

  tagName : "div"

  events : 
    "click .toggle_archived" : "toggleArchived"

  toggleArchived: (event) ->

    if @archivedIsVisible
      @archivedIsVisible = false
      $container = @$el.find(".archived_list").addClass "confirmation"
      @$el.find(".toggle_archived").html "Show"
    else
      @archivedIsVisible = true
      $container = @$el.find(".archived_list").removeClass "confirmation"
      @$el.find(".toggle_archived").html "Hide"

    $container.fadeToggle 150

  initialize: (options) ->

    options.assessments.on "add destroy update", @render

    @parent      = options.parent
    @group       = options.group
    @assessments = options.assessments
    @homeGroup   = options.homeGroup

    @isPublic       = @group == "public" 
    @ignoringGroups = @group == false
    @groupName      = if @isPublic then "Public" else @group

    @subviews          = [] # used to keep track of views to close
    @archivedIsVisible = false # toggled
    

  render: (event) =>

    @closeViews()

    # give us an array. show all if group == false
    if @group != false
      assessments = @assessments.where "group" : @group
    else
      assessments = @assessments.models

    # create archived and active arrays of <li>
    activeViews   = []
    archivedViews = []
    for assessment in assessments

      newView = new AssessmentListElementView
        "model"     : assessment
        "homeGroup" : @homeGroup
        "group"     : @group
        "showAll"   : @showAll

      if assessment.isArchived() && Tangerine.settings.context == "server"
        archivedViews.push newView 
      else
        activeViews.push newView
    
    @subviews = archivedViews.concat activeViews

    # escape if no assessments in non-public list
    if @subviews.length == 0 && not @isPublic
      @$el.html "<p class='grey'>No assessments yet. Click <b>new</b> to get started.</p>"
      @trigger "rendered"
      return


    # templating and components

    header = "
      <h2 class='header_#{@cid}'>#{@groupName} (#{activeViews.length})</h2>
    "

    archivedContainer = "
      <div class='archived_container'>
        <h2>Archived (#{archivedViews.length}) <button class='command toggle_archived'>Show</button></h2>
        <ul class='archived_list confirmation'></ul>
      </div>
    "


    showArchived  = archivedViews.length != 0 && !@isPublic
    showGroupName = not @ignoringGroups
    @$el.html "
      #{ if showGroupName then header else "" }
      <ul class='active_list assessment_list'></ul>
      #{ if showArchived then archivedContainer else "" }
      
    "


    # fill containers
    $ul = @$el.find(".active_list")
    for view in activeViews
      view.render()
      $ul.append view.el
    if showArchived
      $ul = @$el.find(".archived_list")
      for view in archivedViews
        view.render()
        $ul.append view.el

    # all done
    @trigger "rendered"

  closeViews: ->
    for view in @subviews
      view.close()
    @subviews = []

  onClose: ->
    @closeViews()