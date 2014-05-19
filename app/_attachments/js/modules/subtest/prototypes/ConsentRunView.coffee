class ConsentRunView extends Backbone.View

  className : "ConsentRunView"

  events:
    'click #non_consent_confirm' : 'noConsent'
    'click #consent_yes' : 'clearMessages'
    'click #consent_no' : 'showNonConsent'

  i18n: ->
    @text =
      defaultConsent    : t("ConsentRunView.label.default_consent_prompt")
      confirmNonconsent : t("ConsentRunView.label.confirm_nonconsent")
      yes               : t("ConsentRunView.button.yes_continue")
      no                : t("ConsentRunView.button.no_stop")
      confirm           : t("ConsentRunView.message.confirm_nonconsent")
      select            : t("ConsentRunView.message.select")

  initialize: (options) ->

    @i18n()

    @confirmedNonConsent = false
    @model  = @options.model
    @parent = @options.parent
  
  render: ->

    previous = @parent.parent.result.getByHash(@model.get('hash'))

    if previous
      if previous.consent is "yes"
        yesChecked = "checked='checked'" 
      else
        noChecked = "checked='checked'"

    @$el.html "
    <form>
      <div class='question'>
        <label>#{@model.get('prompt') || @text.defaultConsent}</label>
        <div class='messages'></div>
        <div class='non_consent_form confirmation'>
          <div>#{@text.confirmNonconsent}</div>
          <button id='non_consent_confirm command'>#{@text.confirm}</button>
        </div>
        <div id='consent_options' class='buttonset'>

          <label for='consent_yes'>#{@text.yes}</label>
          <input id='consent_yes' type='radio' name='participant_consents' value='yes' #{yesChecked or ''}>
          <label for='consent_no'>#{@text.no}</label>
          <input id='consent_no' type='radio' name='participant_consents' value='no' #{noChecked or ''}>

        </div>
      </div>
    </form>
    "

    @trigger "rendered"
    @trigger "ready"
  
  isValid: ->
    if @confirmedNonConsent == false
      if @$el.find("input[name=participant_consents]:checked").val() == "yes"
        true
      else
        false
    else
      true

  showNonConsent: ->
    @$el.find(".non_consent_form").show(250)

  clearMessages: ->
    @$el.find(".non_consent_form").hide(250)
    @$el.find(".messages").html ""

  noConsent: ->
    @confirmedNonConsent = true
    @parent.abort()
    return false
  
  getSkipped: ->
    return "consent" : "skipped"
  
  showErrors: ->
    answer = @$el.find("input[name=participant_consents]:checked").val()
    if answer == "no"
      Utils.midAlert @text.confirm
      @showNonConsent
    else if answer == undefined
      $(".messages").html @text.select

  getResult: ->
    return "consent" : @$el.find("input[name=participant_consents]:checked").val()
