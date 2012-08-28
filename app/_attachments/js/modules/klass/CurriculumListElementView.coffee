class CurriculumListElementView extends Backbone.View

  tagName: "li"

  events:
    'click div' : 'gotoDetails'

  gotoDetails: ->
    Tangerine.router.navigate "curriculum/#{@curriculum.id}",true

  initialize: (options) ->
    @curriculum = options.curriculum
    @subtests = options.subtests
    window.te = @$el


  render: ->
    name = @curriculum.escape('name')
    @$el.html "<div><span class='icon_ryte'> </span> #{name}</div>"
    @trigger "rendered"