var ResultView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultView = (function(superClass) {
  extend(ResultView, superClass);

  function ResultView() {
    return ResultView.__super__.constructor.apply(this, arguments);
  }

  ResultView.prototype.className = "result_view";

  ResultView.prototype.events = {
    'click .save': 'save',
    'click .another': 'another'
  };

  ResultView.prototype.another = function() {
    return window.location.reload();
  };

  ResultView.prototype.save = function() {
    var $button;
    this.model.add({
      name: "Assessment complete",
      prototype: "complete",
      data: {
        "comment": this.$el.find('#additional-comments').val() || "",
        "end_time": (new Date()).getTime()
      },
      subtestId: "result",
      sum: {
        correct: 1,
        incorrect: 0,
        missing: 0,
        total: 1
      }
    });
    if (this.model.save()) {
      Tangerine.activity = "";
      Utils.midAlert(this.text.saved);
      this.$el.find('.save_status').html(this.text.saved);
      this.$el.find('.save_status').removeClass('not_saved');
      this.$el.find('.question').fadeOut(250);
      $button = this.$el.find("button.save");
      return $button.removeClass('save').addClass('another').html(this.text.another);
    } else {
      Utils.midAlert("Save error");
      return this.$el.find('.save_status').html("Results may not have saved");
    }
  };

  ResultView.prototype.i18n = function() {
    return this.text = {
      "assessmentComplete": t("ResultView.label.assessment_complete"),
      "comments": t("ResultView.label.comments"),
      "subtestsCompleted": t("ResultView.label.subtests_completed"),
      "save": t("ResultView.button.save"),
      "another": t("ResultView.button.another"),
      "saved": t("ResultView.message.saved"),
      "notSaved": t("ResultView.message.not_saved")
    };
  };

  ResultView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.assessment = options.assessment;
    this.saved = false;
    return this.resultSumView = new ResultSumView({
      model: this.model,
      finishCheck: false
    });
  };

  ResultView.prototype.render = function() {
    this.$el.html("<h2>" + this.text.assessmentComplete + "</h2> <button class='save command'>" + this.text.save + "</button> <div class='info_box save_status not_saved'>" + this.text.notSaved + "</div> <br> <div class='question'> <label class='prompt' for='additional-comments'>" + this.text.comments + "</label> <textarea id='additional-comments' class='full_width'></textarea> </div> <div class='label_value'> <h2>" + this.text.subtestsCompleted + "</h2> <div id='result_sum' class='info_box'></div> </div>");
    this.resultSumView.setElement(this.$el.find("#result_sum"));
    this.resultSumView.render();
    return this.trigger("rendered");
  };

  ResultView.prototype.onClose = function() {
    return this.resultSumView.close();
  };

  return ResultView;

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt1QkFFSixTQUFBLEdBQVc7O3VCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBbUIsTUFBbkI7SUFDQSxnQkFBQSxFQUFtQixTQURuQjs7O3VCQUdGLE9BQUEsR0FBUyxTQUFBO1dBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO0VBRE87O3VCQUlULElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO01BQUEsSUFBQSxFQUFPLHFCQUFQO01BQ0EsU0FBQSxFQUFXLFVBRFg7TUFFQSxJQUFBLEVBQ0U7UUFBQSxTQUFBLEVBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxHQUFsQyxDQUFBLENBQUEsSUFBMkMsRUFBdkQ7UUFDQSxVQUFBLEVBQWEsQ0FBSyxJQUFBLElBQUEsQ0FBQSxDQUFMLENBQVksQ0FBQyxPQUFiLENBQUEsQ0FEYjtPQUhGO01BS0EsU0FBQSxFQUFZLFFBTFo7TUFNQSxHQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVUsQ0FBVjtRQUNBLFNBQUEsRUFBWSxDQURaO1FBRUEsT0FBQSxFQUFVLENBRlY7UUFHQSxLQUFBLEVBQVEsQ0FIUjtPQVBGO0tBREY7SUFhQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBQUg7TUFDRSxTQUFTLENBQUMsUUFBVixHQUFxQjtNQUNyQixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBckI7TUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQztNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxXQUExQixDQUFzQyxXQUF0QztNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixHQUEvQjtNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWO2FBRVYsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsTUFBcEIsQ0FBMkIsQ0FBQyxRQUE1QixDQUFxQyxTQUFyQyxDQUErQyxDQUFDLElBQWhELENBQXFELElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBM0QsRUFURjtLQUFBLE1BQUE7TUFXRSxLQUFLLENBQUMsUUFBTixDQUFlLFlBQWY7YUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsNEJBQS9CLEVBWkY7O0VBZEk7O3VCQTZCTixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxvQkFBQSxFQUF1QixDQUFBLENBQUUsc0NBQUYsQ0FBdkI7TUFDQSxVQUFBLEVBQXVCLENBQUEsQ0FBRSwyQkFBRixDQUR2QjtNQUVBLG1CQUFBLEVBQXVCLENBQUEsQ0FBRSxxQ0FBRixDQUZ2QjtNQUlBLE1BQUEsRUFBdUIsQ0FBQSxDQUFFLHdCQUFGLENBSnZCO01BS0EsU0FBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FMdkI7TUFPQSxPQUFBLEVBQXVCLENBQUEsQ0FBRSwwQkFBRixDQVB2QjtNQVFBLFVBQUEsRUFBdUIsQ0FBQSxDQUFFLDhCQUFGLENBUnZCOztFQUZFOzt1QkFhTixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVM7V0FDVCxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbkI7TUFBQSxLQUFBLEVBQWMsSUFBQyxDQUFBLEtBQWY7TUFDQSxXQUFBLEVBQWMsS0FEZDtLQURtQjtFQVBYOzt1QkFXWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FDRixJQUFDLENBQUEsSUFBSSxDQUFDLGtCQURKLEdBQ3VCLHFDQUR2QixHQUd1QixJQUFDLENBQUEsSUFBSSxDQUFDLElBSDdCLEdBR2tDLHdEQUhsQyxHQUlzQyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBSjVDLEdBSXFELHFGQUpyRCxHQVE0QyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBUmxELEdBUTJELGtIQVIzRCxHQWFBLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBYk4sR0Fhd0IsMkRBYmxDO0lBa0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUEwQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQTFCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUE7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF0Qk07O3VCQXdCUixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBO0VBRE87Ozs7R0F6RmMsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9SZXN1bHRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVzdWx0VmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuSXRlbVZpZXdcblxuICBjbGFzc05hbWU6IFwicmVzdWx0X3ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLnNhdmUnICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5hbm90aGVyJyA6ICdhbm90aGVyJ1xuXG4gIGFub3RoZXI6IC0+XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgI1RhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJyZXN0YXJ0LyN7QGFzc2Vzc21lbnQuaWR9XCIsIHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5hZGRcbiAgICAgIG5hbWUgOiBcIkFzc2Vzc21lbnQgY29tcGxldGVcIlxuICAgICAgcHJvdG90eXBlOiBcImNvbXBsZXRlXCJcbiAgICAgIGRhdGEgOlxuICAgICAgICBcImNvbW1lbnRcIiA6IEAkZWwuZmluZCgnI2FkZGl0aW9uYWwtY29tbWVudHMnKS52YWwoKSB8fCBcIlwiXG4gICAgICAgIFwiZW5kX3RpbWVcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHN1YnRlc3RJZCA6IFwicmVzdWx0XCJcbiAgICAgIHN1bSA6XG4gICAgICAgIGNvcnJlY3QgOiAxXG4gICAgICAgIGluY29ycmVjdCA6IDBcbiAgICAgICAgbWlzc2luZyA6IDBcbiAgICAgICAgdG90YWwgOiAxXG5cbiAgICBpZiBAbW9kZWwuc2F2ZSgpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5zYXZlZFxuICAgICAgQCRlbC5maW5kKCcuc2F2ZV9zdGF0dXMnKS5odG1sIEB0ZXh0LnNhdmVkXG4gICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLnJlbW92ZUNsYXNzKCdub3Rfc2F2ZWQnKVxuICAgICAgQCRlbC5maW5kKCcucXVlc3Rpb24nKS5mYWRlT3V0KDI1MClcblxuICAgICAgJGJ1dHRvbiA9IEAkZWwuZmluZChcImJ1dHRvbi5zYXZlXCIpXG5cbiAgICAgICRidXR0b24ucmVtb3ZlQ2xhc3MoJ3NhdmUnKS5hZGRDbGFzcygnYW5vdGhlcicpLmh0bWwgQHRleHQuYW5vdGhlclxuICAgIGVsc2VcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG4gICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLmh0bWwgXCJSZXN1bHRzIG1heSBub3QgaGF2ZSBzYXZlZFwiXG5cblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID0gXG4gICAgICBcImFzc2Vzc21lbnRDb21wbGV0ZVwiIDogdChcIlJlc3VsdFZpZXcubGFiZWwuYXNzZXNzbWVudF9jb21wbGV0ZVwiKVxuICAgICAgXCJjb21tZW50c1wiICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3LmxhYmVsLmNvbW1lbnRzXCIpXG4gICAgICBcInN1YnRlc3RzQ29tcGxldGVkXCIgIDogdChcIlJlc3VsdFZpZXcubGFiZWwuc3VidGVzdHNfY29tcGxldGVkXCIpXG5cbiAgICAgIFwic2F2ZVwiICAgICAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5idXR0b24uc2F2ZVwiKVxuICAgICAgXCJhbm90aGVyXCIgICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3LmJ1dHRvbi5hbm90aGVyXCIpXG5cbiAgICAgIFwic2F2ZWRcIiAgICAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5tZXNzYWdlLnNhdmVkXCIpXG4gICAgICBcIm5vdFNhdmVkXCIgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcubWVzc2FnZS5ub3Rfc2F2ZWRcIilcbiAgICAgIFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcbiAgICBAc2F2ZWQgPSBmYWxzZVxuICAgIEByZXN1bHRTdW1WaWV3ID0gbmV3IFJlc3VsdFN1bVZpZXdcbiAgICAgIG1vZGVsICAgICAgIDogQG1vZGVsXG4gICAgICBmaW5pc2hDaGVjayA6IGZhbHNlXG5cbiAgcmVuZGVyOiAtPlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgyPiN7QHRleHQuYXNzZXNzbWVudENvbXBsZXRlfTwvaDI+XG5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmUgY29tbWFuZCc+I3tAdGV4dC5zYXZlfTwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3ggc2F2ZV9zdGF0dXMgbm90X3NhdmVkJz4je0B0ZXh0Lm5vdFNhdmVkfTwvZGl2PlxuICAgICAgPGJyPlxuXG4gICAgICA8ZGl2IGNsYXNzPSdxdWVzdGlvbic+XG4gICAgICAgIDxsYWJlbCBjbGFzcz0ncHJvbXB0JyBmb3I9J2FkZGl0aW9uYWwtY29tbWVudHMnPiN7QHRleHQuY29tbWVudHN9PC9sYWJlbD5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdhZGRpdGlvbmFsLWNvbW1lbnRzJyBjbGFzcz0nZnVsbF93aWR0aCc+PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxoMj4je0B0ZXh0LnN1YnRlc3RzQ29tcGxldGVkfTwvaDI+XG4gICAgICAgIDxkaXYgaWQ9J3Jlc3VsdF9zdW0nIGNsYXNzPSdpbmZvX2JveCc+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgQHJlc3VsdFN1bVZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoXCIjcmVzdWx0X3N1bVwiKSlcbiAgICBAcmVzdWx0U3VtVmlldy5yZW5kZXIoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHJlc3VsdFN1bVZpZXcuY2xvc2UoKVxuIl19
