class CurriculumView extends Backbone.View

  events:
    "click .back" : "goBack"

  goBack: -> history.back()

  initialize: (options) ->
  
  render: ->
    @$el.html "
    <button class='navigation back'>#{t('back')}</button>
    <h1>#{@options.curriculum.get('name')}</h1>
    
    <table>
      <tr><td>#{t('total subtests')}</td><td>#{@options.subtests.length}</td></tr>
      <tr><td>#{t('total parts')}</td><td>#{@options.parts}</td></tr>
    </table>"
    @trigger "rendered"