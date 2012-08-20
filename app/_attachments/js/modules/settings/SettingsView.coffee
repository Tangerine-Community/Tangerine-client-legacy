class SettingsView extends Backbone.View

  events: 
    "click .save" : "save"

  initialize: (options) ->
    @settings = options.settings

  updateModel: ->
    @settings.set
      context          : @$el.find('#context').val()
      generalThreshold : parseFloat(@$el.find('#generalThreshold').val())

  save: ->
    @updateModel()
    if @settings.save()
      Utils.midAlert "Settings saved"
    else
      Utils.midAlert "Error. Settings weren't saved"

  render: ->
    context = @settings.escape "context"
    generalThreshold = @settings.escape "generalThreshold"

    @$el.html "<h1>#{t("settings")}</h1>
    <p>Please be careful with the following settings.</p>
    <div class='menu_box'>
      <div class='label_value'>
        <label for='context'>Context</label>
        <input id='context' type='text' value='#{context}'>
      </div>
      <div class='label_value'>
        <label for='context'>General Threshold</label>
        <input id='generalThreshold' type='number' value='#{generalThreshold}'>
      </div>
    </div>
    <button class='command save'>Save</button>
    "
    
    @trigger "rendered"