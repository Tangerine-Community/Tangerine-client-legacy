class ConsentPrintView extends Backbone.View

  initialize: (options) ->
    @confirmedNonConsent = false
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    @$el.html "
    <form>
      <div class='question'>
        <label>#{@model.get('prompt') || 'Does the child consent?'}</label>
        <div class='messages'></div>
        <div class='non_consent_form confirmation'>
          <div>Click to confirm consent not obtained.</div>
          <button id='non_consent_confirm'>Confirm</button>
        </div>
        <div id='consent_options' class='buttonset'>
          <label for='consent_yes'>Yes, continue</label>
          <input id='consent_yes' type='radio' name='participant_consents' value='yes'>
          <label for='consent_no'>No, stop</label>
          <input id='consent_no' type='radio' name='participant_consents' value='no'>
        </div>
      </div>
    </form>
    "

    @trigger "rendered"
