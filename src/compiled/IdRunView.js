var IdRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdRunView = (function(superClass) {
  extend(IdRunView, superClass);

  function IdRunView() {
    return IdRunView.__super__.constructor.apply(this, arguments);
  }

  IdRunView.prototype.className = "id";

  IdRunView.prototype.events = {
    'click #generate': 'generate',
    'change #participant_id': 'setValidator'
  };

  IdRunView.prototype.i18n = function() {
    return this.text = {
      identifier: t("IdRunView.label.identifier"),
      generate: t("IdRunView.button.generate")
    };
  };

  IdRunView.prototype.initialize = function(options) {
    console.log(options);
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    return this.validator = new CheckDigit;
  };

  IdRunView.prototype.render = function() {
    var participantId, previous;
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        participantId = previous.participant_id;
      }
    }
    this.$el.html("<form> <label for='participant_id'>" + this.text.identifier + "</label> <input id='participant_id' name='participant_id' value='" + (participantId || '') + "'> <button id='generate' class='command'>" + this.text.generate + "</button> <div class='messages'></div> </form>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  IdRunView.prototype.getResult = function() {
    return {
      'participant_id': this.$el.find("#participant_id").val()
    };
  };

  IdRunView.prototype.getSkipped = function() {
    return {
      'participant_id': "skipped"
    };
  };

  IdRunView.prototype.setValidator = function() {
    return this.validator.set(this.getResult()['participant_id']);
  };

  IdRunView.prototype.isValid = function() {
    this.setValidator();
    if (!this.validator.isValid()) {
      return false;
    }
    return this.updateNavigation();
  };

  IdRunView.prototype.showErrors = function() {
    return this.$el.find(".messages").html(this.validator.getErrors().join(", "));
  };

  IdRunView.prototype.generate = function() {
    this.$el.find(".messages").empty();
    this.$el.find('#participant_id').val(this.validator.generate());
    return false;
  };

  IdRunView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.getResult()['participant_id']);
  };

  return IdRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0lkUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxTQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3NCQUVKLFNBQUEsR0FBVzs7c0JBRVgsTUFBQSxHQUNFO0lBQUEsaUJBQUEsRUFBMkIsVUFBM0I7SUFDQSx3QkFBQSxFQUEyQixjQUQzQjs7O3NCQUdGLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLFVBQUEsRUFBYSxDQUFBLENBQUUsNEJBQUYsQ0FBYjtNQUNBLFFBQUEsRUFBYSxDQUFBLENBQUUsMkJBQUYsQ0FEYjs7RUFGRTs7c0JBS04sVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtJQUVBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztXQUVyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUk7RUFWUDs7c0JBWVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBQSxDQUFPLElBQUMsQ0FBQSxTQUFSO01BQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUF0QixDQUFnQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQWhDO01BQ1gsSUFBRyxRQUFIO1FBQ0UsYUFBQSxHQUFnQixRQUFRLENBQUMsZUFEM0I7T0FGRjs7SUFLQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxQ0FBQSxHQUVzQixJQUFDLENBQUEsSUFBSSxDQUFDLFVBRjVCLEdBRXVDLG1FQUZ2QyxHQUdpRCxDQUFDLGFBQUEsSUFBZSxFQUFoQixDQUhqRCxHQUdvRSwyQ0FIcEUsR0FJZ0MsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUp0QyxHQUkrQyxnREFKekQ7SUFPQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7RUFmTTs7c0JBaUJSLFNBQUEsR0FBVyxTQUFBO0FBQ1QsV0FBTztNQUFFLGdCQUFBLEVBQW1CLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBQSxDQUFyQjs7RUFERTs7c0JBR1gsVUFBQSxHQUFZLFNBQUE7QUFDVixXQUFPO01BQUUsZ0JBQUEsRUFBbUIsU0FBckI7O0VBREc7O3NCQUdaLFlBQUEsR0FBYyxTQUFBO1dBQ1osSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFhLENBQUEsZ0JBQUEsQ0FBNUI7RUFEWTs7c0JBR2QsT0FBQSxHQUFTLFNBQUE7SUFDUCxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ0EsSUFBZ0IsQ0FBSSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQSxDQUFwQjtBQUFBLGFBQU8sTUFBUDs7V0FDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtFQUhPOztzQkFLVCxVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBQSxDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLENBQTVCO0VBRFU7O3NCQUdaLFFBQUEsR0FBVSxTQUFBO0lBQ1IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsV0FBVixDQUFzQixDQUFDLEtBQXZCLENBQUE7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLEdBQTdCLENBQWlDLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFBLENBQWpDO1dBQ0E7RUFIUTs7c0JBS1YsZ0JBQUEsR0FBa0IsU0FBQTtXQUNoQixTQUFTLENBQUMsR0FBRyxDQUFDLFVBQWQsQ0FBeUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFhLENBQUEsZ0JBQUEsQ0FBdEM7RUFEZ0I7Ozs7R0FoRUksUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0lkUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIElkUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiaWRcIlxuICBcbiAgZXZlbnRzOlxuICAgICdjbGljayAjZ2VuZXJhdGUnICAgICAgICA6ICdnZW5lcmF0ZSdcbiAgICAnY2hhbmdlICNwYXJ0aWNpcGFudF9pZCcgOiAnc2V0VmFsaWRhdG9yJ1xuICBcbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBpZGVudGlmaWVyIDogdChcIklkUnVuVmlldy5sYWJlbC5pZGVudGlmaWVyXCIpXG4gICAgICBnZW5lcmF0ZSAgIDogdChcIklkUnVuVmlldy5idXR0b24uZ2VuZXJhdGVcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIGNvbnNvbGUubG9nIG9wdGlvbnNcblxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cbiAgICBAdmFsaWRhdG9yID0gbmV3IENoZWNrRGlnaXRcblxuICByZW5kZXI6IC0+XG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgIHBhcnRpY2lwYW50SWQgPSBwcmV2aW91cy5wYXJ0aWNpcGFudF9pZFxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgPGZvcm0+XG4gICAgICA8bGFiZWwgZm9yPSdwYXJ0aWNpcGFudF9pZCc+I3tAdGV4dC5pZGVudGlmaWVyfTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J3BhcnRpY2lwYW50X2lkJyBuYW1lPSdwYXJ0aWNpcGFudF9pZCcgdmFsdWU9JyN7cGFydGljaXBhbnRJZHx8Jyd9Jz5cbiAgICAgIDxidXR0b24gaWQ9J2dlbmVyYXRlJyBjbGFzcz0nY29tbWFuZCc+I3tAdGV4dC5nZW5lcmF0ZX08L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICA8L2Zvcm0+XCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmV0dXJuIHsgJ3BhcnRpY2lwYW50X2lkJyA6IEAkZWwuZmluZChcIiNwYXJ0aWNpcGFudF9pZFwiKS52YWwoKSB9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4geyAncGFydGljaXBhbnRfaWQnIDogXCJza2lwcGVkXCIgfVxuXG4gIHNldFZhbGlkYXRvcjogLT5cbiAgICBAdmFsaWRhdG9yLnNldCBAZ2V0UmVzdWx0KClbJ3BhcnRpY2lwYW50X2lkJ11cblxuICBpc1ZhbGlkOiAtPlxuICAgIEBzZXRWYWxpZGF0b3IoKVxuICAgIHJldHVybiBmYWxzZSBpZiBub3QgQHZhbGlkYXRvci5pc1ZhbGlkKClcbiAgICBAdXBkYXRlTmF2aWdhdGlvbigpXG4gICAgXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHZhbGlkYXRvci5nZXRFcnJvcnMoKS5qb2luKFwiLCBcIilcblxuICBnZW5lcmF0ZTogLT5cbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZXNcIikuZW1wdHkoKVxuICAgIEAkZWwuZmluZCgnI3BhcnRpY2lwYW50X2lkJykudmFsIEB2YWxpZGF0b3IuZ2VuZXJhdGUoKVxuICAgIGZhbHNlXG5cbiAgdXBkYXRlTmF2aWdhdGlvbjogLT5cbiAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQGdldFJlc3VsdCgpWydwYXJ0aWNpcGFudF9pZCddXG4iXX0=
