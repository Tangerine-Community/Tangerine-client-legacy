class ResultSumView extends Backbone.View

  className : "info_box"

  events:
    'click .details' : 'toggleDetails'

  toggleDetails: ->
    @$el.find('.detail_box').toggle(250)

  initialize: ( options ) ->
    @model = options.model

  render: ->
    html = "<div>
        #{moment(new Date(@model.get('timestamp'))).format( 'YYYY-MMM-DD HH:mm')}
        (#{moment(new Date(@model.get('timestamp'))).fromNow()})
        <button class='details command'>details</button>
      </div>
      <div class='confirmation detail_box'>"
    for datum, i in @model.get("subtestData")
      html += "<div><span id='#{@cid}_#{i}'></span>#{datum.name} - items #{datum.sum.total}</div>"
    html += "
      </div>
    "
    
    @$el.html html
    
    @trigger "rendered"

  afterRender: =>
    for datum, i in @model.get("subtestData")
      spark_id = "##{@cid}_#{i}"
      @$el.find(spark_id).sparkline [datum.sum.correct,datum.sum.incorrect,datum.sum.missing],
        type   : 'pie'
        width  : '30'
        height : '30'
        sliceColors: ["#6f6","#c66","#ccc"]
    null
