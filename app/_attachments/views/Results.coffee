class ResultsView extends Backbone.View
  el: $('#content')

  render: =>

    @el.html "
      <div id='message'></div>
      <h2>#{@assessment.name}</h2>
      <div>Last save to cloud: <span id='lastCloudReplicationTime'></span></div>
      <button>Detect save options</button>
      <div id='saveOptions'>
      </div>
      <button>CSV/Excel</button>
      <hr/>
      Results saved by #{$.enumerator}:
      <div id='results'></div>
    "

    @detectCloud()
    @updateLastCloudReplication()
    @results.each (result) =>
      Tangerine.resultView ?= new ResultView()
      Tangerine.resultView.model = result
      finishTime = new moment(result.get("timestamp"))
      $("#results").append "
        <div><button>#{finishTime.format("D-MMM-YY")} (#{finishTime.fromNow()})</button></div>
        <div class='result'>#{Tangerine.resultView.render()}</div>
      "

    $("#results").accordion
      collapsible: true
      active: false

    $("#results").bind "accordionchange", (event, ui) ->
      return if ui.newContent.find("canvas").length > 0
      $('.sparkline').sparkline 'html',
        type:'pie'
        sliceColors:['black','#F7C942','orangered']

  events:
    "click button:contains(Cloud save)" : "save"
    "click button:contains(Local save)" : "save"
    "click button:contains(CSV/Excel)" : "csv"
    "click button:contains(Detect save options)" : "detect"
    "click button:contains(update table)" : "updateTable"
    "click button:contains(Download as CSV)" : "downloadCSV"

  updateLastCloudReplication: ->
    @results.lastCloudReplication
      success: (result) ->
        $("#lastCloudReplicationTime").html new moment(result.timestamp).fromNow()
      error: ->
        $("#lastCloudReplicationTime").html "Unknown"

  save: (event)->
    @replicate $(event.target).attr("saveTarget")

  detect: ->
    $("#saveOptions").html "<span id='saveMessage'>Detecting</span>"
    @detectCloud()
    @detectSubnet()

  detectCloud: ->
    @detectIP
      url: Tangerine.cloud.url
      successButton: "<button type='button' class='save' saveTarget='#{Tangerine.cloud.url}'>Cloud save</button>"

  detectSubnet: ->
    for subnetIP in [Tangerine.subnet.start..Tangerine.subnet.finish]
      url = Tangerine.subnet.base + subnetIP + ":" + Tangerine.port
      buttonText = "Local save <span style='font-size:50%'>#{url.substring(7,url.lastIndexOf(":"))}</span>"
      @detectIP
        url: url
        successButton: "<button type='button' class='save' saveTarget='#{url}'>#{buttonText}"

  detectIP: (options) ->
    $.ajax
      dataType: "jsonp"
      url: options.url
      success: ->
        $("#saveMessage").html ""
        $("#saveOptions").append options.successButton
      error: (a,b,c) ->
        # old versions of couchdb don't return proper json content type
        if b == 'parsererror'
          $("#saveMessage").html ""
          $("#saveOptions").append options.successButton

  replicate: (target) ->
    @results.replicate target,
      success: ->
        $("#message").html "Save successful"
        @updateLastCloudReplication()

  csv: ->
    Tangerine.router.navigate("results/tabular/#{@assessment.get "_id"}",true)

  updateTable: ->
    tableConfigQueryString = $('form').serialize()
    if document.location.hash.indexOf("?") > 0
      urlHashClean = document.location.hash.substring(0,document.location.hash.indexOf("?"))
    else
      urlHashClean = document.location.hash
    Tangerine.router.navigate(urlHashClean + "/?" + tableConfigQueryString)
    options = jQuery.deparam.querystring(jQuery.param.fragment())
    @renderTable(options)
    return false

  downloadCSV: () ->
    $("table#results").table2CSV()

  renderTable: (options) ->
    options.ignoreColumn = "_rev" unless options.ignoreColumn?
    options.ignoreResult = "" unless options.ignoreResult?
    ignoreResultList = options.ignoreResult.split(/, */)
    if options.combine?
      combines = _.map options.combine.split(/; */), (combine) ->
        [alias, targets] = combine.split(/: */)
        return {
          alias: alias
          targets: targets.split(/, */)
        }
    else
      combines = ""


    uniqueFields = _.difference(@uniqueFields, options.ignoreColumn?.split(/, */))
    uniqueFields = _.map uniqueFields, (field)->
      _.each combines, (combine) ->
        field = combine.alias if _.include(combine.targets, field)
      return field
    uniqueFields = _.unique(uniqueFields)

    # Use a hash to collect all of the fieldnames
    # Initialize each table_rows row
    table_rows = {}
    _.each @tableResults.rows, (row) ->
      table_rows[row._id] = {"id":row._id}

    # Fill the table row object with the appropriate data
    # Note that we can't print the row here because we need to coordinate with all other rows
    _.each @tableResults.rows, (row) ->
      fieldname = row.value.fieldname
      _.each combines, (combine) ->
        fieldname = combine.alias if _.include(combine.targets, fieldname)
      if table_rows[row._id][fieldname]?
        table_rows[row._id][fieldname] += ", " + row.value.result
      else
        table_rows[row._id][fieldname] = row.value.result

    table = "
      <table id='results' class='tablesorter'>
        <thead>
          <tr>
    "
    table += _.map(uniqueFields,(field)-> "<th>#{field}</th>" ).join("")
    table += "
          </tr>
        </thead>
        <tbody>
    "
    count = 0
    _.each table_rows, (row) ->
      count++
      table += "<tr>"
      _.each uniqueFields, (field) ->
        item = row[field] || ""
        table += "<td>#{if _.include(ignoreResultList, item) then "" else item}</td>"
      table += "</tr>"
    table += "
        </tbody>
      </table>
    "

    $("#content").html "
      <script type='text/javascript' src='js-libraries/table2CSV.js'></script>
      <script type='text/javascript' src='js-libraries/picnet.table.filter.min.js'></script>
      <style>
        form{
          font-size:8pt;
        }
        input{
          width: 500px;

        }
      </style>
      <div>Instructions: Ignore the configuration section for now - but it can be used to map column names to specific codes and more - it just needs a better interface. Each column may be sorted by clicking on it. The text box below each column name allows you to filter for results (to search for a specific student ID, or filter by gender). The Download as CSV button takes the current state of the table (including filters and sorting) and creates a CSV text that can be pasted into a spreadsheet for further analysis.</div>
      <form>
        <fieldset>
        <legend>Configuration</legend>
          <table id='configuration'>
            <tr>
              <td>Alias (original_name, display_name)</td><td><input type='text' name='alias' value='#{options.alias || ""}'></input></td>
            </tr><tr>
              <td>Combine (alias: original_name/alias, original_name/alias; alias: orig...) </td><td><input type='text' name='combine' value='#{options.combine || ""}'></input></td>
            </tr><tr>
              <td>Column to Ignore (text to ignore ,i.e. _id) </td><td><input type='text' name='ignoreColumn' value='#{options.ignoreColumn || ""}'></input></td>
            </tr><tr>
              <td>Results to Ignore (text to ignore ,i.e. undefined) </td><td><input type='text' name='ignoreResult' value='#{options.ignoreResult || ""}'></input></td>
            </table>
          </tr>
          <button>update table</button>
        </fieldset>
      </form>
      <button>Download as CSV</button>
      <div>Total Number of Rows:#{count}</div>
    
    " + table

    $("#results").tablesorter()
#    $("#results").tableFilter()

