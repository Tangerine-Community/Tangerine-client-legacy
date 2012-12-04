class Curriculum extends Backbone.Model

  url : "curriculum"

  updateFromServer: ( dKey = @id.substr(-5,5)) =>

    @trigger "status", "import lookup"
    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g," ").split(/\s+/))
    $.ajax "#{Tangerine.config.address.class.host}/#{Tangerine.config.address.class.dbName}/_design/#{Tangerine.config.address.designDoc}/_view/byDKey",
      type: "POST"
      dataType: "jsonp"
      data: keys: dKeys
      success: (data) =>
        docList = []
        for datum in data.rows
          docList.push datum.id
        $.couch.replicate(
          "#{Tangerine.config.address.class.host}/#{Tangerine.config.address.class.dbName}",
          Tangerine.config.address.local.dbName,
            success:      => @trigger "status", "import success"
            error: (a, b) => @trigger "status", "import error", "#{a} #{b}"
          ,
            doc_ids: docList
        )

    false

  destroy: (callback) ->

    # remove children
    curriculumId = @id
    subtests = new Subtests
    subtests.fetch
      key: curriculumId
      success: (collection) -> collection.pop().destroy() while collection.length != 0

    # remove model
    super()

    callback()
