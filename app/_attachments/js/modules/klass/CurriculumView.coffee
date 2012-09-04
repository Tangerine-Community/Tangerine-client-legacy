class CurriculumView extends Backbone.View

  events:
    "click .back" : "goBack"

  goBack: -> history.back()

  initialize: (options) ->
  
  render: ->
    @$el.html "
    <button class='navigation back'>#{t('back')}</button>
    <h1>#{@options.curriculum.get('name')}</h1>
    
    <div class='label_value'>
      <label>#{t('total subtests')}</label><br>
      <div class='info_box'>#{@options.subtests.length}</div>
    </div>
    
    <div class='label_value'>
      <label>#{t('total assessments')}</label><br>
      <div class='info_box'>#{@options.parts}</div>
    </div>

    <div class='label_value'>
      <label>#{t('download key')}</label><br>
      <div class='info_box'>#{@options.curriculum.id.substr(-5, 5)}</div>
    </div>

    </table>"
    @trigger "rendered"