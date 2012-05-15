class ResultSumView extends Backbone.View

  className : "info_box"

  events:
    'click .details' : 'toggleDetails'

  toggleDetails: ->
    @$el.find('.detail_box').toggle(250)

  initialize: ( options ) ->
    @model = options.model
    console.log "my model"
    console.log @model
  render: ->
    console.log @
    html = "<div>
        #{moment(new Date(@model.get('timestamp'))).format( 'YYYY-MMM-DD HH:mm')}
        (#{moment(new Date(@model.get('timestamp'))).fromNow()})
        <button class='details'>details</button>
      </div>
      <div class='confirmation detail_box'>"
    for datum, i in @model.get("subtestData")
      console.log datum
      html += "<div><span id='#{@cid}_@{datum.name}_#{i}'></span>#{datum.name} - items #{datum.sum.total}</div>"
    html += "
      </div>
    "
    
    @$el.html html
    for datum, i in @model.get("subtestData")
      spark_id = "#{@cid}_@{datum.name}_#{i}"
      $("##{@cid}_#{}").sparkline [datum.sum.correct,datum.sum.incorrect,datum.sum.missing],
        type   : 'pie'
        width  : '50'
        height : '50'
        sliceColors: ["#6f6","#c66","#ccc"]
    
    @trigger "rendered"
