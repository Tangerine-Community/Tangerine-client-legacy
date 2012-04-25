# One view to rule them all
# Not necessary to be a view but just in case we need it to do more
class ViewManager extends Backbone.View
  show: (view) ->
    @currentView?.close()
    @currentView = view
    @currentView.on "rendered", => 
      $("#content").html @currentView.el
    # one for the money
    @currentView.trigger "rendered"