# One view to rule them all
# Not necessary to be a view but just in case we need it to do more
class ViewManager extends Backbone.View
  show: (view) ->
    window.scrollTo 0, 0
    @currentView?.close()
    @currentView = view
    @currentView.on "rendered", => 
      $("#content").append @currentView.el
      $("#content .richtext").cleditor()
    @currentView.render()
    