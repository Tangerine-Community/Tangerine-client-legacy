class CsvMenuView extends Backbone.View

  className : "CsvMenuView"

  initialize: (options) ->
    klassId   = options.parent.options.klass.id
    groupName = Tangerine.settings.get("groupName")
    document.location = "http://csv.tangerinecentral.org/class/#{groupName}/#{klassId}"
