class CurriculaView extends Backbone.View

  events :
    'click .import' : 'gotoImport'
    'click .back' : 'goBack'

  goBack: -> history.back()

  gotoImport: ->
    Tangerine.router.navigate "curriculum/import", true

  initialize: (options )->
    @subView = new CurriculaListView
      curricula : options.curricula
    @subView.on "render", @render
    @subView.render()



  render: ->
    @$el.html "
    <button class='back navigation'>#{t('back')}</button>
    <h2>#{t('loaded curricula')}</h2>
    <button class='command import'>#{t('import')}</button>
    <br>
    <div id='klass_list'></div>
    "
    @$el.find('#klass_list').append @subView.el
    
    @trigger "rendered"