var IdRunItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdRunItemView = (function(superClass) {
  extend(IdRunItemView, superClass);

  function IdRunItemView() {
    return IdRunItemView.__super__.constructor.apply(this, arguments);
  }

  IdRunItemView.prototype.template = JST["ItemView"];

  IdRunItemView.prototype.className = "idItem";

  IdRunItemView.prototype.events = {
    'click #generate': 'generate',
    'change #participant_id': 'setValidator'
  };

  IdRunItemView.prototype.i18n = function() {
    return this.text = {
      identifier: t("IdRunView.label.identifier"),
      generate: t("IdRunView.button.generate"),
      "help": t("SubtestRunView.button.help")
    };
  };

  IdRunItemView.prototype.initialize = function(options) {
    var labels;
    this.i18n();
    this.model = options.model;
    this.parent = this.model.parent;
    this.dataEntry = options.dataEntry;
    this.validator = new CheckDigit;
    Tangerine.progress.currentSubview = this;
    labels = {};
    labels.text = this.text;
    this.model.set('labels', labels);
    this.skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    this.parent.displaySkip(this.skippable);
    return this.parent.displayBack(this.backable);
  };

  IdRunItemView.prototype.render = function() {
    var participantId, previous;
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        participantId = previous.participant_id;
      }
    }
    this.$el.html("<form> <label for='participant_id'>" + this.text.identifier + "</label> <input id='participant_id' name='participant_id' value='" + (participantId || '') + "'> <button id='generate' class='command'>" + this.text.generate + "</button> <div class='messages'></div> </form>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  IdRunItemView.prototype.getResult = function() {
    var hash, result, subtestResult;
    result = {
      'participant_id': this.$el.find("#participant_id").val()
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

  IdRunItemView.prototype.getSkipped = function() {
    return {
      'participant_id': "skipped"
    };
  };

  IdRunItemView.prototype.setValidator = function() {
    return this.validator.set(this.getResult()['body']['participant_id']);
  };

  IdRunItemView.prototype.isValid = function() {
    this.setValidator();
    if (!this.validator.isValid()) {
      return false;
    }
    return this.updateNavigation();
  };

  IdRunItemView.prototype.testValid = function() {
    if (this.isValid != null) {
      return this.isValid();
    } else {
      return false;
    }
    return true;
  };

  IdRunItemView.prototype.showErrors = function() {
    return this.$el.find(".messages").html(this.validator.getErrors().join(", "));
  };

  IdRunItemView.prototype.generate = function() {
    this.$el.find(".messages").empty();
    this.$el.find('#participant_id').val(this.validator.generate());
    return false;
  };

  IdRunItemView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.getResult()['body']['participant_id']);
  };

  IdRunItemView.prototype.getSum = function() {
    console.log("This view does not return a sum, correct?");
    return {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
  };

  return IdRunItemView;

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0lkUnVuSXRlbVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7Ozs7OzswQkFDSixRQUFBLEdBQVUsR0FBSSxDQUFBLFVBQUE7OzBCQUVkLFNBQUEsR0FBVzs7MEJBRVgsTUFBQSxHQUNFO0lBQUEsaUJBQUEsRUFBMkIsVUFBM0I7SUFDQSx3QkFBQSxFQUEyQixjQUQzQjs7OzBCQUdGLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLFVBQUEsRUFBYSxDQUFBLENBQUUsNEJBQUYsQ0FBYjtNQUNBLFFBQUEsRUFBYSxDQUFBLENBQUUsMkJBQUYsQ0FEYjtNQUVBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FGVDs7RUFGRTs7MEJBTU4sVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUlWLFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0lBRXJCLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSTtJQUNqQixTQUFTLENBQUMsUUFBUSxDQUFDLGNBQW5CLEdBQW9DO0lBQ3BDLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBO0lBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxFQUFxQixNQUFyQjtJQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLEtBQTJCLElBQTNCLElBQW1DLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxLQUEyQjtJQUMzRSxJQUFDLENBQUEs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LElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFBLENBQWpDO1dBQ0E7RUFIUTs7MEJBS1YsZ0JBQUEsR0FBa0IsU0FBQTtXQUNoQixTQUFTLENBQUMsR0FBRyxDQUFDLFVBQWQsQ0FBeUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFhLENBQUEsTUFBQSxDQUFRLENBQUEsZ0JBQUEsQ0FBOUM7RUFEZ0I7OzBCQUdsQixNQUFBLEdBQVEsU0FBQTtJQUtOLE9BQU8sQ0FBQyxHQUFSLENBQVksMkNBQVo7QUFDQSxXQUFPO01BQUMsT0FBQSxFQUFRLENBQVQ7TUFBVyxTQUFBLEVBQVUsQ0FBckI7TUFBdUIsT0FBQSxFQUFRLENBQS9CO01BQWlDLEtBQUEsRUFBTSxDQUF2Qzs7RUFORDs7OztHQTdGa0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9JZFJ1bkl0ZW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSWRSdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuSXRlbVZpZXdcbiAgdGVtcGxhdGU6IEpTVFtcIkl0ZW1WaWV3XCJdLFxuXG4gIGNsYXNzTmFtZTogXCJpZEl0ZW1cIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgI2dlbmVyYXRlJyAgICAgICAgOiAnZ2VuZXJhdGUnXG4gICAgJ2NoYW5nZSAjcGFydGljaXBhbnRfaWQnIDogJ3NldFZhbGlkYXRvcidcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIGlkZW50aWZpZXIgOiB0KFwiSWRSdW5WaWV3LmxhYmVsLmlkZW50aWZpZXJcIilcbiAgICAgIGdlbmVyYXRlICAgOiB0KFwiSWRSdW5WaWV3LmJ1dHRvbi5nZW5lcmF0ZVwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuIyAgICBjb25zb2xlLmxvZyBvcHRpb25zXG5cbiAgICBAaTE4bigpXG5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBAbW9kZWwucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cbiAgICBAdmFsaWRhdG9yID0gbmV3IENoZWNrRGlnaXRcbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICBpZiBwcmV2aW91c1xuICAgICAgICBwYXJ0aWNpcGFudElkID0gcHJldmlvdXMucGFydGljaXBhbnRfaWRcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgIDxmb3JtPlxuICAgICAgPGxhYmVsIGZvcj0ncGFydGljaXBhbnRfaWQnPiN7QHRleHQuaWRlbnRpZmllcn08L2xhYmVsPlxuICAgICAgPGlucHV0IGlkPSdwYXJ0aWNpcGFudF9pZCcgbmFtZT0ncGFydGljaXBhbnRfaWQnIHZhbHVlPScje3BhcnRpY2lwYW50SWR8fCcnfSc+XG4gICAgICA8YnV0dG9uIGlkPSdnZW5lcmF0ZScgY2xhc3M9J2NvbW1hbmQnPiN7QHRleHQuZ2VuZXJhdGV9PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPSdtZXNzYWdlcyc+PC9kaXY+XG4gICAgPC9mb3JtPlwiXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9ICB7ICdwYXJ0aWNpcGFudF9pZCcgOiBAJGVsLmZpbmQoXCIjcGFydGljaXBhbnRfaWRcIikudmFsKCkgfVxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4geyAncGFydGljaXBhbnRfaWQnIDogXCJza2lwcGVkXCIgfVxuXG4gIHNldFZhbGlkYXRvcjogLT5cbiAgICBAdmFsaWRhdG9yLnNldCBAZ2V0UmVzdWx0KClbJ2JvZHknXVsncGFydGljaXBhbnRfaWQnXVxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgQHNldFZhbGlkYXRvcigpXG4gICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBAdmFsaWRhdG9yLmlzVmFsaWQoKVxuICAgIEB1cGRhdGVOYXZpZ2F0aW9uKClcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiSWRSaW5JdGVtVmlldyB0ZXN0VmFsaWQuXCIpXG4jICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiAgICBpZiBAaXNWYWxpZD9cbiAgICAgIHJldHVybiBAaXNWYWxpZCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHZhbGlkYXRvci5nZXRFcnJvcnMoKS5qb2luKFwiLCBcIilcblxuICBnZW5lcmF0ZTogLT5cbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZXNcIikuZW1wdHkoKVxuICAgIEAkZWwuZmluZCgnI3BhcnRpY2lwYW50X2lkJykudmFsIEB2YWxpZGF0b3IuZ2VuZXJhdGUoKVxuICAgIGZhbHNlXG5cbiAgdXBkYXRlTmF2aWdhdGlvbjogLT5cbiAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQGdldFJlc3VsdCgpWydib2R5J11bJ3BhcnRpY2lwYW50X2lkJ11cblxuICBnZXRTdW06IC0+XG4jICAgIGlmIEBwcm90b3R5cGVWaWV3LmdldFN1bT9cbiMgICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuZ2V0U3VtKClcbiMgICAgZWxzZVxuIyBtYXliZSBhIGJldHRlciBmYWxsYmFja1xuICAgIGNvbnNvbGUubG9nKFwiVGhpcyB2aWV3IGRvZXMgbm90IHJldHVybiBhIHN1bSwgY29ycmVjdD9cIilcbiAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cbiJdfQ==
