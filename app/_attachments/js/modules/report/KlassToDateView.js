var KlassToDateView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassToDateView = (function(_super) {

  __extends(KlassToDateView, _super);

  function KlassToDateView() {
    this.afterRender = __bind(this.afterRender, this);
    KlassToDateView.__super__.constructor.apply(this, arguments);
  }

  KlassToDateView.prototype.events = {
    "click .xtick": "changeCurrentIndex"
  };

  KlassToDateView.prototype.changeCurrentIndex = function(event) {
    var $target;
    $target = $(event.target);
    this.currentIndex = parseInt($target.attr("data-index"));
    this.processResults();
    this.readyFlot();
    return this.afterRender();
  };

  KlassToDateView.prototype.bucketize = function(bucketList) {
    var bucket, result, _i, _len;
    result = [];
    for (_i = 0, _len = bucketList.length; _i < _len; _i++) {
      bucket = bucketList[_i];
      result[bucket] = [];
    }
    return result;
  };

  KlassToDateView.prototype.initialize = function(options) {
    var i, j, milisecondsPerPart, subtest, subtestPart, subtests, subtestsByPart, _i, _j, _len, _len2, _len3, _len4, _len5, _ref;
    milisecondsPerPart = 604800000;
    this.currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart);
    if (!(this.currentIndex != null)) this.currentIndex = this.currentPart;
    this.range = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = this.currentPart; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(i);
      }
      return _results;
    }).call(this);
    subtestsByPart = [];
    _ref = options.subtests;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      subtestPart = subtest.get("part");
      if (subtestsByPart[subtestPart] != null) {
        subtestsByPart[subtestPart].push(subtest);
      } else {
        subtestsByPart[subtestPart] = [subtest];
      }
    }
    this.subtestsByResultsBucket = [];
    this.resultsByBucketByPart = {};
    for (i = 0, _len2 = subtestsByPart.length; i < _len2; i++) {
      subtests = subtestsByPart[i];
      if (subtests === void 0) continue;
      for (_j = 0, _len3 = subtests.length; _j < _len3; _j++) {
        subtest = subtests[_j];
        if (this.resultsByBucketByPart[subtest.get("resultBucket")] === void 0) {
          this.resultsByBucketByPart[subtest.get("resultBucket")] = [];
          this.subtestsByResultsBucket[subtest.get("resultBucket")] = [];
        }
        this.resultsByBucketByPart[subtest.get("resultBucket")][i] = options.results.where({
          "subtestId": subtest.id,
          "klassId": options.klass.id
        });
        this.subtestsByResultsBucket[subtest.get("resultBucket")].push(subtest);
      }
    }
    this.bucketList = _.keys(this.resultsByBucketByPart);
    this.resultsByPart = [];
    for (i = 0, _len4 = subtestsByPart.length; i < _len4; i++) {
      subtests = subtestsByPart[i];
      if (!(subtests != null)) continue;
      for (j = 0, _len5 = subtests.length; j < _len5; j++) {
        subtest = subtests[j];
        if (this.resultsByPart[i] != null) {
          this.resultsByPart[i] = this.resultsByPart[i].concat(options.results.where({
            "subtestId": subtest.id
          }));
        } else {
          this.resultsByPart[i] = options.results.where({
            "subtestId": subtest.id
          });
        }
      }
    }
    this.processResults();
    return this.readyFlot();
  };

  KlassToDateView.prototype.processResults = function() {
    var basicStats, bucket, bucketKey, part, percentages, result, results, _i, _len, _ref;
    this.percentagesByStudent = [];
    this.flotArrays = this.bucketize(this.bucketList);
    _ref = this.resultsByBucketByPart;
    for (bucketKey in _ref) {
      bucket = _ref[bucketKey];
      for (part in bucket) {
        results = bucket[part];
        percentages = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          basicStats = this.getBasicStats(result);
          percentages.push(basicStats.percentCorrect);
        }
        if (results.length > 0) {
          this.flotArrays[bucketKey].push([parseInt(part), Math.ave.apply(this, percentages)]);
          if (parseInt(part) === this.currentIndex) {
            this.percentagesByStudent[bucketKey] = percentages;
          }
        }
      }
    }
    return this.warnings = Tangerine.ReportWarnings["KlassToDateView"]({
      percentages: this.percentagesByStudent,
      studentCount: this.options.studentCount
    });
  };

  KlassToDateView.prototype.readyFlot = function() {
    var bucket, bucketKey, bucketType, flotArray, i, oneObject, subtests, _ref, _ref2, _ref3,
      _this = this;
    bucketType = this.bucketize(this.bucketList);
    _ref = this.subtestsByResultsBucket;
    for (bucketKey in _ref) {
      subtests = _ref[bucketKey];
      if (((_ref2 = subtests[0]) != null ? typeof _ref2.get === "function" ? _ref2.get("timer") : void 0 : void 0) > 0 && _.flatten(this.resultsByBucketByPart[subtests[0].get('resultBucket')]).length > 1) {
        bucketType[bucketKey] = "lines";
      } else {
        bucketType[bucketKey] = "points";
      }
    }
    this.flotData = [];
    _ref3 = this.flotArrays;
    for (bucket in _ref3) {
      flotArray = _ref3[bucket];
      flotArray = _.reject(flotArray, function(arr) {
        return arr[0] > _this.currentPart;
      });
      if (bucketType[bucket] === "lines") {
        flotArray.push([this.currentPart + 1, _.last(flotArray)[1]]);
      }
      oneObject = {
        "label": bucket,
        "data": flotArray
      };
      oneObject[bucketType[bucket]] = {
        "show": true,
        "radius": 4,
        "width": 4
      };
      this.flotData.push(oneObject);
    }
    return this.flotOptions = {
      "yaxis": {
        min: 0,
        max: 100,
        ticks: 10
      },
      "xaxis": {
        min: 0.5,
        max: this.currentPart + 0.5,
        ticks: (function() {
          var _ref4, _results;
          _results = [];
          for (i = 1, _ref4 = this.currentPart; 1 <= _ref4 ? i <= _ref4 : i >= _ref4; 1 <= _ref4 ? i++ : i--) {
            _results.push(String(i));
          }
          return _results;
        }).call(this),
        tickDecimals: 0,
        tickFormatter: function(num) {
          return "<button class='command xtick' data-index='" + num + "'>" + num + "</button>";
        }
      },
      "grid": {
        "markings": [
          {
            "color": "#ffc",
            "xaxis": {
              "to": this.currentIndex + 0.5,
              "from": this.currentIndex - 0.5
            }
          }
        ]
      }
    };
  };

  KlassToDateView.prototype.getBasicStats = function(result) {
    var correctItems, item, percentCorrect, totalItems, _i, _len, _ref;
    correctItems = 0;
    totalItems = 0;
    _ref = result.get("subtestData").items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.itemResult === "correct") correctItems++;
      totalItems++;
    }
    percentCorrect = (correctItems / totalItems) * 100;
    return {
      "percentCorrect": percentCorrect,
      "correctItems": correctItems,
      "totalItems": totalItems,
      "studentId": result.get("studentId")
    };
  };

  KlassToDateView.prototype.render = function() {
    var lineColor;
    this.$el.html("      <h1>" + (t('class progress report')) + "</h1>      <p>This class has " + this.options.studentCount + " students.</p>      <div id='chart' style='width:450px; height:300px;'></div>      <div id='warnings'></div>    ");
    this.trigger("rendered");
    return lineColor = "#BDDC93";
  };

  KlassToDateView.prototype.afterRender = function() {
    var warning, warningsHTML, _i, _len, _ref;
    warningsHTML = "";
    if (this.warnings.length > 0) {
      warningsHTML = "<div class='warnings'>        <b>Warning</b><br>";
      _ref = this.warnings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        warning = _ref[_i];
        warningsHTML += warning.html;
      }
      warningsHTML += "</div>";
      this.$el.find("#warnings").html(warningsHTML);
    } else {
      this.$el.find("#warnings").html("");
    }
    this.flotOptions["legend"] = {
      "show": true
    };
    return this.plot = $.plot(this.$el.find("#chart"), this.flotData, this.flotOptions);
  };

  return KlassToDateView;

})(Backbone.View);
