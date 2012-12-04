class CurriculaView extends Backbone.View

  events :
    'click .import' : 'gotoImport'
    'click .back'   : 'goBack'

  goBack: -> history.back()

  gotoImport: ->
    Tangerine.router.navigate "curriculumImport", true

  initialize: (options )->
    @subView = new CurriculaListView
      curricula : options.curricula
    options.curricula.on "all", => @subView.render()

  render: ->
    @$el.html "
    <button class='back navigation'>#{t('back')}</button><br>
    <button class='command import'>#{t('import')}</button>
    <br>
    <div id='klass_list'></div>
    "

    @subView.setElement @$el.find('#klass_list')

    @trigger "rendered"

  onClose: ->
    @subView?.close()