var PrototypeDatetimeView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

PrototypeDatetimeView = (function(_super) {

  __extends(PrototypeDatetimeView, _super);

  function PrototypeDatetimeView() {
    PrototypeDatetimeView.__super__.constructor.apply(this, arguments);
  }

  PrototypeDatetimeView.prototype.className = "datetime";

  PrototypeDatetimeView.prototype.initialize = function(options) {
    this.model = this.options.model;
    return this.parent = this.options.parent;
  };

  PrototypeDatetimeView.prototype.render = function() {
    var dateTime, day, minutes, month, time, year;
    dateTime = new Date();
    year = dateTime.getFullYear();
    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateTime.getMonth()];
    day = dateTime.getDate();
    minutes = dateTime.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    time = dateTime.getHours() + ":" + minutes;
    this.$el.html("      <form>          <table>            <tr>          <td><label for='year'>Year</label><input type name='year' value='" + year + "'></td>          <td><label for='month'>Month</label><input type='month' name='month' value='" + month + "'></td>          <td><label for='day'>Day</label><input type='day' name='day' value='" + day + "'></td>          </tr>          </table>          <label for='time'>Time</label><input type='text' name='time' value='" + time + "'>      </form>      ");
    return this.trigger("rendered");
  };

  PrototypeDatetimeView.prototype.getSum = function() {
    return {
      correct: 1,
      incorrect: 0,
      missing: 0,
      total: 1
    };
  };

  PrototypeDatetimeView.prototype.isValid = function() {
    return true;
  };

  return PrototypeDatetimeView;

})(Backbone.View);
