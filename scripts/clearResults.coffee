$.couch.db("tangerine").view "tangerine/results",
    include_docs: true
    success: (result) ->
        docs = for row in result.rows
          row.doc
        $.couch.db("tangerine").bulkRemove {docs: docs},
            success: (result) ->
              console.log result


$.couch.db("tangerine").view "tangerine/tripsAndUsers",
    include_docs: true
    success: (result) ->
        docs = for row in result.rows
          row.doc
        $.couch.db("tangerine").bulkRemove {docs: docs},
            success: (result) ->
              console.log result
