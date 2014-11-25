# One view to rule them all
# Not necessary to be a view but just in case we need it to do more

# ViewManager now supports loading bars. To take advantage of this feature
# within a view add a trigger for "start_work" and "end_work" and during
# all the time in between a loading bar should appear. 
class ViewManager extends Backbone.View

  show: (view, setFullWidth = false) =>

    window.scrollTo 0, 0

    @currentView?.close?()
    @currentView = view

    @className = @currentView.className

    Tangerine.log.app("show", @className)

    @currentView.on "rendered", =>

      if setFullWidth
        $('#content').addClass('fullWidth')
      else
        $('#content').removeClass('fullWidth')
        
      $("#content").append @currentView.el
      @currentView.$el.find(".buttonset").buttonset()
      @currentView.afterRender?()

    @currentView.on "subRendered", =>
      @currentView.$el.find(".buttonset").buttonset() # button set everything

    @currentView.render()
