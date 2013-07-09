class CsvMenuView extends Backbone.View

  className : "CsvMenuView"

  initialize: (options) ->
    klassId = options.parent.options.klass.id
    filename = moment().format("YYYY-MMM-DD HH:mm")
    document.location = "/" + Tangerine.db_name + "/_design/" + Tangerine.design_doc + "/_list/csv/csvRowByResult?key=\"#{klassId}\"&filename=#{filename}"
