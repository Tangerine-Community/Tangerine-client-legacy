var LocationRunItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LocationRunItemView = (function(superClass) {
  extend(LocationRunItemView, superClass);

  function LocationRunItemView() {
    return LocationRunItemView.__super__.constructor.apply(this, arguments);
  }

  LocationRunItemView.prototype.className = "LocationRunView";

  LocationRunItemView.prototype.events = {
    "click .school_list li": "autofill",
    "keyup input": "showOptions",
    "click .clear": "clearInputs",
    "change select": "onSelectChange"
  };

  LocationRunItemView.prototype.i18n = function() {
    return this.text = {
      clear: t("LocationRunView.button.clear"),
      "help": t("SubtestRunView.button.help")
    };
  };

  LocationRunItemView.prototype.initialize = function(options) {
    var i, k, l, labels, len, len1, len2, level, location, locationData, m, ref, ref1, template;
    Tangerine.progress.currentSubview = this;
    this.i18n();
    this.model = options.model;
    this.parent = this.model.parent;
    this.dataEntry = options.dataEntry;
    labels = {};
    labels.text = this.text;
    this.model.set('labels', labels);
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
    this.skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    this.parent.displaySkip(this.skippable);
    this.parent.displayBack(this.backable);
    return this.li = _.template(template);
  };

  LocationRunItemView.prototype.clearInputs = function() {
    this.$el.empty();
    return this.render();
  };

  LocationRunItemView.prototype.autofill = function(event) {
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

  LocationRunItemView.prototype.showOptions = function(event) {
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

  LocationRunItemView.prototype.getLocationLi = function(i) {
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

  LocationRunItemView.prototype.render = function() {
    var html, i, isDisabled, k, l, len, len1, level, levelOptions, previous, previousLevel, ref, ref1, schoolListElements;
    schoolListElements = "";
    html = "<button class='clear command'>" + this.text.clear + "</button>";
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
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

  LocationRunItemView.prototype.onSelectChange = function(event) {
    var $html, $target, levelChanged, newValue, nextLevel, options;
    $target = $(event.target);
    levelChanged = parseInt($target.attr("data-level"));
    newValue = $target.val();
    nextLevel = levelChanged + 1;
    if (levelChanged !== this.levels.length) {
      this.$el.find("#level_" + nextLevel).removeAttr("disabled");
      $html = this.$el.find("#level_" + nextLevel).html(this.getOptions(nextLevel));
      if ((options = $html.find("option")).length === 2) {
        $(options.parent("select")).val($(options[1]).val());
        return $(options.parent("select")).trigger("change");
      }
    }
  };

  LocationRunItemView.prototype.getOptions = function(index, previousLevel) {
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
    return promptOption + " " + levelOptions;
  };

  LocationRunItemView.prototype.getResult = function() {
    var hash, i, level, result, subtestResult;
    result = {
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

  LocationRunItemView.prototype.getSkipped = function() {
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

  LocationRunItemView.prototype.isValid = function() {
    var elements, i, input, inputs, k, len, selects, value;
    this.$el.find(".message").remove();
    inputs = this.$el.find("input");
    selects = this.$el.find("select");
    elements = selects.length > 0 ? selects : inputs;
    for (i = k = 0, len = elements.length; k < len; i = ++k) {
      input = elements[i];
      value = $(input).val();
      if (!value) {
        return false;
      }
    }
    return true;
  };

  LocationRunItemView.prototype.testValid = function() {
    if (this.isValid != null) {
      return this.isValid();
    } else {
      return false;
    }
    return true;
  };

  LocationRunItemView.prototype.showErrors = function() {
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

  return LocationRunItemView;

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUnVuSXRlbVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSx1QkFBQSxFQUEwQixVQUExQjtJQUNBLGFBQUEsRUFBaUIsYUFEakI7SUFFQSxjQUFBLEVBQWlCLGFBRmpCO0lBR0EsZUFBQSxFQUFrQixnQkFIbEI7OztnQ0FLRixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxLQUFBLEVBQVEsQ0FBQSxDQUFFLDhCQUFGLENBQVI7TUFDQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRFQ7O0VBRkU7O2dDQUtOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFuQixHQUFvQztJQUNwQyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0lBRXJCLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBO0lBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxFQUFxQixNQUFyQjtJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFBLElBQThCO0lBQ3hDLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLElBQTJCO0lBRXhDLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEtBQWtCLENBQWxCLElB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LElBQUEsQ0FBTyxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsR0FBVCxDQUFBLENBQVA7UUFDRSxTQUFBLEdBQVksQ0FBQSxDQUFFLFlBQUEsR0FBYSxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBYixHQUFpQyxHQUFuQyxDQUF1QyxDQUFDLElBQXhDLENBQUE7c0JBQ1osQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLEtBQVQsQ0FBZSx5QkFBQSxHQUF5QixDQUFDLENBQUEsQ0FBRSx3Q0FBRixFQUE0QztVQUFBLFNBQUEsRUFBWSxTQUFaO1NBQTVDLENBQUQsQ0FBekIsR0FBNkYsU0FBNUcsR0FGRjtPQUFBLE1BQUE7OEJBQUE7O0FBREY7O0VBSlU7Ozs7R0F4UW9CLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9zdWJ0ZXN0L3Byb3RvdHlwZXMvTG9jYXRpb25SdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExvY2F0aW9uUnVuSXRlbVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5NYXJpb25ldHRlLkl0ZW1WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkxvY2F0aW9uUnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgIFwiY2xpY2sgLnNjaG9vbF9saXN0IGxpXCIgOiBcImF1dG9maWxsXCJcbiAgICBcImtleXVwIGlucHV0XCIgIDogXCJzaG93T3B0aW9uc1wiXG4gICAgXCJjbGljayAuY2xlYXJcIiA6IFwiY2xlYXJJbnB1dHNcIlxuICAgIFwiY2hhbmdlIHNlbGVjdFwiIDogXCJvblNlbGVjdENoYW5nZVwiXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9IFxuICAgICAgY2xlYXIgOiB0KFwiTG9jYXRpb25SdW5WaWV3LmJ1dHRvbi5jbGVhclwiKVxuICAgICAgXCJoZWxwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmhlbHBcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gQG1vZGVsLnBhcmVudFxuICAgIEBkYXRhRW50cnkgPSBvcHRpb25zLmRhdGFFbnRyeVxuXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG5cbiAgICBAbGV2ZWxzID0gQG1vZGVsLmdldChcImxldmVsc1wiKSAgICAgICB8fCBbXVxuICAgIEBsb2NhdGlvbnMgPSBAbW9kZWwuZ2V0KFwibG9jYXRpb25zXCIpIHx8IFtdXG5cbiAgICBpZiBAbGV2ZWxzLmxlbmd0aCBpcyAxIGFuZCBAbGV2ZWxzWzBdIGlzIFwiXCJcbiAgICAgIEBsZXZlbHMgPSBbXVxuICAgIGlmIEBsb2NhdGlvbnMubGVuZ3RoIGlzIDEgYW5kIEBsb2NhdGlvbnNbMF0gaXMgXCJcIlxuICAgICAgQGxvY2F0aW9ucyA9IFtdXG5cbiAgICBAaGF5c3RhY2sgPSBbXVxuXG4gICAgZm9yIGxvY2F0aW9uLCBpIGluIEBsb2NhdGlvbnNcbiAgICAgIEBoYXlzdGFja1tpXSA9IFtdXG4gICAgICBmb3IgbG9jYXRpb25EYXRhIGluIGxvY2F0aW9uXG4gICAgICAgIEBoYXlzdGFja1tpXS5wdXNoIGxvY2F0aW9uRGF0YS50b0xvd2VyQ2FzZSgpXG5cbiAgICB0ZW1wbGF0ZSA9IFwiPGxpIGRhdGEtaW5kZXg9J3t7aX19Jz5cIlxuICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG4gICAgICB0ZW1wbGF0ZSArPSBcInt7bGV2ZWxfI3tpfX19XCJcbiAgICAgIHRlbXBsYXRlICs9IFwiIC0gXCIgdW5sZXNzIGkgaXMgQGxldmVscy5sZW5ndGgtMVxuICAgIHRlbXBsYXRlICs9IFwiPC9saT5cIlxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gICAgQGxpID0gXy50ZW1wbGF0ZSh0ZW1wbGF0ZSlcblxuICBjbGVhcklucHV0czogLT5cbiAgICBAJGVsLmVtcHR5KClcbiAgICBAcmVuZGVyKClcblxuICBhdXRvZmlsbDogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5hdXRvZmlsbFwiKS5mYWRlT3V0KDI1MClcbiAgICBpbmRleCA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1pbmRleFwiKVxuICAgIGxvY2F0aW9uID0gQGxvY2F0aW9uc1tpbmRleF1cbiAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKGxvY2F0aW9uW2ldKVxuXG5cbiAgc2hvd09wdGlvbnM6IChldmVudCkgLT5cbiAgICBuZWVkbGUgPSAkKGV2ZW50LnRhcmdldCkudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgIGZpZWxkSW5kZXggPSBwYXJzZUludCgkKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS1sZXZlbCcpKVxuICAgICMgaGlkZSBpZiBvdGhlcnMgYXJlIHNob3dpbmdcbiAgICBmb3Igb3RoZXJGaWVsZCBpbiBbMC4uQGhheXN0YWNrLmxlbmd0aF1cbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je290aGVyRmllbGR9XCIpLmhpZGUoKVxuXG4gICAgYXRMZWFzdE9uZSA9IGZhbHNlXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIHN0YWNrLCBpIGluIEBoYXlzdGFja1xuICAgICAgaXNUaGVyZSA9IH5AaGF5c3RhY2tbaV1bZmllbGRJbmRleF0uaW5kZXhPZihuZWVkbGUpXG4gICAgICByZXN1bHRzLnB1c2ggaSBpZiBpc1RoZXJlXG4gICAgICBhdExlYXN0T25lID0gdHJ1ZSBpZiBpc1RoZXJlXG5cbiAgICBmb3Igc3RhY2ssIGkgaW4gQGhheXN0YWNrXG4gICAgICBmb3Igb3RoZXJGaWVsZCwgaiBpbiBzdGFja1xuICAgICAgICBpZiBqIGlzIGZpZWxkSW5kZXhcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpc1RoZXJlID0gfkBoYXlzdGFja1tpXVtqXS5pbmRleE9mKG5lZWRsZSlcbiAgICAgICAgcmVzdWx0cy5wdXNoIGkgaWYgaXNUaGVyZSBhbmQgIX5yZXN1bHRzLmluZGV4T2YoaSlcbiAgICAgICAgYXRMZWFzdE9uZSA9IHRydWUgaWYgaXNUaGVyZVxuXG4gICAgaWYgYXRMZWFzdE9uZVxuICAgICAgaHRtbCA9IFwiXCJcbiAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgICAgICBodG1sICs9IEBnZXRMb2NhdGlvbkxpIHJlc3VsdFxuICAgICAgQCRlbC5maW5kKFwiI2F1dG9maWxsXyN7ZmllbGRJbmRleH1cIikuZmFkZUluKDI1MClcbiAgICAgIEAkZWwuZmluZChcIiNzY2hvb2xfbGlzdF8je2ZpZWxkSW5kZXh9XCIpLmh0bWwgaHRtbFxuXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2F1dG9maWxsXyN7ZmllbGRJbmRleH1cIikuZmFkZU91dCgyNTApXG5cbiAgZ2V0TG9jYXRpb25MaTogKGkpIC0+XG4gICAgdGVtcGxhdGVJbmZvID0gXCJpXCIgOiBpXG4gICAgZm9yIGxvY2F0aW9uLCBqIGluIEBsb2NhdGlvbnNbaV1cbiAgICAgIHRlbXBsYXRlSW5mb1tcImxldmVsX1wiICsgal0gPSBsb2NhdGlvblxuICAgIHJldHVybiBAbGkgdGVtcGxhdGVJbmZvXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgc2Nob29sTGlzdEVsZW1lbnRzID0gXCJcIlxuXG4gICAgaHRtbCA9IFwiPGJ1dHRvbiBjbGFzcz0nY2xlYXIgY29tbWFuZCc+I3tAdGV4dC5jbGVhcn08L2J1dHRvbj5cIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcbiAgICAgIHByZXZpb3VzID0gQG1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcblxuICAgIGlmIEB0eXBlZFxuXG4gICAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgICBwcmV2aW91c0xldmVsID0gJydcbiAgICAgICAgaWYgcHJldmlvdXNcbiAgICAgICAgICBwcmV2aW91c0xldmVsID0gcHJldmlvdXMubG9jYXRpb25baV1cbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xldmVsXyN7aX0nPiN7bGV2ZWx9PC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8aW5wdXQgZGF0YS1sZXZlbD0nI3tpfScgaWQ9J2xldmVsXyN7aX0nIHZhbHVlPScje3ByZXZpb3VzTGV2ZWx8fCcnfSc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nYXV0b2ZpbGxfI3tpfScgY2xhc3M9J2F1dG9maWxsJyBzdHlsZT0nZGlzcGxheTpub25lJz5cbiAgICAgICAgICAgIDxoMj4je3QoJ3NlbGVjdCBvbmUgZnJvbSBhdXRvZmlsbCBsaXN0Jyl9PC9oMj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz0nc2Nob29sX2xpc3QnIGlkPSdzY2hvb2xfbGlzdF8je2l9Jz5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIFwiXG5cbiAgICBlbHNlXG5cbiAgICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG5cbiAgICAgICAgcHJldmlvdXNMZXZlbCA9ICcnXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgcHJldmlvdXNMZXZlbCA9IHByZXZpb3VzLmxvY2F0aW9uW2ldXG4gICAgICAgIFxuICAgICAgICBsZXZlbE9wdGlvbnMgPSBAZ2V0T3B0aW9ucyhpLCBwcmV2aW91c0xldmVsKVxuXG4gICAgICAgIGlzRGlzYWJsZWQgPSAoaSBpc250IDAgYW5kIG5vdCBwcmV2aW91c0xldmVsKSBhbmQgXCJkaXNhYmxlZD0nZGlzYWJsZWQnXCIgXG5cbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xldmVsXyN7aX0nPiN7bGV2ZWx9PC9sYWJlbD48YnI+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPSdsZXZlbF8je2l9JyBkYXRhLWxldmVsPScje2l9JyAje2lzRGlzYWJsZWR8fCcnfT5cbiAgICAgICAgICAgICAgI3tsZXZlbE9wdGlvbnN9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgb25TZWxlY3RDaGFuZ2U6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgbGV2ZWxDaGFuZ2VkID0gcGFyc2VJbnQoJHRhcmdldC5hdHRyKFwiZGF0YS1sZXZlbFwiKSlcbiAgICBuZXdWYWx1ZSA9ICR0YXJnZXQudmFsKClcbiAgICBuZXh0TGV2ZWwgPSBsZXZlbENoYW5nZWQgKyAxXG4gICAgaWYgbGV2ZWxDaGFuZ2VkIGlzbnQgQGxldmVscy5sZW5ndGhcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbF8je25leHRMZXZlbH1cIikucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpXG4gICAgICAkaHRtbCA9IEAkZWwuZmluZChcIiNsZXZlbF8je25leHRMZXZlbH1cIikuaHRtbCBAZ2V0T3B0aW9ucyhuZXh0TGV2ZWwpXG4gICAgICAjIElmIHRoZXJlIGlzIG9ubHkgb25lIG9wdGlvbiwgc2VsZWN0IHRoYXQgb3B0aW9uLlxuICAgICAgaWYgKG9wdGlvbnMgPSAkaHRtbC5maW5kKFwib3B0aW9uXCIpKS5sZW5ndGggaXMgMlxuICAgICAgICAjIFByb2dyYW1hdGljYWxseSBzZXQgdGhlIHNlbGVjdGVkIHZhbHVlLlxuICAgICAgICAkKG9wdGlvbnMucGFyZW50KFwic2VsZWN0XCIpKS52YWwoJChvcHRpb25zWzFdKS52YWwoKSlcbiAgICAgICAgIyBUcmlnZ2VyIGNoYW5nZSBldmVudCB0aGF0IHdvdWxkIG90aGVyd2lzZSBiZSB0cmlnZ2VyZWQgYnkgdXNlci1icm93c2VyXG4gICAgICAgICMgaW50ZXJhY3Rpb24uXG4gICAgICAgICQob3B0aW9ucy5wYXJlbnQoXCJzZWxlY3RcIikpLnRyaWdnZXIgXCJjaGFuZ2VcIlxuXG4gIGdldE9wdGlvbnM6ICggaW5kZXgsIHByZXZpb3VzTGV2ZWwgKSAtPlxuXG4gICAgZG9uZU9wdGlvbnMgPSBbXVxuICAgIGxldmVsT3B0aW9ucyA9ICcnXG5cbiAgICBwcmV2aW91c0ZsYWcgPSBmYWxzZVxuXG4gICAgcGFyZW50VmFsdWVzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uaW5kZXhdXG4gICAgICBicmVhayBpZiBpIGlzIGluZGV4XG4gICAgICBwYXJlbnRWYWx1ZXMucHVzaCBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tpfVwiKS52YWwoKVxuXG4gICAgZm9yIGxvY2F0aW9uLCBpIGluIEBsb2NhdGlvbnNcblxuICAgICAgdW5sZXNzIH5kb25lT3B0aW9ucy5pbmRleE9mIGxvY2F0aW9uW2luZGV4XVxuXG4gICAgICAgIGlzTm90Q2hpbGQgPSBpbmRleCBpcyAwXG4gICAgICAgIGlzVmFsaWRDaGlsZCA9IHRydWVcbiAgICAgICAgZm9yIGkgaW4gWzAuLk1hdGgubWF4KGluZGV4LTEsMCldXG5cbiAgICAgICAgICBpZiBwYXJlbnRWYWx1ZXNbaV0gaXNudCBsb2NhdGlvbltpXSBhbmQgbm90IHByZXZpb3VzTGV2ZWxcbiAgICAgICAgICAgIGlzVmFsaWRDaGlsZCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIGlmIGlzTm90Q2hpbGQgb3IgaXNWYWxpZENoaWxkXG5cbiAgICAgICAgICBkb25lT3B0aW9ucy5wdXNoIGxvY2F0aW9uW2luZGV4XVxuXG4gICAgICAgICAgbG9jYXRpb25OYW1lID0gXyhsb2NhdGlvbltpbmRleF0pLmVzY2FwZSgpXG4gICAgICAgICAgXG4gICAgICAgICAgaWYgbG9jYXRpb25baW5kZXhdIGlzIHByZXZpb3VzTGV2ZWxcbiAgICAgICAgICAgIHNlbGVjdGVkID0gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCJcbiAgICAgICAgICAgIHByZXZpb3VzRmxhZyA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZWxlY3RlZCA9ICcnXG4gICAgICAgICAgbGV2ZWxPcHRpb25zICs9IFwiXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScje2xvY2F0aW9uTmFtZX0nICN7c2VsZWN0ZWQgb3IgJyd9PiN7bG9jYXRpb25OYW1lfTwvb3B0aW9uPlxuICAgICAgICAgIFwiXG5cbiAgICBzZWxlY3RQcm9tcHQgPSBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIiB1bmxlc3MgcHJldmlvdXNGbGFnXG5cbiAgICBwcm9tcHRPcHRpb24gID0gXCI8b3B0aW9uICN7c2VsZWN0UHJvbXB0IG9yICcnfSBkaXNhYmxlZD0nZGlzYWJsZWQnPlBsZWFzZSBzZWxlY3QgYSAje0BsZXZlbHNbaW5kZXhdfTwvb3B0aW9uPlwiXG5cbiMgICAgaWYgZG9uZU9wdGlvbnMubGVuZ3RoIGlzIDFcbiMgICAgICByZXR1cm4gbGV2ZWxPcHRpb25zXG4jICAgIGVsc2VcbiAgICByZXR1cm4gXCJcbiAgICAgICN7cHJvbXB0T3B0aW9ufVxuICAgICAgI3tsZXZlbE9wdGlvbnN9XG4gICAgICBcIlxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPVxuICAgICAgXCJsYWJlbHNcIiAgIDogKGxldmVsLnJlcGxhY2UoL1tcXHMtXS9nLFwiX1wiKSBmb3IgbGV2ZWwgaW4gQGxldmVscylcbiAgICAgIFwibG9jYXRpb25cIiA6ICgkLnRyaW0oQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKCkpIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzKVxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHN1YnRlc3RSZXN1bHQgPVxuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4ge1xuICAgICAgXCJsYWJlbHNcIiAgIDogKGxldmVsLnJlcGxhY2UoL1tcXHMtXS9nLFwiX1wiKSBmb3IgbGV2ZWwgaW4gQGxldmVscylcbiAgICAgIFwibG9jYXRpb25cIiA6IChcInNraXBwZWRcIiBmb3IgbGV2ZWwsIGkgaW4gQGxldmVscylcbiAgICB9XG5cbiAgaXNWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJDaGVja2luZyBMb2NhdGlvbiBpc1ZhbGlkOiBcIilcbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZVwiKS5yZW1vdmUoKVxuICAgIGlucHV0cyA9IEAkZWwuZmluZChcImlucHV0XCIpXG4gICAgc2VsZWN0cyA9IEAkZWwuZmluZChcInNlbGVjdFwiKVxuICAgIGVsZW1lbnRzID0gaWYgc2VsZWN0cy5sZW5ndGggPiAwIHRoZW4gc2VsZWN0cyBlbHNlIGlucHV0c1xuICAgIGZvciBpbnB1dCwgaSBpbiBlbGVtZW50c1xuIyAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgJChpbnB1dCkudmFsKClcbiAgICAgIHZhbHVlID0gJChpbnB1dCkudmFsKClcbiMgICAgICBpZiB2YWx1ZVxuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyB2YWx1ZVxuICAgIHRydWVcblxuICB0ZXN0VmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiTG9jYXRpb25SdW5JdGVtVmlldyB0ZXN0VmFsaWQuXCIpXG4gICMgICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuIyAgICBjdXJyZW50VmlldyA9IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuICAgIGlmIEBpc1ZhbGlkP1xuICAgICAgcmV0dXJuIEBpc1ZhbGlkKClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB0cnVlXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICBpbnB1dHMgPSBAJGVsLmZpbmQoXCJpbnB1dFwiKVxuICAgIHNlbGVjdHMgPSBAJGVsLmZpbmQoXCJzZWxlY3RcIilcbiAgICBlbGVtZW50cyA9IGlmIHNlbGVjdHMubGVuZ3RoID4gMCB0aGVuIHNlbGVjdHMgZWxzZSBpbnB1dHNcbiAgICBmb3IgaW5wdXQgaW4gZWxlbWVudHNcbiAgICAgIHVubGVzcyAkKGlucHV0KS52YWwoKVxuICAgICAgICBsZXZlbE5hbWUgPSAkKCdsYWJlbFtmb3I9JyskKGlucHV0KS5hdHRyKCdpZCcpKyddJykudGV4dCgpXG4gICAgICAgICQoaW5wdXQpLmFmdGVyIFwiIDxzcGFuIGNsYXNzPSdtZXNzYWdlJz4je3QoXCJMb2NhdGlvblJ1blZpZXcubWVzc2FnZS5tdXN0X2JlX2ZpbGxlZFwiLCBsZXZlbE5hbWUgOiBsZXZlbE5hbWUpfTwvc3Bhbj5cIlxuIl19
