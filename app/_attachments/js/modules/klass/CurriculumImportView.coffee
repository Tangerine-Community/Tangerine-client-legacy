class CurriculumImportView extends Backbone.View

  events: 
    'click .import' : 'import'
    'click .back'   : 'back'

  back: ->
    Tangerine.router.navigate "", true
    false

  # @TODO This should be moved somewhere, it's a copy of the assesssmentImport View
  import: ->
    
    # This is supposed to work
#    $.couch.db("tangerine").compact
#      complete: (a,b,c) =>
#        console.log "compact"
#        console.log [a,b,c]

    dKey = @$el.find("#d_key").val()
    @$el.find(".status").fadeIn(250)
    @$el.find("#progress").html "Looking for #{dKey}"
    repOps = 
      'filter' : Tangerine.config.address.designDoc + '/importFilter'
      'create_target' : true
      'query_params' :
        'downloadKey' : dKey

    opts =
      success: (a, b) =>
        @$el.find("#progress").html "Import successful <h3>Imported</h3>"
        # this next step is just a test to see everything is there...
        # maybe it doesn't need to. Kind of impressive though.
        $.couch.db("tangerine").view Tangerine.config.address.designDoc + '/byDKey',
          keys: [dKey]
          success: (data) =>
            console.log data
            subtests = 0
            curriculumName = ""
            for datum in data.rows
              doc = datum.value
              subtests++ if doc.collection == 'subtest'
              curriculumName = doc.name if doc.collection == 'curriculum'
            @$el.find("#progress").append "
              <div>#{assessmentName}</div>
              <div>Subtests - #{subtests}</div>
            "
          error: (a, b ,c) ->
            @$el.find("#progress").html "<div>Error after data imported</div><div>#{a}</div><div>#{b}"

      error: (a,b) =>
        @$el.find("#progress").html "<div>Import error</div><div>#{a}</div><div>#{b}"
    
    $.couch.replicate Tangerine.config.address.cloud.host+":"+Tangerine.config.address.port+"/"+Tangerine.config.address.cloud.dbName, Tangerine.config.address.local.dbName, opts, repOps
    false

  render: ->
    @$el.html "
    <button class='back navigation'>Back</button>

    <h1>Import Curriculum</h1>
    <div class='question'>
      <label for='d_key'>Download key</label>
      <input id='d_key' value=''>
      <button class='import command'>Import</button>
    </div>

    <div class='confirmation status'>
      <h2>Status<h2>
      <div class='info_box' id='progress'></div>
    </div>

    "
    @trigger "rendered"
