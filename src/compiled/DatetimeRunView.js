var DatetimeRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DatetimeRunView = (function(superClass) {
  extend(DatetimeRunView, superClass);

  function DatetimeRunView() {
    return DatetimeRunView.__super__.constructor.apply(this, arguments);
  }

  DatetimeRunView.prototype.className = "datetime";

  DatetimeRunView.prototype.i18n = function() {
    return this.text = {
      year: t("DatetimeRunView.label.year"),
      month: t("DatetimeRunView.label.month"),
      day: t("DatetimeRunView.label.day"),
      time: t("DatetimeRunView.label.time")
    };
  };

  DatetimeRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  DatetimeRunView.prototype.render = function() {
    var dateTime, day, m, minutes, month, months, previous, time, year;
    dateTime = new Date();
    year = dateTime.getFullYear();
    months = [t("jan"), t("feb"), t("mar"), t("apr"), t("may"), t("jun"), t("jul"), t("aug"), t("sep"), t("oct"), t("nov"), t("dec")];
    month = months[dateTime.getMonth()];
    day = dateTime.getDate();
    minutes = dateTime.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    time = dateTime.getHours() + ":" + minutes;
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        year = previous.year;
        month = previous.month;
        day = previous.day;
        time = previous.time;
      }
    }
    this.$el.html("<div class='question'> <table> <tr> <td><label for='year'>" + this.text.year + "</label><input id='year' value='" + year + "'></td> <td> <label for='month'>" + this.text.month + "</label><br> <select id='month' value='" + month + "'>" + (((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = months.length; i < len; i++) {
        m = months[i];
        results.push("<option value='" + m + "' " + ((m === month ? "selected='selected'" : void 0) || '') + ">" + (m.titleize()) + " </option>");
      }
      return results;
    })()).join('')) + "</select> </td> <td><label for='day'>" + this.text.day + "</label><input id='day' type='day' value='" + day + "'></td> </tr> <tr> <td><label for='time'>" + this.text.time + "</label><br><input type='text' id='time' value='" + time + "'></td> </tr> </table> </div>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  DatetimeRunView.prototype.getResult = function() {
    return {
      "year": this.$el.find("#year").val(),
      "month": this.$el.find("#month").val(),
      "day": this.$el.find("#day").val(),
      "time": this.$el.find("#time").val()
    };
  };

  DatetimeRunView.prototype.getSkipped = function() {
    return {
      "year": "skipped",
      "month": "skipped",
      "day": "skipped",
      "time": "skipped"
    };
  };

  DatetimeRunView.prototype.isValid = function() {
    return true;
  };

  DatetimeRunView.prototype.showErrors = function() {
    return true;
  };

  DatetimeRunView.prototype.next = function() {
    console.log("next!!");
    this.prototypeView.on("click .next", (function(_this) {
      return function() {
        console.log("clickme!");
        return _this.next();
      };
    })(this));
    return this.parent.next();
  };

  DatetimeRunView.prototype.back = function() {
    return this.parent.back();
  };

  return DatetimeRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0RhdGV0aW1lUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzRCQUVKLFNBQUEsR0FBVzs7NEJBRVgsSUFBQSxHQUFNLFNBQUE7V0FFSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsSUFBQSxFQUFPLENBQUEsQ0FBRSw0QkFBRixDQUFQO01BQ0EsS0FBQSxFQUFRLENBQUEsQ0FBRSw2QkFBRixDQURSO01BRUEsR0FBQSxFQUFNLENBQUEsQ0FBRSwyQkFBRixDQUZOO01BR0EsSUFBQSxFQUFPLENBQUEsQ0FBRSw0QkFBRixDQUhQOztFQUhFOzs0QkFRTixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxLQUFELEdBQVUsT0FBTyxDQUFDO0lBQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO1dBQ2xCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0VBTlg7OzRCQVFaLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLFFBQUEsR0FBZSxJQUFBLElBQUEsQ0FBQTtJQUNmLElBQUEsR0FBVyxRQUFRLENBQUMsV0FBVCxDQUFBO0lBQ1gsTUFBQSxHQUFXLENBQUMsQ0FBQSxDQUFFLEtBQUYsQ0FBRCxFQUFVLENBQUEsQ0FBRSxLQUFGLENBQVYsRUFBbUIsQ0FBQSxDQUFFLEtBQUYsQ0FBbkIsRUFBNEIsQ0FBQSxDQUFFLEtBQUYsQ0FBNUIsRUFBcUMsQ0FBQSxDQUFFLEtBQUYsQ0FBckMsRUFBOEMsQ0FBQSxDQUFFLEtBQUYsQ0FBOUMsRUFBdUQsQ0FBQSxDQUFFLEtBQUYsQ0FBdkQsRUFBZ0UsQ0FBQSxDQUFFLEtBQUYsQ0FBaEUsRUFBeUUsQ0FBQSxDQUFFLEtBQUYsQ0FBekUsRUFBa0YsQ0FBQSxDQUFFLEtBQUYsQ0FBbEYsRUFBMkYsQ0FBQSxD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QUFhLENBQUMsRUFBZixDQUFrQixhQUFsQixFQUFvQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDbEMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaO2VBQ0EsS0FBSSxDQUFDLElBQUwsQ0FBQTtNQUZrQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEM7V0FHQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtFQUxJOzs0QkFNTixJQUFBLEdBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFBO0VBQUg7Ozs7R0F6RnNCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9EYXRldGltZVJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEYXRldGltZVJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcImRhdGV0aW1lXCJcblxuICBpMThuOiAtPlxuXG4gICAgQHRleHQgPVxuICAgICAgeWVhciA6IHQoXCJEYXRldGltZVJ1blZpZXcubGFiZWwueWVhclwiKVxuICAgICAgbW9udGggOiB0KFwiRGF0ZXRpbWVSdW5WaWV3LmxhYmVsLm1vbnRoXCIpXG4gICAgICBkYXkgOiB0KFwiRGF0ZXRpbWVSdW5WaWV3LmxhYmVsLmRheVwiKVxuICAgICAgdGltZSA6IHQoXCJEYXRldGltZVJ1blZpZXcubGFiZWwudGltZVwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICByZW5kZXI6IC0+XG4gICAgZGF0ZVRpbWUgPSBuZXcgRGF0ZSgpXG4gICAgeWVhciAgICAgPSBkYXRlVGltZS5nZXRGdWxsWWVhcigpXG4gICAgbW9udGhzICAgPSBbdChcImphblwiKSx0KFwiZmViXCIpLHQoXCJtYXJcIiksdChcImFwclwiKSx0KFwibWF5XCIpLHQoXCJqdW5cIiksdChcImp1bFwiKSx0KFwiYXVnXCIpLHQoXCJzZXBcIiksdChcIm9jdFwiKSx0KFwibm92XCIpLHQoXCJkZWNcIildXG4gICAgbW9udGggICAgPSBtb250aHNbZGF0ZVRpbWUuZ2V0TW9udGgoKV1cbiAgICBkYXkgICAgICA9IGRhdGVUaW1lLmdldERhdGUoKVxuICAgIG1pbnV0ZXMgID0gZGF0ZVRpbWUuZ2V0TWludXRlcygpXG4gICAgbWludXRlcyAgPSBcIjBcIiArIG1pbnV0ZXMgaWYgbWludXRlcyA8IDEwXG4gICAgdGltZSAgICAgPSBkYXRlVGltZS5nZXRIb3VycygpICsgXCI6XCIgKyBtaW51dGVzXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuXG5cbiAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgIHllYXIgID0gcHJldmlvdXMueWVhclxuICAgICAgICBtb250aCA9IHByZXZpb3VzLm1vbnRoXG4gICAgICAgIGRheSAgID0gcHJldmlvdXMuZGF5XG4gICAgICAgIHRpbWUgID0gcHJldmlvdXMudGltZVxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdxdWVzdGlvbic+XG4gICAgICAgIDx0YWJsZT5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PGxhYmVsIGZvcj0neWVhcic+I3tAdGV4dC55ZWFyfTwvbGFiZWw+PGlucHV0IGlkPSd5ZWFyJyB2YWx1ZT0nI3t5ZWFyfSc+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGxhYmVsIGZvcj0nbW9udGgnPiN7QHRleHQubW9udGh9PC9sYWJlbD48YnI+XG4gICAgICAgICAgICAgIDxzZWxlY3QgaWQ9J21vbnRoJyB2YWx1ZT0nI3ttb250aH0nPiN7KFwiPG9wdGlvbiB2YWx1ZT0nI3ttfScgI3soXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgaWYgbSBpcyBtb250aCkgfHwgJyd9PiN7bS50aXRsZWl6ZSgpfSA8L29wdGlvbj5cIiBmb3IgbSBpbiBtb250aHMpLmpvaW4oJycpfTwvc2VsZWN0PlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPSdkYXknPiN7QHRleHQuZGF5fTwvbGFiZWw+PGlucHV0IGlkPSdkYXknIHR5cGU9J2RheScgdmFsdWU9JyN7ZGF5fSc+PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPSd0aW1lJz4je0B0ZXh0LnRpbWV9PC9sYWJlbD48YnI+PGlucHV0IHR5cGU9J3RleHQnIGlkPSd0aW1lJyB2YWx1ZT0nI3t0aW1lfSc+PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9kaXY+XG4gICAgICBcIlxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXR1cm4ge1xuICAgICAgXCJ5ZWFyXCIgIDogQCRlbC5maW5kKFwiI3llYXJcIikudmFsKClcbiAgICAgIFwibW9udGhcIiA6IEAkZWwuZmluZChcIiNtb250aFwiKS52YWwoKVxuICAgICAgXCJkYXlcIiAgIDogQCRlbC5maW5kKFwiI2RheVwiKS52YWwoKVxuICAgICAgXCJ0aW1lXCIgIDogQCRlbC5maW5kKFwiI3RpbWVcIikudmFsKClcbiAgICB9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4ge1xuICAgICAgXCJ5ZWFyXCIgIDogXCJza2lwcGVkXCJcbiAgICAgIFwibW9udGhcIiA6IFwic2tpcHBlZFwiXG4gICAgICBcImRheVwiICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJ0aW1lXCIgIDogXCJza2lwcGVkXCJcbiAgICB9XG5cbiAgaXNWYWxpZDogLT5cbiAgICB0cnVlXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICB0cnVlXG5cbiAgbmV4dDogLT5cbiAgICBjb25zb2xlLmxvZyhcIm5leHQhIVwiKVxuICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwiY2xpY2sgLm5leHRcIiwgICAgPT5cbiAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2ttZSFcIilcbiAgICAgIHRoaXMubmV4dCgpXG4gICAgQHBhcmVudC5uZXh0KClcbiAgYmFjazogLT4gQHBhcmVudC5iYWNrKClcbiJdfQ==
