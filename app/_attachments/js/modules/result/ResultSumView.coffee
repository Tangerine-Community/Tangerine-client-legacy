class ResultSumView extends Backbone.View

  className : "info_box"

  events:
    'click .details' : 'toggleDetails'
    'click .resume' : 'resume'


  resume: ->
    Tangerine.router.navigate "resume/#{@result.get('assessmentId')}/#{@result.id}", true

  toggleDetails: ->
    @$el.find('.detail_box').toggle(250)

  initialize: ( options ) ->
    @result = options.model
    @finishCheck = options.finishCheck
    @finished = if _.last(@result.attributes.subtestData)?.data.end_time? then true else false
    
    @studentId = ""
    for subtest in @result.attributes.subtestData
      prototype = subtest.prototype
      if prototype == "id"
        @studentId = subtest.data.participant_id
        break


  render: ->
    if @finished || !@finishCheck
      savedEnd = _.last(@result.attributes.subtestData)?.data.end_time
      timestamp = @result.get('timestamp')
      if timestamp?
        endTime = new Date(timestamp) 
      else if savedEnd?
        endTime = new Date(savedEnd)
      else
        endTime = new Date()

      html = "
        <div>
          #{@studentId}
          #{moment(endTime).format( 'YYYY-MMM-DD HH:mm' )}
          (#{moment(endTime).fromNow()})
          <button class='details command'>details</button>
        </div>"
    else
      startTime = new Date(if @result.has('start_time') then @result.get("start_time") else @result.get("starttime"))
      html = "<div>Not finished ( #{moment(startTime).fromNow()} ) <button class='command resume'>Resume</button></div>"
    
    html += "<div class='confirmation detail_box'>"
    for datum, i in @result.get("subtestData")
      html += "<div><span id='#{@cid}_#{i}'></span>#{datum.name} - items #{datum.sum.total}</div>"
    html += "
      </div>
    "
    
    @$el.html html
    
    @trigger "rendered"

  afterRender: =>
    for datum, i in @result.get("subtestData")
      spark_id = "##{@cid}_#{i}"
      @$el.find(spark_id).sparkline [datum.sum.correct,datum.sum.incorrect,datum.sum.missing],
        type   : 'pie'
        width  : '30'
        height : '30'
        sliceColors: ["#6f6","#c66","#ccc"]
    null
