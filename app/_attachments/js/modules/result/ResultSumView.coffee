class ResultSumView extends Backbone.View

  className : "info_box"

  events:
    'click .details' : 'toggleDetails'

  toggleDetails: ->
    @$el.find('.detail_box').toggle(250)

  initialize: ( options ) ->
    @result = options.model
    @finishCheck = options.finishCheck
    @finished = if _.last(@result.attributes.subtestData)?.data.end_time? then true else false
    
    @studentId = @result.getVariable "participant_id"

  render: ->
    html = "<div class='detail_box'>"
    html += "<div>Not finished<a href='#resume/#{@result.get('assessmentId')}/#{@result.id}'><button class='command'>Resume</button></a></div>" unless @finished || !@finishCheck
    for datum, i in @result.getArray("subtestData")
      html += "<div>#{datum.name} - items #{datum.sum.total}</div>"
    html += "
      </div>
    "
    
    @$el.html html
    
    @trigger "rendered"

