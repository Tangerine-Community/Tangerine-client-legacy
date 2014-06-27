class ResultView extends Backbone.View

  className: "result_view"

  events:
    'click .result_save' : 'save'
    'click .another'     : 'another'

  initialize: ( options ) ->
    @model = options.model
    @assessment = options.assessment
    @saved = false

    @resultSumView = new ResultSumView
      model       : @model
      finishCheck : false

  another: ->
    window.location.reload()
    #Tangerine.router.navigate "restart/#{@assessment.id}", false

  save: =>
    @model.add
      name : "Assessment complete"
      prototype: "complete"
      data :
        "comment" : @$el.find('#additional_comments').val() || ""
        "end_time" : (new Date()).getTime()
      subtestId : "result"
      sum :
        correct : 1
        incorrect : 0
        missing : 0
        total : 1
    ,
      success: =>
        Tangerine.activity = ""
        Utils.midAlert "Result saved"
        @$el.find('.save_status').html "saved"
        @$el.find('.save_status').removeClass('not_saved')
        @$el.find('.question').fadeOut(250)

        $button = @$el.find("button.result_save")

        $button.removeClass('result_save').addClass('another').html "Perform another assessment"
      error: =>
        Utils.midAlert "Save error"
        @$el.find('.save_status').html "Results may not have saved"

  render: ->
    @$el.html "
      <h2>Assessment complete</h2>
      <button class='result_save command'>Save result</button>
      <div class='info_box save_status not_saved'>Not saved yet</div>
      <br>

      <div class='question'>
        <div class='prompt'>Additional comments (optional)</div>
        <textarea id='additional_comments' class='full_width'></textarea>
      </div>

      <div class='label_value'>
        <h2>Subtests completed</h2>
        <div id='result_sum' class='info_box'></div>
      </div>
    "

    @resultSumView.setElement(@$el.find("#result_sum"))
    @resultSumView.render()

    @trigger "rendered"
    
  onClose: ->
    @resultSumView.close()
