class KlassToDateMenuView extends Backbone.View

  initialize: (options) ->
    Tangerine.router.navigate "report/classToDate/" + options.parent.options.klass.id, true