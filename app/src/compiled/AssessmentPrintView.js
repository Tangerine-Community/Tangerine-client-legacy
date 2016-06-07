var AssessmentPrintView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentPrintView = (function(superClass) {
  extend(AssessmentPrintView, superClass);

  function AssessmentPrintView() {
    this.afterRender = bind(this.afterRender, this);
    return AssessmentPrintView.__super__.constructor.apply(this, arguments);
  }

  AssessmentPrintView.prototype.className = "AssessmentPrintView";

  AssessmentPrintView.prototype.initialize = function(options) {
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.format = options.format;
    Tangerine.activity = "assessment print";
    this.subtestViews = [];
    this.model.subtests.sort();
    return this.model.subtests.each((function(_this) {
      return function(subtest) {
        var subtestView;
        subtestView = new SubtestPrintView({
          model: subtest,
          parent: _this,
          format: _this.format
        });
        subtestView.on("rendered", function(view) {
          return view != null ? typeof view.afterRender === "function" ? view.afterRender() : void 0 : void 0;
        });
        return _this.subtestViews.push(subtestView);
      };
    })(this));
  };

  AssessmentPrintView.prototype.render = function() {
    if (this.model.subtests.length === 0) {
      this.$el.append("<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>");
    } else {
      this.$el.addClass("format-" + this.format).append("<style> @page :right { @bottom-right-corner { content: counter(page) \" of \" counter(pages); }} table.print-metadata td{ border: solid black 1px; } table.print-content.question-attributes{ margin: 10px; } table.print-content.question-options{ margin-bottom: 5px; } table.print-content{ border: solid black 1px; } table.print-content td{ border: solid black 1px; } .AssessmentPrintView #prototype_wrapper .print-page.content { height: auto; } </style> <div class='print-page " + this.format + "'> <h2>" + (this.model.get("name").titleize()) + "</h2> <h3> " + (this.model.has("updated") ? "Last Updated: " + (moment(this.model.get("updated"))) : "") + " </h3> <table class='marking-table'> <tr> <td style='vertical-align:middle'>Enumerator Name</td><td class='marking-area'></td> </tr> </table> </div> <hr/>");
      _.each(this.subtestViews, (function(_this) {
        return function(subtestView) {
          subtestView.render();
          return _this.$el.append(subtestView.el);
        };
      })(this));
    }
    return this.trigger("rendered");
  };

  AssessmentPrintView.prototype.afterRender = function() {
    return _.delay(function() {
      $('#navigation').hide();
      return $('#footer').hide();
    }, 1000);
  };

  return AssessmentPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50UHJpbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG1CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0lBRWxCLFNBQVMsQ0FBQyxRQUFWLEdBQXFCO0lBQ3JCLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQWhCLENBQUE7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFxQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUUsT0FBRjtBQUNuQixZQUFBO1FBQUEsV0FBQSxHQUFrQixJQUFBLGdCQUFBLENBQ2hCO1VBQUEsS0FBQSxFQUFTLE9BQVQ7VUFDQSxNQUFBLEVBQVMsS0FEVDtVQUVBLE1BQUEsRUFBUyxLQUFDLENBQUEsTUFGVjtTQURnQjtRQUlsQixXQUFXLENBQUMsRUFBWixDQUFlLFVBQWYsRUFBMkIsU0FBRSxJQUFGO3lFQUN6QixJQUFJLENBQUU7UUFEbUIsQ0FBM0I7ZUFFQSxLQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsV0FBbkI7TUFQbUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO0VBVFU7O2dDQWtCWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBaEIsS0FBMEIsQ0FBN0I7TUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSwwRkFBWixFQURGO0tBQUEsTUFBQTtNQUdFLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFNBQUEsR0FBVSxJQUFDLENBQUEsTUFBekIsQ0FBa0MsQ0FBQyxNQUFuQyxDQUEwQyw2ZEFBQSxHQXdCZixJQUFDLENBQUEsTUF4QmMsR0F3QlAsU0F4Qk8sR0F5QmpDLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFrQixDQUFDLFFBQW5CLENBQUEsQ0FBRCxDQXpCaUMsR0F5QkYsYUF6QkUsR0EyQm5DLENBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxDQUFILEdBQ0UsZ0JBQUEsR0FBZ0IsQ0FBQyxNQUFBLENBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxDQUFQLENBQUQsQ0FEbEIsR0FHRSxFQUpILENBM0JtQyxHQWdDbkMsNEpBaENQO01BMENBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLFlBQVIsRUFBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFdBQUQ7VUFFckIsV0FBVyxDQUFDLE1BQVosQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxXQUFXLENBQUMsRUFBeEI7UUFIcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBN0NGOztXQWtEQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFuRE07O2dDQXFEUixXQUFBLEdBQWEsU0FBQTtXQUNYLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBQTtNQUNOLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBQTthQUNBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFGTSxDQUFSLEVBR0UsSUFIRjtFQURXOzs7O0dBM0VtQixRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9hc3Nlc3NtZW50L0Fzc2Vzc21lbnRQcmludFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBc3Nlc3NtZW50UHJpbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJBc3Nlc3NtZW50UHJpbnRWaWV3XCJcbiAgXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBhYm9ydEFzc2Vzc21lbnQgPSBmYWxzZVxuICAgIEBpbmRleCA9IDBcbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0XG5cbiAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcImFzc2Vzc21lbnQgcHJpbnRcIlxuICAgIEBzdWJ0ZXN0Vmlld3MgPSBbXVxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5zb3J0KClcbiAgICBAbW9kZWwuc3VidGVzdHMuZWFjaCAoIHN1YnRlc3QgKSA9PlxuICAgICAgc3VidGVzdFZpZXcgPSBuZXcgU3VidGVzdFByaW50Vmlld1xuICAgICAgICBtb2RlbCAgOiBzdWJ0ZXN0XG4gICAgICAgIHBhcmVudCA6IEBcbiAgICAgICAgZm9ybWF0IDogQGZvcm1hdFxuICAgICAgc3VidGVzdFZpZXcub24gXCJyZW5kZXJlZFwiLCAoIHZpZXcgKSA9PlxuICAgICAgICB2aWV3Py5hZnRlclJlbmRlcj8oKVxuICAgICAgQHN1YnRlc3RWaWV3cy5wdXNoIHN1YnRlc3RWaWV3XG4gIFxuICByZW5kZXI6IC0+XG4gICAgaWYgQG1vZGVsLnN1YnRlc3RzLmxlbmd0aCA9PSAwXG4gICAgICBAJGVsLmFwcGVuZCBcIjxoMT5Pb3BzLi4uPC9oMT48cD5UaGlzIGFzc2Vzc21lbnQgaXMgYmxhbmsuIFBlcmhhcHMgeW91IG1lYW50IHRvIGFkZCBzb21lIHN1YnRlc3RzLjwvcD5cIlxuICAgIGVsc2VcbiAgICAgIEAkZWwuYWRkQ2xhc3MoXCJmb3JtYXQtI3tAZm9ybWF0fVwiKS5hcHBlbmQgXCJcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgIEBwYWdlIDpyaWdodCB7IEBib3R0b20tcmlnaHQtY29ybmVyIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNvdW50ZXIocGFnZSkgXFxcIiBvZiBcXFwiIGNvdW50ZXIocGFnZXMpO1xuICAgICAgICAgIH19XG4gICAgICAgICAgdGFibGUucHJpbnQtbWV0YWRhdGEgdGR7XG4gICAgICAgICAgICBib3JkZXI6IHNvbGlkIGJsYWNrIDFweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFibGUucHJpbnQtY29udGVudC5xdWVzdGlvbi1hdHRyaWJ1dGVze1xuICAgICAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YWJsZS5wcmludC1jb250ZW50LnF1ZXN0aW9uLW9wdGlvbnN7XG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRhYmxlLnByaW50LWNvbnRlbnR7XG4gICAgICAgICAgICBib3JkZXI6IHNvbGlkIGJsYWNrIDFweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFibGUucHJpbnQtY29udGVudCB0ZHtcbiAgICAgICAgICAgIGJvcmRlcjogc29saWQgYmxhY2sgMXB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICAuQXNzZXNzbWVudFByaW50VmlldyAjcHJvdG90eXBlX3dyYXBwZXIgLnByaW50LXBhZ2UuY29udGVudCB7XG4gICAgICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzPSdwcmludC1wYWdlICN7QGZvcm1hdH0nPlxuICAgICAgICAgIDxoMj4je0Btb2RlbC5nZXQoXCJuYW1lXCIpLnRpdGxlaXplKCl9PC9oMj5cbiAgICAgICAgICA8aDM+XG4gICAgICAgICAgICAje1xuICAgICAgICAgICAgICBpZiBAbW9kZWwuaGFzIFwidXBkYXRlZFwiXG4gICAgICAgICAgICAgICAgXCJMYXN0IFVwZGF0ZWQ6ICN7bW9tZW50KEBtb2RlbC5nZXQgXCJ1cGRhdGVkXCIpfVwiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9oMz5cbiAgICAgICAgICA8dGFibGUgY2xhc3M9J21hcmtpbmctdGFibGUnPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQgc3R5bGU9J3ZlcnRpY2FsLWFsaWduOm1pZGRsZSc+RW51bWVyYXRvciBOYW1lPC90ZD48dGQgY2xhc3M9J21hcmtpbmctYXJlYSc+PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxoci8+XG4gICAgICBcIlxuICAgICAgXy5lYWNoIEBzdWJ0ZXN0Vmlld3MgLCAoc3VidGVzdFZpZXcpID0+XG5cbiAgICAgICAgc3VidGVzdFZpZXcucmVuZGVyKClcbiAgICAgICAgQCRlbC5hcHBlbmQgc3VidGVzdFZpZXcuZWxcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGFmdGVyUmVuZGVyOiA9PlxuICAgIF8uZGVsYXkgKCkgLT5cbiAgICAgICQoJyNuYXZpZ2F0aW9uJykuaGlkZSgpXG4gICAgICAkKCcjZm9vdGVyJykuaGlkZSgpXG4gICAgICwxMDAwXG4iXX0=
