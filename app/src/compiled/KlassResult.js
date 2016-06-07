var KlassResult,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassResult = (function(superClass) {
  extend(KlassResult, superClass);

  function KlassResult() {
    return KlassResult.__super__.constructor.apply(this, arguments);
  }

  KlassResult.prototype.url = "result";

  KlassResult.prototype.add = function(subtestDataElement, callback) {
    return this.save({
      'subtestData': subtestDataElement
    }, {
      success: (function(_this) {
        return function() {
          return callback();
        };
      })(this)
    });
  };

  KlassResult.prototype.getItemized = function(options) {
    var itemized, key, ref, value;
    if (this.attributes.prototype === "grid") {
      itemized = this.attributes.subtestData.items;
    } else if (this.attributes.prototype === "survey") {
      itemized = [];
      ref = this.attributes.subtestData;
      for (key in ref) {
        value = ref[key];
        itemized.push({
          itemLabel: key,
          itemResult: value
        });
      }
    }
    return itemized;
  };

  KlassResult.prototype.get = function(options) {
    if (options === "correct") {
      return this.gridCount(["correct", 1]);
    }
    if (options === "incorrect") {
      return this.gridCount(["incorrect", 0]);
    }
    if (options === "missing") {
      return this.gridCount(["missing", 9]);
    }
    if (options === "total") {
      if (this.attributes.prototype === "grid") {
        return this.attributes.subtestData.items.length;
      } else if (this.attributes.prototype === "survey") {
        return _.keys(this.attributes.subtestData).length;
      }
    }
    if (options === "attempted") {
      return this.getAttempted();
    }
    if (options === "time_remain") {
      return this.getTimeRemain();
    }
    return KlassResult.__super__.get.call(this, options);
  };

  KlassResult.prototype.gridCount = function(value) {
    var count, i, item, j, k, len, len1, ref, ref1, ref2, ref3, v;
    count = 0;
    if (this.attributes.prototype === "grid") {
      if (_.isArray(value)) {
        ref = this.get("subtestData").items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (~value.indexOf(item.itemResult)) {
            count++;
          }
        }
      } else {
        ref1 = this.get("subtestData").items;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          item = ref1[j];
          if (item.itemResult === value) {
            count++;
          }
        }
      }
    } else if (this.attributes.prototype === "survey") {
      if (_.isArray(value)) {
        ref2 = this.attributes.subtestData;
        for (k in ref2) {
          v = ref2[k];
          if (~value.indexOf(v) || ~value.indexOf(parseInt(v))) {
            count++;
          }
        }
      } else {
        ref3 = this.attributes.subtestData;
        for (k in ref3) {
          v = ref3[k];
          if (value === v || value === parseInt(v)) {
            count++;
          }
        }
      }
    }
    return count;
  };

  KlassResult.prototype.getAttempted = function() {
    return parseInt(this.get("subtestData").attempted);
  };

  KlassResult.prototype.getTimeRemain = function() {
    return parseInt(this.get("subtestData").time_remain);
  };

  KlassResult.prototype.getCorrectPerSeconds = function(secondsAllowed) {
    return Math.round((this.get("correct") / (secondsAllowed - this.getTimeRemain())) * secondsAllowed);
  };

  return KlassResult;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NSZXN1bHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt3QkFFSixHQUFBLEdBQU07O3dCQUVOLEdBQUEsR0FBSyxTQUFFLGtCQUFGLEVBQXNCLFFBQXRCO1dBQ0gsSUFBQyxDQUFBLElBQUQsQ0FDRTtNQUFBLGFBQUEsRUFBZ0Isa0JBQWhCO0tBREYsRUFHRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsUUFBQSxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FIRjtFQURHOzt3QkFNTCxXQUFBLEdBQWEsU0FBQyxPQUFEO0FBRVgsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLEtBQXlCLE1BQTVCO01BQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBVyxDQUFDLE1BRHJDO0tBQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixRQUE1QjtNQUNILFFBQUEsR0FBVztBQUNYO0FBQUEsV0FBQSxVQUFBOztRQUNFLFFBQVEsQ0FBQyxJQUFULENBQ0U7VUFBQSxTQUFBLEVBQVcsR0FBWDtVQUNBLFVBQUEsRUFBWSxLQURaO1NBREY7QUFERixPQUZHOztBQU9MLFdBQU87RUFYSTs7d0JBYWIsR0FBQSxHQUFLLFNBQUMsT0FBRDtJQUNILElBQUcsT0FBQSxLQUFXLFNBQWQ7QUFBaUMsYUFBTyxJQUFDLENBQUEsU0FBRCxDQUFXLENBQUMsU0FBRCxFQUFZLENBQVosQ0FBWCxFQUF4Qzs7SUFDQSxJQUFHLE9BQUEsS0FBVyxXQUFkO0FBQWlDLGFBQU8sSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFDLFdBQUQsRUFBYyxDQUFkLENBQVgsRUFBeEM7O0lBQ0EsSUFBRyxPQUFBLEtBQVcsU0FBZDtBQUFpQyxhQUFPLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBQyxTQUFELEVBQVksQ0FBWixDQUFYLEVBQXhDOztJQUVBLElBQUcsT0FBQSxLQUFXLE9BQWQ7TUFDRSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixNQUE1QjtBQUNFLGVBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BRHZDO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixRQUE1QjtBQUNILGVBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsVUFBVSxDQUFDLFdBQW5CLENBQStCLENBQUMsT0FEcEM7T0FIUDs7SUFNQSxJQUFHLE9BQUEsS0FBVyxXQUFkO0FBQWlDLGFBQU8sSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQUF4Qzs7SUFDQSxJQUFHLE9BQUEsS0FBVyxhQUFkO0FBQWlDLGFBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUF4Qzs7V0FLQSxxQ0FBTSxPQUFOO0VBakJHOzt3QkFtQkwsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixNQUE1QjtNQUNFLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQUg7QUFDRTtBQUFBLGFBQUEscUNBQUE7O1VBQUMsSUFBVyxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBSSxDQUFDLFVBQW5CLENBQVo7WUFBQSxLQUFBLEdBQUE7O0FBQUQsU0FERjtPQUFBLE1BQUE7QUFHRTtBQUFBLGFBQUEsd0NBQUE7O1VBQUMsSUFBVyxJQUFJLENBQUMsVUFBTCxLQUFtQixLQUE5QjtZQUFBLEtBQUEsR0FBQTs7QUFBRCxTQUhGO09BREY7S0FBQSxNQUtLLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLEtBQXlCLFFBQTVCO01BQ0gsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBSDtBQUNFO0FBQUEsYUFBQSxTQUFBOztVQUNFLElBQVksQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBRCxJQUFxQixDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBQSxDQUFTLENBQVQsQ0FBZCxDQUFsQztZQUFBLEtBQUEsR0FBQTs7QUFERixTQURGO09BQUEsTUFBQTtBQUlFO0FBQUEsYUFBQSxTQUFBOztVQUNFLElBQVksS0FBQSxLQUFTLENBQVQsSUFBYyxLQUFBLEtBQVMsUUFBQSxDQUFTLENBQVQsQ0FBbkM7WUFBQSxLQUFBLEdBQUE7O0FBREYsU0FKRjtPQURHOztBQVFMLFdBQU87RUFmRTs7d0JBaUJYLFlBQUEsR0FBYyxTQUFBO0FBQ1osV0FBTyxRQUFBLENBQVUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLENBQW1CLENBQUMsU0FBOUI7RUFESzs7d0JBR2QsYUFBQSxHQUFlLFNBQUE7QUFDYixXQUFPLFFBQUEsQ0FBVSxJQUFDLENBQUEsR0FBRCxDQUFLLGFBQUwsQ0FBbUIsQ0FBQyxXQUE5QjtFQURNOzt3QkFHZixvQkFBQSxHQUFzQixTQUFFLGNBQUY7V0FDcEIsSUFBSSxDQUFDLEtBQUwsQ0FBWSxDQUFFLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxDQUFBLEdBQWtCLENBQUUsY0FBQSxHQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQW5CLENBQXBCLENBQUEsR0FBOEQsY0FBMUU7RUFEb0I7Ozs7R0FqRUUsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMva2xhc3MvS2xhc3NSZXN1bHQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc1Jlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cbiAgdXJsIDogXCJyZXN1bHRcIlxuXG4gIGFkZDogKCBzdWJ0ZXN0RGF0YUVsZW1lbnQsIGNhbGxiYWNrICkgLT5cbiAgICBAc2F2ZVxuICAgICAgJ3N1YnRlc3REYXRhJyA6IHN1YnRlc3REYXRhRWxlbWVudFxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+IGNhbGxiYWNrKClcblxuICBnZXRJdGVtaXplZDogKG9wdGlvbnMpIC0+XG4gIFxuICAgIGlmIEBhdHRyaWJ1dGVzLnByb3RvdHlwZSA9PSBcImdyaWRcIlxuICAgICAgaXRlbWl6ZWQgPSBAYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YS5pdGVtc1xuICAgIGVsc2UgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwic3VydmV5XCJcbiAgICAgIGl0ZW1pemVkID0gW11cbiAgICAgIGZvciBrZXksIHZhbHVlIG9mIEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhXG4gICAgICAgIGl0ZW1pemVkLnB1c2hcbiAgICAgICAgICBpdGVtTGFiZWw6IGtleVxuICAgICAgICAgIGl0ZW1SZXN1bHQ6IHZhbHVlXG5cbiAgICByZXR1cm4gaXRlbWl6ZWRcblxuICBnZXQ6IChvcHRpb25zKSAtPlxuICAgIGlmIG9wdGlvbnMgPT0gXCJjb3JyZWN0XCIgICAgIHRoZW4gcmV0dXJuIEBncmlkQ291bnQgW1wiY29ycmVjdFwiLCAxXVxuICAgIGlmIG9wdGlvbnMgPT0gXCJpbmNvcnJlY3RcIiAgIHRoZW4gcmV0dXJuIEBncmlkQ291bnQgW1wiaW5jb3JyZWN0XCIsIDBdXG4gICAgaWYgb3B0aW9ucyA9PSBcIm1pc3NpbmdcIiAgICAgdGhlbiByZXR1cm4gQGdyaWRDb3VudCBbXCJtaXNzaW5nXCIsIDldXG5cbiAgICBpZiBvcHRpb25zID09IFwidG90YWxcIlxuICAgICAgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwiZ3JpZFwiXG4gICAgICAgIHJldHVybiBAYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YS5pdGVtcy5sZW5ndGhcbiAgICAgIGVsc2UgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwic3VydmV5XCJcbiAgICAgICAgcmV0dXJuIF8ua2V5cyhAYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YSkubGVuZ3RoXG4gICAgXG4gICAgaWYgb3B0aW9ucyA9PSBcImF0dGVtcHRlZFwiICAgdGhlbiByZXR1cm4gQGdldEF0dGVtcHRlZCgpXG4gICAgaWYgb3B0aW9ucyA9PSBcInRpbWVfcmVtYWluXCIgdGhlbiByZXR1cm4gQGdldFRpbWVSZW1haW4oKVxuXG4gICAgIyBpZiBubyBzcGVjaWFsIHByb3BlcnRpZXMgZGV0ZWN0ZWQgbGV0J3MgZ28gd2l0aCBzdXBlclxuICAgICMgcmVzdWx0ID0gS2xhc3NSZXN1bHQuX19zdXBlcl9fLmdldC5hcHBseSBALCBhcmd1bWVudHNcblxuICAgIHN1cGVyKG9wdGlvbnMpXG5cbiAgZ3JpZENvdW50OiAodmFsdWUpIC0+XG4gICAgY291bnQgPSAwXG4gICAgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwiZ3JpZFwiXG4gICAgICBpZiBfLmlzQXJyYXkodmFsdWUpXG4gICAgICAgIChjb3VudCsrIGlmIH52YWx1ZS5pbmRleE9mKGl0ZW0uaXRlbVJlc3VsdCkpIGZvciBpdGVtIGluIEBnZXQoXCJzdWJ0ZXN0RGF0YVwiKS5pdGVtcyAgIFxuICAgICAgZWxzZVxuICAgICAgICAoY291bnQrKyBpZiBpdGVtLml0ZW1SZXN1bHQgPT0gdmFsdWUpIGZvciBpdGVtIGluIEBnZXQoXCJzdWJ0ZXN0RGF0YVwiKS5pdGVtcyBcbiAgICBlbHNlIGlmIEBhdHRyaWJ1dGVzLnByb3RvdHlwZSA9PSBcInN1cnZleVwiXG4gICAgICBpZiBfLmlzQXJyYXkodmFsdWUpXG4gICAgICAgIGZvciBrLCB2IG9mIEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhXG4gICAgICAgICAgY291bnQrKyBpZiAofnZhbHVlLmluZGV4T2YodikgfHwgfnZhbHVlLmluZGV4T2YocGFyc2VJbnQodikpKVxuICAgICAgZWxzZVxuICAgICAgICBmb3IgaywgdiBvZiBAYXR0cmlidXRlcy5zdWJ0ZXN0RGF0YVxuICAgICAgICAgIGNvdW50KysgaWYgKHZhbHVlID09IHYgfHwgdmFsdWUgPT0gcGFyc2VJbnQodikpXG4gICAgICAgICAgICBcbiAgICByZXR1cm4gY291bnRcblxuICBnZXRBdHRlbXB0ZWQ6IC0+XG4gICAgcmV0dXJuIHBhcnNlSW50KCBAZ2V0KFwic3VidGVzdERhdGFcIikuYXR0ZW1wdGVkIClcblxuICBnZXRUaW1lUmVtYWluOiAtPlxuICAgIHJldHVybiBwYXJzZUludCggQGdldChcInN1YnRlc3REYXRhXCIpLnRpbWVfcmVtYWluIClcblxuICBnZXRDb3JyZWN0UGVyU2Vjb25kczogKCBzZWNvbmRzQWxsb3dlZCApIC0+XG4gICAgTWF0aC5yb3VuZCggKCBAZ2V0KFwiY29ycmVjdFwiKSAvICggc2Vjb25kc0FsbG93ZWQgLSBAZ2V0VGltZVJlbWFpbigpICkgKSAqIHNlY29uZHNBbGxvd2VkIClcbiJdfQ==
