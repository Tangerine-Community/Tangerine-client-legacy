var Result,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Result = (function(_super) {

  __extends(Result, _super);

  function Result() {
    Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.url = "/result";

  Result.prototype.subtestResults = function() {
    var resultCollection, subtestTypesToSkip,
      _this = this;
    subtestTypesToSkip = ["ConsentPage", "TextPage"];
    resultCollection = {};
    _.each(this.toJSON(), function(result, subtestName) {
      if (_.contains(subtestTypesToSkip, subtestName)) return;
      return resultCollection = _.extend(resultCollection, _this.summaryData(subtestName, result));
    });
    return resultCollection;
  };

  Result.prototype.summaryData = function(subtestName, result) {
    var gender, returnValue, _ref;
    if (result.subtestType == null) {
      switch (subtestName) {
        case "timestamp":
          return {
            FinishTime: new Date(result)
          };
        case "enumerator":
          return {
            Enumerator: result
          };
        default:
          return {};
      }
    }
    if (result.skipped) {
      returnValue = {};
      returnValue[subtestName] = "Skipped";
      return returnValue;
    }
    switch (result.subtestType) {
      case "DateTimePage":
        return {
          Student: result["student-id"],
          StartTime: new Date("" + result.month + " " + result.day + ", " + result.year + " " + result.time)
        };
      case "Dictation":
        return {
          DictationScore: _.values(result).reduce(function(sum, n) {
            return sum += n;
          })
        };
      case "SchoolPage":
        return {
          School: result.name
        };
      case "StudentInformationPage":
        gender = (_ref = result.gender) != null ? _ref : result["m--gender"];
        if (gender) {
          return {
            Gender: gender
          };
        }
        break;
      case "ToggleGridWithTimer":
        returnValue = {};
        returnValue[subtestName] = Result.GridTemplate(result);
        return returnValue;
      case "Phonemes":
        return {
          Phonemes: _.keys(result).length
        };
      case "UntimedSubtest":
      case "UntimedSubtestLinked":
        returnValue = {};
        returnValue[subtestName] = Result.CountCorrectIncorrect(result);
        return returnValue;
      case "PupilContextInterview":
        return {
          PupilContextInterview: _.keys(result).length
        };
      case "ResultsPage":
        return {
          Comments: result.resultComment
        };
    }
  };

  return Result;

})(Backbone.Model);

Result.CountCorrectIncorrect = function(result) {
  return _.values(result).reduce(function(memo, result) {
    if (result === "Correct") memo.itemsCorrect += 1;
    memo.attempted += 1;
    return memo;
  }, {
    itemsCorrect: 0,
    attempted: 0
  });
};

Result.GridTemplate = function(result) {
  var index, itemResult, itemsCorrect, _len, _ref;
  itemsCorrect = 0;
  _ref = result.items;
  for (index = 0, _len = _ref.length; index < _len; index++) {
    itemResult = _ref[index];
    if (index <= result.attempted) if (itemResult) itemsCorrect++;
  }
  return {
    itemsCorrect: itemsCorrect,
    attempted: result.attempted,
    total: result.items.length
  };
};
