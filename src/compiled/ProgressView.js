var ProgressView, SortedCollection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ProgressView = (function(superClass) {
  extend(ProgressView, superClass);

  function ProgressView() {
    this.updateFlot = bind(this.updateFlot, this);
    this.afterRender = bind(this.afterRender, this);
    return ProgressView.__super__.constructor.apply(this, arguments);
  }

  ProgressView.prototype.className = "ProgressView";

  ProgressView.prototype.INDIVIDUAL = 1;

  ProgressView.prototype.AGGREGATE = 2;

  ProgressView.prototype.events = {
    'click .back': 'goBack',
    'click .select_itemType': 'selectItemType',
    'click .xtick': 'selectAssessment'
  };

  ProgressView.prototype.selectAssessment = function(event) {
    this.selected.week = parseInt($(event.target).attr('data-index'));
    this.updateTable();
    return this.updateFlot();
  };

  ProgressView.prototype.selectItemType = function(event) {
    var $target;
    $target = $(event.target);
    this.selected.itemType = $target.attr('data-itemType');
    this.$el.find(".select_itemType").removeClass("selected");
    $target.addClass("selected");
    this.updateTable();
    return this.updateFlot();
  };

  ProgressView.prototype.goBack = function() {
    return history.go(-1);
  };

  ProgressView.prototype.initialize = function(options) {
    var data, dataForBenchmark, graphIndex, i, itemType, itemTypes, j, k, key, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, name, o, p, part, partByIndex, parts, pointsByItemType, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, result, row, subtest, subtests, subtestsByPart;
    this.results = options.results;
    this.student = options.student;
    this.subtests = options.subtests;
    this.klass = options.klass;
    if (this.klass == null) {
      Utils.log(this, "No klass.");
    }
    if (this.subtests == null) {
      Utils.log(this, "No progress type subtests.");
    }
    if (this.results.length === 0) {
      this.renderReady = true;
      this.render();
      return;
    }
    this.mode = this.student != null ? this.INDIVIDUAL : this.AGGREGATE;
    this.subtestNames = {};
    this.benchmarkScore = {};
    this.rows = [];
    this.partCount = 0;
    this.flot = null;
    this.lastPart = Math.max.apply(this, _.compact(this.subtests.pluck("part")));
    this.resultsByPart = [];
    this.itemTypeList = {};
    this.selected = {
      "itemType": null,
      "week": 0
    };
    parts = [];
    ref = this.subtests.models;
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      if (!~parts.indexOf(subtest.get("part"))) {
        parts.push(subtest.get("part"));
      }
      i = parts.indexOf(subtest.get("part"));
      if (this.subtestNames[i] == null) {
        this.subtestNames[i] = {};
      }
      this.subtestNames[i][subtest.get("itemType")] = subtest.get("name");
    }
    this.partCount = parts.length;
    subtestsByPart = this.subtests.indexBy("part");
    partByIndex = _.keys(subtestsByPart);
    this.indexByPart = [];
    for (i = k = 0, len1 = partByIndex.length; k < len1; i = ++k) {
      part = partByIndex[i];
      this.indexByPart[part] = i;
    }
    this.resultsByPart = this.results.indexBy("part");
    ref1 = this.results.models;
    for (l = 0, len2 = ref1.length; l < len2; l++) {
      result = ref1[l];
      this.itemTypeList[result.get("itemType").toLowerCase()] = true;
    }
    this.itemTypeList = _.keys(this.itemTypeList);
    for (part = m = 1, ref2 = this.lastPart; 1 <= ref2 ? m <= ref2 : m >= ref2; part = 1 <= ref2 ? ++m : --m) {
      if (this.resultsByPart[part] === void 0) {
        continue;
      }
      itemTypes = {};
      ref3 = this.resultsByPart[part];
      for (i = n = 0, len3 = ref3.length; n < len3; i = ++n) {
        result = ref3[i];
        if (this.mode === this.INDIVIDUAL && result.get("studentId") !== this.student.id) {
          continue;
        }
        itemType = result.get("itemType");
        if (this.selected.itemType == null) {
          this.selected.itemType = itemType;
        }
        if (itemTypes[itemType] == null) {
          itemTypes[itemType] = [];
        }
        itemTypes[itemType].push({
          "name": itemType.titleize(),
          "key": itemType,
          "part": result.get("part"),
          "correct": result.get("correct"),
          "attempted": result.get("attempted"),
          "itemsPerMinute": result.getCorrectPerSeconds(60)
        });
        this.benchmarkScore[itemType] = this.subtests.get(result.get("subtestId")).getNumber("scoreTarget");
      }
      this.rows.push({
        "part": part,
        "itemTypes": _.values(itemTypes)
      });
    }
    this.rows = this.aggregate(this.rows);
    if (this.rows.length !== 0) {
      this.selected = {
        week: this.indexByPart[_.last(this.rows)['part']],
        itemType: _.last(this.rows)['itemTypes'][0].key
      };
    }
    pointsByItemType = {};
    ref4 = this.rows;
    for (i = o = 0, len4 = ref4.length; o < len4; i = ++o) {
      row = ref4[i];
      ref5 = row.itemTypes;
      for (p = 0, len5 = ref5.length; p < len5; p++) {
        itemType = ref5[p];
        graphIndex = this.indexByPart[row.part] + 1;
        if (pointsByItemType[itemType.key] == null) {
          pointsByItemType[itemType.key] = [];
        }
        pointsByItemType[itemType.key].push([graphIndex, itemType.itemsPerMinute]);
      }
    }
    this.flotData = [];
    this.benchmarkData = [];
    i = 0;
    for (name in pointsByItemType) {
      data = pointsByItemType[name];
      key = name.toLowerCase();
      this.flotData[key] = {
        "data": data,
        "label": name.titleize(),
        "key": key,
        "lines": {
          "show": true
        },
        "points": {
          "show": true
        }
      };
    }
    this.flotBenchmark = [];
    ref6 = this.subtests.indexBy("itemType");
    for (itemType in ref6) {
      subtests = ref6[itemType];
      dataForBenchmark = [];
      for (i = q = 0, len6 = subtests.length; q < len6; i = ++q) {
        subtest = subtests[i];
        graphIndex = this.indexByPart[subtest.get("part")] + 1;
        dataForBenchmark.push([graphIndex, subtest.getNumber("scoreTarget")]);
      }
      this.flotBenchmark[itemType.toLowerCase()] = {
        "label": "Progress benchmark",
        "data": dataForBenchmark,
        "color": "#aaa",
        "lines": {
          "show": true
        }
      };
    }
    this.warningThresholds = {};
    ref7 = this.subtests.indexBy("itemType");
    for (itemType in ref7) {
      subtests = ref7[itemType];
      this.warningThresholds[itemType] = [];
      for (i = r = 0, len7 = subtests.length; r < len7; i = ++r) {
        subtest = subtests[i];
        this.warningThresholds[itemType.toLowerCase()][this.indexByPart[subtest.get("part")]] = {
          target: subtest.getNumber("scoreTarget"),
          spread: subtest.getNumber("scoreSpread"),
          seconds: subtest.getNumber("timer")
        };
      }
    }
    this.renderReady = true;
    return this.render();
  };

  ProgressView.prototype.render = function() {
    var $window, html, htmlWarning, j, key, label, len, ref, selectedClass, studentName, win;
    if (!this.renderReady) {
      return;
    }
    $window = $(window);
    win = {
      h: $window.height(),
      w: $window.width()
    };
    if (this.mode === this.INDIVIDUAL) {
      studentName = "<h2>" + (this.student.get('name')) + "</h2>";
    }
    html = "<h1>Progress table</h1> " + (studentName || "");
    htmlWarning = "<p>No test data for this type of report. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>";
    if (this.results.length === 0) {
      this.$el.html(html + " " + htmlWarning);
      this.trigger("rendered");
      return;
    }
    html += "<div id='flot-menu'>";
    ref = _.uniq(this.subtests.pluck("itemType"));
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      label = key.replace(/[_-]/g, " ").capitalize();
      selectedClass = key === this.selected.itemType ? "selected" : "";
      html += "<button class='command select_itemType " + selectedClass + "' data-itemType='" + key + "'>" + label + "</button>";
    }
    html += "</div> <div id='flot-container' style='width: " + (window.w * 0.8) + "px; height:300px;'></div>";
    html += "<div id='table_container'></div> <button class='navigation back'>" + (t('back')) + "</button>";
    this.$el.html(html);
    this.updateTable();
    return this.trigger("rendered");
  };

  ProgressView.prototype.afterRender = function() {
    return this.updateFlot();
  };

  ProgressView.prototype.updateTable = function() {
    var availableItemTypesThisWeek, data, datum, difference, high, html, i, itemType, j, k, l, len, len1, len2, low, ref, ref1, ref2, result, row, score, threshold, type, warnings, week;
    type = this.selected.itemType;
    week = this.selected.week;
    html = "<table class='tabular'>";
    ref = this.rows;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      row = ref[i];
      if (!~_.pluck(row.itemTypes, "key").indexOf(type)) {
        continue;
      }
      html += "<tr><th>" + this.subtestNames[i][type] + "</th></tr><tr>";
      ref1 = row.itemTypes;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        itemType = ref1[k];
        if (itemType.key !== type) {
          continue;
        }
        html += "<tr> <td>" + itemType.name + " correct</td><td>" + itemType.correct + "/" + itemType.attempted + "</td> </tr> <tr> <td>" + itemType.name + " correct per minute</td><td>" + itemType.itemsPerMinute + "</td> </tr>";
      }
    }
    html += "</table>";
    availableItemTypesThisWeek = _.pluck((ref2 = this.rows[week]) != null ? ref2.itemTypes : void 0, "key");
    if (week >= this.rows.length || !~availableItemTypesThisWeek.indexOf(type)) {
      html += "<section>No data for this assessment.</section>";
    } else if (this.mode === this.AGGREGATE) {
      score = 0;
      data = this.flotData[type] != null ? this.flotData[type].data : [];
      for (l = 0, len2 = data.length; l < len2; l++) {
        datum = data[l];
        if (datum[0] === week + 1) {
          score = datum[1];
        }
      }
      threshold = this.warningThresholds[type][week];
      high = threshold.target + threshold.spread;
      low = threshold.target - threshold.spread;
      difference = score - threshold.target;
      if (score > high) {
        result = "(" + score + "), " + difference + " correct items per minute above the benchmark";
        warnings = "Your class is doing well, " + result + ", continue with the reading program. Share your and your class’ great work with parents. Reward your class with some fun reading activities such as reading marathons or competitions. However, look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
      } else if (score < low) {
        result = "(" + score + "), " + (Math.abs(difference)) + " correct items per minute below the benchmark";
        warnings = "Your class is performing below the grade-level target, " + result + ". Plan for additional lesson time focusing on reading in consultation with your principal. Encourage parents to spend more time with reading materials at home – remind them that you are a team working together to help their children learning to read. Think about organizing other events and opportunities for practice, e.g., reading marathons or competitions to motivate students to read more.";
      } else {
        if (difference !== 0 && difference * -1 === Math.abs(difference)) {
          result = (score - threshold.target) + " correct items per minute above the bench mark";
        } else if (difference === 0) {
          result = score + " correct items per minute";
        } else {
          result = ("(" + score + "), ") + Math.abs(score - threshold.target) + " correct items per minute below the bench mark";
        }
        warnings = "Your class is in line with expectations, " + result + ". Continue with the reading program and keep up the good work! Look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
      }
      html += "<section> " + warnings + " </section>";
    }
    return this.$el.find("#table_container").html(html);
  };

  ProgressView.prototype.updateFlot = function() {
    var displayData, i;
    this.flotOptions = {
      "xaxis": {
        "min": 0.5,
        "max": this.partCount + 0.5,
        "ticks": (function() {
          var j, ref, results1;
          results1 = [];
          for (i = j = 1, ref = this.partCount; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            results1.push(String(i));
          }
          return results1;
        }).call(this),
        "tickDecimals": 0,
        "tickFormatter": (function(_this) {
          return function(num) {
            if (_this.subtestNames[num - 1][_this.selected.itemType] != null) {
              return "<button class='xtick " + (num - 1 === _this.selected.week ? 'selected' : '') + "' data-index='" + (num - 1) + "'>" + _this.subtestNames[num - 1][_this.selected.itemType] + "</button>";
            } else {
              return "";
            }
          };
        })(this)
      },
      "grid": {
        "markings": {
          "color": "#ffc",
          "xaxis": {
            "to": this.selected.week + 0.5,
            "from": this.selected.week - 0.5
          }
        }
      }
    };
    displayData = [];
    if (this.flotData[this.selected.itemType]) {
      displayData.push(this.flotData[this.selected.itemType]);
    }
    if (this.flotBenchmark[this.selected.itemType]) {
      displayData.push(this.flotBenchmark[this.selected.itemType]);
    }
    return this.flot = $.plot(this.$el.find("#flot-container"), displayData, this.flotOptions);
  };

  ProgressView.prototype.aggregate = function(oldRows) {
    var i, j, k, l, len, len1, len2, mean, newRows, ref, result, results, row;
    newRows = [];
    for (i = j = 0, len = oldRows.length; j < len; i = ++j) {
      row = oldRows[i];
      newRows[i] = {
        "part": row.part,
        "itemTypes": []
      };
      ref = row.itemTypes;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        results = ref[k];
        mean = {
          "name": "",
          "key": "",
          "correct": 0,
          "attempted": 0,
          "itemsPerMinute": 0
        };
        for (l = 0, len2 = results.length; l < len2; l++) {
          result = results[l];
          mean.name = result.name;
          mean.key = result.key;
          mean.correct += result.correct;
          mean.attempted += result.attempted;
          mean.itemsPerMinute += result.itemsPerMinute;
        }
        mean.correct /= results.length;
        mean.attempted /= results.length;
        mean.itemsPerMinute /= results.length;
        mean.correct = Math.round(mean.correct);
        mean.attempted = Math.round(mean.attempted);
        mean.itemsPerMinute = Math.round(mean.itemsPerMinute);
        newRows[i].itemTypes.push(mean);
      }
    }
    return newRows;
  };

  return ProgressView;

})(Backbone.View);

SortedCollection = (function() {
  function SortedCollection(options) {
    this.sorted = [];
    this.models = options.models;
    this.attribute = options.attribute;
  }

  return SortedCollection;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVwb3J0L1Byb2dyZXNzVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSw4QkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozt5QkFFSixTQUFBLEdBQVk7O3lCQUVaLFVBQUEsR0FBYTs7eUJBQ2IsU0FBQSxHQUFhOzt5QkFFYixNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQTJCLFFBQTNCO0lBQ0Esd0JBQUEsRUFBMkIsZ0JBRDNCO0lBRUEsY0FBQSxFQUEyQixrQkFGM0I7Ozt5QkFNRixnQkFBQSxHQUFrQixTQUFDLEtBQUQ7SUFDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEdBQWlCLFFBQUEsQ0FBUyxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFlBQXJCLENBQVQ7SUFDakIsSUFBQyxDQUFBLFdBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7RUFIZ0I7O3lCQUtsQixjQUFBLEdBQWdCLFNBQUMsS0FBRDtBQUNkLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSO0lBQ1YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLEdBQXFCLE9BQU8sQ0FBQyxJQUFSLENBQWEsZUFBYjtJQUNyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLFdBQTlCLENBQTBDLFVBQTFDO0lBQ0EsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsVUFBakI7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQU5jOzt5QkFRaEIsTUFBQSxHQUFRLFNBQUE7V0FBRyxPQUFPLENBQUMsRUFBUixDQUFXLENBQUMsQ0FBWjtFQUFIOzt5QkFFUixVQUFBLEdBQVksU0FBQyxPQUFEO0FBS1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxPQUFELEdBQWdCLE9BQU8sQ0FBQztJQUN4QixJQUFDLENBQUEs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b2dyZXNzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFByb2dyZXNzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIlByb2dyZXNzVmlld1wiXG5cbiAgSU5ESVZJRFVBTCA6IDFcbiAgQUdHUkVHQVRFICA6IDJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5iYWNrJyAgICAgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLnNlbGVjdF9pdGVtVHlwZScgOiAnc2VsZWN0SXRlbVR5cGUnXG4gICAgJ2NsaWNrIC54dGljaycgICAgICAgICAgIDogJ3NlbGVjdEFzc2Vzc21lbnQnXG5cbiAgIyAhISEgLSB2YXJpYWJsZSBuYW1lIEZVQkFSXG4gICMgYXNzZXNzbWVudCA9IHBhcnQgPSB3ZWVrXG4gIHNlbGVjdEFzc2Vzc21lbnQ6IChldmVudCkgLT5cbiAgICBAc2VsZWN0ZWQud2VlayA9IHBhcnNlSW50KCQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLWluZGV4JykpXG4gICAgQHVwZGF0ZVRhYmxlKClcbiAgICBAdXBkYXRlRmxvdCgpXG5cbiAgc2VsZWN0SXRlbVR5cGU6IChldmVudCkgLT5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgQHNlbGVjdGVkLml0ZW1UeXBlID0gJHRhcmdldC5hdHRyKCdkYXRhLWl0ZW1UeXBlJylcbiAgICBAJGVsLmZpbmQoXCIuc2VsZWN0X2l0ZW1UeXBlXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIilcbiAgICAkdGFyZ2V0LmFkZENsYXNzKFwic2VsZWN0ZWRcIilcbiAgICBAdXBkYXRlVGFibGUoKVxuICAgIEB1cGRhdGVGbG90KClcblxuICBnb0JhY2s6IC0+IGhpc3RvcnkuZ28gLTFcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgICNcbiAgICAjIEFyZ3VtZW50cyBhbmQgbWVtYmVyIHZhcnNcbiAgICAjXG4gICAgQHJlc3VsdHMgICAgICA9IG9wdGlvbnMucmVzdWx0c1xuICAgIEBzdHVkZW50ICAgICAgPSBvcHRpb25zLnN0dWRlbnRcbiAgICBAc3VidGVzdHMgICAgID0gb3B0aW9ucy5zdWJ0ZXN0c1xuICAgIEBrbGFzcyAgICAgICAgPSBvcHRpb25zLmtsYXNzXG5cbiAgICAjIENhdGNoIHRoaW5ncyB0aGF0IFwibG9va1wiIFwib2RkXCJcbiAgICBpZiBub3QgQGtsYXNzPyAgICAgICAgICB0aGVuIFV0aWxzLmxvZyBALCBcIk5vIGtsYXNzLlwiXG4gICAgaWYgbm90IEBzdWJ0ZXN0cz8gICAgICAgdGhlbiBVdGlscy5sb2cgQCwgXCJObyBwcm9ncmVzcyB0eXBlIHN1YnRlc3RzLlwiXG4gICAgaWYgQHJlc3VsdHMubGVuZ3RoID09IDBcbiAgICAgIEByZW5kZXJSZWFkeSA9IHRydWVcbiAgICAgIEByZW5kZXIoKVxuICAgICAgcmV0dXJuXG5cblxuICAgIEBtb2RlID0gaWYgQHN0dWRlbnQ/IHRoZW4gQElORElWSURVQUwgZWxzZSBAQUdHUkVHQVRFXG5cbiAgICBAc3VidGVzdE5hbWVzICAgPSB7fVxuICAgIEBiZW5jaG1hcmtTY29yZSA9IHt9XG4gICAgQHJvd3MgICAgICAgICAgID0gW11cbiAgICBAcGFydENvdW50ICAgICAgPSAwXG4gICAgQGZsb3QgICAgICAgICAgID0gbnVsbCAjIGZvciBmbG90XG4gICAgQGxhc3RQYXJ0ICAgICAgID0gTWF0aC5tYXguYXBwbHkgQCwgXy5jb21wYWN0KEBzdWJ0ZXN0cy5wbHVjayhcInBhcnRcIikpXG4gICAgQHJlc3VsdHNCeVBhcnQgPSBbXVxuICAgIEBpdGVtVHlwZUxpc3QgID0ge31cbiAgICBAc2VsZWN0ZWQgPVxuICAgICAgXCJpdGVtVHlwZVwiIDogbnVsbFxuICAgICAgXCJ3ZWVrXCIgICAgIDogMFxuXG4gICAgI1xuICAgICMgRmluZCBvdXQgaG93IG1hbnkgcGFydHMgYmVsb25nIHRvIHRoZSBwcm9ncmVzcyByZXBvcnRcbiAgICAjIE1ha2UgYSBuYW1lcyBieSBwZXJ0aW5lbnRJbmRleCBhbmQgaXRlbVR5cGVcbiAgICAjXG4gICAgcGFydHMgPSBbXVxuICAgIGZvciBzdWJ0ZXN0IGluIEBzdWJ0ZXN0cy5tb2RlbHNcbiAgICAgIHBhcnRzLnB1c2ggc3VidGVzdC5nZXQoXCJwYXJ0XCIpIGlmICF+cGFydHMuaW5kZXhPZihzdWJ0ZXN0LmdldChcInBhcnRcIikpXG5cbiAgICAgICMgZ2V0IG5hbWVzXG4gICAgICBpID0gcGFydHMuaW5kZXhPZihzdWJ0ZXN0LmdldChcInBhcnRcIikpXG4gICAgICBAc3VidGVzdE5hbWVzW2ldID0ge30gaWYgbm90IEBzdWJ0ZXN0TmFtZXNbaV0/XG4gICAgICBAc3VidGVzdE5hbWVzW2ldW3N1YnRlc3QuZ2V0KFwiaXRlbVR5cGVcIildID0gc3VidGVzdC5nZXQoXCJuYW1lXCIpXG5cbiAgICBAcGFydENvdW50ID0gcGFydHMubGVuZ3RoXG5cbiAgICAjXG4gICAgIyBNYWtlIGEgbWFwIGluIGNhc2Ugd2UgbmVlZCBpdCBvZiB3aGljaCB3ZWVrIGJlbG9uZ3MgdG8gd2hpY2ggaW5kZXhcbiAgICAjXG4gICAgc3VidGVzdHNCeVBhcnQgPSBAc3VidGVzdHMuaW5kZXhCeShcInBhcnRcIilcbiAgICBwYXJ0QnlJbmRleCA9IF8ua2V5cyhzdWJ0ZXN0c0J5UGFydClcbiAgICBAaW5kZXhCeVBhcnQgPSBbXVxuICAgIGZvciBwYXJ0LCBpIGluIHBhcnRCeUluZGV4XG4gICAgICBAaW5kZXhCeVBhcnRbcGFydF0gPSBpXG5cblxuICAgICNcbiAgICAjIG1ha2UgdGhlIHJlc3VsdHNCeVBhcnQgYW5kIHRoZSBpdGVtVHlwZUxpc3RcbiAgICAjXG4gICAgQHJlc3VsdHNCeVBhcnQgPSBAcmVzdWx0cy5pbmRleEJ5IFwicGFydFwiXG4gICAgQGl0ZW1UeXBlTGlzdFtyZXN1bHQuZ2V0KFwiaXRlbVR5cGVcIikudG9Mb3dlckNhc2UoKV0gPSB0cnVlIGZvciByZXN1bHQgaW4gQHJlc3VsdHMubW9kZWxzXG4gICAgQGl0ZW1UeXBlTGlzdCA9IF8ua2V5cyhAaXRlbVR5cGVMaXN0KVxuXG4gICAgI1xuICAgICMgQ29tcGlsZSBkYXRhIGFuZCBzYXZlIHRvIEByb3dzXG4gICAgIyB0aGlzIGlzIGZvciB0aGUgdGFibGVcbiAgICAjXG5cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCBhbGwgd2Vla3NcbiAgICBmb3IgcGFydCBpbiBbMS4uQGxhc3RQYXJ0XVxuXG4gICAgICBpZiBAcmVzdWx0c0J5UGFydFtwYXJ0XSA9PSB1bmRlZmluZWQgdGhlbiBjb250aW51ZSAjIGlmIHRoZXJlJ3Mgbm8gcmVzdWx0cyBmb3IgdGhhdCB3ZWVrLCBza2lwIGl0XG5cbiAgICAgICMgaXRlcmF0ZSB0aHJvdWdoIGFsbCBpdGVtVHlwZXMgZm9yIHRoaXMgd2Vla1xuICAgICAgaXRlbVR5cGVzID0ge31cbiAgICAgIGZvciByZXN1bHQsIGkgaW4gQHJlc3VsdHNCeVBhcnRbcGFydF1cblxuICAgICAgICBpZiBAbW9kZSA9PSBASU5ESVZJRFVBTCAmJiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpICE9IEBzdHVkZW50LmlkIHRoZW4gY29udGludWVcblxuICAgICAgICBpdGVtVHlwZSA9IHJlc3VsdC5nZXQoXCJpdGVtVHlwZVwiKVxuXG4gICAgICAgICMgc2VsZWN0IGZpcnN0IGl0ZW1UeXBlXG4gICAgICAgIEBzZWxlY3RlZC5pdGVtVHlwZSA9IGl0ZW1UeXBlIGlmIG5vdCBAc2VsZWN0ZWQuaXRlbVR5cGU/XG5cbiAgICAgICAgIyBwdXNoIGFuIG9iamVjdFxuICAgICAgICBpdGVtVHlwZXNbaXRlbVR5cGVdID0gW10gaWYgbm90IGl0ZW1UeXBlc1tpdGVtVHlwZV0/XG4gICAgICAgIGl0ZW1UeXBlc1tpdGVtVHlwZV0ucHVzaFxuICAgICAgICAgIFwibmFtZVwiICAgICAgICAgICA6IGl0ZW1UeXBlLnRpdGxlaXplKClcbiAgICAgICAgICBcImtleVwiICAgICAgICAgICAgOiBpdGVtVHlwZVxuICAgICAgICAgIFwicGFydFwiICAgICAgICAgICA6IHJlc3VsdC5nZXQoXCJwYXJ0XCIpXG4gICAgICAgICAgXCJjb3JyZWN0XCIgICAgICAgIDogcmVzdWx0LmdldCBcImNvcnJlY3RcIlxuICAgICAgICAgIFwiYXR0ZW1wdGVkXCIgICAgICA6IHJlc3VsdC5nZXQgXCJhdHRlbXB0ZWRcIlxuICAgICAgICAgIFwiaXRlbXNQZXJNaW51dGVcIiA6IHJlc3VsdC5nZXRDb3JyZWN0UGVyU2Vjb25kcyg2MClcblxuICAgICAgICBAYmVuY2htYXJrU2NvcmVbaXRlbVR5cGVdID0gQHN1YnRlc3RzLmdldChyZXN1bHQuZ2V0KFwic3VidGVzdElkXCIpKS5nZXROdW1iZXIoXCJzY29yZVRhcmdldFwiKVxuXG4gICAgICAjIGVhY2ggcm93IGlzIG9uZSB3ZWVrL3BhcnRcbiAgICAgIEByb3dzLnB1c2hcbiAgICAgICAgXCJwYXJ0XCIgICAgICA6IHBhcnRcbiAgICAgICAgXCJpdGVtVHlwZXNcIiA6IChfLnZhbHVlcyhpdGVtVHlwZXMpKSAjIG9iamVjdCAtPiBhcnJheVxuXG4gICAgI1xuICAgICMgQWdncmVnYXRlIG1vZGUgYXZlcmFnZXMgZGF0YSBhY3Jvc3Mgc3R1ZGVudHNcbiAgICAjXG4gICAgQHJvd3MgPSBAYWdncmVnYXRlIEByb3dzXG5cbiAgICAjXG4gICAgIyBTZWxlY3QgdGhlIG1vc3QgcmVjZW50IHRoaW5nIHdpdGggZGF0YVxuICAgICNcblxuICAgIGlmIEByb3dzLmxlbmd0aCAhPSAwXG4gICAgICBAc2VsZWN0ZWQgPVxuICAgICAgICB3ZWVrICAgICA6IEBpbmRleEJ5UGFydFtfLmxhc3QoQHJvd3MpWydwYXJ0J11dXG4gICAgICAgIGl0ZW1UeXBlIDogXy5sYXN0KEByb3dzKVsnaXRlbVR5cGVzJ11bMF0ua2V5XG5cbiAgICAjXG4gICAgIyBNYWtlIGZsb3QgZGF0YVxuICAgICNcbiAgICBwb2ludHNCeUl0ZW1UeXBlID0ge31cbiAgICBmb3Igcm93LCBpIGluIEByb3dzXG4gICAgICBmb3IgaXRlbVR5cGUgaW4gcm93Lml0ZW1UeXBlc1xuICAgICAgICBncmFwaEluZGV4ID0gQGluZGV4QnlQYXJ0W3Jvdy5wYXJ0XSArIDFcbiAgICAgICAgcG9pbnRzQnlJdGVtVHlwZVtpdGVtVHlwZS5rZXldID0gW10gaWYgbm90IHBvaW50c0J5SXRlbVR5cGVbaXRlbVR5cGUua2V5XT8gXG4gICAgICAgIHBvaW50c0J5SXRlbVR5cGVbaXRlbVR5cGUua2V5XS5wdXNoIFtncmFwaEluZGV4LCBpdGVtVHlwZS5pdGVtc1Blck1pbnV0ZV1cbiAgICBAZmxvdERhdGEgICAgICA9IFtdXG4gICAgQGJlbmNobWFya0RhdGEgPSBbXVxuICAgIGkgPSAwXG5cbiAgICBmb3IgbmFtZSwgZGF0YSBvZiBwb2ludHNCeUl0ZW1UeXBlXG4gICAgICBrZXkgPSBuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIEBmbG90RGF0YVtrZXldID0ge1xuICAgICAgICBcImRhdGFcIiAgOiBkYXRhXG4gICAgICAgIFwibGFiZWxcIiA6IG5hbWUudGl0bGVpemUoKVxuICAgICAgICBcImtleVwiICAgOiBrZXlcbiAgICAgICAgXCJsaW5lc1wiIDpcbiAgICAgICAgICBcInNob3dcIiA6IHRydWVcbiAgICAgICAgXCJwb2ludHNcIiA6XG4gICAgICAgICAgXCJzaG93XCIgOiB0cnVlXG4gICAgICB9XG5cblxuICAgICNcbiAgICAjIENyZWF0ZSBiZW5jaG1hcmsgZmxvdCBncmFwaHNcbiAgICAjXG4gICAgQGZsb3RCZW5jaG1hcmsgPSBbXVxuICAgIGZvciBpdGVtVHlwZSwgc3VidGVzdHMgb2YgQHN1YnRlc3RzLmluZGV4QnkoXCJpdGVtVHlwZVwiKVxuICAgICAgZGF0YUZvckJlbmNobWFyayA9IFtdXG4gICAgICBmb3Igc3VidGVzdCwgaSBpbiBzdWJ0ZXN0c1xuICAgICAgICBncmFwaEluZGV4ID0gQGluZGV4QnlQYXJ0W3N1YnRlc3QuZ2V0KFwicGFydFwiKV0gKyAxXG4gICAgICAgIGRhdGFGb3JCZW5jaG1hcmsucHVzaCBbZ3JhcGhJbmRleCwgc3VidGVzdC5nZXROdW1iZXIoXCJzY29yZVRhcmdldFwiKV1cblxuICAgICAgQGZsb3RCZW5jaG1hcmtbaXRlbVR5cGUudG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIFwibGFiZWxcIiA6IFwiUHJvZ3Jlc3MgYmVuY2htYXJrXCJcbiAgICAgICAgXCJkYXRhXCIgOiBkYXRhRm9yQmVuY2htYXJrXG4gICAgICAgIFwiY29sb3JcIiA6IFwiI2FhYVwiXG4gICAgICAgIFwibGluZXNcIiA6XG4gICAgICAgICAgXCJzaG93XCIgIDogdHJ1ZVxuICAgICAgfVxuXG4gICAgI1xuICAgICMgY3JlYXRlIHdhcm5pbmcgdGhyZXNob2xkc1xuICAgICNcbiAgICBAd2FybmluZ1RocmVzaG9sZHMgPSB7fVxuICAgIGZvciBpdGVtVHlwZSwgc3VidGVzdHMgb2YgQHN1YnRlc3RzLmluZGV4QnkoXCJpdGVtVHlwZVwiKVxuICAgICAgQHdhcm5pbmdUaHJlc2hvbGRzW2l0ZW1UeXBlXSA9IFtdXG4gICAgICBmb3Igc3VidGVzdCwgaSBpbiBzdWJ0ZXN0c1xuICAgICAgICBAd2FybmluZ1RocmVzaG9sZHNbaXRlbVR5cGUudG9Mb3dlckNhc2UoKV1bQGluZGV4QnlQYXJ0W3N1YnRlc3QuZ2V0KFwicGFydFwiKV1dID1cbiAgICAgICAgICB0YXJnZXQ6IHN1YnRlc3QuZ2V0TnVtYmVyKFwic2NvcmVUYXJnZXRcIilcbiAgICAgICAgICBzcHJlYWQ6IHN1YnRlc3QuZ2V0TnVtYmVyKFwic2NvcmVTcHJlYWRcIilcbiAgICAgICAgICBzZWNvbmRzOiBzdWJ0ZXN0LmdldE51bWJlcihcInRpbWVyXCIpXG5cblxuICAgIEByZW5kZXJSZWFkeSA9IHRydWVcbiAgICBAcmVuZGVyKClcblxuICByZW5kZXI6IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IEByZW5kZXJSZWFkeVxuICAgICR3aW5kb3cgPSAkKHdpbmRvdylcbiAgICB3aW4gPSBcbiAgICAgIGggOiAkd2luZG93LmhlaWdodCgpXG4gICAgICB3IDogJHdpbmRvdy53aWR0aCgpXG4gICAgXG4gICAgc3R1ZGVudE5hbWUgPSBcIlxuICAgICAgPGgyPiN7QHN0dWRlbnQuZ2V0KCduYW1lJyl9PC9oMj5cbiAgICBcIiBpZiBAbW9kZSA9PSBASU5ESVZJRFVBTFxuXG4gICAgaHRtbCA9IFwiXG4gICAgICA8aDE+UHJvZ3Jlc3MgdGFibGU8L2gxPlxuICAgICAgI3tzdHVkZW50TmFtZSB8fCBcIlwifVxuICAgIFwiXG5cbiAgICAjXG4gICAgIyBFbXB0eSB3YXJuaW5nXG4gICAgI1xuICAgIGh0bWxXYXJuaW5nID0gXCI8cD5ObyB0ZXN0IGRhdGEgZm9yIHRoaXMgdHlwZSBvZiByZXBvcnQuIFJldHVybiB0byB0aGUgPGEgaHJlZj0nI2NsYXNzJz5jbGFzcyBtZW51PC9hPiBhbmQgY2xpY2sgdGhlIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9ydW4ucG5nJz4gaWNvbiB0byBjb2xsZWN0IGRhdGEuPC9wPlwiXG5cbiAgICBpZiBAcmVzdWx0cy5sZW5ndGggPT0gMFxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICN7aHRtbH1cbiAgICAgICAgI3todG1sV2FybmluZ31cbiAgICAgIFwiXG4gICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICAgIHJldHVyblxuXG5cbiAgICAjXG4gICAgIyBGbG90IGNvbnRhaW5lcnNcbiAgICAjXG4gICAgaHRtbCArPSBcIlxuICAgICAgPGRpdiBpZD0nZmxvdC1tZW51Jz5cbiAgICAgIFwiXG5cbiAgICBmb3Iga2V5IGluIF8udW5pcShAc3VidGVzdHMucGx1Y2soXCJpdGVtVHlwZVwiKSlcbiAgICAgIGxhYmVsID0ga2V5LnJlcGxhY2UoL1tfLV0vZywgXCIgXCIpLmNhcGl0YWxpemUoKVxuICAgICAgc2VsZWN0ZWRDbGFzcyA9IGlmIGtleSA9PSBAc2VsZWN0ZWQuaXRlbVR5cGUgdGhlbiBcInNlbGVjdGVkXCIgZWxzZSBcIlwiXG4gICAgICBodG1sICs9IFwiPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzZWxlY3RfaXRlbVR5cGUgI3tzZWxlY3RlZENsYXNzfScgZGF0YS1pdGVtVHlwZT0nI3trZXl9Jz4je2xhYmVsfTwvYnV0dG9uPlwiXG5cbiAgICBodG1sICs9IFwiXG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9J2Zsb3QtY29udGFpbmVyJyBzdHlsZT0nd2lkdGg6ICN7d2luZG93LncqMC44fXB4OyBoZWlnaHQ6MzAwcHg7Jz48L2Rpdj5cbiAgICBcIlxuXG4gICAgI1xuICAgICMgU2V0IHRoZSB0YWJsZVxuICAgICNcbiAgICBodG1sICs9IFwiXG4gICAgPGRpdiBpZD0ndGFibGVfY29udGFpbmVyJz48L2Rpdj5cbiAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIGJhY2snPiN7dCgnYmFjaycpfTwvYnV0dG9uPlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuICAgIEB1cGRhdGVUYWJsZSgpXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgQHVwZGF0ZUZsb3QoKVxuXG4gIHVwZGF0ZVRhYmxlOiAtPlxuXG4gICAgdHlwZSA9IEBzZWxlY3RlZC5pdGVtVHlwZVxuICAgIHdlZWsgPSBAc2VsZWN0ZWQud2Vla1xuXG4gICAgaHRtbCA9IFwiPHRhYmxlIGNsYXNzPSd0YWJ1bGFyJz5cIlxuICAgIGZvciByb3csIGkgaW4gQHJvd3NcbiAgICAgICMgc2tpcCBpZiBzZWxlY3RlZCByb3cgZG9lc24ndCBoYXZlIGFueSBvZiB0aGUgc2VsZWN0ZWQgaXRlbSB0eXBlXG4gICAgICBjb250aW51ZSBpZiAhfl8ucGx1Y2socm93Lml0ZW1UeXBlcywgXCJrZXlcIikuaW5kZXhPZih0eXBlKVxuICAgICAgaHRtbCArPSBcIjx0cj48dGg+I3tAc3VidGVzdE5hbWVzW2ldW3R5cGVdfTwvdGg+PC90cj48dHI+XCJcbiAgICAgIGZvciBpdGVtVHlwZSBpbiByb3cuaXRlbVR5cGVzXG4gICAgICAgIGlmIGl0ZW1UeXBlLmtleSAhPSB0eXBlIHRoZW4gY29udGludWVcbiAgICAgICAgaHRtbCArPSBcIlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD4je2l0ZW1UeXBlLm5hbWV9IGNvcnJlY3Q8L3RkPjx0ZD4je2l0ZW1UeXBlLmNvcnJlY3R9LyN7aXRlbVR5cGUuYXR0ZW1wdGVkfTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+I3tpdGVtVHlwZS5uYW1lfSBjb3JyZWN0IHBlciBtaW51dGU8L3RkPjx0ZD4je2l0ZW1UeXBlLml0ZW1zUGVyTWludXRlfTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgIFwiXG4gICAgaHRtbCArPSBcIjwvdGFibGU+XCJcblxuICAgICNcbiAgICAjIEFkZCB3YXJuaW5nIGlmIGFsbCBzdHVkZW50cyBtb2RlXG4gICAgI1xuXG4gICAgYXZhaWxhYmxlSXRlbVR5cGVzVGhpc1dlZWsgPSBfLnBsdWNrKEByb3dzW3dlZWtdPy5pdGVtVHlwZXMsIFwia2V5XCIpXG5cbiAgICBpZiB3ZWVrID49IEByb3dzLmxlbmd0aCB8fCAhfmF2YWlsYWJsZUl0ZW1UeXBlc1RoaXNXZWVrLmluZGV4T2YodHlwZSlcbiAgICAgIGh0bWwgKz0gXCI8c2VjdGlvbj5ObyBkYXRhIGZvciB0aGlzIGFzc2Vzc21lbnQuPC9zZWN0aW9uPlwiXG4gICAgZWxzZSBpZiBAbW9kZSA9PSBAQUdHUkVHQVRFXG5cbiAgICAgIHNjb3JlID0gMFxuXG4gICAgICBkYXRhID0gaWYgQGZsb3REYXRhW3R5cGVdP1xuICAgICAgICBAZmxvdERhdGFbdHlwZV0uZGF0YVxuICAgICAgZWxzZVxuICAgICAgICBbXVxuXG4gICAgICBmb3IgZGF0dW0gaW4gZGF0YVxuICAgICAgICBpZiBkYXR1bVswXSA9PSB3ZWVrKzFcbiAgICAgICAgICBzY29yZSA9IGRhdHVtWzFdXG5cbiAgICAgIHRocmVzaG9sZCA9IEB3YXJuaW5nVGhyZXNob2xkc1t0eXBlXVt3ZWVrXVxuXG4gICAgICBoaWdoID0gdGhyZXNob2xkLnRhcmdldCArIHRocmVzaG9sZC5zcHJlYWRcbiAgICAgIGxvdyAgPSB0aHJlc2hvbGQudGFyZ2V0IC0gdGhyZXNob2xkLnNwcmVhZFxuICAgICAgZGlmZmVyZW5jZSA9IHNjb3JlIC0gdGhyZXNob2xkLnRhcmdldFxuXG4gICAgICBpZiBzY29yZSA+IGhpZ2hcbiAgICAgICAgcmVzdWx0ID0gXCIoI3tzY29yZX0pLCAje2RpZmZlcmVuY2V9IGNvcnJlY3QgaXRlbXMgcGVyIG1pbnV0ZSBhYm92ZSB0aGUgYmVuY2htYXJrXCJcbiAgICAgICAgd2FybmluZ3MgPSBcIllvdXIgY2xhc3MgaXMgZG9pbmcgd2VsbCwgI3tyZXN1bHR9LCBjb250aW51ZSB3aXRoIHRoZSByZWFkaW5nIHByb2dyYW0uIFNoYXJlIHlvdXIgYW5kIHlvdXIgY2xhc3PigJkgZ3JlYXQgd29yayB3aXRoIHBhcmVudHMuIFJld2FyZCB5b3VyIGNsYXNzIHdpdGggc29tZSBmdW4gcmVhZGluZyBhY3Rpdml0aWVzIHN1Y2ggYXMgcmVhZGluZyBtYXJhdGhvbnMgb3IgY29tcGV0aXRpb25zLiBIb3dldmVyLCBsb29rIGF0IGEgc3R1ZGVudCBncm91cGluZyByZXBvcnQgZm9yIHRoaXMgYXNzZXNzbWVudCBhbmQgbWFrZSBzdXJlIHRoYXQgdGhvc2UgY2hpbGRyZW4gcGVyZm9ybWluZyBiZWxvdyBhdmVyYWdlIGdldCBleHRyYSBhdHRlbnRpb24gYW5kIHByYWN0aWNlIGFuZCBkb27igJl0IGZhbGwgYmVoaW5kLlwiXG4gICAgICBlbHNlIGlmIHNjb3JlIDwgbG93XG4gICAgICAgIHJlc3VsdCA9IFwiKCN7c2NvcmV9KSwgI3tNYXRoLmFicyhkaWZmZXJlbmNlKX0gY29ycmVjdCBpdGVtcyBwZXIgbWludXRlIGJlbG93IHRoZSBiZW5jaG1hcmtcIlxuICAgICAgICB3YXJuaW5ncyA9IFwiWW91ciBjbGFzcyBpcyBwZXJmb3JtaW5nIGJlbG93IHRoZSBncmFkZS1sZXZlbCB0YXJnZXQsICN7cmVzdWx0fS4gUGxhbiBmb3IgYWRkaXRpb25hbCBsZXNzb24gdGltZSBmb2N1c2luZyBvbiByZWFkaW5nIGluIGNvbnN1bHRhdGlvbiB3aXRoIHlvdXIgcHJpbmNpcGFsLiBFbmNvdXJhZ2UgcGFyZW50cyB0byBzcGVuZCBtb3JlIHRpbWUgd2l0aCByZWFkaW5nIG1hdGVyaWFscyBhdCBob21lIOKAkyByZW1pbmQgdGhlbSB0aGF0IHlvdSBhcmUgYSB0ZWFtIHdvcmtpbmcgdG9nZXRoZXIgdG8gaGVscCB0aGVpciBjaGlsZHJlbiBsZWFybmluZyB0byByZWFkLiBUaGluayBhYm91dCBvcmdhbml6aW5nIG90aGVyIGV2ZW50cyBhbmQgb3Bwb3J0dW5pdGllcyBmb3IgcHJhY3RpY2UsIGUuZy4sIHJlYWRpbmcgbWFyYXRob25zIG9yIGNvbXBldGl0aW9ucyB0byBtb3RpdmF0ZSBzdHVkZW50cyB0byByZWFkIG1vcmUuXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgZGlmZmVyZW5jZSAhPSAwICYmIGRpZmZlcmVuY2UgKiAtMSA9PSBNYXRoLmFicyhkaWZmZXJlbmNlKVxuICAgICAgICAgIHJlc3VsdCA9IChzY29yZSAtIHRocmVzaG9sZC50YXJnZXQpICsgXCIgY29ycmVjdCBpdGVtcyBwZXIgbWludXRlIGFib3ZlIHRoZSBiZW5jaCBtYXJrXCJcbiAgICAgICAgZWxzZSBpZiBkaWZmZXJlbmNlID09IDBcbiAgICAgICAgICByZXN1bHQgPSBcIiN7c2NvcmV9IGNvcnJlY3QgaXRlbXMgcGVyIG1pbnV0ZVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXN1bHQgPSBcIigje3Njb3JlfSksIFwiICsgTWF0aC5hYnMoc2NvcmUgLSB0aHJlc2hvbGQudGFyZ2V0KSArIFwiIGNvcnJlY3QgaXRlbXMgcGVyIG1pbnV0ZSBiZWxvdyB0aGUgYmVuY2ggbWFya1wiXG4gICAgICAgIFxuICAgICAgICAjIEBUT0RPIG1ha2UgdGhhdCBcIm1pbnV0ZVwiIHVuaXQgZHluYW1pY1xuICAgICAgICB3YXJuaW5ncyA9IFwiWW91ciBjbGFzcyBpcyBpbiBsaW5lIHdpdGggZXhwZWN0YXRpb25zLCAje3Jlc3VsdH0uIENvbnRpbnVlIHdpdGggdGhlIHJlYWRpbmcgcHJvZ3JhbSBhbmQga2VlcCB1cCB0aGUgZ29vZCB3b3JrISBMb29rIGF0IGEgc3R1ZGVudCBncm91cGluZyByZXBvcnQgZm9yIHRoaXMgYXNzZXNzbWVudCBhbmQgbWFrZSBzdXJlIHRoYXQgdGhvc2UgY2hpbGRyZW4gcGVyZm9ybWluZyBiZWxvdyBhdmVyYWdlIGdldCBleHRyYSBhdHRlbnRpb24gYW5kIHByYWN0aWNlIGFuZCBkb27igJl0IGZhbGwgYmVoaW5kLlwiXG5cbiAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPHNlY3Rpb24+XG4gICAgICAgICAgI3t3YXJuaW5nc31cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgXCJcblxuICAgIEAkZWwuZmluZChcIiN0YWJsZV9jb250YWluZXJcIikuaHRtbCBodG1sXG5cblxuICB1cGRhdGVGbG90OiA9PlxuICAgICNcbiAgICAjIEZsb3Qgb3B0aW9uc1xuICAgICNcblxuICAgIEBmbG90T3B0aW9ucyA9XG4gICAgICBcInhheGlzXCIgOlxuICAgICAgICBcIm1pblwiICAgICAgICAgICA6IDAuNVxuICAgICAgICBcIm1heFwiICAgICAgICAgICA6IEBwYXJ0Q291bnQgKyAwLjVcbiAgICAgICAgXCJ0aWNrc1wiICAgICAgICAgOiAoIFN0cmluZyggaSApIGZvciBpIGluIFsxLi5AcGFydENvdW50XSApXG4gICAgICAgIFwidGlja0RlY2ltYWxzXCIgIDogMFxuICAgICAgICBcInRpY2tGb3JtYXR0ZXJcIiA6ICggbnVtICkgPT4gXG4gICAgICAgICAgaWYgQHN1YnRlc3ROYW1lc1tudW0tMV1bQHNlbGVjdGVkLml0ZW1UeXBlXT9cbiAgICAgICAgICAgIHJldHVybiBcIjxidXR0b24gY2xhc3M9J3h0aWNrICN7aWYgbnVtLTE9PUBzZWxlY3RlZC53ZWVrIHRoZW4gJ3NlbGVjdGVkJyBlbHNlICcnfScgZGF0YS1pbmRleD0nI3tudW0tMX0nPiN7QHN1YnRlc3ROYW1lc1tudW0tMV1bQHNlbGVjdGVkLml0ZW1UeXBlXX08L2J1dHRvbj5cIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiXCJcbiAgICAgIFwiZ3JpZFwiIDpcbiAgICAgICAgXCJtYXJraW5nc1wiIDpcbiAgICAgICAgICBcImNvbG9yXCIgIDogXCIjZmZjXCJcbiAgICAgICAgICBcInhheGlzXCIgIDogXG4gICAgICAgICAgICBcInRvXCIgICA6IEBzZWxlY3RlZC53ZWVrICsgMC41XG4gICAgICAgICAgICBcImZyb21cIiA6IEBzZWxlY3RlZC53ZWVrIC0gMC41XG5cblxuICAgIGRpc3BsYXlEYXRhID0gW11cbiAgICBkaXNwbGF5RGF0YS5wdXNoIEBmbG90RGF0YVtAc2VsZWN0ZWQuaXRlbVR5cGVdICAgICAgaWYgQGZsb3REYXRhW0BzZWxlY3RlZC5pdGVtVHlwZV1cbiAgICBkaXNwbGF5RGF0YS5wdXNoIEBmbG90QmVuY2htYXJrW0BzZWxlY3RlZC5pdGVtVHlwZV0gaWYgQGZsb3RCZW5jaG1hcmtbQHNlbGVjdGVkLml0ZW1UeXBlXVxuICAgIFxuICAgIEBmbG90ID0gJC5wbG90IEAkZWwuZmluZChcIiNmbG90LWNvbnRhaW5lclwiKSwgZGlzcGxheURhdGEsIEBmbG90T3B0aW9uc1xuXG4gICMgVGFrZXMgdGhlIHJlc3VsdHMgZm9yIGVhY2ggaXRlbVR5cGUgYW5kIHJlcGxhY2VzIHRoZW0gd2l0aCBhbiBhdmVyYWdlXG4gIGFnZ3JlZ2F0ZTogKG9sZFJvd3MpIC0+XG5cbiAgICBuZXdSb3dzID0gW11cbiAgICBmb3Igcm93LCBpIGluIG9sZFJvd3NcbiAgICAgIG5ld1Jvd3NbaV0gPVxuICAgICAgICBcInBhcnRcIiAgICAgIDogcm93LnBhcnRcbiAgICAgICAgXCJpdGVtVHlwZXNcIiA6IFtdXG5cbiAgICAgIGZvciByZXN1bHRzIGluIHJvdy5pdGVtVHlwZXNcblxuICAgICAgICAjIGJsYW5rXG4gICAgICAgIG1lYW4gPVxuICAgICAgICAgIFwibmFtZVwiICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgICBcImtleVwiICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgICAgXCJjb3JyZWN0XCIgICAgICAgIDogMFxuICAgICAgICAgIFwiYXR0ZW1wdGVkXCIgICAgICA6IDBcbiAgICAgICAgICBcIml0ZW1zUGVyTWludXRlXCIgOiAwXG5cbiAgICAgICAgIyBhZGRcbiAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICAgICAgbWVhbi5uYW1lICAgICAgICAgICA9IHJlc3VsdC5uYW1lXG4gICAgICAgICAgbWVhbi5rZXkgICAgICAgICAgICA9IHJlc3VsdC5rZXlcbiAgICAgICAgICBtZWFuLmNvcnJlY3QgICAgICAgICs9IHJlc3VsdC5jb3JyZWN0XG4gICAgICAgICAgbWVhbi5hdHRlbXB0ZWQgICAgICArPSByZXN1bHQuYXR0ZW1wdGVkXG4gICAgICAgICAgbWVhbi5pdGVtc1Blck1pbnV0ZSArPSByZXN1bHQuaXRlbXNQZXJNaW51dGVcblxuICAgICAgICAjIGRpdmlkZVxuICAgICAgICBtZWFuLmNvcnJlY3QgICAgICAgIC89IHJlc3VsdHMubGVuZ3RoXG4gICAgICAgIG1lYW4uYXR0ZW1wdGVkICAgICAgLz0gcmVzdWx0cy5sZW5ndGhcbiAgICAgICAgbWVhbi5pdGVtc1Blck1pbnV0ZSAvPSByZXN1bHRzLmxlbmd0aFxuXG4gICAgICAgICMgUm91bmRcbiAgICAgICAgbWVhbi5jb3JyZWN0ID0gTWF0aC5yb3VuZChtZWFuLmNvcnJlY3QpXG4gICAgICAgIG1lYW4uYXR0ZW1wdGVkID0gTWF0aC5yb3VuZChtZWFuLmF0dGVtcHRlZClcbiAgICAgICAgbWVhbi5pdGVtc1Blck1pbnV0ZSA9IE1hdGgucm91bmQobWVhbi5pdGVtc1Blck1pbnV0ZSlcblxuICAgICAgICAjIHJlcGxhY2UgdmFsdWVzIGluIEByb3dzXG4gICAgICAgIG5ld1Jvd3NbaV0uaXRlbVR5cGVzLnB1c2ggbWVhblxuXG4gICAgcmV0dXJuIG5ld1Jvd3NcblxuY2xhc3MgU29ydGVkQ29sbGVjdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgQHNvcnRlZCAgICA9IFtdXG4gICAgQG1vZGVscyAgICA9IG9wdGlvbnMubW9kZWxzXG4gICAgQGF0dHJpYnV0ZSA9IG9wdGlvbnMuYXR0cmlidXRlXG4gICAgIl19
