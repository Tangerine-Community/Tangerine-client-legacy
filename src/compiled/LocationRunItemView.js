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
    this.parent = options.parent;
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
    var enumeratorHelp, html, i, isDisabled, k, l, len, len1, level, levelOptions, previous, previousLevel, ref, ref1, schoolListElements, studentDialog;
    enumeratorHelp = (this.model.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>" + this.text.help + "</button><div class='enumerator_help' " + (this.fontStyle || "") + ">" + (this.model.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog' " + (this.fontStyle || "") + ">" + (this.model.get('studentDialog')) + "</div>" : "";
    schoolListElements = "";
    html = "<h2>" + (this.model.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog + " <button class='clear command'>" + this.text.clear + "</button>";
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
      if ((options = $html.find("option")).length === 1) {
        return options.parent("select").trigger("change");
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

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUnVuSXRlbVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSx1QkFBQSxFQUEwQixVQUExQjtJQUNBLGFBQUEsRUFBaUIsYUFEakI7SUFFQSxjQUFBLEVBQWlCLGFBRmpCO0lBR0EsZUFBQSxFQUFrQixnQkFIbEI7OztnQ0FLRixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxLQUFBLEVBQVEsQ0FBQSxDQUFFLDhCQUFGLENBQVI7TUFDQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRFQ7O0VBRkU7O2dDQUtOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFuQixHQUFvQztJQUNwQyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFFckIsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUE7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLE1BQXJCO0lBR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQUEsSUFBOEI7SUFDeEMsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsSUFBMkI7SUFFeEMsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBa0IsQ0FBbEIsSUFBd0IsSUFBQyxD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QUFpQixDQUFwQixHQUEyQixPQUEzQixHQUF3QztBQUNuRDtTQUFBLDBDQUFBOztNQUNFLElBQUEsQ0FBTyxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsR0FBVCxDQUFBLENBQVA7UUFDRSxTQUFBLEdBQVksQ0FBQSxDQUFFLFlBQUEsR0FBYSxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBYixHQUFpQyxHQUFuQyxDQUF1QyxDQUFDLElBQXhDLENBQUE7c0JBQ1osQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLEtBQVQsQ0FBZSx5QkFBQSxHQUF5QixDQUFDLENBQUEsQ0FBRSx3Q0FBRixFQUE0QztVQUFBLFNBQUEsRUFBWSxTQUFaO1NBQTVDLENBQUQsQ0FBekIsR0FBNkYsU0FBNUcsR0FGRjtPQUFBLE1BQUE7OEJBQUE7O0FBREY7O0VBSlU7Ozs7R0FuUW9CLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvblJ1bkl0ZW1WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9jYXRpb25SdW5JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiTG9jYXRpb25SdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgXCJjbGljayAuc2Nob29sX2xpc3QgbGlcIiA6IFwiYXV0b2ZpbGxcIlxuICAgIFwia2V5dXAgaW5wdXRcIiAgOiBcInNob3dPcHRpb25zXCJcbiAgICBcImNsaWNrIC5jbGVhclwiIDogXCJjbGVhcklucHV0c1wiXG4gICAgXCJjaGFuZ2Ugc2VsZWN0XCIgOiBcIm9uU2VsZWN0Q2hhbmdlXCJcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID0gXG4gICAgICBjbGVhciA6IHQoXCJMb2NhdGlvblJ1blZpZXcuYnV0dG9uLmNsZWFyXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3VidmlldyA9IEBcbiAgICBAaTE4bigpXG5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgPSBvcHRpb25zLmRhdGFFbnRyeVxuXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG5cbiAgICBAbGV2ZWxzID0gQG1vZGVsLmdldChcImxldmVsc1wiKSAgICAgICB8fCBbXVxuICAgIEBsb2NhdGlvbnMgPSBAbW9kZWwuZ2V0KFwibG9jYXRpb25zXCIpIHx8IFtdXG5cbiAgICBpZiBAbGV2ZWxzLmxlbmd0aCBpcyAxIGFuZCBAbGV2ZWxzWzBdIGlzIFwiXCJcbiAgICAgIEBsZXZlbHMgPSBbXVxuICAgIGlmIEBsb2NhdGlvbnMubGVuZ3RoIGlzIDEgYW5kIEBsb2NhdGlvbnNbMF0gaXMgXCJcIlxuICAgICAgQGxvY2F0aW9ucyA9IFtdXG5cbiAgICBAaGF5c3RhY2sgPSBbXVxuXG4gICAgZm9yIGxvY2F0aW9uLCBpIGluIEBsb2NhdGlvbnNcbiAgICAgIEBoYXlzdGFja1tpXSA9IFtdXG4gICAgICBmb3IgbG9jYXRpb25EYXRhIGluIGxvY2F0aW9uXG4gICAgICAgIEBoYXlzdGFja1tpXS5wdXNoIGxvY2F0aW9uRGF0YS50b0xvd2VyQ2FzZSgpXG5cbiAgICB0ZW1wbGF0ZSA9IFwiPGxpIGRhdGEtaW5kZXg9J3t7aX19Jz5cIlxuICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG4gICAgICB0ZW1wbGF0ZSArPSBcInt7bGV2ZWxfI3tpfX19XCJcbiAgICAgIHRlbXBsYXRlICs9IFwiIC0gXCIgdW5sZXNzIGkgaXMgQGxldmVscy5sZW5ndGgtMVxuICAgIHRlbXBsYXRlICs9IFwiPC9saT5cIlxuXG4gICAgQGxpID0gXy50ZW1wbGF0ZSh0ZW1wbGF0ZSlcblxuICBjbGVhcklucHV0czogLT5cbiAgICBAJGVsLmVtcHR5KClcbiAgICBAcmVuZGVyKClcblxuICBhdXRvZmlsbDogKGV2ZW50KSAtPlxuICAgIEAkZWwuZmluZChcIi5hdXRvZmlsbFwiKS5mYWRlT3V0KDI1MClcbiAgICBpbmRleCA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1pbmRleFwiKVxuICAgIGxvY2F0aW9uID0gQGxvY2F0aW9uc1tpbmRleF1cbiAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKGxvY2F0aW9uW2ldKVxuXG5cbiAgc2hvd09wdGlvbnM6IChldmVudCkgLT5cbiAgICBuZWVkbGUgPSAkKGV2ZW50LnRhcmdldCkudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgIGZpZWxkSW5kZXggPSBwYXJzZUludCgkKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS1sZXZlbCcpKVxuICAgICMgaGlkZSBpZiBvdGhlcnMgYXJlIHNob3dpbmdcbiAgICBmb3Igb3RoZXJGaWVsZCBpbiBbMC4uQGhheXN0YWNrLmxlbmd0aF1cbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je290aGVyRmllbGR9XCIpLmhpZGUoKVxuXG4gICAgYXRMZWFzdE9uZSA9IGZhbHNlXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIHN0YWNrLCBpIGluIEBoYXlzdGFja1xuICAgICAgaXNUaGVyZSA9IH5AaGF5c3RhY2tbaV1bZmllbGRJbmRleF0uaW5kZXhPZihuZWVkbGUpXG4gICAgICByZXN1bHRzLnB1c2ggaSBpZiBpc1RoZXJlXG4gICAgICBhdExlYXN0T25lID0gdHJ1ZSBpZiBpc1RoZXJlXG5cbiAgICBmb3Igc3RhY2ssIGkgaW4gQGhheXN0YWNrXG4gICAgICBmb3Igb3RoZXJGaWVsZCwgaiBpbiBzdGFja1xuICAgICAgICBpZiBqIGlzIGZpZWxkSW5kZXhcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpc1RoZXJlID0gfkBoYXlzdGFja1tpXVtqXS5pbmRleE9mKG5lZWRsZSlcbiAgICAgICAgcmVzdWx0cy5wdXNoIGkgaWYgaXNUaGVyZSBhbmQgIX5yZXN1bHRzLmluZGV4T2YoaSlcbiAgICAgICAgYXRMZWFzdE9uZSA9IHRydWUgaWYgaXNUaGVyZVxuXG4gICAgaWYgYXRMZWFzdE9uZVxuICAgICAgaHRtbCA9IFwiXCJcbiAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgICAgICBodG1sICs9IEBnZXRMb2NhdGlvbkxpIHJlc3VsdFxuICAgICAgQCRlbC5maW5kKFwiI2F1dG9maWxsXyN7ZmllbGRJbmRleH1cIikuZmFkZUluKDI1MClcbiAgICAgIEAkZWwuZmluZChcIiNzY2hvb2xfbGlzdF8je2ZpZWxkSW5kZXh9XCIpLmh0bWwgaHRtbFxuXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2F1dG9maWxsXyN7ZmllbGRJbmRleH1cIikuZmFkZU91dCgyNTApXG5cbiAgZ2V0TG9jYXRpb25MaTogKGkpIC0+XG4gICAgdGVtcGxhdGVJbmZvID0gXCJpXCIgOiBpXG4gICAgZm9yIGxvY2F0aW9uLCBqIGluIEBsb2NhdGlvbnNbaV1cbiAgICAgIHRlbXBsYXRlSW5mb1tcImxldmVsX1wiICsgal0gPSBsb2NhdGlvblxuICAgIHJldHVybiBAbGkgdGVtcGxhdGVJbmZvXG5cbiAgcmVuZGVyOiAtPlxuICAgIGVudW1lcmF0b3JIZWxwID0gaWYgKEBtb2RlbC5nZXQoXCJlbnVtZXJhdG9ySGVscFwiKSB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8YnV0dG9uIGNsYXNzPSdzdWJ0ZXN0X2hlbHAgY29tbWFuZCc+I3tAdGV4dC5oZWxwfTwvYnV0dG9uPjxkaXYgY2xhc3M9J2VudW1lcmF0b3JfaGVscCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAnZW51bWVyYXRvckhlbHAnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgIHN0dWRlbnREaWFsb2cgID0gaWYgKEBtb2RlbC5nZXQoXCJzdHVkZW50RGlhbG9nXCIpICB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8ZGl2IGNsYXNzPSdzdHVkZW50X2RpYWxvZycgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAnc3R1ZGVudERpYWxvZyd9PC9kaXY+XCIgZWxzZSBcIlwiXG5cbiAgICBzY2hvb2xMaXN0RWxlbWVudHMgPSBcIlwiXG5cbiAgICBodG1sID0gXCI8aDI+I3tAbW9kZWwuZ2V0ICduYW1lJ308L2gyPlxuICAgICAgICAje2VudW1lcmF0b3JIZWxwfVxuICAgICAgICAje3N0dWRlbnREaWFsb2d9XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NsZWFyIGNvbW1hbmQnPiN7QHRleHQuY2xlYXJ9PC9idXR0b24+XCJcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG4gICAgICBwcmV2aW91cyA9IEBtb2RlbC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICBpZiBAdHlwZWRcblxuICAgICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcbiAgICAgICAgcHJldmlvdXNMZXZlbCA9ICcnXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgcHJldmlvdXNMZXZlbCA9IHByZXZpb3VzLmxvY2F0aW9uW2ldXG4gICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbF8je2l9Jz4je2xldmVsfTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IGRhdGEtbGV2ZWw9JyN7aX0nIGlkPSdsZXZlbF8je2l9JyB2YWx1ZT0nI3twcmV2aW91c0xldmVsfHwnJ30nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2F1dG9maWxsXyN7aX0nIGNsYXNzPSdhdXRvZmlsbCcgc3R5bGU9J2Rpc3BsYXk6bm9uZSc+XG4gICAgICAgICAgICA8aDI+I3t0KCdzZWxlY3Qgb25lIGZyb20gYXV0b2ZpbGwgbGlzdCcpfTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9J3NjaG9vbF9saXN0JyBpZD0nc2Nob29sX2xpc3RfI3tpfSc+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBcIlxuXG4gICAgZWxzZVxuXG4gICAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuXG4gICAgICAgIHByZXZpb3VzTGV2ZWwgPSAnJ1xuICAgICAgICBpZiBwcmV2aW91c1xuICAgICAgICAgIHByZXZpb3VzTGV2ZWwgPSBwcmV2aW91cy5sb2NhdGlvbltpXVxuICAgICAgICBcbiAgICAgICAgbGV2ZWxPcHRpb25zID0gQGdldE9wdGlvbnMoaSwgcHJldmlvdXNMZXZlbClcblxuICAgICAgICBpc0Rpc2FibGVkID0gKGkgaXNudCAwIGFuZCBub3QgcHJldmlvdXNMZXZlbCkgYW5kIFwiZGlzYWJsZWQ9J2Rpc2FibGVkJ1wiIFxuXG4gICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbF8je2l9Jz4je2xldmVsfTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD0nbGV2ZWxfI3tpfScgZGF0YS1sZXZlbD0nI3tpfScgI3tpc0Rpc2FibGVkfHwnJ30+XG4gICAgICAgICAgICAgICN7bGV2ZWxPcHRpb25zfVxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIFwiXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIG9uU2VsZWN0Q2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGxldmVsQ2hhbmdlZCA9IHBhcnNlSW50KCR0YXJnZXQuYXR0cihcImRhdGEtbGV2ZWxcIikpXG4gICAgbmV3VmFsdWUgPSAkdGFyZ2V0LnZhbCgpXG4gICAgbmV4dExldmVsID0gbGV2ZWxDaGFuZ2VkICsgMVxuICAgIGlmIGxldmVsQ2hhbmdlZCBpc250IEBsZXZlbHMubGVuZ3RoXG4gICAgICBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tuZXh0TGV2ZWx9XCIpLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKVxuICAgICAgJGh0bWwgPSBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tuZXh0TGV2ZWx9XCIpLmh0bWwgQGdldE9wdGlvbnMobmV4dExldmVsKVxuICAgICAgaWYgKG9wdGlvbnMgPSAkaHRtbC5maW5kKFwib3B0aW9uXCIpKS5sZW5ndGggaXMgMVxuICAgICAgICBvcHRpb25zLnBhcmVudChcInNlbGVjdFwiKS50cmlnZ2VyIFwiY2hhbmdlXCJcblxuICBnZXRPcHRpb25zOiAoIGluZGV4LCBwcmV2aW91c0xldmVsICkgLT5cblxuICAgIGRvbmVPcHRpb25zID0gW11cbiAgICBsZXZlbE9wdGlvbnMgPSAnJ1xuXG4gICAgcHJldmlvdXNGbGFnID0gZmFsc2VcblxuICAgIHBhcmVudFZhbHVlcyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLmluZGV4XVxuICAgICAgYnJlYWsgaWYgaSBpcyBpbmRleFxuICAgICAgcGFyZW50VmFsdWVzLnB1c2ggQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKClcblxuICAgIGZvciBsb2NhdGlvbiwgaSBpbiBAbG9jYXRpb25zXG5cbiAgICAgIHVubGVzcyB+ZG9uZU9wdGlvbnMuaW5kZXhPZiBsb2NhdGlvbltpbmRleF1cblxuICAgICAgICBpc05vdENoaWxkID0gaW5kZXggaXMgMFxuICAgICAgICBpc1ZhbGlkQ2hpbGQgPSB0cnVlXG4gICAgICAgIGZvciBpIGluIFswLi5NYXRoLm1heChpbmRleC0xLDApXVxuXG4gICAgICAgICAgaWYgcGFyZW50VmFsdWVzW2ldIGlzbnQgbG9jYXRpb25baV0gYW5kIG5vdCBwcmV2aW91c0xldmVsXG4gICAgICAgICAgICBpc1ZhbGlkQ2hpbGQgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBpZiBpc05vdENoaWxkIG9yIGlzVmFsaWRDaGlsZFxuXG4gICAgICAgICAgZG9uZU9wdGlvbnMucHVzaCBsb2NhdGlvbltpbmRleF1cblxuICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IF8obG9jYXRpb25baW5kZXhdKS5lc2NhcGUoKVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIGxvY2F0aW9uW2luZGV4XSBpcyBwcmV2aW91c0xldmVsXG4gICAgICAgICAgICBzZWxlY3RlZCA9IFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiXG4gICAgICAgICAgICBwcmV2aW91c0ZsYWcgPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2VsZWN0ZWQgPSAnJ1xuICAgICAgICAgIGxldmVsT3B0aW9ucyArPSBcIlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nI3tsb2NhdGlvbk5hbWV9JyAje3NlbGVjdGVkIG9yICcnfT4je2xvY2F0aW9uTmFtZX08L29wdGlvbj5cbiAgICAgICAgICBcIlxuXG4gICAgc2VsZWN0UHJvbXB0ID0gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgdW5sZXNzIHByZXZpb3VzRmxhZ1xuXG4gICAgcHJvbXB0T3B0aW9uICA9IFwiPG9wdGlvbiAje3NlbGVjdFByb21wdCBvciAnJ30gZGlzYWJsZWQ9J2Rpc2FibGVkJz5QbGVhc2Ugc2VsZWN0IGEgI3tAbGV2ZWxzW2luZGV4XX08L29wdGlvbj5cIlxuXG4jICAgIGlmIGRvbmVPcHRpb25zLmxlbmd0aCBpcyAxXG4jICAgICAgcmV0dXJuIGxldmVsT3B0aW9uc1xuIyAgICBlbHNlXG4gICAgcmV0dXJuIFwiXG4gICAgICAje3Byb21wdE9wdGlvbn1cbiAgICAgICN7bGV2ZWxPcHRpb25zfVxuICAgICAgXCJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID1cbiAgICAgIFwibGFiZWxzXCIgICA6IChsZXZlbC5yZXBsYWNlKC9bXFxzLV0vZyxcIl9cIikgZm9yIGxldmVsIGluIEBsZXZlbHMpXG4gICAgICBcImxvY2F0aW9uXCIgOiAoJC50cmltKEAkZWwuZmluZChcIiNsZXZlbF8je2l9XCIpLnZhbCgpKSBmb3IgbGV2ZWwsIGkgaW4gQGxldmVscylcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICBzdWJ0ZXN0UmVzdWx0ID1cbiAgICAgICdib2R5JyA6IHJlc3VsdFxuICAgICAgJ21ldGEnIDpcbiAgICAgICAgJ2hhc2gnIDogaGFzaFxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIFwibGFiZWxzXCIgICA6IChsZXZlbC5yZXBsYWNlKC9bXFxzLV0vZyxcIl9cIikgZm9yIGxldmVsIGluIEBsZXZlbHMpXG4gICAgICBcImxvY2F0aW9uXCIgOiAoXCJza2lwcGVkXCIgZm9yIGxldmVsLCBpIGluIEBsZXZlbHMpXG4gICAgfVxuXG4gIGlzVmFsaWQ6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwiQ2hlY2tpbmcgTG9jYXRpb24gaXNWYWxpZDogXCIpXG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VcIikucmVtb3ZlKClcbiAgICBpbnB1dHMgPSBAJGVsLmZpbmQoXCJpbnB1dFwiKVxuICAgIHNlbGVjdHMgPSBAJGVsLmZpbmQoXCJzZWxlY3RcIilcbiAgICBlbGVtZW50cyA9IGlmIHNlbGVjdHMubGVuZ3RoID4gMCB0aGVuIHNlbGVjdHMgZWxzZSBpbnB1dHNcbiAgICBmb3IgaW5wdXQsIGkgaW4gZWxlbWVudHNcbiMgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzICQoaW5wdXQpLnZhbCgpXG4gICAgICB2YWx1ZSA9ICQoaW5wdXQpLnZhbCgpXG4jICAgICAgaWYgdmFsdWVcbiAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgdmFsdWVcbiAgICB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIkxvY2F0aW9uUnVuSXRlbVZpZXcgdGVzdFZhbGlkLlwiKVxuICAjICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiMgICAgY3VycmVudFZpZXcgPSBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcbiAgICBpZiBAaXNWYWxpZD9cbiAgICAgIHJldHVybiBAaXNWYWxpZCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgaW5wdXRzID0gQCRlbC5maW5kKFwiaW5wdXRcIilcbiAgICBzZWxlY3RzID0gQCRlbC5maW5kKFwic2VsZWN0XCIpXG4gICAgZWxlbWVudHMgPSBpZiBzZWxlY3RzLmxlbmd0aCA+IDAgdGhlbiBzZWxlY3RzIGVsc2UgaW5wdXRzXG4gICAgZm9yIGlucHV0IGluIGVsZW1lbnRzXG4gICAgICB1bmxlc3MgJChpbnB1dCkudmFsKClcbiAgICAgICAgbGV2ZWxOYW1lID0gJCgnbGFiZWxbZm9yPScrJChpbnB1dCkuYXR0cignaWQnKSsnXScpLnRleHQoKVxuICAgICAgICAkKGlucHV0KS5hZnRlciBcIiA8c3BhbiBjbGFzcz0nbWVzc2FnZSc+I3t0KFwiTG9jYXRpb25SdW5WaWV3Lm1lc3NhZ2UubXVzdF9iZV9maWxsZWRcIiwgbGV2ZWxOYW1lIDogbGV2ZWxOYW1lKX08L3NwYW4+XCJcbiJdfQ==
