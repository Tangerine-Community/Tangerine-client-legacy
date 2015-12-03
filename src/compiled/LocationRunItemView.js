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

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUnVuSXRlbVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7Z0NBRUosU0FBQSxHQUFXOztnQ0FFWCxNQUFBLEdBQ0U7SUFBQSx1QkFBQSxFQUEwQixVQUExQjtJQUNBLGFBQUEsRUFBaUIsYUFEakI7SUFFQSxjQUFBLEVBQWlCLGFBRmpCO0lBR0EsZUFBQSxFQUFrQixnQkFIbEI7OztnQ0FLRixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxLQUFBLEVBQVEsQ0FBQSxDQUFFLDhCQUFGLENBQVI7TUFDQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRFQ7O0VBRkU7O2dDQUtOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7QUFDVixRQUFBO0lBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFuQixHQUFvQztJQUNwQyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0lBRXJCLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBO0lBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxFQUFxQixNQUFyQjtJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFBLElBQThCO0lBQ3hDLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLElBQTJCO0lBRXhDLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEtBQWtCLENBQWxCLElB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Y2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMb2NhdGlvblJ1bkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5JdGVtVmlld1xuXG4gIGNsYXNzTmFtZTogXCJMb2NhdGlvblJ1blZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5zY2hvb2xfbGlzdCBsaVwiIDogXCJhdXRvZmlsbFwiXG4gICAgXCJrZXl1cCBpbnB1dFwiICA6IFwic2hvd09wdGlvbnNcIlxuICAgIFwiY2xpY2sgLmNsZWFyXCIgOiBcImNsZWFySW5wdXRzXCJcbiAgICBcImNoYW5nZSBzZWxlY3RcIiA6IFwib25TZWxlY3RDaGFuZ2VcIlxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPSBcbiAgICAgIGNsZWFyIDogdChcIkxvY2F0aW9uUnVuVmlldy5idXR0b24uY2xlYXJcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3ID0gQFxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IEBtb2RlbC5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICAgIGxhYmVscyA9IHt9XG4gICAgbGFiZWxzLnRleHQgPSBAdGV4dFxuICAgIEBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcblxuXG4gICAgQGxldmVscyA9IEBtb2RlbC5nZXQoXCJsZXZlbHNcIikgICAgICAgfHwgW11cbiAgICBAbG9jYXRpb25zID0gQG1vZGVsLmdldChcImxvY2F0aW9uc1wiKSB8fCBbXVxuXG4gICAgaWYgQGxldmVscy5sZW5ndGggaXMgMSBhbmQgQGxldmVsc1swXSBpcyBcIlwiXG4gICAgICBAbGV2ZWxzID0gW11cbiAgICBpZiBAbG9jYXRpb25zLmxlbmd0aCBpcyAxIGFuZCBAbG9jYXRpb25zWzBdIGlzIFwiXCJcbiAgICAgIEBsb2NhdGlvbnMgPSBbXVxuXG4gICAgQGhheXN0YWNrID0gW11cblxuICAgIGZvciBsb2NhdGlvbiwgaSBpbiBAbG9jYXRpb25zXG4gICAgICBAaGF5c3RhY2tbaV0gPSBbXVxuICAgICAgZm9yIGxvY2F0aW9uRGF0YSBpbiBsb2NhdGlvblxuICAgICAgICBAaGF5c3RhY2tbaV0ucHVzaCBsb2NhdGlvbkRhdGEudG9Mb3dlckNhc2UoKVxuXG4gICAgdGVtcGxhdGUgPSBcIjxsaSBkYXRhLWluZGV4PSd7e2l9fSc+XCJcbiAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuICAgICAgdGVtcGxhdGUgKz0gXCJ7e2xldmVsXyN7aX19fVwiXG4gICAgICB0ZW1wbGF0ZSArPSBcIiAtIFwiIHVubGVzcyBpIGlzIEBsZXZlbHMubGVuZ3RoLTFcbiAgICB0ZW1wbGF0ZSArPSBcIjwvbGk+XCJcblxuICAgIEBza2lwcGFibGUgPSBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSBcInRydWVcIlxuICAgIEBiYWNrYWJsZSA9ICggQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSBcInRydWVcIiApIGFuZCBAcGFyZW50LmluZGV4IGlzbnQgMFxuICAgIEBwYXJlbnQuZGlzcGxheVNraXAoQHNraXBwYWJsZSlcbiAgICBAcGFyZW50LmRpc3BsYXlCYWNrKEBiYWNrYWJsZSlcblxuICAgIEBsaSA9IF8udGVtcGxhdGUodGVtcGxhdGUpXG5cbiAgY2xlYXJJbnB1dHM6IC0+XG4gICAgQCRlbC5lbXB0eSgpXG4gICAgQHJlbmRlcigpXG5cbiAgYXV0b2ZpbGw6IChldmVudCkgLT5cbiAgICBAJGVsLmZpbmQoXCIuYXV0b2ZpbGxcIikuZmFkZU91dCgyNTApXG4gICAgaW5kZXggPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtaW5kZXhcIilcbiAgICBsb2NhdGlvbiA9IEBsb2NhdGlvbnNbaW5kZXhdXG4gICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbF8je2l9XCIpLnZhbChsb2NhdGlvbltpXSlcblxuXG4gIHNob3dPcHRpb25zOiAoZXZlbnQpIC0+XG4gICAgbmVlZGxlID0gJChldmVudC50YXJnZXQpLnZhbCgpLnRvTG93ZXJDYXNlKClcbiAgICBmaWVsZEluZGV4ID0gcGFyc2VJbnQoJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtbGV2ZWwnKSlcbiAgICAjIGhpZGUgaWYgb3RoZXJzIGFyZSBzaG93aW5nXG4gICAgZm9yIG90aGVyRmllbGQgaW4gWzAuLkBoYXlzdGFjay5sZW5ndGhdXG4gICAgICBAJGVsLmZpbmQoXCIjYXV0b2ZpbGxfI3tvdGhlckZpZWxkfVwiKS5oaWRlKClcblxuICAgIGF0TGVhc3RPbmUgPSBmYWxzZVxuICAgIHJlc3VsdHMgPSBbXVxuICAgIGZvciBzdGFjaywgaSBpbiBAaGF5c3RhY2tcbiAgICAgIGlzVGhlcmUgPSB+QGhheXN0YWNrW2ldW2ZpZWxkSW5kZXhdLmluZGV4T2YobmVlZGxlKVxuICAgICAgcmVzdWx0cy5wdXNoIGkgaWYgaXNUaGVyZVxuICAgICAgYXRMZWFzdE9uZSA9IHRydWUgaWYgaXNUaGVyZVxuXG4gICAgZm9yIHN0YWNrLCBpIGluIEBoYXlzdGFja1xuICAgICAgZm9yIG90aGVyRmllbGQsIGogaW4gc3RhY2tcbiAgICAgICAgaWYgaiBpcyBmaWVsZEluZGV4XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaXNUaGVyZSA9IH5AaGF5c3RhY2tbaV1bal0uaW5kZXhPZihuZWVkbGUpXG4gICAgICAgIHJlc3VsdHMucHVzaCBpIGlmIGlzVGhlcmUgYW5kICF+cmVzdWx0cy5pbmRleE9mKGkpXG4gICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlIGlmIGlzVGhlcmVcblxuICAgIGlmIGF0TGVhc3RPbmVcbiAgICAgIGh0bWwgPSBcIlwiXG4gICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgICAgaHRtbCArPSBAZ2V0TG9jYXRpb25MaSByZXN1bHRcbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je2ZpZWxkSW5kZXh9XCIpLmZhZGVJbigyNTApXG4gICAgICBAJGVsLmZpbmQoXCIjc2Nob29sX2xpc3RfI3tmaWVsZEluZGV4fVwiKS5odG1sIGh0bWxcblxuICAgIGVsc2VcbiAgICAgIEAkZWwuZmluZChcIiNhdXRvZmlsbF8je2ZpZWxkSW5kZXh9XCIpLmZhZGVPdXQoMjUwKVxuXG4gIGdldExvY2F0aW9uTGk6IChpKSAtPlxuICAgIHRlbXBsYXRlSW5mbyA9IFwiaVwiIDogaVxuICAgIGZvciBsb2NhdGlvbiwgaiBpbiBAbG9jYXRpb25zW2ldXG4gICAgICB0ZW1wbGF0ZUluZm9bXCJsZXZlbF9cIiArIGpdID0gbG9jYXRpb25cbiAgICByZXR1cm4gQGxpIHRlbXBsYXRlSW5mb1xuXG4gIHJlbmRlcjogLT5cbiAgICBlbnVtZXJhdG9ySGVscCA9IGlmIChAbW9kZWwuZ2V0KFwiZW51bWVyYXRvckhlbHBcIikgfHwgXCJcIikgIT0gXCJcIiB0aGVuIFwiPGJ1dHRvbiBjbGFzcz0nc3VidGVzdF9oZWxwIGNvbW1hbmQnPiN7QHRleHQuaGVscH08L2J1dHRvbj48ZGl2IGNsYXNzPSdlbnVtZXJhdG9yX2hlbHAnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ2VudW1lcmF0b3JIZWxwJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICBzdHVkZW50RGlhbG9nICA9IGlmIChAbW9kZWwuZ2V0KFwic3R1ZGVudERpYWxvZ1wiKSAgfHwgXCJcIikgIT0gXCJcIiB0aGVuIFwiPGRpdiBjbGFzcz0nc3R1ZGVudF9kaWFsb2cnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ3N0dWRlbnREaWFsb2cnfTwvZGl2PlwiIGVsc2UgXCJcIlxuXG4gICAgc2Nob29sTGlzdEVsZW1lbnRzID0gXCJcIlxuXG4gICAgaHRtbCA9IFwiPGgyPiN7QG1vZGVsLmdldCAnbmFtZSd9PC9oMj5cbiAgICAgICAgI3tlbnVtZXJhdG9ySGVscH1cbiAgICAgICAgI3tzdHVkZW50RGlhbG9nfVxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjbGVhciBjb21tYW5kJz4je0B0ZXh0LmNsZWFyfTwvYnV0dG9uPlwiXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgaWYgQHR5cGVkXG5cbiAgICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG4gICAgICAgIHByZXZpb3VzTGV2ZWwgPSAnJ1xuICAgICAgICBpZiBwcmV2aW91c1xuICAgICAgICAgIHByZXZpb3VzTGV2ZWwgPSBwcmV2aW91cy5sb2NhdGlvbltpXVxuICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbGV2ZWxfI3tpfSc+I3tsZXZlbH08L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxpbnB1dCBkYXRhLWxldmVsPScje2l9JyBpZD0nbGV2ZWxfI3tpfScgdmFsdWU9JyN7cHJldmlvdXNMZXZlbHx8Jyd9Jz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdhdXRvZmlsbF8je2l9JyBjbGFzcz0nYXV0b2ZpbGwnIHN0eWxlPSdkaXNwbGF5Om5vbmUnPlxuICAgICAgICAgICAgPGgyPiN7dCgnc2VsZWN0IG9uZSBmcm9tIGF1dG9maWxsIGxpc3QnKX08L2gyPlxuICAgICAgICAgICAgPHVsIGNsYXNzPSdzY2hvb2xfbGlzdCcgaWQ9J3NjaG9vbF9saXN0XyN7aX0nPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcblxuICAgIGVsc2VcblxuICAgICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcblxuICAgICAgICBwcmV2aW91c0xldmVsID0gJydcbiAgICAgICAgaWYgcHJldmlvdXNcbiAgICAgICAgICBwcmV2aW91c0xldmVsID0gcHJldmlvdXMubG9jYXRpb25baV1cbiAgICAgICAgXG4gICAgICAgIGxldmVsT3B0aW9ucyA9IEBnZXRPcHRpb25zKGksIHByZXZpb3VzTGV2ZWwpXG5cbiAgICAgICAgaXNEaXNhYmxlZCA9IChpIGlzbnQgMCBhbmQgbm90IHByZXZpb3VzTGV2ZWwpIGFuZCBcImRpc2FibGVkPSdkaXNhYmxlZCdcIiBcblxuICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nbGV2ZWxfI3tpfSc+I3tsZXZlbH08L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2xldmVsXyN7aX0nIGRhdGEtbGV2ZWw9JyN7aX0nICN7aXNEaXNhYmxlZHx8Jyd9PlxuICAgICAgICAgICAgICAje2xldmVsT3B0aW9uc31cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBcIlxuICAgIEAkZWwuaHRtbCBodG1sXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICBvblNlbGVjdENoYW5nZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBsZXZlbENoYW5nZWQgPSBwYXJzZUludCgkdGFyZ2V0LmF0dHIoXCJkYXRhLWxldmVsXCIpKVxuICAgIG5ld1ZhbHVlID0gJHRhcmdldC52YWwoKVxuICAgIG5leHRMZXZlbCA9IGxldmVsQ2hhbmdlZCArIDFcbiAgICBpZiBsZXZlbENoYW5nZWQgaXNudCBAbGV2ZWxzLmxlbmd0aFxuICAgICAgQCRlbC5maW5kKFwiI2xldmVsXyN7bmV4dExldmVsfVwiKS5yZW1vdmVBdHRyKFwiZGlzYWJsZWRcIilcbiAgICAgICRodG1sID0gQCRlbC5maW5kKFwiI2xldmVsXyN7bmV4dExldmVsfVwiKS5odG1sIEBnZXRPcHRpb25zKG5leHRMZXZlbClcbiAgICAgIGlmIChvcHRpb25zID0gJGh0bWwuZmluZChcIm9wdGlvblwiKSkubGVuZ3RoIGlzIDFcbiAgICAgICAgb3B0aW9ucy5wYXJlbnQoXCJzZWxlY3RcIikudHJpZ2dlciBcImNoYW5nZVwiXG5cbiAgZ2V0T3B0aW9uczogKCBpbmRleCwgcHJldmlvdXNMZXZlbCApIC0+XG5cbiAgICBkb25lT3B0aW9ucyA9IFtdXG4gICAgbGV2ZWxPcHRpb25zID0gJydcblxuICAgIHByZXZpb3VzRmxhZyA9IGZhbHNlXG5cbiAgICBwYXJlbnRWYWx1ZXMgPSBbXVxuICAgIGZvciBpIGluIFswLi5pbmRleF1cbiAgICAgIGJyZWFrIGlmIGkgaXMgaW5kZXhcbiAgICAgIHBhcmVudFZhbHVlcy5wdXNoIEAkZWwuZmluZChcIiNsZXZlbF8je2l9XCIpLnZhbCgpXG5cbiAgICBmb3IgbG9jYXRpb24sIGkgaW4gQGxvY2F0aW9uc1xuXG4gICAgICB1bmxlc3MgfmRvbmVPcHRpb25zLmluZGV4T2YgbG9jYXRpb25baW5kZXhdXG5cbiAgICAgICAgaXNOb3RDaGlsZCA9IGluZGV4IGlzIDBcbiAgICAgICAgaXNWYWxpZENoaWxkID0gdHJ1ZVxuICAgICAgICBmb3IgaSBpbiBbMC4uTWF0aC5tYXgoaW5kZXgtMSwwKV1cblxuICAgICAgICAgIGlmIHBhcmVudFZhbHVlc1tpXSBpc250IGxvY2F0aW9uW2ldIGFuZCBub3QgcHJldmlvdXNMZXZlbFxuICAgICAgICAgICAgaXNWYWxpZENoaWxkID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgaWYgaXNOb3RDaGlsZCBvciBpc1ZhbGlkQ2hpbGRcblxuICAgICAgICAgIGRvbmVPcHRpb25zLnB1c2ggbG9jYXRpb25baW5kZXhdXG5cbiAgICAgICAgICBsb2NhdGlvbk5hbWUgPSBfKGxvY2F0aW9uW2luZGV4XSkuZXNjYXBlKClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiBsb2NhdGlvbltpbmRleF0gaXMgcHJldmlvdXNMZXZlbFxuICAgICAgICAgICAgc2VsZWN0ZWQgPSBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIlxuICAgICAgICAgICAgcHJldmlvdXNGbGFnID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbGVjdGVkID0gJydcbiAgICAgICAgICBsZXZlbE9wdGlvbnMgKz0gXCJcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JyN7bG9jYXRpb25OYW1lfScgI3tzZWxlY3RlZCBvciAnJ30+I3tsb2NhdGlvbk5hbWV9PC9vcHRpb24+XG4gICAgICAgICAgXCJcblxuICAgIHNlbGVjdFByb21wdCA9IFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiIHVubGVzcyBwcmV2aW91c0ZsYWdcblxuICAgIHByb21wdE9wdGlvbiAgPSBcIjxvcHRpb24gI3tzZWxlY3RQcm9tcHQgb3IgJyd9IGRpc2FibGVkPSdkaXNhYmxlZCc+UGxlYXNlIHNlbGVjdCBhICN7QGxldmVsc1tpbmRleF19PC9vcHRpb24+XCJcblxuIyAgICBpZiBkb25lT3B0aW9ucy5sZW5ndGggaXMgMVxuIyAgICAgIHJldHVybiBsZXZlbE9wdGlvbnNcbiMgICAgZWxzZVxuICAgIHJldHVybiBcIlxuICAgICAgI3twcm9tcHRPcHRpb259XG4gICAgICAje2xldmVsT3B0aW9uc31cbiAgICAgIFwiXG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9XG4gICAgICBcImxhYmVsc1wiICAgOiAobGV2ZWwucmVwbGFjZSgvW1xccy1dL2csXCJfXCIpIGZvciBsZXZlbCBpbiBAbGV2ZWxzKVxuICAgICAgXCJsb2NhdGlvblwiIDogKCQudHJpbShAJGVsLmZpbmQoXCIjbGV2ZWxfI3tpfVwiKS52YWwoKSkgZm9yIGxldmVsLCBpIGluIEBsZXZlbHMpXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIHJldHVybiB7XG4gICAgICBcImxhYmVsc1wiICAgOiAobGV2ZWwucmVwbGFjZSgvW1xccy1dL2csXCJfXCIpIGZvciBsZXZlbCBpbiBAbGV2ZWxzKVxuICAgICAgXCJsb2NhdGlvblwiIDogKFwic2tpcHBlZFwiIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzKVxuICAgIH1cblxuICBpc1ZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIkNoZWNraW5nIExvY2F0aW9uIGlzVmFsaWQ6IFwiKVxuICAgIEAkZWwuZmluZChcIi5tZXNzYWdlXCIpLnJlbW92ZSgpXG4gICAgaW5wdXRzID0gQCRlbC5maW5kKFwiaW5wdXRcIilcbiAgICBzZWxlY3RzID0gQCRlbC5maW5kKFwic2VsZWN0XCIpXG4gICAgZWxlbWVudHMgPSBpZiBzZWxlY3RzLmxlbmd0aCA+IDAgdGhlbiBzZWxlY3RzIGVsc2UgaW5wdXRzXG4gICAgZm9yIGlucHV0LCBpIGluIGVsZW1lbnRzXG4jICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyAkKGlucHV0KS52YWwoKVxuICAgICAgdmFsdWUgPSAkKGlucHV0KS52YWwoKVxuIyAgICAgIGlmIHZhbHVlXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHZhbHVlXG4gICAgdHJ1ZVxuXG4gIHRlc3RWYWxpZDogLT5cbiMgICAgY29uc29sZS5sb2coXCJMb2NhdGlvblJ1bkl0ZW1WaWV3IHRlc3RWYWxpZC5cIilcbiAgIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4gICAgaWYgQGlzVmFsaWQ/XG4gICAgICByZXR1cm4gQGlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIGlucHV0cyA9IEAkZWwuZmluZChcImlucHV0XCIpXG4gICAgc2VsZWN0cyA9IEAkZWwuZmluZChcInNlbGVjdFwiKVxuICAgIGVsZW1lbnRzID0gaWYgc2VsZWN0cy5sZW5ndGggPiAwIHRoZW4gc2VsZWN0cyBlbHNlIGlucHV0c1xuICAgIGZvciBpbnB1dCBpbiBlbGVtZW50c1xuICAgICAgdW5sZXNzICQoaW5wdXQpLnZhbCgpXG4gICAgICAgIGxldmVsTmFtZSA9ICQoJ2xhYmVsW2Zvcj0nKyQoaW5wdXQpLmF0dHIoJ2lkJykrJ10nKS50ZXh0KClcbiAgICAgICAgJChpbnB1dCkuYWZ0ZXIgXCIgPHNwYW4gY2xhc3M9J21lc3NhZ2UnPiN7dChcIkxvY2F0aW9uUnVuVmlldy5tZXNzYWdlLm11c3RfYmVfZmlsbGVkXCIsIGxldmVsTmFtZSA6IGxldmVsTmFtZSl9PC9zcGFuPlwiXG4iXX0=
