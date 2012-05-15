class AssessmentListElementView extends Backbone.View

  tagName : "li"

  events:
    'click .link_icon'                 : 'navigate'
    'click .assessment_menu_toggle'    : 'assessmentMenuToggle'
    'click .assessment_delete'         : 'assessmentDeleteToggle'
    'click .assessment_delete_cancel'  : 'assessmentDeleteToggle'
    'click .assessment_delete_confirm' : 'assessmentDelete'
    'click .copy'                      : 'copyToGroup'

  initialize:(options) ->
    @parent = options.parent
    @isAdmin = Tangerine.user.isAdmin
    @isPublic = options.isPublic
    @model = options.model

  navigate: (event) ->
    whereTo = @$el.find(event.target).attr 'data-href'
    Tangerine.router.navigate whereTo, true

  copyToGroup: ->
    originalId = @model.id
    groupModel = @model.clone()

    groupModel.set "group", Tangerine.user.groups[0]
    groupModel.set "_id", Utils.guid()

    groupModel.save()

    @render()
    questions = new Questions
    questions.fetch
      success: ( questions ) =>
        filteredQuestions = questions.where { "assessmentId" : originalId }
        
        subtests = new Subtests
        subtests.fetch
          success: ( subtests ) =>
          
            filteredSubtests = subtests.where { "assessmentId" : originalId }
            subtestIdMap = {}
            newSubtests = []
            # link new subtests to new assessment
            for model, i in filteredSubtests
              newSubtest = model.clone()
              newSubtest.set "assessmentId", groupModel.id
              newSubtestId = Utils.guid()
              subtestIdMap[newSubtest.get("_id")] = newSubtestId
              newSubtest.set "_id", newSubtestId
              newSubtests.push newSubtest

            # update the links to other subtests
            for model, i in newSubtests
              gridId = model.get( "gridLinkId" )
              if ( gridId || "" ) != ""
                model.set "gridLinkId", subtestIdMap[gridId]
              model.save()

            # link questions to new subtest
            for question in filteredQuestions
              newQuestion = question.clone()
              oldId = newQuestion.get "subtestId"
              newQuestion.set "assessmentId", groupModel.id
              newQuestion.set "_id", Utils.guid() 
              newQuestion.set "subtestId", subtestIdMap[oldId]
              newQuestion.save()

            @parent.refresh()

        
  assessmentMenuToggle: ->
    @$el.find('.assessment_menu_toggle').toggleClass 'icon_down'
    @$el.find('.assessment_menu').fadeToggle(250)

  assessmentDeleteToggle: -> @$el.find(".assessment_delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  assessmentDelete: ->
    # remove from collection
    @$el.fadeOut 250, => 
      @parent.collection.remove @model

      # remove children
      assessmentId = @model.id
      subtests = new Subtests
      subtests.fetch
        success: (collection) =>
          for model in collection.where { "assessmentId" : assessmentId }
            model.destroy()
      questions = new Questions
      questions.fetch
        success: (collection) =>
          for model in collection.where { "assessmentId" : assessmentId }
            model.destroy()
    
      # remove model
      @model.destroy()
      false

          
  render: ->
    archiveClass  = if (@model.get('archived') == true or @model.get('archived') == 'true') then " archived_assessment" else ""
    copyButton    = "<button class='copy'>Copy to group</button>"
    toggleButton  = "<span class='assessment_menu_toggle icon_ryte'> </span>"
    deleteButton  = "<img class='assessment_delete' src='images/icon_delete.png'> <span class='assessment_delete_confirm'>Confirm <button class='assessment_delete_yes'>Delete</button> <button class='assessment_delete_cancel'>Cancel</button></span>"
    editButton    = "<img data-href='edit/#{@model.get('name')}' class='link_icon' src='images/icon_edit.png'>"
    resultsButton = "<img data-href='results/#{@model.get('name')}' class='link_icon' src='images/icon_result.png'>"
    runButton     = "<img data-href='run/#{@model.get('name')}' class='link_icon' src='images/icon_run.png'>"
    name          = "<span class='name clickable '>#{@model.get('name')}</span>"
    adminName     = "<span class='admin_name clickable #{archiveClass}'>#{@model.get('name')}</span>"

    resultCount   = "<span class='resultCount'>#{@model.get('resultCount') || '0'} results</span>"

    if @isAdmin
      html = "
        <div>
          #{toggleButton}
          #{adminName} 
        </div>"
      if @isPublic
        html += "
        <div class='assessment_menu'>
          #{copyButton}
        </div>"
      else
        html += "
        <div class='assessment_menu'>
          #{runButton}
          #{resultsButton}
          #{editButton}
          #{deleteButton}
        </div>"
      @$el.html html
    else
      @$el.html "<div>#{runButton}#{name} #{resultsButton}</div>"
