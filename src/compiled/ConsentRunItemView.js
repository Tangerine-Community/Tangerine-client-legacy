var ConsentRunItemView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConsentRunItemView = (function(superClass) {
  extend(ConsentRunItemView, superClass);

  function ConsentRunItemView() {
    this.onConsentChange = bind(this.onConsentChange, this);
    return ConsentRunItemView.__super__.constructor.apply(this, arguments);
  }

  ConsentRunItemView.prototype.className = "ConsentRunView";

  ConsentRunItemView.prototype.events = {
    'click #non_consent_confirm': 'noConsent'
  };

  ConsentRunItemView.prototype.onConsentChange = function() {
    if (this.consentButton.answer === "yes") {
      return this.clearMessages();
    } else {
      return this.showNonConsent();
    }
  };

  ConsentRunItemView.prototype.i18n = function() {
    return this.text = {
      defaultConsent: t("ConsentRunView.label.default_consent_prompt"),
      confirmNonconsent: t("ConsentRunView.label.confirm_nonconsent"),
      confirm: t("ConsentRunView.button.confirm"),
      yes: t("ConsentRunView.button.yes_continue"),
      no: t("ConsentRunView.button.no_stop"),
      select: t("ConsentRunView.message.select"),
      "help": t("SubtestRunView.button.help")
    };
  };

  ConsentRunItemView.prototype.initialize = function(options) {
    var labels;
    Tangerine.progress.currentSubview = this;
    this.i18n();
    this.confirmedNonConsent = false;
    this.model = options.model;
    this.parent = this.model.parent;
    this.dataEntry = options.dataEntry;
    labels = {};
    labels.text = this.text;
    return this.model.set('labels', labels);
  };

  ConsentRunItemView.prototype.render = function() {
    var answer, enumeratorHelp, previous, studentDialog;
    enumeratorHelp = (this.model.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>" + this.text.help + "</button><div class='enumerator_help' " + (this.fontStyle || "") + ">" + (this.model.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog' " + (this.fontStyle || "") + ">" + (this.model.get('studentDialog')) + "</div>" : "";
    this.$el.html("<h2>" + (this.model.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog + " <div class='question'> <label>" + (this.model.get('prompt') || this.text.defaultConsent) + "</label> <div class='messages'></div> <div class='non_consent_form confirmation'> <div>" + this.text.confirmNonconsent + "</div> <button id='non_consent_confirm' class='command'>" + this.text.confirm + "</button> </div> <div class='consent-button'></div> </div>");
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        answer = previous.consent;
      }
    }
    this.consentButton = new ButtonView({
      options: [
        {
          label: this.text.yes,
          value: "yes"
        }, {
          label: this.text.no,
          value: "no"
        }
      ],
      mode: "single",
      dataEntry: false,
      answer: answer || ""
    });
    this.consentButton.setElement(this.$el.find(".consent-button"));
    this.consentButton.on("change", this.onConsentChange);
    this.consentButton.render();
    this.trigger("rendered");
    return this.trigger("ready");
  };

  ConsentRunItemView.prototype.isValid = function() {
    if (this.confirmedNonConsent === false) {
      if (this.consentButton.answer === "yes") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  ConsentRunItemView.prototype.testValid = function() {
    if (this.isValid != null) {
      return this.isValid();
    } else {
      return false;
    }
    return true;
  };

  ConsentRunItemView.prototype.showNonConsent = function() {
    return this.$el.find(".non_consent_form").show(250);
  };

  ConsentRunItemView.prototype.clearMessages = function() {
    this.$el.find(".non_consent_form").hide(250);
    return this.$el.find(".messages").html("");
  };

  ConsentRunItemView.prototype.noConsent = function() {
    this.confirmedNonConsent = true;
    this.parent.abort();
    return false;
  };

  ConsentRunItemView.prototype.getSkipped = function() {
    return {
      "consent": "skipped"
    };
  };

  ConsentRunItemView.prototype.showErrors = function() {
    var answer;
    answer = this.consentButton.answer;
    if (answer === "no") {
      Utils.midAlert(this.text.confirm);
      return this.showNonConsent();
    } else if (answer === void 0) {
      return $(".messages").html(this.text.select);
    }
  };

  ConsentRunItemView.prototype.getResult = function() {
    var hash, result, subtestResult;
    result = {
      "consent": this.consentButton.answer
    };
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    return subtestResult = {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
  };

  ConsentRunItemView.prototype.onClose = function() {
    var ref;
    return (ref = this.consentButton) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  return ConsentRunItemView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0NvbnNlbnRSdW5JdGVtVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxrQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OytCQUVKLFNBQUEsR0FBWTs7K0JBRVosTUFBQSxHQUNFO0lBQUEsNEJBQUEsRUFBK0IsV0FBL0I7OzsrQkFFRixlQUFBLEdBQWlCLFNBQUE7SUFDZixJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixLQUF5QixLQUE1QjthQUNFLElBQUMsQ0FBQSxhQUFELENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBSEY7O0VBRGU7OytCQU1qQixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxjQUFBLEVBQW9CLENBQUEsQ0FBRSw2Q0FBRixDQUFwQjtNQUNBLGlCQUFBLEVBQW9CLENBQUEsQ0FBRSx5Q0FBRixDQURwQjtNQUVBLE9BQUEsRUFBb0IsQ0FBQSxDQUFFLCtCQUFGLENBRnBCO01BR0EsR0FBQSxFQUFvQixDQUFBLENBQUUsb0NBQUYsQ0FIcEI7TUFJQSxFQUFBLEVBQW9CLENBQUEsQ0FBRSwrQkFBRixDQUpwQjtNQUtBLE1BQUEsRUFBb0IsQ0FBQSxDQUFFLCtCQUFGLENBTHBCO01BTUEsTUFBQSxFQUFTLENBQUEsQ0FBRSw0QkFBRixDQU5UOztFQUZFOzsrQkFVTixVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1YsUUFBQTtJQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBbkIsR0FBb0M7SUFDcEMsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QjtJQUN2QixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDakIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFP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QkFRWixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQ0U7TUFBQSxTQUFBLEVBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUEzQjs7SUFDRixJQUE2QixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQTdCO01BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBUDs7V0FDQSxhQUFBLEdBQ0U7TUFBQSxNQUFBLEVBQVMsTUFBVDtNQUNBLE1BQUEsRUFDRTtRQUFBLE1BQUEsRUFBUyxJQUFUO09BRkY7O0VBTE87OytCQVNYLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTtxRkFBYyxDQUFFO0VBRFQ7Ozs7R0FoSXNCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb25zZW50UnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDb25zZW50UnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAjbm9uX2NvbnNlbnRfY29uZmlybScgOiAnbm9Db25zZW50J1xuXG4gIG9uQ29uc2VudENoYW5nZTogPT5cbiAgICBpZiBAY29uc2VudEJ1dHRvbi5hbnN3ZXIgaXMgXCJ5ZXNcIlxuICAgICAgQGNsZWFyTWVzc2FnZXMoKVxuICAgIGVsc2VcbiAgICAgIEBzaG93Tm9uQ29uc2VudCgpXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBkZWZhdWx0Q29uc2VudCAgICA6IHQoXCJDb25zZW50UnVuVmlldy5sYWJlbC5kZWZhdWx0X2NvbnNlbnRfcHJvbXB0XCIpXG4gICAgICBjb25maXJtTm9uY29uc2VudCA6IHQoXCJDb25zZW50UnVuVmlldy5sYWJlbC5jb25maXJtX25vbmNvbnNlbnRcIilcbiAgICAgIGNvbmZpcm0gICAgICAgICAgIDogdChcIkNvbnNlbnRSdW5WaWV3LmJ1dHRvbi5jb25maXJtXCIpXG4gICAgICB5ZXMgICAgICAgICAgICAgICA6IHQoXCJDb25zZW50UnVuVmlldy5idXR0b24ueWVzX2NvbnRpbnVlXCIpXG4gICAgICBubyAgICAgICAgICAgICAgICA6IHQoXCJDb25zZW50UnVuVmlldy5idXR0b24ubm9fc3RvcFwiKVxuICAgICAgc2VsZWN0ICAgICAgICAgICAgOiB0KFwiQ29uc2VudFJ1blZpZXcubWVzc2FnZS5zZWxlY3RcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIEBpMThuKClcblxuICAgIEBjb25maXJtZWROb25Db25zZW50ID0gZmFsc2VcbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gIFxuICByZW5kZXI6IC0+XG5cbiAgICBlbnVtZXJhdG9ySGVscCA9IGlmIChAbW9kZWwuZ2V0KFwiZW51bWVyYXRvckhlbHBcIikgfHwgXCJcIikgIT0gXCJcIiB0aGVuIFwiPGJ1dHRvbiBjbGFzcz0nc3VidGVzdF9oZWxwIGNvbW1hbmQnPiN7QHRleHQuaGVscH08L2J1dHRvbj48ZGl2IGNsYXNzPSdlbnVtZXJhdG9yX2hlbHAnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ2VudW1lcmF0b3JIZWxwJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICBzdHVkZW50RGlhbG9nICA9IGlmIChAbW9kZWwuZ2V0KFwic3R1ZGVudERpYWxvZ1wiKSAgfHwgXCJcIikgIT0gXCJcIiB0aGVuIFwiPGRpdiBjbGFzcz0nc3R1ZGVudF9kaWFsb2cnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ3N0dWRlbnREaWFsb2cnfTwvZGl2PlwiIGVsc2UgXCJcIlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxoMj4je0Btb2RlbC5nZXQgJ25hbWUnfTwvaDI+XG4gICAgICAgICAgI3tlbnVtZXJhdG9ySGVscH1cbiAgICAgICAgICAje3N0dWRlbnREaWFsb2d9XG4gICAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgICA8bGFiZWw+I3tAbW9kZWwuZ2V0KCdwcm9tcHQnKSB8fCBAdGV4dC5kZWZhdWx0Q29uc2VudH08L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdub25fY29uc2VudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICA8ZGl2PiN7QHRleHQuY29uZmlybU5vbmNvbnNlbnR9PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGlkPSdub25fY29uc2VudF9jb25maXJtJyBjbGFzcz0nY29tbWFuZCc+I3tAdGV4dC5jb25maXJtfTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2NvbnNlbnQtYnV0dG9uJz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcblxuICAgICAgcHJldmlvdXMgPSAgQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGFuc3dlciA9IHByZXZpb3VzLmNvbnNlbnQgaWYgcHJldmlvdXNcblxuICAgIEBjb25zZW50QnV0dG9uID0gbmV3IEJ1dHRvblZpZXdcbiAgICAgIG9wdGlvbnMgOiBbXG4gICAgICAgIHsgbGFiZWwgOiBAdGV4dC55ZXMsIHZhbHVlIDogXCJ5ZXNcIiB9XG4gICAgICAgIHsgbGFiZWwgOiBAdGV4dC5ubywgIHZhbHVlIDogXCJub1wiIH1cbiAgICAgIF1cbiAgICAgIG1vZGUgICAgICA6IFwic2luZ2xlXCJcbiAgICAgIGRhdGFFbnRyeSA6IGZhbHNlXG4gICAgICBhbnN3ZXIgICAgOiBhbnN3ZXIgb3IgXCJcIlxuICAgIFxuICAgIEBjb25zZW50QnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kKFwiLmNvbnNlbnQtYnV0dG9uXCIpXG4gICAgQGNvbnNlbnRCdXR0b24ub24gXCJjaGFuZ2VcIiwgQG9uQ29uc2VudENoYW5nZVxuICAgIEBjb25zZW50QnV0dG9uLnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgXG4gIGlzVmFsaWQ6IC0+XG4gICAgaWYgQGNvbmZpcm1lZE5vbkNvbnNlbnQgaXMgZmFsc2VcbiAgICAgIGlmIEBjb25zZW50QnV0dG9uLmFuc3dlciBpcyBcInllc1wiXG4gICAgICAgIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIkNvbnNlbnRSdW5JdGVtVmlldyB0ZXN0VmFsaWQuXCIpXG4jICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiAgICBpZiBAaXNWYWxpZD9cbiAgICAgIHJldHVybiBAaXNWYWxpZCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gIHNob3dOb25Db25zZW50OiAtPlxuICAgIEAkZWwuZmluZChcIi5ub25fY29uc2VudF9mb3JtXCIpLnNob3coMjUwKVxuXG4gIGNsZWFyTWVzc2FnZXM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm5vbl9jb25zZW50X2Zvcm1cIikuaGlkZSgyNTApXG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgXCJcIlxuXG4gIG5vQ29uc2VudDogLT5cbiAgICBAY29uZmlybWVkTm9uQ29uc2VudCA9IHRydWVcbiAgICBAcGFyZW50LmFib3J0KClcbiAgICByZXR1cm4gZmFsc2VcbiAgXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmV0dXJuIFwiY29uc2VudFwiIDogXCJza2lwcGVkXCJcbiAgXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgYW5zd2VyID0gQGNvbnNlbnRCdXR0b24uYW5zd2VyIFxuICAgIGlmIGFuc3dlciA9PSBcIm5vXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LmNvbmZpcm1cbiAgICAgIEBzaG93Tm9uQ29uc2VudCgpXG4gICAgZWxzZSBpZiBhbnN3ZXIgPT0gdW5kZWZpbmVkXG4gICAgICAkKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHRleHQuc2VsZWN0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9XG4gICAgICBcImNvbnNlbnRcIiA6IEBjb25zZW50QnV0dG9uLmFuc3dlclxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG5cbiAgb25DbG9zZTogLT5cbiAgICBAY29uc2VudEJ1dHRvbj8uY2xvc2U/KClcbiJdfQ==
