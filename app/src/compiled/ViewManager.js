
/*

 One view to rule them all
 Not necessary to be a view but just in case we need it to do more

*/

var ViewManager = function() {
        
  this.currentView = {};

};

ViewManager.prototype = {

  templates: {
    container: function(name) {
      return "<div class='" + name + "'></div>";
    }
  },


  // displays a view and removes the previous if it exists
  show: function( view ) {

    // scroll window to top of screen
    window.scrollTo(0, 0);

    // close view if exists
    if (typeof this.currentView.close === "function") {
      this.currentView.close()
    }

    // save new view to member variable
    this.currentView = view;
    this.className = view.className;

    // make a container
    var $container = $(this.templates.container(this.className)).appendTo("#content");
    this.currentView.setElement($container);

    // render view to container
    this.currentView.render()

    // call afterRender function if exists
    if (typeof this.currentView.afterRender === "function") {
      this.currentView.afterRender()
    }

  } // END of show

};

;


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdmlld01hbmFnZXIvVmlld01hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6Im1vZHVsZXMvdmlld01hbmFnZXIvVmlld01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJgXG4vKlxuXG4gT25lIHZpZXcgdG8gcnVsZSB0aGVtIGFsbFxuIE5vdCBuZWNlc3NhcnkgdG8gYmUgYSB2aWV3IGJ1dCBqdXN0IGluIGNhc2Ugd2UgbmVlZCBpdCB0byBkbyBtb3JlXG5cbiovXG5cbnZhciBWaWV3TWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgdGhpcy5jdXJyZW50VmlldyA9IHt9O1xuXG59O1xuXG5WaWV3TWFuYWdlci5wcm90b3R5cGUgPSB7XG5cbiAgdGVtcGxhdGVzOiB7XG4gICAgY29udGFpbmVyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdcIiArIG5hbWUgKyBcIic+PC9kaXY+XCI7XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gZGlzcGxheXMgYSB2aWV3IGFuZCByZW1vdmVzIHRoZSBwcmV2aW91cyBpZiBpdCBleGlzdHNcbiAgc2hvdzogZnVuY3Rpb24oIHZpZXcgKSB7XG5cbiAgICAvLyBzY3JvbGwgd2luZG93IHRvIHRvcCBvZiBzY3JlZW5cbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG5cbiAgICAvLyBjbG9zZSB2aWV3IGlmIGV4aXN0c1xuICAgIGlmICh0eXBlb2YgdGhpcy5jdXJyZW50Vmlldy5jbG9zZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLmN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICB9XG5cbiAgICAvLyBzYXZlIG5ldyB2aWV3IHRvIG1lbWJlciB2YXJpYWJsZVxuICAgIHRoaXMuY3VycmVudFZpZXcgPSB2aWV3O1xuICAgIHRoaXMuY2xhc3NOYW1lID0gdmlldy5jbGFzc05hbWU7XG5cbiAgICAvLyBtYWtlIGEgY29udGFpbmVyXG4gICAgdmFyICRjb250YWluZXIgPSAkKHRoaXMudGVtcGxhdGVzLmNvbnRhaW5lcih0aGlzLmNsYXNzTmFtZSkpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIik7XG4gICAgdGhpcy5jdXJyZW50Vmlldy5zZXRFbGVtZW50KCRjb250YWluZXIpO1xuXG4gICAgLy8gcmVuZGVyIHZpZXcgdG8gY29udGFpbmVyXG4gICAgdGhpcy5jdXJyZW50Vmlldy5yZW5kZXIoKVxuXG4gICAgLy8gY2FsbCBhZnRlclJlbmRlciBmdW5jdGlvbiBpZiBleGlzdHNcbiAgICBpZiAodHlwZW9mIHRoaXMuY3VycmVudFZpZXcuYWZ0ZXJSZW5kZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5jdXJyZW50Vmlldy5hZnRlclJlbmRlcigpXG4gICAgfVxuXG4gIH0gLy8gRU5EIG9mIHNob3dcblxufTtcblxuYCJdfQ==
