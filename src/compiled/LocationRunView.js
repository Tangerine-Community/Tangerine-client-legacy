var LocationRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LocationRunView = (function(superClass) {
  extend(LocationRunView, superClass);

  function LocationRunView() {
    return LocationRunView.__super__.constructor.apply(this, arguments);
  }

  LocationRunView.prototype.className = "LocationRunView";

  LocationRunView.prototype.events = {
    "click .school_list li": "autofill",
    "keyup input": "showOptions",
    "click .clear": "clearInputs",
    "change select": "onSelectChange"
  };

  LocationRunView.prototype.i18n = function() {
    return this.text = {
      clear: t("LocationRunView.button.clear")
    };
  };

  LocationRunView.prototype.initialize = function(options) {
    var i, k, l, len, len1, len2, level, location, locationData, m, ref, ref1, template;
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.levels = this.model.get("levels") || [];
    this.locations = this.model.get("locations") || [];
    if (this.levels.length === 1 && this.levels[0] === "") {
      this.levels = [];
    }
    if (this.locations.length === 1 && this.locations[0] === "") {
      this.locations = [];
    }
    this.haystack = [];
    ref = this.locations;
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      location = ref[i];
      this.haystack[i] = [];
      for (l = 0, len1 = location.length; l < len1; l++) {
        locationData = location[l];
        this.haystack[i].push(locationData.toLowerCase());
      }
    }
    template = "<li data-index='{{i}}'>";
    ref1 = this.levels;
    for (i = m = 0, len2 = ref1.length; m < len2; i = ++m) {
      level = ref1[i];
      template += "{{level_" + i + "}}";
      if (i !== this.levels.length - 1) {
        template += " - ";
      }
    }
    template += "</li>";
    return this.li = _.template(template);
  };

  LocationRunView.prototype.clearInputs = function() {
    this.$el.empty();
    return this.render();
  };

  LocationRunView.prototype.autofill = function(event) {
    var i, index, k, len, level, location, ref, results1;
    this.$el.find(".autofill").fadeOut(250);
    index = $(event.target).attr("data-index");
    location = this.locations[index];
    ref = this.levels;
    results1 = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      level = ref[i];
      results1.push(this.$el.find("#level_" + i).val(location[i]));
    }
    return results1;
  };

  LocationRunView.prototype.showOptions = function(event) {
    var atLeastOne, fieldIndex, html, i, isThere, j, k, l, len, len1, len2, len3, m, n, needle, o, otherField, ref, ref1, ref2, result, results, stack;
    needle = $(event.target).val().toLowerCase();
    fieldIndex = parseInt($(event.target).attr('data-level'));
    for (otherField = k = 0, ref = this.haystack.length; 0 <= ref ? k <= ref : k >= ref; otherField = 0 <= ref ? ++k : --k) {
      this.$el.find("#autofill_" + otherField).hide();
    }
    atLeastOne = false;
    results = [];
    ref1 = this.haystack;
    for (i = l = 0, len = ref1.length; l < len; i = ++l) {
      stack = ref1[i];
      isThere = ~this.haystack[i][fieldIndex].indexOf(needle);
      if (isThere) {
        results.push(i);
      }
      if (isThere) {
        atLeastOne = true;
      }
    }
    ref2 = this.haystack;
    for (i = m = 0, len1 = ref2.length; m < len1; i = ++m) {
      stack = ref2[i];
      for (j = n = 0, len2 = stack.length; n < len2; j = ++n) {
        otherField = stack[j];
        if (j === fieldIndex) {
          continue;
        }
        isThere = ~this.haystack[i][j].indexOf(needle);
        if (isThere && !~results.indexOf(i)) {
          results.push(i);
        }
        if (isThere) {
          atLeastOne = true;
        }
      }
    }
    if (atLeastOne) {
      html = "";
      for (o = 0, len3 = results.length; o < len3; o++) {
        result = results[o];
        html += this.getLocationLi(result);
      }
      this.$el.find("#autofill_" + fieldIndex).fadeIn(250);
      return this.$el.find("#school_list_" + fieldIndex).html(html);
    } else {
      return this.$el.find("#autofill_" + fieldIndex).fadeOut(250);
    }
  };

  LocationRunView.prototype.getLocationLi = function(i) {
    var j, k, len, location, ref, templateInfo;
    templateInfo = {
      "i": i
    };
    ref = this.locations[i];
    for (j = k = 0, len = ref.length; k < len; j = ++k) {
      location = ref[j];
      templateInfo["level_" + j] = location;
    }
    return this.li(templateInfo);
  };

  LocationRunView.prototype.render = function() {
    var html, i, isDisabled, k, l, len, len1, level, levelOptions, previous, previousLevel, ref, ref1, schoolListElements;
    schoolListElements = "";
    html = "<button class='clear command'>" + this.text.clear + "</button>";
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
    }
    if (this.typed) {
      ref = this.levels;
      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        level = ref[i];
        previousLevel = '';
        if (previous) {
          previousLevel = previous.location[i];
        }
        html += "<div class='label_value'> <label for='level_" + i + "'>" + level + "</label><br> <input data-level='" + i + "' id='level_" + i + "' value='" + (previousLevel || '') + "'> </div> <div id='autofill_" + i + "' class='autofill' style='display:none'> <h2>" + (t('select one from autofill list')) + "</h2> <ul class='school_list' id='school_list_" + i + "'> </ul> </div>";
      }
    } else {
      ref1 = this.levels;
      for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
        level = ref1[i];
        previousLevel = '';
        if (previous) {
          previousLevel = previous.location[i];
        }
        levelOptions = this.getOptions(i, previousLevel);
        isDisabled = (i !== 0 && !previousLevel) && "disabled='disabled'";
        html += "<div class='label_value'> <label for='level_" + i + "'>" + level + "</label><br> <select id='level_" + i + "' data-level='" + i + "' " + (isDisabled || '') + "> " + levelOptions + " </select> </div>";
      }
    }
    this.$el.html(html);
    this.trigger("rendered");
    return this.trigger("ready");
  };

  LocationRunView.prototype.onSelectChange = function(event) {
    var $html, $target, levelChanged, newValue, nextLevel, options;
    $target = $(event.target);
    levelChanged = parseInt($target.attr("data-level"));
    newValue = $target.val();
    nextLevel = levelChanged + 1;
    if (levelChanged !== this.levels.length) {
      this.$el.find("#level_" + nextLevel).removeAttr("disabled");
      $html = this.$el.find("#level_" + nextLevel).html(this.getOptions(nextLevel));
      if ((options = $html.find("option")).length === 1) {
        return options.parent("select").trigger("change");
      }
    }
  };

  LocationRunView.prototype.getOptions = function(index, previousLevel) {
    var doneOptions, i, isNotChild, isValidChild, k, l, len, levelOptions, location, locationName, m, parentValues, previousFlag, promptOption, ref, ref1, ref2, selectPrompt, selected;
    doneOptions = [];
    levelOptions = '';
    previousFlag = false;
    parentValues = [];
    for (i = k = 0, ref = index; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      if (i === index) {
        break;
      }
      parentValues.push(this.$el.find("#level_" + i).val());
    }
    ref1 = this.locations;
    for (i = l = 0, len = ref1.length; l < len; i = ++l) {
      location = ref1[i];
      if (!~doneOptions.indexOf(location[index])) {
        isNotChild = index === 0;
        isValidChild = true;
        for (i = m = 0, ref2 = Math.max(index - 1, 0); 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
          if (parentValues[i] !== location[i] && !previousLevel) {
            isValidChild = false;
            break;
          }
        }
        if (isNotChild || isValidChild) {
          doneOptions.push(location[index]);
          locationName = _(location[index]).escape();
          if (location[index] === previousLevel) {
            selected = "selected='selected'";
            previousFlag = true;
          } else {
            selected = '';
          }
          levelOptions += "<option value='" + locationName + "' " + (selected || '') + ">" + locationName + "</option>";
        }
      }
    }
    if (!previousFlag) {
      selectPrompt = "selected='selected'";
    }
    promptOption = "<option " + (selectPrompt || '') + " disabled='disabled'>Please select a " + this.levels[index] + "</option>";
    if (doneOptions.length === 1) {
      return levelOptions;
    } else {
      return promptOption + " " + levelOptions;
    }
  };

  LocationRunView.prototype.getResult = function() {
    var i, level;
    return {
      "labels": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (k = 0, len = ref.length; k < len; k++) {
          level = ref[k];
          results1.push(level.replace(/[\s-]/g, "_"));
        }
        return results1;
      }).call(this),
      "location": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          level = ref[i];
          results1.push($.trim(this.$el.find("#level_" + i).val()));
        }
        return results1;
      }).call(this)
    };
  };

  LocationRunView.prototype.getSkipped = function() {
    var i, level;
    return {
      "labels": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (k = 0, len = ref.length; k < len; k++) {
          level = ref[k];
          results1.push(level.replace(/[\s-]/g, "_"));
        }
        return results1;
      }).call(this),
      "location": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          level = ref[i];
          results1.push("skipped");
        }
        return results1;
      }).call(this)
    };
  };

  LocationRunView.prototype.isValid = function() {
    var elements, i, input, inputs, k, len, selects;
    this.$el.find(".message").remove();
    inputs = this.$el.find("input");
    selects = this.$el.find("select");
    elements = selects.length > 0 ? selects : inputs;
    for (i = k = 0, len = elements.length; k < len; i = ++k) {
      input = elements[i];
      if (!$(input).val()) {
        return false;
      }
    }
    return true;
  };

  LocationRunView.prototype.showErrors = function() {
    var elements, input, inputs, k, len, levelName, results1, selects;
    inputs = this.$el.find("input");
    selects = this.$el.find("select");
    elements = selects.length > 0 ? selects : inputs;
    results1 = [];
    for (k = 0, len = elements.length; k < len; k++) {
      input = elements[k];
      if (!$(input).val()) {
        levelName = $('label[for=' + $(input).attr('id') + ']').text();
        results1.push($(input).after(" <span class='message'>" + (t("LocationRunView.message.must_be_filled", {
          levelName: levelName
        })) + "</span>"));
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  return LocationRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxlQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzRCQUVKLFNBQUEsR0FBVzs7NEJBRVgsTUFBQSxHQUNFO0lBQUEsdUJBQUEsRUFBMEIsVUFBMUI7SUFDQSxhQUFBLEVBQWlCLGFBRGpCO0lBRUEsY0FBQSxFQUFpQixhQUZqQjtJQUdBLGVBQUEsRUFBa0IsZ0JBSGxCOzs7NEJBS0YsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsS0FBQSxFQUFRLENBQUEsQ0FBRSw4QkFBRixDQUFSOztFQUZFOzs0QkFJTixVQUFBLEdBQVksU0FBQyxPQUFEO0FBRVYsUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztJQUdyQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsQ0FBQSxJQUE4QjtJQUN4QyxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxJQUEyQjtJQUV4QyxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFrQixDQUFsQixJQUF3QixJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUixLQUFjLEVBQXpDO01BQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxHQURaOztJQUVBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLENBQXJCLElBQTJCLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFYLEtBQWlCLEVBQS9DO01BQ0UsSUFBQyxDQUFBLFNBQUQs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QUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBYixHQUFpQyxHQUFuQyxDQUF1QyxDQUFDLElBQXhDLENBQUE7c0JBQ1osQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLEtBQVQsQ0FBZSx5QkFBQSxHQUF5QixDQUFDLENBQUEsQ0FBRSx3Q0FBRixFQUE0QztVQUFBLFNBQUEsRUFBWSxTQUFaO1NBQTVDLENBQUQsQ0FBekIsR0FBNkYsU0FBNUcsR0FGRjtPQUFBLE1BQUE7OEJBQUE7O0FBREY7O0VBSlU7Ozs7R0F0T2dCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvblJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMb2NhdGlvblJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkxvY2F0aW9uUnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLnNjaG9vbF9saXN0IGxpXCIgOiBcImF1dG9maWxsXCJcbiAgICBcImtleXVwIGlucHV0XCIgIDogXCJzaG93T3B0aW9uc1wiXG4gICAgXCJjbGljayAuY2xlYXJcIiA6IFwiY2xlYXJJbnB1dHNcIlxuICAgIFwiY2hhbmdlIHNlbGVjdFwiIDogXCJvblNlbGVjdENoYW5nZVwiXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9IFxuICAgICAgY2xlYXIgOiB0KFwiTG9jYXRpb25SdW5WaWV3LmJ1dHRvbi5jbGVhclwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuXG4gICAgQGxldmVscyA9IEBtb2RlbC5nZXQoXCJsZXZlbHNcIikgICAgICAgfHwgW11cbiAgICBAbG9jYXRpb25zID0gQG1vZGVsLmdldChcImxvY2F0aW9uc1wiKSB8fCBbXVxuXG4gICAgaWYgQGxldmVscy5sZW5ndGggaXMgMSBhbmQgQGxldmVsc1swXSBpcyBcIlwiXG4gICAgICBAbGV2ZWxzID0gW11cbiAgICBpZiBAbG9jYXRpb25zLmxlbmd0aCBpcyAxIGFuZCBAbG9jYXRpb25zWzBdIGlzIFwiXCJcbiAgICAgIEBsb2NhdGlvbnMgPSBbXVxuXG4gICAgQGhheXN0YWNrID0gW11cblxuICAgIGZvciBsb2NhdGlvbiwgaSBpbiBAbG9jYXRpb25zXG4gICAgICBAaGF5c3RhY2tbaV0gPSBbXVxuICAgICAgZm9yIGxvY2F0aW9uRGF0YSBpbiBsb2NhdGlvblxuICAgICAgICBAaGF5c3RhY2tbaV0ucHVzaCBsb2NhdGlvbkRhdGEudG9Mb3dlckNhc2UoKVxuXG4gICAgdGVtcGxhdGUgPSBcIjxsaSBkYXRhLWluZGV4PSd7e2l9fSc+XCJcbiAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgdGVtcGxhdGUgKz0gXCJ7e2xldmVsXyN7aX19fVwiXG4gICAgICB0ZW1wbGF0ZSArPSBcIiAtIFwiIHVubGVzcyBpIGlzIEBsZXZlbHMubGVuZ3RoLTFcbiAgICB0ZW1wbGF0ZSArPSBcIjwvbGk+XCJcblxuICAgIEBsaSA9IF8udGVtcGxhdGUodGVtcGxhdGUpXG5cbiAgY2xlYXJJbnB1dHM6IC0+XG4gICAgQCRlbC5lbXB0eSgpXG4gICAgQHJlbmRlcigpXG5cbiAgYXV0b2ZpbGw6IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIuYXV0b2ZpbGxcIikuZmFkZU91dCgyNTApXG4gICAgaW5kZXggPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtaW5kZXhcIilcbiAgICBsb2NhdGlvbiA9IEBsb2NhdGlvbnNbaW5kZXhdXG4gICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbF8je2l9XCIpLnZhbChsb2NhdGlvbltpXSlcblxuXG4gIHNob3dPcHRpb25zOiAoZXZlbnQpIC0+XG4gICAgbmVlZGxlID0gJChldmVudC50YXJnZXQpLnZhbCgpLnRvTG93ZXJDYXNlKClcbiAgICBmaWVsZEluZGV4ID0gcGFyc2VJbnQoJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtbGV2ZWwnKSlcbiAgICAjIGhpZGUgaWYgb3RoZXJzIGFyZSBzaG93aW5nXG4gICAgZm9yIG90aGVyRmllbGQgaW4gWzAuLkBoYXlzdGFjay5sZW5ndGhdXG4gICAgICBAJGVsLmZpbmQoXCIjYXV0b2ZpbGxfI3tvdGhlckZpZWxkfVwiKS5oaWRlKClcblxuICAgIGF0TGVhc3RPbmUgPSBmYWxzZVxuICAgIHJlc3VsdHMgPSBbXVxuICAgIGZvciBzdGFjaywgaSBpbiBAaGF5c3RhY2tcbiAgICAgIGlzVGhlcmUgPSB+QGhheXN0YWNrW2ldW2ZpZWxkSW5kZXhdLmluZGV4T2YobmVlZGxlKVxuICAgICAgcmVzdWx0cy5wdXNoIGkgaWYgaXNUaGVyZVxuICAgICAgYXRMZWFzdE9uZSA9IHRydWUgaWYgaXNUaGVyZVxuXG4gICAgZm9yIHN0YWNrLCBpIGluIEBoYXlzdGFja1xuICAgICAgZm9yIG90aGVyRmllbGQsIGogaW4gc3RhY2tcbiAgICAgICAgaWYgaiBpcyBmaWVsZEluZGV4XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaXNUaGVyZSA9IH5AaGF5c3RhY2tbaV1bal0uaW5kZXhPZihuZWVkbGUpXG4gICAgICAgIHJlc3VsdHMucHVzaCBpIGlmIGlzVGhlcmUgYW5kICF+cmVzdWx0cy5pbmRleE9mKGkpXG4gICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlIGlmIGlzVGhlcmVcblxuICAgIGlmIGF0TGVhc3RPbmVcbiAgICAgIGh0bWwgPSBcIlwiXG4gICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgICAgaHRtbCArPSBAZ2V0TG9jYXRpb25MaSByZXN1bHRcbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je2ZpZWxkSW5kZXh9XCIpLmZhZGVJbigyNTApXG4gICAgICBAJGVsLmZpbmQoXCIjc2Nob29sX2xpc3RfI3tmaWVsZEluZGV4fVwiKS5odG1sIGh0bWxcblxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je2ZpZWxkSW5kZXh9XCIpLmZhZGVPdXQoMjUwKVxuXG4gIGdldExvY2F0aW9uTGk6IChpKSAtPlxuICAgIHRlbXBsYXRlSW5mbyA9IFwiaVwiIDogaVxuICAgIGZvciBsb2NhdGlvbiwgaiBpbiBAbG9jYXRpb25zW2ldXG4gICAgICB0ZW1wbGF0ZUluZm9bXCJsZXZlbF9cIiArIGpdID0gbG9jYXRpb25cbiAgICByZXR1cm4gQGxpIHRlbXBsYXRlSW5mb1xuXG4gIHJlbmRlcjogLT5cbiAgICBzY2hvb2xMaXN0RWxlbWVudHMgPSBcIlwiXG5cbiAgICBodG1sID0gXCI8YnV0dG9uIGNsYXNzPSdjbGVhciBjb21tYW5kJz4je0B0ZXh0LmNsZWFyfTwvYnV0dG9uPlwiXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcblxuICAgIGlmIEB0eXBlZFxuXG4gICAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgICBwcmV2aW91c0xldmVsID0gJydcbiAgICAgICAgaWYgcHJldmlvdXNcbiAgICAgICAgICBwcmV2aW91c0xldmVsID0gcHJldmlvdXMubG9jYXRpb25baV1cbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xldmVsXyN7aX0nPiN7bGV2ZWx9PC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8aW5wdXQgZGF0YS1sZXZlbD0nI3tpfScgaWQ9J2xldmVsXyN7aX0nIHZhbHVlPScje3ByZXZpb3VzTGV2ZWx8fCcnfSc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nYXV0b2ZpbGxfI3tpfScgY2xhc3M9J2F1dG9maWxsJyBzdHlsZT0nZGlzcGxheTpub25lJz5cbiAgICAgICAgICAgIDxoMj4je3QoJ3NlbGVjdCBvbmUgZnJvbSBhdXRvZmlsbCBsaXN0Jyl9PC9oMj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz0nc2Nob29sX2xpc3QnIGlkPSdzY2hvb2xfbGlzdF8je2l9Jz5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIFwiXG5cbiAgICBlbHNlXG5cbiAgICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG5cbiAgICAgICAgcHJldmlvdXNMZXZlbCA9ICcnXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgcHJldmlvdXNMZXZlbCA9IHByZXZpb3VzLmxvY2F0aW9uW2ldXG4gICAgICAgIFxuICAgICAgICBsZXZlbE9wdGlvbnMgPSBAZ2V0T3B0aW9ucyhpLCBwcmV2aW91c0xldmVsKVxuXG4gICAgICAgIGlzRGlzYWJsZWQgPSAoaSBpc250IDAgYW5kIG5vdCBwcmV2aW91c0xldmVsKSBhbmQgXCJkaXNhYmxlZD0nZGlzYWJsZWQnXCIgXG5cbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xldmVsXyN7aX0nPiN7bGV2ZWx9PC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPSdsZXZlbF8je2l9JyBkYXRhLWxldmVsPScje2l9JyAje2lzRGlzYWJsZWR8fCcnfT5cbiAgICAgICAgICAgICAgI3tsZXZlbE9wdGlvbnN9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgb25TZWxlY3RDaGFuZ2U6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgbGV2ZWxDaGFuZ2VkID0gcGFyc2VJbnQoJHRhcmdldC5hdHRyKFwiZGF0YS1sZXZlbFwiKSlcbiAgICBuZXdWYWx1ZSA9ICR0YXJnZXQudmFsKClcbiAgICBuZXh0TGV2ZWwgPSBsZXZlbENoYW5nZWQgKyAxXG4gICAgaWYgbGV2ZWxDaGFuZ2VkIGlzbnQgQGxldmVscy5sZW5ndGhcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbF8je25leHRMZXZlbH1cIikucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpXG4gICAgICAkaHRtbCA9IEAkZWwuZmluZChcIiNsZXZlbF8je25leHRMZXZlbH1cIikuaHRtbCBAZ2V0T3B0aW9ucyhuZXh0TGV2ZWwpXG4gICAgICBpZiAob3B0aW9ucyA9ICRodG1sLmZpbmQoXCJvcHRpb25cIikpLmxlbmd0aCBpcyAxXG4gICAgICAgIG9wdGlvbnMucGFyZW50KFwic2VsZWN0XCIpLnRyaWdnZXIgXCJjaGFuZ2VcIlxuXG4gIGdldE9wdGlvbnM6ICggaW5kZXgsIHByZXZpb3VzTGV2ZWwgKSAtPlxuXG4gICAgZG9uZU9wdGlvbnMgPSBbXVxuICAgIGxldmVsT3B0aW9ucyA9ICcnXG5cbiAgICBwcmV2aW91c0ZsYWcgPSBmYWxzZVxuXG4gICAgcGFyZW50VmFsdWVzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uaW5kZXhdXG4gICAgICBicmVhayBpZiBpIGlzIGluZGV4XG4gICAgICBwYXJlbnRWYWx1ZXMucHVzaCBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tpfVwiKS52YWwoKVxuXG4gICAgZm9yIGxvY2F0aW9uLCBpIGluIEBsb2NhdGlvbnNcblxuICAgICAgdW5sZXNzIH5kb25lT3B0aW9ucy5pbmRleE9mIGxvY2F0aW9uW2luZGV4XVxuXG4gICAgICAgIGlzTm90Q2hpbGQgPSBpbmRleCBpcyAwXG4gICAgICAgIGlzVmFsaWRDaGlsZCA9IHRydWVcbiAgICAgICAgZm9yIGkgaW4gWzAuLk1hdGgubWF4KGluZGV4LTEsMCldXG5cbiAgICAgICAgICBpZiBwYXJlbnRWYWx1ZXNbaV0gaXNudCBsb2NhdGlvbltpXSBhbmQgbm90IHByZXZpb3VzTGV2ZWxcbiAgICAgICAgICAgIGlzVmFsaWRDaGlsZCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIGlmIGlzTm90Q2hpbGQgb3IgaXNWYWxpZENoaWxkXG5cbiAgICAgICAgICBkb25lT3B0aW9ucy5wdXNoIGxvY2F0aW9uW2luZGV4XVxuXG4gICAgICAgICAgbG9jYXRpb25OYW1lID0gXyhsb2NhdGlvbltpbmRleF0pLmVzY2FwZSgpXG4gICAgICAgICAgXG4gICAgICAgICAgaWYgbG9jYXRpb25baW5kZXhdIGlzIHByZXZpb3VzTGV2ZWxcbiAgICAgICAgICAgIHNlbGVjdGVkID0gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcbiAgICAgICAgICAgIHByZXZpb3VzRmxhZyA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZWxlY3RlZCA9ICcnXG4gICAgICAgICAgbGV2ZWxPcHRpb25zICs9IFwiXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScje2xvY2F0aW9uTmFtZX0nICN7c2VsZWN0ZWQgb3IgJyd9PiN7bG9jYXRpb25OYW1lfTwvb3B0aW9uPlxuICAgICAgICAgIFwiXG5cbiAgICBzZWxlY3RQcm9tcHQgPSBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIiB1bmxlc3MgcHJldmlvdXNGbGFnXG5cbiAgICBwcm9tcHRPcHRpb24gID0gXCI8b3B0aW9uICN7c2VsZWN0UHJvbXB0IG9yICcnfSBkaXNhYmxlZD0nZGlzYWJsZWQnPlBsZWFzZSBzZWxlY3QgYSAje0BsZXZlbHNbaW5kZXhdfTwvb3B0aW9uPlwiXG5cbiAgICBpZiBkb25lT3B0aW9ucy5sZW5ndGggaXMgMVxuICAgICAgcmV0dXJuIGxldmVsT3B0aW9uc1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlxuICAgICAgICAje3Byb21wdE9wdGlvbn1cbiAgICAgICAgI3tsZXZlbE9wdGlvbnN9XG4gICAgICBcIlxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXR1cm4ge1xuICAgICAgXCJsYWJlbHNcIiAgIDogKGxldmVsLnJlcGxhY2UoL1tcXHMtXS9nLFwiX1wiKSBmb3IgbGV2ZWwgaW4gQGxldmVscylcbiAgICAgIFwibG9jYXRpb25cIiA6ICgkLnRyaW0oQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKCkpIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzKVxuICAgIH1cblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJldHVybiB7XG4gICAgICBcImxhYmVsc1wiICAgOiAobGV2ZWwucmVwbGFjZSgvW1xccy1dL2csXCJfXCIpIGZvciBsZXZlbCBpbiBAbGV2ZWxzKVxuICAgICAgXCJsb2NhdGlvblwiIDogKFwic2tpcHBlZFwiIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzKVxuICAgIH1cblxuICBpc1ZhbGlkOiAtPlxuICAgIEAkZWwuZmluZChcIi5tZXNzYWdlXCIpLnJlbW92ZSgpXG4gICAgaW5wdXRzID0gQCRlbC5maW5kKFwiaW5wdXRcIilcbiAgICBzZWxlY3RzID0gQCRlbC5maW5kKFwic2VsZWN0XCIpXG4gICAgZWxlbWVudHMgPSBpZiBzZWxlY3RzLmxlbmd0aCA+IDAgdGhlbiBzZWxlY3RzIGVsc2UgaW5wdXRzXG4gICAgZm9yIGlucHV0LCBpIGluIGVsZW1lbnRzXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzICQoaW5wdXQpLnZhbCgpXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgaW5wdXRzID0gQCRlbC5maW5kKFwiaW5wdXRcIilcbiAgICBzZWxlY3RzID0gQCRlbC5maW5kKFwic2VsZWN0XCIpXG4gICAgZWxlbWVudHMgPSBpZiBzZWxlY3RzLmxlbmd0aCA+IDAgdGhlbiBzZWxlY3RzIGVsc2UgaW5wdXRzXG4gICAgZm9yIGlucHV0IGluIGVsZW1lbnRzXG4gICAgICB1bmxlc3MgJChpbnB1dCkudmFsKClcbiAgICAgICAgbGV2ZWxOYW1lID0gJCgnbGFiZWxbZm9yPScrJChpbnB1dCkuYXR0cignaWQnKSsnXScpLnRleHQoKVxuICAgICAgICAkKGlucHV0KS5hZnRlciBcIiA8c3BhbiBjbGFzcz0nbWVzc2FnZSc+I3t0KFwiTG9jYXRpb25SdW5WaWV3Lm1lc3NhZ2UubXVzdF9iZV9maWxsZWRcIiwgbGV2ZWxOYW1lIDogbGV2ZWxOYW1lKX08L3NwYW4+XCJcbiJdfQ==
