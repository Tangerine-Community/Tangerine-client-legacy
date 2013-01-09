class ResultsView extends Backbone.View

  events:
    'click .cloud'    : 'cloud'
    'click .csv'      : 'csv'
    'click .tablets'  : 'tablets'
    'click .detect'   : 'detectOptions'
    'click .details'  : 'showResultSumView'
    'click .csv_beta' : 'csvBeta'

    'change .limit' : "setLimit"
    'change .page' : "setOffset"

  csvBeta: ->
    filename = @assessment.get("name")# + "-" + moment().format("YYYY-MMM-DD HH:mm")
    document.location = "/" + Tangerine.db_name + "/_design/" + Tangerine.design_doc + "/_list/csv/csvRowByResult?key=\"#{@assessment.id}\"&filename=#{filename}"

  showResultSumView: (event) ->
    targetId = $(event.target).attr("data-result-id")
    $details = @$el.find("#details_#{targetId}")
    if not _.isEmpty($details.html())
      $details.empty()
      return 

    result = new Result "_id" : targetId
    result.fetch
      success: ->
        view = new ResultSumView
          model       : result
          finishCheck : true
        view.render()
        $details.html "<div class='info_box'>" + $(view.el).html() + "</div>"
        view.close()
        


  cloud: ->
    if @available.cloud.ok
      $.couch.replicate(
        Tangerine.settings.urlDB("local"),
        Tangerine.settings.urlDB("group"),
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
            Tangerine.settings.urlDB("local"),
            Tangerine.settings.urlSubnet(ip),
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
    @$el.find("button.csv").html "Preparing CSV..." # show message
    view = new CSVView # make a new CSV view, but don't show it, just let it work
      assessmentId : @assessment.id
    view.render()
    view.on "ready", => # when it's ready, get a link to the doc it saved
      filename = @assessment.get("name") + "-" + moment().format("YYYY-MMM-DD HH:mm")
      # point browser to file
      # do it in a new window because otherwise it will cancel the fetching/updating of the file
      csvLocation = Tangerine.settings.urlShow("local", "csv/Tangerine-#{@assessment.id.substr(-5, 5)}.csv?filename=#{filename}")
      $button = @$el.find "button.csv"
      $button.after "<a href='#{csvLocation}' class='command'>Download CSV</a>"
      $button.remove()

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
    $("button.cloud, button.tablets").attr("disabled", "disabled")
    @detectCloud()
    @detectTablets()
    
  detectCloud: ->
    # Detect Cloud
    $.ajax
      dataType: "jsonp"
      url: Tangerine.settings.urlHost("group")
      success: (a, b) =>
        @available.cloud.ok = true
      error: (a, b) =>
        @available.cloud.ok = false
      complete: =>
        @available.cloud.checked = true
        @updateOptions()

  detectTablets: =>
    for local in [0..255]
      do (local) =>
        ip = Tangerine.settings.subnetIP(local)
        $.ajax
          url: Tangerine.settings.urlSubnet(ip)
          dataType: "jsonp"
          contentType: "application/json;charset=utf-8",
          timeout: 30000
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


  readyCSVBeta: ->
    $.ajax
      dataType: "json"
      contentType: "application/json;charset=utf-8",
      url: "http://localhost:5984/tangerine/_design/tangerine/_list/csvHeaders/csvRowByResult"
      data: {key:"\""+@assessment.id+"\""}
      success:  (data) =>
        $button = @$el.find(".csv_beta")
        $button.removeAttr "disabled"
        $button.html "CSV"
        
        @columnHeaders = data

  initialize: ( options ) ->

    @resultLimit  = 100
    @resultOffset = 0

    @subViews = []
    @results = options.results
    @assessment = options.assessment
    @docList = []
    for result in @results
      @docList.push result.get "id"
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
        #{if Tangerine.settings.get("context") == "mobile" then cloudButton  else ""}
        #{if Tangerine.settings.get("context") == "mobile" then tabletButton else ""}
        #{csvButton}
        <button class='command csv_beta'>CSV (beta)</button>
      </div>"

    if Tangerine.settings.get("context") == "mobile"
      html += "
        <button class='detect command'>Detect options</button>
        <div class='status'>
          <h2>Status</h2>
          <div class='info_box'></div>
          <div class='checking_status'></div>

        </div>
        "
    html += "
      <h2 id='results_header'>Results (loading)</h2>
      <div id='results_container'></div>
    "
    
    @$el.html html

    @updateResults()

    @trigger "rendered"

  setLimit: (event) ->
    @resultLimit = parseInt($(event.target).val()) || 100 # default 100
    @updateResults()

  setOffset: (event) ->
    val = parseInt($(event.target).val()) || 1 
    calculated = (val - 1) * @resultLimit
    maxPage = Math.floor(@results.length / @resultLimit ) + 1

    @resultOffset = Math.limit(0, calculated, maxPage) # default page 1 == 0_offset

    @updateResults()

  updateResults: =>
    if @results?.length == 0
      @$el.find('#results_header').html "No results yet!"
      return

    $.ajax 
      url: Tangerine.settings.urlView("local", "resultSummaryByAssessmentId")
      type: "POST"
      dataType: "json"
      contentType: "application/json"
      data: JSON.stringify
        keys        : [@assessment.id]
        descenting  : true
        limit       : @resultLimit
        skip        : @resultOffset
      success: ( data ) =>

        rows  = data.rows
        count = rows.length

        $('#results_header').html "Results (#{count})"

        maxResults  = 100
        currentPage = Math.floor( @resultOffset / @resultLimit ) + 1 

        htmlMenu = ""
        htmlMenu = "
          <br>
          <div>
            <label for='page' class='small_grey'>Page</label><input id='page' type='number' value='#{currentPage}'>
            <label for='limit' class='small_grey'>Per page</label><input id='limit' type='number' value='#{@resultLimit}'>
          </div>
        " if count > maxResults


        @$el.find('#results_header').html "
          Results (#{count})
          #{htmlMenu}
        "

        htmlRows = ""
        for row in rows
          id      = row.value?.participant_id || ""
          long    = moment(row.value.end_time).format('YYYY-MMM-DD HH:mm')
          fromNow = moment(row.value.end_time).fromNow()
          time    = "#{long} (#{fromNow})"
          htmlRows += "
            <div>
              #{ id } -
              #{ time }
              <button data-result-id='#{row.id}' class='details command'>details</button>
              <div id='details_#{row.id}'></div>
            </div>
          "

        @$el.find("#results_container").html htmlRows
  
  afterRender: =>
    for view in @subViews
      view.afterRender?()
      
  clearSubViews:->
    for view in @subViews
      view.close()
    @subViews = []
