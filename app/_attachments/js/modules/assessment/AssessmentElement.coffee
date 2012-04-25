class AssessmentElementView extends Backbone.View

  tagName : "li"

  events:
    'click .link_icon' : 'navigate'
    'click .assessment_menu_toggle' : 'assessmentMenuToggle'

  initialize:(options) ->
    @isAdmin = options.isAdmin
    @model = options.model

  navigate: (event) ->
    whereTo = $(event.target).attr 'data-href'
    Tangerine.router.navigate whereTo, true

  assessmentMenuToggle: ->
    toggleChar = @$el.find '.assessment_menu_toggle'
    if toggleChar.html() == '&gt; ' then toggleChar.html('&nabla; ') else toggleChar.html("&gt; ") 
    @$el.find('.assessment_menu').toggle(250)

  render: ->
    deleteButton  = "<img data-href='delete' class='link_icon' src='images/icon_delete.png'>"
    editButton    = "<img data-href='edit/' class='link_icon' src='images/icon_edit.png'>"
    resultsButton = "<img data-href='results' class='link_icon' src='images/icon_result.png'>"
    runButton     = "<img data-href='run' class='link_icon' src='images/icon_run.png'>"
    name          = "<span class='name'>#{@model.get('name')}</span>"
    resultCount   = "<span class='resultCount'>#{@model.get('resultCount') || '0'} results</span>"
    subtestCount  = @model.get('urlPathsForPages').length

    if @isAdmin
      @$el.html "
        <div>
          <span class='assessment_menu_toggle clickable'>&gt; </span>
            #{name} 
            #{resultCount}
        </div>
        <div class='assessment_menu'>
          #{runButton}
          #{resultsButton}
          #{editButton}
          #{deleteButton}
        </div>"
    else
      @$el.html "<div>#{runButton}#{name} #{resultsButton}#{resultCount}</div>"

