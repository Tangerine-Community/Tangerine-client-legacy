class SettingsView extends Backbone.View

  events: 
    "click .save" : "save"

  initialize: (options) ->
    @settings = options.settings

  updateModel: ->
    @settings.set
      context          : @$el.find('#context').val()
      generalThreshold : parseFloat(@$el.find('#generalThreshold').val())
      language         : @$el.find('#language').val()

  save: ->
    @updateModel()
    if @settings.save()
      Utils.midAlert "Settings saved"
    else
      Utils.midAlert "Error. Settings weren't saved"

  render: ->
    context = @settings.escape "context"
    generalThreshold = @settings.escape "generalThreshold"
    language = @settings.escape "language"

    @$el.html "<h1>#{t("settings")}</h1>
    <p>Please be careful with the following settings.</p>
    <div class='menu_box'>
      <div class='label_value'>
        <label for='context'>Context</label><br>
        <input id='context' type='text' value='#{context}'>
      </div>
      <div class='label_value'>
        <label for='context'>General Threshold</label><br>
        <input id='generalThreshold' type='number' value='#{generalThreshold}'>
      </div>
      <div class='label_value'>
        <label for='context'>Language</label><br>
        <input id='language' type='number' value='#{language}'>
      </div>
    </div><br>
    
    <button class='command save'>Save</button>
    "
    
    @trigger "rendered"