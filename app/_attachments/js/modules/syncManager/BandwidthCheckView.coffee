class BandwidthCheckView extends Backbone.View

  className : "BandwidthCheckView"

  events:
    "click .bandwidth-begin-btn"	: 'begin'
    "click .bandwidth-cancel-btn"	: 'cancel'

  config:
    method: 'BDP'   # BDP, latency, or bandwidth
    threshold:
      BDP:          #Bandwidth Delay Product (Default)
        upper: 20
        lower: 2
      latency:
        upper: 750
        lower: 250
      bandwidth:
        upper: 1000
        lower: 1
    settings: # !Important - These must also be set in lib/boomerang-plugin-bw-custom.js @ the bottom
      base_url: 'http://databases.tangerinecentral.org/boomerang/'
      cookie: 'netstats'
      timeout: 6000

  # Allow for overridden configs
  initialize: (config={}) =>
    _.extend(@config, config)

    BOOMR.subscribe 'before_beacon', (data) =>
      results = _.clone(data)

      #remove all of the properties from BOOMR so that it doesn't fire the beacon
      pNames = for key, val of data
        key
      BOOMR.removeVar(pNames)
      
      if !@aborted
        @displayResults(results)
      ""


  displayResults: (data) ->
    console.log('displaying results')
    console.log(data)

    result = @calculateStatus(data)

    @$el.find(".bandwidth-cancel-btn, .bandwidth-begin-btn").toggle()
    @$el.find(".status-bar").removeClass('stripes blue').addClass(result.toString())
    @$el.find(".status-bar span").html 'Complete: '+result+' Connection'

    results = """
    Your bandwidth to this server is #{parseInt(data.bw*8/1024)}kbps (&#x00b1; #{parseInt(data.bw_err*100/data.bw)}%)<br>
    Your latency to this server is #{parseInt(data.lat)} &#x00b1; #{data.lat_err}ms<br>
    """
    @$el.find(".BandwidthCheckView .results").html results
    ""

  calculateStatus: (data) ->
    switch @config.method
      when "BDP"
        res = score: (data.bw*(data.lat/1000))/1024
        _.extend(res, @config.threshold.BDP)
      when "latency"
        res = score: data.lat
        _.extend(res, @config.threshold.latency)
      when "bandwidth"
        res = score: data.bw
        _.extend(res, config.threshold.bandwidth)

    if res.score > (.667*res.upper)
      adjScore = 'Good'
    else if res.score < (.332*res.lower)
      adjScore = 'Poor'
    else
      adjScore = 'Fair'

    adjScore


  begin: =>
    @$el.find(".bandwidth-cancel-btn, .bandwidth-begin-btn").toggle()
    @$el.find(".status-bar").removeClass("Good Fair Poor").addClass("stripes blue")
    @$el.find(".test-results").show()
    @$el.find(".status-bar span").html "Conducting Test..."
    @$el.find(".BandwidthCheckView .results").html ""
    
    BOOMR.utils.removeCookie('netstats')
    BOOMR.plugins.BW.reset()
    BOOMR.plugins.BW.init(@config.settings)

    @aborted = false
    BOOMR.plugins.BW.run() #init the bandwidth check

  cancel: =>
    @$el.find(".bandwidth-cancel-btn, .bandwidth-begin-btn, .test-results").toggle()
    @$el.find(".test-results").hide()
    @$el.find(".status-bar").removeClass("stripes blue Good Fair Poor")
    @$el.find(".status-bar span").html ""
    @$el.find(".BandwidthCheckView .results").html ""
    @aborted = true
    BOOMR.plugins.BW.abort()

  render: =>
    @$el.html "
      <h1>Network Connection Test</h1>
      <section class='BandwidthCheckView'>
        <div class='grid grid-pad'>
          <div class='col-3-12'>
            <div class='content'>
              <button class='bandwidth-begin-btn begin command'>Begin</button>
              <button class='bandwidth-cancel-btn cancel command'>Cancel</button>
            </div>
          </div>
          <div class='col-7-12'>
            <div class='content test-results'>
              <div class='status-bar'>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      	<div class='results'>
      		<span class='results'></span>
      	</div>
      </section>
    "

    @trigger "rendered"