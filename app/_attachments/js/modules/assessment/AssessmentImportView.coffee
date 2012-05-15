class AssessmentImportView extends Backbone.View

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'

  back: ->
    Tangerine.router.navigate "", true
    false

  import: ->
    dKey = @$el.find("#d_key").val()
    @$el.find(".status").fadeIn(250)
    @$el.find("#progress").html "Looking for #{dKey}"
    console.log dKey
    repOps = 
      'filter' : 'tangerine/importFilter'
      'create_target' : true
      'query_params' :
        'downloadKey' : dKey

    opts = 
      success: (a, b) => 
        console.log [ "success", a, b ]
        @$el.find("#progress").html "Import successful <h3>Imported</h3>"
        
        $.couch.db("tangerine").view "tangerine/byDKey",
          keys: [dKey]
          success: (data) =>
            console.log data
            for datum in data.rows
              doc = datum.value
              @$el.find("#progress").append "<div>#{doc.collection} - #{doc.name}</div>"

          error: (a, b ,c) ->
            console.log([a,b,c])

        

      error: (a,b) =>
        console.log [ "error", a, b ]
        @$el.find("#progress").html "<div>Import error</div><div>#{a}</div><div>#{b}"
        
    $.couch.replicate "http://tangerine.iriscouch.com:5984/tangerine", "tangerine", opts, repOps
    false

  render: ->
    @$el.html "
    <button class='back'>Back</button>

    <h1>Tangerine Central Import</h1>
    <div class='question'>
      <label for='d_key'>Download key</label>
      <input id='d_key' value=''>
      <button class='import'>Import</button>
    </div>

    <div class='confirmation status'>
      <h2>Status<h2>
      <div class='info_box' id='progress'></div>
    </div>

    "
    @trigger "rendered"
