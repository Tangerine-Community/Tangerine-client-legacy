var Result,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Result = (function(superClass) {
  extend(Result, superClass);

  function Result() {
    return Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.url = "result";

  Result.prototype.initialize = function(options) {
    var device, deviceInfo;
    if (options.blank === true) {
      device = window.Device || {};
      deviceInfo = {
        'name': device.name,
        'platform': device.platform,
        'uuid': device.uuid,
        'version': device.version,
        'userAgent': navigator.userAgent
      };
      this.set({
        'subtestData': [],
        'start_time': (new Date()).getTime(),
        'enumerator': Tangerine.user.name(),
        'tangerine_version': Tangerine.version,
        'device': deviceInfo,
        'instanceId': Tangerine.settings.getString("instanceId")
      });
      return this.unset("blank");
    }
  };

  Result.prototype.add = function(subtestDataElement, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    this.setSubtestData(subtestDataElement, callbacks);
    return this.save(null, {
      success: callbacks.success || $.noop,
      error: callbacks.error || $.noop
    });
  };

  Result.prototype.insert = function(newElement) {
    var i, j, len, newSubtestData, oldElement, oldSubtestData;
    oldSubtestData = this.get("subtestData");
    newSubtestData = oldSubtestData;
    for (i = j = 0, len = oldSubtestData.length; j < len; i = ++j) {
      oldElement = oldSubtestData[i];
      if (oldElement.subtestId === newElement.subtestId) {
        newSubtestData[i] = newElement;
        break;
      }
    }
    return this.set("subtestData", newSubtestData);
  };

  Result.prototype.setSubtestData = function(subtestDataElement, subtestId) {
    var subtestData;
    subtestDataElement['timestamp'] = (new Date()).getTime();
    subtestData = this.get('subtestData');
    subtestData.push(subtestDataElement);
    return this.set('subtestData', subtestData);
  };

  Result.prototype.getVariable = function(key) {
    var data, i, j, k, label, len, len1, name, ref, ref1, state, subtest, value, variable;
    ref = this.get("subtestData");
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      data = subtest.data;
      if (data.labels != null) {
        ref1 = data.labels;
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          label = ref1[i];
          if (label === key) {
            return data.location[i];
          }
        }
      } else {
        for (variable in data) {
          value = data[variable];
          if (variable === key) {
            if (_.isObject(value)) {
              return _.compact((function() {
                var results;
                results = [];
                for (name in value) {
                  state = value[name];
                  results.push(state === "checked" ? name : void 0);
                }
                return results;
              })());
            } else {
              return value;
            }
          }
        }
      }
    }
    return null;
  };

  Result.prototype.getByHash = function(hash) {
    var j, len, ref, subtest;
    ref = this.get("subtestData");
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      if (hash === subtest.subtestHash) {
        return subtest.data;
      }
    }
    return null;
  };

  Result.prototype.getGridScore = function(id) {
    var datum, j, len, ref;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if (datum.subtestId === id) {
        return parseInt(datum.data.attempted);
      }
    }
  };

  Result.prototype.getItemResultCountByVariableName = function(name, result) {
    var count, datum, found, item, items, j, k, len, len1, ref;
    found = false;
    count = 0;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if ((datum.data != null) && (datum.data.variable_name != null) && datum.data.variable_name === name) {
        found = true;
        items = datum.data.items;
        for (k = 0, len1 = items.length; k < len1; k++) {
          item = items[k];
          if (item.itemResult === result) {
            count++;
          }
        }
      }
    }
    if (!found) {
      throw new Error("Variable name \"" + name + "\" not found");
    }
    return count;
  };

  Result.prototype.gridWasAutostopped = function(id) {
    var datum, j, len, ref;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if (datum.subtestId === id) {
        return datum.data.auto_stop;
      }
    }
  };

  return Result;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBO0VBQUE7OztBQUFNOzs7Ozs7O21CQUVKLEdBQUEsR0FBSzs7bUJBRUwsVUFBQSxHQUFZLFNBQUUsT0FBRjtBQUdWLFFBQUE7SUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFSLEtBQWlCLElBQXBCO01BQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLElBQWlCO01BQzFCLFVBQUEsR0FDRTtRQUFBLE1BQUEsRUFBYyxNQUFNLENBQUMsSUFBckI7UUFDQSxVQUFBLEVBQWMsTUFBTSxDQUFDLFFBRHJCO1FBRUEsTUFBQSxFQUFjLE1BQU0sQ0FBQyxJQUZyQjtRQUdBLFNBQUEsRUFBYyxNQUFNLENBQUMsT0FIckI7UUFJQSxXQUFBLEVBQWMsU0FBUyxDQUFDLFNBSnhCOztNQU1GLElBQUMsQ0FBQSxHQUFELENBQ0U7UUFBQSxhQUFBLEVBQXNCLEVBQXRCO1FBQ0EsWUFBQSxFQUFzQixDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQSxDQUR0QjtRQUVBLFlBQUEsRUFBc0IsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFmLENBQUEsQ0FGdEI7UUFHQSxtQkFBQSxFQUFzQixTQUFTLENBQUMsT0FIaEM7UUFJQSxRQUFBLEVBQXNCLFVBSnRCO1FBS0EsWUFBQSxFQUFzQixTQUFTLENBQUMsUUFBUSxDQUFDLFNBQW5CLENBQTZCLFlBQTdCLENBTHRCO09BREY7YUFRQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFqQkY7O0VBSFU7O21CQXNCWixHQUFBLEdBQUssU0FBRSxrQkFBRixFQUFzQixTQUF0Qjs7TUFBc0IsWUFBWTs7SUFDckMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0Isa0JBQWhCLEVBQW9DLFNBQXBDO1dBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBUyxDQUFDLE9B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O0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQStCLEtBQUssQ0FBQyxTQUFOLEtBQW1CLEVBQWxEO0FBQUEsZUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQWxCOztBQURGO0VBRGtCOzs7O0dBdEZELFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9SZXN1bHQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogXCJyZXN1bHRcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICAjIGNvdWxkIHVzZSBkZWZhdWx0cyBidXQgaXQgbWVzc2VzIHRoaW5ncyB1cFxuICAgIGlmIG9wdGlvbnMuYmxhbmsgPT0gdHJ1ZVxuICAgICAgZGV2aWNlID0gd2luZG93LkRldmljZSB8fCB7fVxuICAgICAgZGV2aWNlSW5mbyA9XG4gICAgICAgICduYW1lJyAgICAgIDogZGV2aWNlLm5hbWVcbiAgICAgICAgJ3BsYXRmb3JtJyAgOiBkZXZpY2UucGxhdGZvcm1cbiAgICAgICAgJ3V1aWQnICAgICAgOiBkZXZpY2UudXVpZFxuICAgICAgICAndmVyc2lvbicgICA6IGRldmljZS52ZXJzaW9uXG4gICAgICAgICd1c2VyQWdlbnQnIDogbmF2aWdhdG9yLnVzZXJBZ2VudFxuXG4gICAgICBAc2V0XG4gICAgICAgICdzdWJ0ZXN0RGF0YScgICAgICAgOiBbXVxuICAgICAgICAnc3RhcnRfdGltZScgICAgICAgIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICAnZW51bWVyYXRvcicgICAgICAgIDogVGFuZ2VyaW5lLnVzZXIubmFtZSgpXG4gICAgICAgICd0YW5nZXJpbmVfdmVyc2lvbicgOiBUYW5nZXJpbmUudmVyc2lvblxuICAgICAgICAnZGV2aWNlJyAgICAgICAgICAgIDogZGV2aWNlSW5mb1xuICAgICAgICAnaW5zdGFuY2VJZCcgICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLmdldFN0cmluZyhcImluc3RhbmNlSWRcIilcblxuICAgICAgQHVuc2V0IFwiYmxhbmtcIiAjIG9wdGlvbnMgYXV0b21hdGljYWxseSBnZXQgYWRkZWQgdG8gdGhlIG1vZGVsLiBMYW1lLlxuXG4gIGFkZDogKCBzdWJ0ZXN0RGF0YUVsZW1lbnQsIGNhbGxiYWNrcyA9IHt9KSAtPlxuICAgIEBzZXRTdWJ0ZXN0RGF0YSBzdWJ0ZXN0RGF0YUVsZW1lbnQsIGNhbGxiYWNrc1xuICAgIEBzYXZlIG51bGwsIFxuICAgICAgc3VjY2VzczogY2FsbGJhY2tzLnN1Y2Nlc3MgfHwgJC5ub29wXG4gICAgICBlcnJvcjogICBjYWxsYmFja3MuZXJyb3IgICB8fCAkLm5vb3BcblxuICBpbnNlcnQ6IChuZXdFbGVtZW50KSAtPlxuICAgIG9sZFN1YnRlc3REYXRhID0gQGdldChcInN1YnRlc3REYXRhXCIpXG4gICAgbmV3U3VidGVzdERhdGEgPSBvbGRTdWJ0ZXN0RGF0YVxuICAgIGZvciBvbGRFbGVtZW50LCBpIGluIG9sZFN1YnRlc3REYXRhXG4gICAgICBpZiBvbGRFbGVtZW50LnN1YnRlc3RJZCBpcyBuZXdFbGVtZW50LnN1YnRlc3RJZFxuICAgICAgICBuZXdTdWJ0ZXN0RGF0YVtpXSA9IG5ld0VsZW1lbnRcbiAgICAgICAgYnJlYWtcblxuICAgIEBzZXQgXCJzdWJ0ZXN0RGF0YVwiLCBuZXdTdWJ0ZXN0RGF0YVxuXG5cbiAgc2V0U3VidGVzdERhdGE6IChzdWJ0ZXN0RGF0YUVsZW1lbnQsIHN1YnRlc3RJZCkgLT5cbiAgICBzdWJ0ZXN0RGF0YUVsZW1lbnRbJ3RpbWVzdGFtcCddID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgIHN1YnRlc3REYXRhID0gQGdldCAnc3VidGVzdERhdGEnXG4gICAgc3VidGVzdERhdGEucHVzaCBzdWJ0ZXN0RGF0YUVsZW1lbnRcbiAgICBAc2V0ICdzdWJ0ZXN0RGF0YScsIHN1YnRlc3REYXRhXG5cbiAgZ2V0VmFyaWFibGU6ICgga2V5ICkgLT5cbiAgICBmb3Igc3VidGVzdCBpbiBAZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgIGRhdGEgPSBzdWJ0ZXN0LmRhdGFcbiAgICAgIGlmIGRhdGEubGFiZWxzP1xuICAgICAgICBmb3IgbGFiZWwsIGkgaW4gZGF0YS5sYWJlbHNcbiAgICAgICAgICByZXR1cm4gZGF0YS5sb2NhdGlvbltpXSBpZiBsYWJlbCBpcyBrZXlcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIHZhcmlhYmxlLCB2YWx1ZSBvZiBkYXRhXG4gICAgICAgICAgaWYgdmFyaWFibGUgPT0ga2V5XG4gICAgICAgICAgICBpZiBfLmlzT2JqZWN0KHZhbHVlKVxuICAgICAgICAgICAgICByZXR1cm4gXy5jb21wYWN0KCgobmFtZSBpZiBzdGF0ZSA9PSBcImNoZWNrZWRcIikgZm9yIG5hbWUsIHN0YXRlIG9mIHZhbHVlKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgcmV0dXJuIG51bGxcblxuICBnZXRCeUhhc2g6ICggaGFzaCApIC0+XG4gICAgZm9yIHN1YnRlc3QgaW4gQGdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICBpZiBoYXNoIGlzIHN1YnRlc3Quc3VidGVzdEhhc2hcbiAgICAgICAgcmV0dXJuIHN1YnRlc3QuZGF0YVxuICAgIHJldHVybiBudWxsXG5cbiAgZ2V0R3JpZFNjb3JlOiAoaWQpIC0+XG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgcmV0dXJuIHBhcnNlSW50KGRhdHVtLmRhdGEuYXR0ZW1wdGVkKSBpZiBkYXR1bS5zdWJ0ZXN0SWQgPT0gaWRcblxuICBnZXRJdGVtUmVzdWx0Q291bnRCeVZhcmlhYmxlTmFtZTogKG5hbWUsIHJlc3VsdCkgLT5cbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgY291bnQgPSAwXG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgaWYgZGF0dW0uZGF0YT8gYW5kIGRhdHVtLmRhdGEudmFyaWFibGVfbmFtZT8gYW5kIGRhdHVtLmRhdGEudmFyaWFibGVfbmFtZSA9PSBuYW1lXG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBpdGVtcyA9IGRhdHVtLmRhdGEuaXRlbXNcbiAgICAgICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgICAgICBjb3VudCsrIGlmIGl0ZW0uaXRlbVJlc3VsdCA9PSByZXN1bHRcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYXJpYWJsZSBuYW1lIFxcXCIje25hbWV9XFxcIiBub3QgZm91bmRcIikgaWYgbm90IGZvdW5kXG4gICAgcmV0dXJuIGNvdW50XG5cbiAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAoaWQpIC0+XG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgcmV0dXJuIGRhdHVtLmRhdGEuYXV0b19zdG9wIGlmIGRhdHVtLnN1YnRlc3RJZCA9PSBpZFxuIl19
