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

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt1QkFFSixTQUFBLEdBQVc7O3VCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBbUIsTUFBbkI7SUFDQSxnQkFBQSxFQUFtQixTQURuQjs7O3VCQUdGLE9BQUEsR0FBUyxTQUFBO1dBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO0VBRE87O3VCQUlULElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO01BQUEsSUFBQSxFQUFPLHFCQUFQO01BQ0EsU0FBQSxFQUFXLFVBRFg7TUFFQSxJQUFBLEVBQ0U7UUFBQSxTQUFBLEVBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxHQUFsQyxDQUFBLENBQUEsSUFBMkMsRUFBdkQ7UUFDQSxVQUFBLEVBQWEsQ0FBSyxJQUFBLElBQUEsQ0FBQSxDQUFMLENBQVksQ0FBQyxPQUFiLENBQUEsQ0FEYjtPQUhGO01BS0EsU0FBQSxFQUFZLFFBTFo7TUFNQSxHQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVUsQ0FBVjtRQUNBLFNBQUEsRUFBWSxDQURaO1FBRUEsT0FBQSxFQUFVLENBRlY7UUFHQSxLQUFBLEVBQVEsQ0FIUjtPQVBGO0tBREY7SUFhQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBQUg7TUFDRSxTQUFTLENBQUMsUUFBVixHQUFxQjtNQUNyQixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBckI7TUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQztNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxXQUExQixDQUFzQyxXQUF0QztNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixHQUEvQjtNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWO2FBRVYsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsTUFBcEIsQ0FBMkIsQ0FBQyxRQUE1QixDQUFxQyxTQUFyQyxDQUErQyxDQUFDLElBQWhELENBQXFELElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBM0QsRUFURjtLQUFBLE1BQUE7TUFXRSxLQUFLLENBQUMsUUFBTixDQUFlLFlBQWY7YUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsNEJBQS9CLEVBWkY7O0VBZEk7O3VCQTZCTixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxvQkFBQSxFQUF1QixDQUFBLENBQUUsc0NBQUYsQ0FBdkI7TUFDQSxVQUFBLEVBQXVCLENBQUEsQ0FBRSwyQkFBRixDQUR2QjtNQUVBLG1CQUFBLEVBQXVCLENBQUEsQ0FBRSxxQ0FBRixDQUZ2QjtNQUlBLE1BQUEsRUFBdUIsQ0FBQSxDQUFFLHdCQUFGLENBSnZCO01BS0EsU0FBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FMdkI7TUFPQSxPQUFBLEVBQXVCLENBQUEsQ0FBRSwwQkFBRixDQVB2QjtNQVFBLFVBQUEsRUFBdUIsQ0FBQSxDQUFFLDhCQUFGLENBUnZCOztFQUZFOzt1QkFhTixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVM7V0FDVCxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbkI7TUFBQSxLQUFBLEVBQWMsSUFBQyxDQUFBLEtBQWY7TUFDQSxXQUFBLEVBQWMsS0FEZDtLQURtQjtFQVBYOzt1QkFXWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FDRixJQUFDLENBQUEsSUFBSSxDQUFDLGtCQURKLEdBQ3VCLHFDQUR2QixHQUd1QixJQUFDLENBQUEsSUFBSSxDQUFDLElBSDdCLEdBR2tDLHdEQUhsQyxHQUlzQyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBSjVDLEdBSXFELHFGQUpyRCxHQVE0QyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBUmxELEdBUTJELGtIQVIzRCxHQWFBLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBYk4sR0Fhd0IsMkRBYmxDO0lBa0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUEwQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQTFCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUE7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF0Qk07O3VCQXdCUixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBO0VBRE87Ozs7R0F6RmMsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvcmVzdWx0L1Jlc3VsdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZXN1bHRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJyZXN1bHRfdmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuc2F2ZScgICAgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLmFub3RoZXInIDogJ2Fub3RoZXInXG5cbiAgYW5vdGhlcjogLT5cbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAjVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJlc3RhcnQvI3tAYXNzZXNzbWVudC5pZH1cIiwgdHJ1ZVxuXG4gIHNhdmU6IC0+XG4gICAgQG1vZGVsLmFkZFxuICAgICAgbmFtZSA6IFwiQXNzZXNzbWVudCBjb21wbGV0ZVwiXG4gICAgICBwcm90b3R5cGU6IFwiY29tcGxldGVcIlxuICAgICAgZGF0YSA6XG4gICAgICAgIFwiY29tbWVudFwiIDogQCRlbC5maW5kKCcjYWRkaXRpb25hbC1jb21tZW50cycpLnZhbCgpIHx8IFwiXCJcbiAgICAgICAgXCJlbmRfdGltZVwiIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgc3VidGVzdElkIDogXCJyZXN1bHRcIlxuICAgICAgc3VtIDpcbiAgICAgICAgY29ycmVjdCA6IDFcbiAgICAgICAgaW5jb3JyZWN0IDogMFxuICAgICAgICBtaXNzaW5nIDogMFxuICAgICAgICB0b3RhbCA6IDFcblxuICAgIGlmIEBtb2RlbC5zYXZlKClcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LnNhdmVkXG4gICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLmh0bWwgQHRleHQuc2F2ZWRcbiAgICAgIEAkZWwuZmluZCgnLnNhdmVfc3RhdHVzJykucmVtb3ZlQ2xhc3MoJ25vdF9zYXZlZCcpXG4gICAgICBAJGVsLmZpbmQoJy5xdWVzdGlvbicpLmZhZGVPdXQoMjUwKVxuXG4gICAgICAkYnV0dG9uID0gQCRlbC5maW5kKFwiYnV0dG9uLnNhdmVcIilcblxuICAgICAgJGJ1dHRvbi5yZW1vdmVDbGFzcygnc2F2ZScpLmFkZENsYXNzKCdhbm90aGVyJykuaHRtbCBAdGV4dC5hbm90aGVyXG4gICAgZWxzZVxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJTYXZlIGVycm9yXCJcbiAgICAgIEAkZWwuZmluZCgnLnNhdmVfc3RhdHVzJykuaHRtbCBcIlJlc3VsdHMgbWF5IG5vdCBoYXZlIHNhdmVkXCJcblxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPSBcbiAgICAgIFwiYXNzZXNzbWVudENvbXBsZXRlXCIgOiB0KFwiUmVzdWx0Vmlldy5sYWJlbC5hc3Nlc3NtZW50X2NvbXBsZXRlXCIpXG4gICAgICBcImNvbW1lbnRzXCIgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcubGFiZWwuY29tbWVudHNcIilcbiAgICAgIFwic3VidGVzdHNDb21wbGV0ZWRcIiAgOiB0KFwiUmVzdWx0Vmlldy5sYWJlbC5zdWJ0ZXN0c19jb21wbGV0ZWRcIilcblxuICAgICAgXCJzYXZlXCIgICAgICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBcImFub3RoZXJcIiAgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcuYnV0dG9uLmFub3RoZXJcIilcblxuICAgICAgXCJzYXZlZFwiICAgICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3Lm1lc3NhZ2Uuc2F2ZWRcIilcbiAgICAgIFwibm90U2F2ZWRcIiAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5tZXNzYWdlLm5vdF9zYXZlZFwiKVxuICAgICAgXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAYXNzZXNzbWVudCA9IG9wdGlvbnMuYXNzZXNzbWVudFxuICAgIEBzYXZlZCA9IGZhbHNlXG4gICAgQHJlc3VsdFN1bVZpZXcgPSBuZXcgUmVzdWx0U3VtVmlld1xuICAgICAgbW9kZWwgICAgICAgOiBAbW9kZWxcbiAgICAgIGZpbmlzaENoZWNrIDogZmFsc2VcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDI+I3tAdGV4dC5hc3Nlc3NtZW50Q29tcGxldGV9PC9oMj5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCBzYXZlX3N0YXR1cyBub3Rfc2F2ZWQnPiN7QHRleHQubm90U2F2ZWR9PC9kaXY+XG4gICAgICA8YnI+XG5cbiAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgPGxhYmVsIGNsYXNzPSdwcm9tcHQnIGZvcj0nYWRkaXRpb25hbC1jb21tZW50cyc+I3tAdGV4dC5jb21tZW50c308L2xhYmVsPlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J2FkZGl0aW9uYWwtY29tbWVudHMnIGNsYXNzPSdmdWxsX3dpZHRoJz48L3RleHRhcmVhPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGgyPiN7QHRleHQuc3VidGVzdHNDb21wbGV0ZWR9PC9oMj5cbiAgICAgICAgPGRpdiBpZD0ncmVzdWx0X3N1bScgY2xhc3M9J2luZm9fYm94Jz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAcmVzdWx0U3VtVmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNyZXN1bHRfc3VtXCIpKVxuICAgIEByZXN1bHRTdW1WaWV3LnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBcbiAgb25DbG9zZTogLT5cbiAgICBAcmVzdWx0U3VtVmlldy5jbG9zZSgpXG4iXX0=
