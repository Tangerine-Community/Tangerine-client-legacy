var GpsRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GpsRunView = (function(superClass) {
  extend(GpsRunView, superClass);

  function GpsRunView() {
    this.poll = bind(this.poll, this);
    return GpsRunView.__super__.constructor.apply(this, arguments);
  }

  GpsRunView.prototype.className = "GpsRunView";

  GpsRunView.prototype.events = {
    'click .clear': 'clear'
  };

  GpsRunView.prototype.clear = function() {
    this.position = null;
    return this.updateDisplay();
  };

  GpsRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.position = null;
    return this.retryCount = 0;
  };

  GpsRunView.prototype.i18n = function() {
    return this.text = {
      "clear": t('GpsRunView.button.clear'),
      "good": t('GpsRunView.label.good'),
      "ok": t('GpsRunView.label.ok'),
      "poor": t('GpsRunView.label.poor'),
      "latitude": t('GpsRunView.label.latitude'),
      "longitude": t('GpsRunView.label.longitude'),
      "accuracy": t('GpsRunView.label.accuracy'),
      "meters": t('GpsRunView.label.meters'),
      "savedReading": t('GpsRunView.label.saved_reading'),
      "currentReading": t('GpsRunView.label.current_reading'),
      "bestReading": t('GpsRunView.label.best_reading'),
      "gpsStatus": t('GpsRunView.label.gps_status'),
      "gpsOk": t('GpsRunView.message.gps_ok'),
      "retrying": t('GpsRunView.message.retrying'),
      "searching": t('GpsRunView.message.searching'),
      "notSupported": _(t('GpsRunView.message.not_supported')).escape()
    };
  };

  GpsRunView.prototype.poll = function() {
    return navigator.geolocation.getCurrentPosition((function(_this) {
      return function(position) {
        _this.updateDisplay(position);
        _this.updatePosition(position);
        _this.updateStatus(_this.text.gpsOk);
        _this.retryCount = 0;
        if (!_this.stopPolling) {
          return setTimeout(_this.poll(), 5 * 1000);
        }
      };
    })(this), (function(_this) {
      return function(positionError) {
        _this.updateStatus(positionError.message);
        if (!_this.stopPolling) {
          setTimeout(_this.poll(), 5 * 1000);
        }
        return _this.retryCount++;
      };
    })(this), {
      maximumAge: 10 * 1000,
      timeout: 30 * 1000,
      enableHighAccuracy: true
    });
  };

  GpsRunView.prototype.easify = function(position) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6;
    return {
      lat: (position != null ? (ref = position.coords) != null ? ref.latitude : void 0 : void 0) != null ? position.coords.latitude : "...",
      long: (position != null ? (ref1 = position.coords) != null ? ref1.longitude : void 0 : void 0) != null ? position.coords.longitude : "...",
      alt: (position != null ? (ref2 = position.coords) != null ? ref2.altitude : void 0 : void 0) != null ? position.coords.altitude : "...",
      acc: (position != null ? (ref3 = position.coords) != null ? ref3.accuracy : void 0 : void 0) != null ? position.coords.accuracy : "...",
      altAcc: (position != null ? (ref4 = position.coords) != null ? ref4.altitudeAccuracy : void 0 : void 0) != null ? position.coords.altitudeAccuracy : "...",
      heading: (position != null ? (ref5 = position.coords) != null ? ref5.heading : void 0 : void 0) != null ? position.coords.heading : "...",
      speed: (position != null ? (ref6 = position.coords) != null ? ref6.speed : void 0 : void 0) != null ? position.coords.speed : "...",
      timestamp: (position != null ? position.timestamp : void 0) != null ? position.timestamp : "..."
    };
  };

  GpsRunView.prototype.updatePosition = function(newPosition) {
    var ref;
    newPosition = this.easify(newPosition);
    if (this.position == null) {
      this.position = newPosition;
    }
    if ((((newPosition != null ? newPosition.acc : void 0) != null) && (((ref = this.position) != null ? ref.acc : void 0) != null)) && newPosition.acc <= this.position.acc) {
      return this.position = newPosition;
    }
  };

  GpsRunView.prototype.updateDisplay = function(position) {
    var acc, data, el, html, i, j, lat, len, long, pos, positions, results;
    position = this.easify(position);
    positions = [
      {
        el: this.$el.find(".gps_current"),
        data: position
      }, {
        el: this.$el.find(".gps_best"),
        data: this.position
      }
    ];
    results = [];
    for (i = j = 0, len = positions.length; j < len; i = ++j) {
      pos = positions[i];
      data = pos.data;
      el = pos.el;
      lat = (data != null ? data.lat : void 0) ? parseFloat(data.lat).toFixed(4) : "...";
      long = (data != null ? data.long : void 0) ? parseFloat(data.long).toFixed(4) : "...";
      acc = (data != null ? data.acc : void 0) ? parseInt(data.acc) + (" " + this.text.meters) : "...";
      acc = acc + (parseInt(data != null ? data.acc : void 0) < 50 ? "(" + this.text.good + ")" : parseInt(data != null ? data.acc : void 0) > 100 ? "(" + this.text.poor + ")" : "(" + this.text.ok + ")");
      html = "<table> <tr><td>" + this.text.latitude + "</td> <td>" + lat + "</td></tr> <tr><td>" + this.text.longitude + "</td><td>" + long + "</td></tr> <tr><td>" + this.text.accuracy + "</td> <td>" + acc + "</td></tr> </table>";
      results.push(el.html(html));
    }
    return results;
  };

  GpsRunView.prototype.updateStatus = function(message) {
    var polling, retries;
    if (message == null) {
      message = '';
    }
    retries = this.retryCount > 0 ? t('GpsRunView.message.attempt', {
      count: this.retryCount + 1
    }) : "";
    polling = !this.stopPolling ? "<br>" + this.text.retrying + " " + retries : "";
    return this.$el.find(".status").html(message + polling);
  };

  GpsRunView.prototype.render = function() {
    var acc, lat, long, previous;
    if (!Modernizr.geolocation) {
      this.$el.html(this.text.notSupported);
      this.position = this.easify(null);
      this.trigger("rendered");
      return this.trigger("ready");
    } else {
      if (!this.dataEntry) {
        previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      }
      if (previous) {
        lat = previous.lat;
        long = previous.long;
        acc = previous.acc;
        this.$el.html("<section> <h3>" + this.text.savedReading + "</h3> <div class='gps_saved'> <table> <tr><td>" + this.text.latitude + "</td> <td>" + lat + "</td></tr> <tr><td>" + this.text.longitude + "</td><td>" + long + "</td></tr> <tr><td>" + this.text.accuracy + "</td> <td>" + acc + "</td></tr> </table> </div>");
      } else {
        this.$el.html("<section> <h3>" + this.text.bestReading + "</h3> <div class='gps_best'></div><button class='clear command'>" + this.text.clear + "</button> <h3>" + this.text.currentReading + "</h3> <div class='gps_current'></div> </section> <section> <h2>" + this.text.gpsStatus + "</h2> <div class='status'>" + this.text.searching + "</div> </section>");
      }
      this.trigger("rendered");
      this.trigger("ready");
      return this.poll();
    }
  };

  GpsRunView.prototype.getResult = function() {
    var previous;
    previous = this.parent.parent.result.getByHash(this.model.get('hash'));
    if (previous) {
      return previous;
    }
    return this.position || {};
  };

  GpsRunView.prototype.getSkipped = function() {
    return this.position || {};
  };

  GpsRunView.prototype.onClose = function() {
    return this.stopPolling = true;
  };

  GpsRunView.prototype.isValid = function() {
    return true;
  };

  GpsRunView.prototype.showErrors = function() {
    return true;
  };

  return GpsRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0dwc1J1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3VCQUVKLFNBQUEsR0FBVzs7dUJBRVgsTUFBQSxHQUFRO0lBQUEsY0FBQSxFQUFpQixPQUFqQjs7O3VCQUVSLEtBQUEsR0FBTyxTQUFBO0lBQ0wsSUFBQyxDQUFBLFFBQUQsR0FBWTtXQUNaLElBQUMsQ0FBQSxhQUFELENBQUE7RUFGSzs7dUJBSVAsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxJQUFELENBQUE7SUFDQSxJQUFDLENBQUEsS0FBRCxHQUFXLE9BQU8sQ0FBQztJQUNuQixJQUFDLENBQUEsTUFBRCxHQUFXLE9BQU8sQ0FBQztJQUNuQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztJQUdyQixJQUFDLENBQUEsUUFBRCxHQUFZO1dBQ1osSUFBQyxDQUFBLFVBQUQsR0FBYztFQVJKOzt1QkFVWixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxPQUFBLEVBQVUsQ0FBQSxDQUFFLHlCQUFGLENBQVY7TUFFQSxNQUFBLEVBQW1CLENBQUEsQ0FBRSx1QkFBRixDQUZuQjtNQUdBLElBQUEsRUFBbUIsQ0FBQSxDQUFFLHFCQUFGLENBSG5CO01BSUEsTUFBQSxFQUFtQixDQUFBLENBQUUsdUJBQUYsQ0FKbkI7TUFLQSxVQUFBLEVBQW1CLENBQUEsQ0FBRSwyQkFBRixDQUxuQjtNQU1BLFdBQUEsRUFBbUIsQ0FBQSxDQUFFLDRCQUFGLENBTm5CO01BT0EsVUFBQSxFQUFtQixDQUFBLENBQUUsMkJBQUYsQ0FQbkI7TUFRQSxRQUFBLEVBQW1CLENBQUEsQ0FBRSx5QkFBRixDQVJuQjtNQVVBLGNBQUEsRUFBbUIsQ0FBQSxDQUFFLGdDQUFGLENBVm5CO01BV0EsZ0JBQUEsRUFBbUIsQ0FBQSxDQUFFLGtDQUFGLENB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Q0FBQSxJQUFELENBQUEsRUEzQ0Y7O0VBRk07O3VCQStDUixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXRCLENBQWdDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBaEM7SUFDWCxJQUFtQixRQUFuQjtBQUFBLGFBQU8sU0FBUDs7QUFDQSxXQUFPLElBQUMsQ0FBQSxRQUFELElBQWE7RUFIWDs7dUJBS1gsVUFBQSxHQUFZLFNBQUE7QUFDVixXQUFPLElBQUMsQ0FBQSxRQUFELElBQWE7RUFEVjs7dUJBR1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsV0FBRCxHQUFlO0VBRFI7O3VCQUdULE9BQUEsR0FBUyxTQUFBO1dBQ1A7RUFETzs7dUJBR1QsVUFBQSxHQUFZLFNBQUE7V0FDVjtFQURVOzs7O0dBekxXLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9HcHNSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgR3BzUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiR3BzUnVuVmlld1wiXG5cbiAgZXZlbnRzOiAnY2xpY2sgLmNsZWFyJyA6ICdjbGVhcidcblxuICBjbGVhcjogLT5cbiAgICBAcG9zaXRpb24gPSBudWxsXG4gICAgQHVwZGF0ZURpc3BsYXkoKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBpMThuKClcbiAgICBAbW9kZWwgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cblxuICAgIEBwb3NpdGlvbiA9IG51bGxcbiAgICBAcmV0cnlDb3VudCA9IDBcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwiY2xlYXJcIiA6IHQoJ0dwc1J1blZpZXcuYnV0dG9uLmNsZWFyJylcblxuICAgICAgXCJnb29kXCIgICAgICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5nb29kJylcbiAgICAgIFwib2tcIiAgICAgICAgICAgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwub2snKVxuICAgICAgXCJwb29yXCIgICAgICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5wb29yJylcbiAgICAgIFwibGF0aXR1ZGVcIiAgICAgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwubGF0aXR1ZGUnKVxuICAgICAgXCJsb25naXR1ZGVcIiAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5sb25naXR1ZGUnKVxuICAgICAgXCJhY2N1cmFjeVwiICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5hY2N1cmFjeScpXG4gICAgICBcIm1ldGVyc1wiICAgICAgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLm1ldGVycycpXG5cbiAgICAgIFwic2F2ZWRSZWFkaW5nXCIgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwuc2F2ZWRfcmVhZGluZycpXG4gICAgICBcImN1cnJlbnRSZWFkaW5nXCIgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmN1cnJlbnRfcmVhZGluZycpXG4gICAgICBcImJlc3RSZWFkaW5nXCIgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmJlc3RfcmVhZGluZycpXG4gICAgICBcImdwc1N0YXR1c1wiICAgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmdwc19zdGF0dXMnKVxuXG4gICAgICBcImdwc09rXCIgICAgICAgIDogdCgnR3BzUnVuVmlldy5tZXNzYWdlLmdwc19vaycpXG4gICAgICBcInJldHJ5aW5nXCIgICAgIDogdCgnR3BzUnVuVmlldy5tZXNzYWdlLnJldHJ5aW5nJylcbiAgICAgIFwic2VhcmNoaW5nXCIgICAgOiB0KCdHcHNSdW5WaWV3Lm1lc3NhZ2Uuc2VhcmNoaW5nJylcbiAgICAgIFwibm90U3VwcG9ydGVkXCIgOiBfKHQoJ0dwc1J1blZpZXcubWVzc2FnZS5ub3Rfc3VwcG9ydGVkJykpLmVzY2FwZSgpXG5cbiAgcG9sbDogPT4gIyBmdWxsIG9mIG1hZ2ljIG51bWJlcnNcblxuICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXG4gICAgICAgIChwb3NpdGlvbikgPT5cbiAgICAgICAgICBAdXBkYXRlRGlzcGxheSBwb3NpdGlvblxuICAgICAgICAgIEB1cGRhdGVQb3NpdGlvbiBwb3NpdGlvblxuICAgICAgICAgIEB1cGRhdGVTdGF0dXMgQHRleHQuZ3BzT2tcbiAgICAgICAgICBAcmV0cnlDb3VudCA9IDBcbiAgICAgICAgICBzZXRUaW1lb3V0KEBwb2xsKCksIDUgKiAxMDAwKSB1bmxlc3MgQHN0b3BQb2xsaW5nICMgbm90IHJlY3Vyc2lvbiwgbm8gc3RhY2tvdmVyZmxvd1xuICAgICAgLFxuICAgICAgICAocG9zaXRpb25FcnJvcikgPT5cbiAgICAgICAgICBAdXBkYXRlU3RhdHVzIHBvc2l0aW9uRXJyb3IubWVzc2FnZVxuICAgICAgICAgIHNldFRpbWVvdXQoQHBvbGwoKSwgNSAqIDEwMDApICB1bmxlc3MgQHN0b3BQb2xsaW5nICAjIG5vdCByZWN1cnNpb24sIG5vIHN0YWNrb3ZlcmZsb3dcbiAgICAgICAgICBAcmV0cnlDb3VudCsrXG4gICAgICAsIFxuICAgICAgICBtYXhpbXVtQWdlICAgICAgICAgOiAxMCAqIDEwMDBcbiAgICAgICAgdGltZW91dCAgICAgICAgICAgIDogMzAgKiAxMDAwXG4gICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeSA6IHRydWVcbiAgICApXG5cbiAgZWFzaWZ5OiAoIHBvc2l0aW9uICkgLT5cbiAgICByZXR1cm4ge1xuICAgICAgbGF0ICAgICAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8ubGF0aXR1ZGU/IHRoZW4gcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlIGVsc2UgXCIuLi5cIlxuICAgICAgbG9uZyAgICAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8ubG9uZ2l0dWRlPyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUgZWxzZSBcIi4uLlwiXG4gICAgICBhbHQgICAgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hbHRpdHVkZT8gdGhlbiBwb3NpdGlvbi5jb29yZHMuYWx0aXR1ZGUgZWxzZSBcIi4uLlwiXG4gICAgICBhY2MgICAgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hY2N1cmFjeT8gdGhlbiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgZWxzZSBcIi4uLlwiXG4gICAgICBhbHRBY2MgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hbHRpdHVkZUFjY3VyYWN5PyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5hbHRpdHVkZUFjY3VyYWN5IGVsc2UgXCIuLi5cIlxuICAgICAgaGVhZGluZyAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8uaGVhZGluZz8gdGhlbiBwb3NpdGlvbi5jb29yZHMuaGVhZGluZyBlbHNlIFwiLi4uXCJcbiAgICAgIHNwZWVkICAgICA6IGlmIHBvc2l0aW9uPy5jb29yZHM/LnNwZWVkPyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5zcGVlZCBlbHNlIFwiLi4uXCJcbiAgICAgIHRpbWVzdGFtcCA6IGlmIHBvc2l0aW9uPy50aW1lc3RhbXA/IHRoZW4gcG9zaXRpb24udGltZXN0YW1wIGVsc2UgXCIuLi5cIlxuICAgIH1cblxuICB1cGRhdGVQb3NpdGlvbjogKCBuZXdQb3NpdGlvbiApIC0+XG4gICAgbmV3UG9zaXRpb24gPSBAZWFzaWZ5KG5ld1Bvc2l0aW9uKVxuICAgIEBwb3NpdGlvbiA9IG5ld1Bvc2l0aW9uIHVubGVzcyBAcG9zaXRpb24/XG4gICAgIyBwcmVmZXIgbW9zdCBhY2N1cmF0ZSByZXN1bHRcbiAgICBpZiAobmV3UG9zaXRpb24/LmFjYz8gJiYgQHBvc2l0aW9uPy5hY2M/KSAmJiBuZXdQb3NpdGlvbi5hY2MgPD0gQHBvc2l0aW9uLmFjY1xuICAgICAgQHBvc2l0aW9uID0gbmV3UG9zaXRpb25cblxuICB1cGRhdGVEaXNwbGF5OiAocG9zaXRpb24pIC0+XG4gICAgcG9zaXRpb24gPSBAZWFzaWZ5IHBvc2l0aW9uXG4gICAgcG9zaXRpb25zID0gW1xuICAgICAgZWwgICA6IEAkZWwuZmluZChcIi5ncHNfY3VycmVudFwiKVxuICAgICAgZGF0YSA6IHBvc2l0aW9uXG4gICAgLFxuICAgICAgZWwgICA6IEAkZWwuZmluZChcIi5ncHNfYmVzdFwiKVxuICAgICAgZGF0YSA6IEBwb3NpdGlvblxuICAgIF1cblxuICAgIGZvciBwb3MsIGkgaW4gcG9zaXRpb25zXG5cbiAgICAgIGRhdGEgPSBwb3MuZGF0YVxuICAgICAgZWwgICA9IHBvcy5lbFxuXG4gICAgICBsYXQgID0gaWYgZGF0YT8ubGF0ICB0aGVuIHBhcnNlRmxvYXQoZGF0YS5sYXQpLnRvRml4ZWQoNCkgICBlbHNlIFwiLi4uXCJcbiAgICAgIGxvbmcgPSBpZiBkYXRhPy5sb25nIHRoZW4gcGFyc2VGbG9hdChkYXRhLmxvbmcpLnRvRml4ZWQoNCkgZWxzZSBcIi4uLlwiXG4gICAgICBhY2MgID0gaWYgZGF0YT8uYWNjICB0aGVuIHBhcnNlSW50KGRhdGEuYWNjKSArIFwiICN7QHRleHQubWV0ZXJzfVwiIFxuICAgICAgZWxzZSBcIi4uLlwiXG5cbiAgICAgIGFjYyA9IGFjYyArXG4gICAgICAgIGlmIHBhcnNlSW50KGRhdGE/LmFjYykgPCA1MCAjIG1hZ2ljIG51bWJlclxuICAgICAgICAgIFwiKCN7QHRleHQuZ29vZH0pXCJcbiAgICAgICAgZWxzZSBpZiBwYXJzZUludChkYXRhPy5hY2MpID4gMTAwICMgbWFnaWMgbnVtYmVyXG4gICAgICAgICAgXCIoI3tAdGV4dC5wb29yfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCIoI3tAdGV4dC5va30pXCJcblxuICAgICAgaHRtbCA9IFwiXG4gICAgICAgIDx0YWJsZT5cbiAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubGF0aXR1ZGV9PC90ZD4gPHRkPiN7bGF0fTwvdGQ+PC90cj5cbiAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubG9uZ2l0dWRlfTwvdGQ+PHRkPiN7bG9uZ308L3RkPjwvdHI+XG4gICAgICAgICAgPHRyPjx0ZD4je0B0ZXh0LmFjY3VyYWN5fTwvdGQ+IDx0ZD4je2FjY308L3RkPjwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICBcIlxuXG4gICAgICBlbC5odG1sIGh0bWxcblxuICB1cGRhdGVTdGF0dXM6IChtZXNzYWdlID0gJycpIC0+XG4gICAgcmV0cmllcyA9IGlmIEByZXRyeUNvdW50ID4gMCB0aGVuIHQoJ0dwc1J1blZpZXcubWVzc2FnZS5hdHRlbXB0JywgY291bnQ6IEByZXRyeUNvdW50KzEpIGVsc2UgXCJcIlxuICAgIHBvbGxpbmcgPSBpZiBub3QgQHN0b3BQb2xsaW5nIHRoZW4gXCI8YnI+I3tAdGV4dC5yZXRyeWluZ30gI3tyZXRyaWVzfVwiIGVsc2UgXCJcIlxuICAgIEAkZWwuZmluZChcIi5zdGF0dXNcIikuaHRtbCBtZXNzYWdlICsgcG9sbGluZ1xuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIG5vdCBNb2Rlcm5penIuZ2VvbG9jYXRpb25cbiAgICAgIFxuICAgICAgQCRlbC5odG1sIEB0ZXh0Lm5vdFN1cHBvcnRlZFxuXG4gICAgICBAcG9zaXRpb24gPSBAZWFzaWZ5KG51bGwpXG5cbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgICBlbHNlXG4gICAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgICBwcmV2aW91cyA9IEBwYXJlbnQucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgICBpZiBwcmV2aW91c1xuICAgICAgICBsYXQgID0gcHJldmlvdXMubGF0XG4gICAgICAgIGxvbmcgPSBwcmV2aW91cy5sb25nXG4gICAgICAgIGFjYyAgPSBwcmV2aW91cy5hY2NcbiAgICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHNlY3Rpb24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5zYXZlZFJlYWRpbmd9PC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J2dwc19zYXZlZCc+XG4gICAgICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubGF0aXR1ZGV9PC90ZD4gPHRkPiN7bGF0fTwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubG9uZ2l0dWRlfTwvdGQ+PHRkPiN7bG9uZ308L3RkPjwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPjx0ZD4je0B0ZXh0LmFjY3VyYWN5fTwvdGQ+IDx0ZD4je2FjY308L3RkPjwvdHI+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHNlY3Rpb24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5iZXN0UmVhZGluZ308L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nZ3BzX2Jlc3QnPjwvZGl2PjxidXR0b24gY2xhc3M9J2NsZWFyIGNvbW1hbmQnPiN7QHRleHQuY2xlYXJ9PC9idXR0b24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5jdXJyZW50UmVhZGluZ308L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nZ3BzX2N1cnJlbnQnPjwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICA8c2VjdGlvbj5cbiAgICAgICAgICAgIDxoMj4je0B0ZXh0Lmdwc1N0YXR1c308L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nc3RhdHVzJz4je0B0ZXh0LnNlYXJjaGluZ308L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgXCJcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgICBAcG9sbCgpXG4gIFxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICByZXR1cm4gcHJldmlvdXMgaWYgcHJldmlvdXNcbiAgICByZXR1cm4gQHBvc2l0aW9uIHx8IHt9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4gQHBvc2l0aW9uIHx8IHt9XG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3RvcFBvbGxpbmcgPSB0cnVlXG5cbiAgaXNWYWxpZDogLT5cbiAgICB0cnVlXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICB0cnVlXG4iXX0=
