class VisitsByUser extends Backbone.View

  @id : "visits-by-user"

  initialize: ->
    @results = new TripResultCollection
    @results.fetch
      resultView : "resultsByUserId"
      queryKey    : Tangerine.user.name()

      success: =>
        @render()

  render: ->
    @$el.html "<img src='images/loading.gif' class='loading'>" unless @results? and @results.length > 0
    @trigger "rendered"

Dashboard.prototype.reports.push VisitsByUser