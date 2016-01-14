var ResultItemView;

ResultItemView = Backbone.Marionette.CompositeView.extend({
  className: "result_view",
  events: {
    'click .save': 'save',
    'click .another': 'another'
  },
  another: function() {
    var d, timestamp;
    d = new Date();
    timestamp = d.getTime();
    Tangerine.router.navigateAwayMessage = false;
    return Tangerine.router.navigate("runMar/" + this.model.get('assessmentId') + "?" + timestamp, {
      trigger: true
    });
  },
  save: function() {
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
  },
  i18n: function() {
    return this.text = {
      "assessmentComplete": t("ResultView.label.assessment_complete"),
      "comments": t("ResultView.label.comments"),
      "subtestsCompleted": t("ResultView.label.subtests_completed"),
      "save": t("ResultView.button.save"),
      "another": t("ResultView.button.another"),
      "saved": t("ResultView.message.saved"),
      "notSaved": t("ResultView.message.not_saved")
    };
  },
  initialize: function(options) {
    Tangerine.progress.currentSubview = this;
    this.i18n();
    this.model = options.model;
    this.assessment = options.assessment;
    this.saved = false;
    return this.resultSumView = new ResultSumView({
      model: this.model.parent.result,
      finishCheck: false
    });
  },
  render: function() {
    $(".subtest-next").hide();
    this.$el.html("<h2>" + this.text.assessmentComplete + "</h2> <button class='save command'>" + this.text.save + "</button> <div class='info_box save_status not_saved'>" + this.text.notSaved + "</div> <br> <div class='question'> <label class='prompt' for='additional-comments'>" + this.text.comments + "</label> <textarea id='additional-comments' class='full_width'></textarea> </div> <div class='label_value'> <h2>" + this.text.subtestsCompleted + "</h2> <div id='result_sum' class='info_box'></div> </div>");
    this.resultSumView.setElement(this.$el.find("#result_sum"));
    this.resultSumView.render();
    return this.trigger("rendered");
  },
  onClose: function() {
    return this.resultSumView.close();
  }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdEl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFBLGNBQUEsR0FBa0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBbEMsQ0FFaEI7RUFBQSxTQUFBLEVBQVcsYUFBWDtFQUVBLE1BQUEsRUFDRTtJQUFBLGFBQUEsRUFBbUIsTUFBbkI7SUFDQSxnQkFBQSxFQUFtQixTQURuQjtHQUhGO0VBTUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxRQUFBO0lBQUEsQ0FBQSxHQUFRLElBQUEsSUFBQSxDQUFBO0lBQ1IsU0FBQSxHQUFZLENBQUMsQ0FBQyxPQUFGLENBQUE7SUFDWixTQUFTLENBQUMsTUFBTSxDQUFDLG1CQUFqQixHQUF1QztXQUN2QyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQVgsQ0FBZSxjQUFmLENBQVosR0FBNkMsR0FBN0MsR0FBbUQsU0FBN0UsRUFBd0Y7TUFBQSxPQUFBLEVBQVMsSUFBVDtLQUF4RjtFQUpPLENBTlQ7RUFZQSxJQUFBLEVBQU0sU0FBQTtBQUNKLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtNQUFBLElBQUEsRUFBTyxxQkFBUDtNQUNBLFNBQUEsRUFBVyxVQURYO01BRUEsSUFBQSxFQUNFO1FBQUEsU0FBQSxFQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHNCQUFWLENBQWlDLENBQUMsR0FBbEMsQ0FBQSxDQUFBLElBQTJDLEVBQXZEO1FBQ0EsVUFBQSxFQUFhLENBQUssSUFBQSxJQUFBLENBQUEsQ0FBTCxDQUFZLENBQUMsT0FBYixDQUFBLENBRGI7T0FIRjtNQUtBLFNBQUEsRUFBWSxRQUxaO01BTUEsR0FBQSxFQUNFO1FBQUEsT0FBQSxFQUFVLENBQVY7UUFDQSxTQUFBLEVBQVksQ0FEWjtRQUVBLE9BQUEsRUFBVSxD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MkZBLE9BQUEsRUFBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUE7RUFETyxDQTNGVDtDQUZnQiIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9SZXN1bHRJdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlJlc3VsdEl0ZW1WaWV3ID0gIEJhY2tib25lLk1hcmlvbmV0dGUuQ29tcG9zaXRlVmlldy5leHRlbmRcblxuICBjbGFzc05hbWU6IFwicmVzdWx0X3ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLnNhdmUnICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5hbm90aGVyJyA6ICdhbm90aGVyJ1xuXG4gIGFub3RoZXI6IC0+XG4gICAgZCA9IG5ldyBEYXRlKCk7XG4gICAgdGltZXN0YW1wID0gZC5nZXRUaW1lKCk7XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZUF3YXlNZXNzYWdlID0gZmFsc2VcbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicnVuTWFyL1wiICsgdGhpcy5tb2RlbC5nZXQoJ2Fzc2Vzc21lbnRJZCcpICsgXCI/XCIgKyB0aW1lc3RhbXAsIHRyaWdnZXI6IHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5hZGRcbiAgICAgIG5hbWUgOiBcIkFzc2Vzc21lbnQgY29tcGxldGVcIlxuICAgICAgcHJvdG90eXBlOiBcImNvbXBsZXRlXCJcbiAgICAgIGRhdGEgOlxuICAgICAgICBcImNvbW1lbnRcIiA6IEAkZWwuZmluZCgnI2FkZGl0aW9uYWwtY29tbWVudHMnKS52YWwoKSB8fCBcIlwiXG4gICAgICAgIFwiZW5kX3RpbWVcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHN1YnRlc3RJZCA6IFwicmVzdWx0XCJcbiAgICAgIHN1bSA6XG4gICAgICAgIGNvcnJlY3QgOiAxXG4gICAgICAgIGluY29ycmVjdCA6IDBcbiAgICAgICAgbWlzc2luZyA6IDBcbiAgICAgICAgdG90YWwgOiAxXG5cbiAgICBpZiBAbW9kZWwuc2F2ZSgpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5zYXZlZFxuICAgICAgQCRlbC5maW5kKCcuc2F2ZV9zdGF0dXMnKS5odG1sIEB0ZXh0LnNhdmVkXG4gICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLnJlbW92ZUNsYXNzKCdub3Rfc2F2ZWQnKVxuICAgICAgQCRlbC5maW5kKCcucXVlc3Rpb24nKS5mYWRlT3V0KDI1MClcblxuICAgICAgJGJ1dHRvbiA9IEAkZWwuZmluZChcImJ1dHRvbi5zYXZlXCIpXG5cbiAgICAgICRidXR0b24ucmVtb3ZlQ2xhc3MoJ3NhdmUnKS5hZGRDbGFzcygnYW5vdGhlcicpLmh0bWwgQHRleHQuYW5vdGhlclxuICAgIGVsc2VcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG4gICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLmh0bWwgXCJSZXN1bHRzIG1heSBub3QgaGF2ZSBzYXZlZFwiXG5cblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwiYXNzZXNzbWVudENvbXBsZXRlXCIgOiB0KFwiUmVzdWx0Vmlldy5sYWJlbC5hc3Nlc3NtZW50X2NvbXBsZXRlXCIpXG4gICAgICBcImNvbW1lbnRzXCIgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcubGFiZWwuY29tbWVudHNcIilcbiAgICAgIFwic3VidGVzdHNDb21wbGV0ZWRcIiAgOiB0KFwiUmVzdWx0Vmlldy5sYWJlbC5zdWJ0ZXN0c19jb21wbGV0ZWRcIilcblxuICAgICAgXCJzYXZlXCIgICAgICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBcImFub3RoZXJcIiAgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcuYnV0dG9uLmFub3RoZXJcIilcblxuICAgICAgXCJzYXZlZFwiICAgICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3Lm1lc3NhZ2Uuc2F2ZWRcIilcbiAgICAgIFwibm90U2F2ZWRcIiAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5tZXNzYWdlLm5vdF9zYXZlZFwiKVxuXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cblxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBAaTE4bigpXG5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcbiAgICBAc2F2ZWQgPSBmYWxzZVxuICAgIEByZXN1bHRTdW1WaWV3ID0gbmV3IFJlc3VsdFN1bVZpZXdcbiAgICAgIG1vZGVsICAgICAgIDogQG1vZGVsLnBhcmVudC5yZXN1bHRcbiAgICAgIGZpbmlzaENoZWNrIDogZmFsc2VcblxuICByZW5kZXI6IC0+XG4gICAgJChcIi5zdWJ0ZXN0LW5leHRcIikuaGlkZSgpXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDI+I3tAdGV4dC5hc3Nlc3NtZW50Q29tcGxldGV9PC9oMj5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZSBjb21tYW5kJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCBzYXZlX3N0YXR1cyBub3Rfc2F2ZWQnPiN7QHRleHQubm90U2F2ZWR9PC9kaXY+XG4gICAgICA8YnI+XG5cbiAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgPGxhYmVsIGNsYXNzPSdwcm9tcHQnIGZvcj0nYWRkaXRpb25hbC1jb21tZW50cyc+I3tAdGV4dC5jb21tZW50c308L2xhYmVsPlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J2FkZGl0aW9uYWwtY29tbWVudHMnIGNsYXNzPSdmdWxsX3dpZHRoJz48L3RleHRhcmVhPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGgyPiN7QHRleHQuc3VidGVzdHNDb21wbGV0ZWR9PC9oMj5cbiAgICAgICAgPGRpdiBpZD0ncmVzdWx0X3N1bScgY2xhc3M9J2luZm9fYm94Jz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAcmVzdWx0U3VtVmlldy5zZXRFbGVtZW50KEAkZWwuZmluZChcIiNyZXN1bHRfc3VtXCIpKVxuICAgIEByZXN1bHRTdW1WaWV3LnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBvbkNsb3NlOiAtPlxuICAgIEByZXN1bHRTdW1WaWV3LmNsb3NlKClcbiJdfQ==
