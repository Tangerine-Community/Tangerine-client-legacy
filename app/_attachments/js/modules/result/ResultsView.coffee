class ResultsView extends Backbone.View

  events:
    'click .cloud'   : 'cloud'
    'click .csv'     : 'csv'
    'click .tablets' : 'tablets'
    'click .detect'  : 'detectOptions'

  cloud: ->
    if @available.cloud.ok
      $.couch.replicate(
        Tangerine.config.address.local.dbName,
        Tangerine.config.address.cloud.host+"/"+Tangerine.config.address.cloud.dbName,
          success:      =>
            @$el.find(".status").find(".info_box").html "Results synced to cloud successfully"
          error: (a, b) =>
            @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{a} #{b}</div>"
        ,
          doc_ids: @docList
      )
    else
      Utils.midAlert "Cannot detect cloud"
    return false


  tablets: ->
    if @available.tablets.okCount > 0
      for ip in @available.tablets.ips
        do (ip) =>
          $.couch.replicate(
            Tangerine.config.address.local.dbName,
            "http://#{ip}:5984/"+Tangerine.config.address.local.dbName,
              success:      =>
                @$el.find(".status").find(".info_box").html "Results synced to #{@available.tablets.okCount} successfully"
              error: (a, b) =>
                @$el.find(".status").find(".info_box").html "<div>Sync error</div><div>#{a} #{b}</div>"
            ,
              doc_ids: @docList
          )
    else
      Utils.midAlert "Cannot detect tablets"
    return false

  csv: ->
    view = new CSVView
      assessmentId : @assessment.id
    view.render()

  #  Tangerine.router.navigate "csv/"+@assessment.id, true

  initDetectOptions: ->
    @available = 
      cloud : 
        ok : false
        checked : false
      tablets :
        ips : [] 
        okCount  : 0
        checked  : 0
        total : 256

  detectOptions: ->
    @detectCloud()
    @detectTablets()
    
  detectCloud: ->
    # Detect Cloud
    $.ajax
      dataType: "jsonp"
      url: Tangerine.config.address.cloud.host+":"+Tangerine.config.address.port+"/"
      success: (a, b) =>
        @available.cloud.ok = true
      error: (a, b) =>
        @available.cloud.ok = false
      complete: =>
        @available.cloud.checked = true
        @updateOptions()

  detectTablets: =>
    port = Tangerine.config.address.port
    for local in [0..255]
      do (local, port) =>
        ip = "192.168.1.#{local}"
        $.ajax
          dataType: "jsonp"
          contentType: "application/json;charset=utf-8",
          timeout: 30000
          url: "http://#{ip}:#{port}/"
          complete:  (xhr, error) =>
            @available.tablets.checked++
            if xhr.status == 200
              @available.tablets.okCount++
              @available.tablets.ips.push ip
            @updateOptions()

  updateOptions: =>
    percentage = Math.decimals((@available.tablets.checked / @available.tablets.total) * 100, 2)
    if percentage == 100
      message = "finished"
    else
      message = "#{percentage}%"
    tabletMessage = "Searching for tablets: #{message}"

    @$el.find(".checking_status").html "#{tabletMessage}" if @available.tablets.checked > 0 

    if @available.cloud.checked && @available.tablets.checked == @available.tablets.total
      @$el.find(".status .info_box").html "Done detecting options"
      @$el.find(".checking_status").hide()

    if @available.cloud.ok
      @$el.find('button.cloud').removeAttr('disabled')
    if @available.tablets.okCount > 0 && percentage == 100
      @$el.find('button.tablets').removeAttr('disabled')



  initialize: ( options ) ->
    @subViews = []
    @results = options.results
    @model = options.model
    @assessment = options.assessment
    @docList = []
    for result in @results
      @docList.push result.id

    @initDetectOptions()
    @detectCloud()

    
  render: ->

    @clearSubViews()

    cloudButton  = "<button class='cloud command' disabled='disabled'>Cloud</button>"
    tabletButton = "<button class='tablets command' disabled='disabled'>Tablets</button>"
    csvButton    = "<button class='csv command'>CSV</button>"

    html = "
      <h1>#{@assessment.get('name')}</h1>
      <h2>Save options</h2>
      <div class='menu_box'>
        #{if Tangerine.settings.context == "mobile" then cloudButton  else ""}
        #{if Tangerine.settings.context == "mobile" then tabletButton else ""}
        #{csvButton}
      </div>"

    if Tangerine.settings.context == "mobile"
      html += "
        <button class='detect command'>Detect options</button>
        <div class='status'>
          <h2>Status</h2>
          <div class='info_box'></div>
          <div class='checking_status'></div>

        </div>
        "
    html += "
      <h2>Results</h2>
    "
    
    @$el.html html
    
    if @results?.length == 0
      @$el.append "No results yet!"
    else
      for result in @results
        view = new ResultSumView
          model: result
          finishCheck : true
        view.render()
        @subViews.push view
        @$el.append view.el
      
    @trigger "rendered"
  
  afterRender: =>
    for view in @subViews
      view.afterRender?()
      
  clearSubViews:->
    for view in @subViews
      view.close()
    @subViews = []
