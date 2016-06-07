var SubtestRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestRunView = (function(superClass) {
  extend(SubtestRunView, superClass);

  function SubtestRunView() {
    this.hideNext = bind(this.hideNext, this);
    this.showNext = bind(this.showNext, this);
    this.afterRender = bind(this.afterRender, this);
    this.flagRender = bind(this.flagRender, this);
    return SubtestRunView.__super__.constructor.apply(this, arguments);
  }

  SubtestRunView.prototype.className = "SubtestRunView";

  SubtestRunView.prototype.events = {
    'click .subtest-next': 'next',
    'click .subtest-back': 'back',
    'click .subtest_help': 'toggleHelp',
    'click .skip': 'skip'
  };

  SubtestRunView.prototype.toggleHelp = function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  };

  SubtestRunView.prototype.i18n = function() {
    return this.text = {
      "next": t("SubtestRunView.button.next"),
      "back": t("SubtestRunView.button.back"),
      "skip": t("SubtestRunView.button.skip"),
      "help": t("SubtestRunView.button.help")
    };
  };

  SubtestRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    if (this.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.model.get('fontFamily')) + " !important;\"";
    }
    return this.prototypeRendered = false;
  };

  SubtestRunView.prototype.render = function() {
    var _render, code;
    _render = (function(_this) {
      return function() {
        var backButton, backable, enumeratorHelp, skipButton, skippable, studentDialog, transitionComment;
        _this.delegateEvents();
        enumeratorHelp = (_this.model.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>" + _this.text.help + "</button><div class='enumerator_help' " + (_this.fontStyle || "") + ">" + (_this.model.get('enumeratorHelp')) + "</div>" : "";
        studentDialog = (_this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog' " + (_this.fontStyle || "") + ">" + (_this.model.get('studentDialog')) + "</div>" : "";
        transitionComment = (_this.model.get("transitionComment") || "") !== "" ? "<div class='student_dialog' " + (_this.fontStyle || "") + ">" + (_this.model.get('transitionComment')) + "</div> <br>" : "";
        skippable = _this.model.get("skippable") === true || _this.model.get("skippable") === "true";
        backable = (_this.model.get("backButton") === true || _this.model.get("backButton") === "true") && _this.parent.index !== 0;
        if (skippable) {
          skipButton = "<button class='skip navigation'>" + _this.text.skip + "</button>";
        }
        if (backable) {
          backButton = "<button class='subtest-back navigation'>" + _this.text.back + "</button>";
        }
        _this.$el.html("<h2>" + (_this.model.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog + " <div id='prototype_wrapper'></div> <div class='controlls clearfix'> " + transitionComment + " " + (backButton || '') + " <button class='subtest-next navigation'>" + _this.text.next + "</button> " + (skipButton || '') + " </div>");
        _this.prototypeView = new window[(_this.model.get('prototype').titleize()) + "RunView"]({
          model: _this.model,
          parent: _this
        });
        _this.prototypeView.on("rendered", function() {
          return _this.flagRender("prototype");
        });
        _this.prototypeView.on("subRendered", function() {
          return _this.trigger("subRendered");
        });
        _this.prototypeView.on("showNext", function() {
          return _this.showNext();
        });
        _this.prototypeView.on("hideNext", function() {
          return _this.hideNext();
        });
        _this.prototypeView.on("ready", function() {
          return _this.prototypeRendered = true;
        });
        _this.prototypeView.setElement(_this.$el.find('#prototype_wrapper'));
        _this.prototypeView.render();
        return _this.flagRender("subtest");
      };
    })(this);
    code = this.model.has("language") && this.model.get("language") !== "" ? this.model.get("language") : Tangerine.settings.get("language");
    if (typeof Tangerine.locales[code] === "undefined") {
      code = Tangerine.settings.get("language");
    }
    return Utils.changeLanguage(code, function(err, t) {
      window.t = t;
      return _render();
    });
  };

  SubtestRunView.prototype.flagRender = function(flag) {
    if (!this.renderFlags) {
      this.renderFlags = {};
    }
    this.renderFlags[flag] = true;
    if (this.renderFlags['subtest'] && this.renderFlags['prototype']) {
      return this.trigger("rendered");
    }
  };

  SubtestRunView.prototype.afterRender = function() {
    var ref;
    if ((ref = this.prototypeView) != null) {
      if (typeof ref.afterRender === "function") {
        ref.afterRender();
      }
    }
    return this.onShow();
  };

  SubtestRunView.prototype.showNext = function() {
    return this.$el.find(".controlls").show();
  };

  SubtestRunView.prototype.hideNext = function() {
    return this.$el.find(".controlls").hide();
  };

  SubtestRunView.prototype.onShow = function() {
    var displayCode, error, error1, message, name, ref;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      try {
        CoffeeScript["eval"].apply(this, [displayCode]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displayCode Error: " + JSON.stringify(error));
      }
    }
    return (ref = this.prototypeView) != null ? typeof ref.updateExecuteReady === "function" ? ref.updateExecuteReady(true) : void 0 : void 0;
  };

  SubtestRunView.prototype.getGridScore = function() {
    var grid, gridScore, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    gridScore = this.parent.result.getGridScore(grid.id);
    return gridScore;
  };

  SubtestRunView.prototype.gridWasAutostopped = function() {
    var grid, gridWasAutostopped, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    return gridWasAutostopped = this.parent.result.gridWasAutostopped(grid.id);
  };

  SubtestRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.prototypeView) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  SubtestRunView.prototype.isValid = function() {
    if (!this.prototypeRendered) {
      return false;
    }
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  };

  SubtestRunView.prototype.showErrors = function() {
    return this.prototypeView.showErrors();
  };

  SubtestRunView.prototype.getSum = function() {
    if (this.prototypeView.getSum != null) {
      return this.prototypeView.getSum();
    } else {
      return {
        correct: 0,
        incorrect: 0,
        missing: 0,
        total: 0
      };
    }
  };

  SubtestRunView.prototype.abort = function() {
    return this.parent.abort();
  };

  SubtestRunView.prototype.getResult = function() {
    var hash, result;
    result = this.prototypeView.getResult();
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    return {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
  };

  SubtestRunView.prototype.getSkipped = function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  };

  SubtestRunView.prototype.next = function() {
    return this.trigger("next");
  };

  SubtestRunView.prototype.back = function() {
    return this.trigger("back");
  };

  SubtestRunView.prototype.skip = function() {
    return this.parent.skip();
  };

  return SubtestRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0UnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxjQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7MkJBRUosU0FBQSxHQUFZOzsyQkFFWixNQUFBLEdBQ0U7SUFBQSxxQkFBQSxFQUF3QixNQUF4QjtJQUNBLHFCQUFBLEVBQXdCLE1BRHhCO0lBRUEscUJBQUEsRUFBd0IsWUFGeEI7SUFHQSxhQUFBLEVBQXdCLE1BSHhCOzs7MkJBS0YsVUFBQSxHQUFZLFNBQUE7V0FBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLFVBQTlCLENBQXlDLEdBQXpDO0VBQUg7OzJCQUVaLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FBVDtNQUNBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FEVDtNQUVBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FGVDtNQUdBLE1BQUEsRUFBUyxDQUFBLENBQUUsNEJBQUYsQ0FIVDs7RUFGRTs7MkJBUU4sVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFlLE9BQU8sQ0FBQztJQUN2QixJQUFDLENBQUEsTUFBRCxHQUFlLE9BQU8sQ0FBQztJQUN2QixJQUFpRixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUEsS0FBNEIsRUFBN0c7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLHVCQUFBLEdBQXVCLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUFELENBQXZCLEdBQWlELGlCQUE5RDs7V0FFQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7RUFSWDs7MkJBVVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtBQUVSLFlBQUE7UUFBQSxLQUFDLENBQUEsY0FBRCxDQUFBO1FBRUEsY0FBQSxHQUFvQixDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGdCQUFYLENBQUEsSUFBZ0MsRUFBakMsQ0FBQSxLQUF3QyxFQUEzQyxHQUFtRCx1Q0FBQSxHQUF3QyxLQUFDLENBQUEsSUFBSSxDQUFDLElBQTlDLEdBQW1ELHdDQUFuRCxHQUEwRixDQUFDLEtBQUMsQ0FBQSxTQUFELElBQWMsRUFBZixDQUExRixHQUE0RyxHQUE1RyxHQUE4RyxDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGdCQUFYLENBQUQsQ0FBOUcsR0FBMkksUUFBOUwsR0FBMk07UUFDNU4sYUFBQSxHQUFvQixDQUFDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGVBQVgsQ0FBQSxJQUFnQyxFQUFqQyxDQUFBLEtBQXdDLEVBQTNDLEdBQW1ELDhCQUFBLEdBQThCLENBQUMsS0FBQyxDQUFBLFNBQUQsSUFBYyxFQUFmLENBQTlCLEdBQWdELEdBQWhELEdBQWtELENBQUMsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsZUFBWCxDQUFELENBQWxELEdBQThFLFFBQWpJLEdBQThJO1FBQy9KLGlCQUFBLEdBQXdCLENBQUMsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsbUJBQVgsQ0FBQSxJQUFvQyxFQUFyQyxDQUFBLEtBQTRDLEVBQS9DLEdBQXVELDhCQUFBLEdBQThCLENBQUMsS0FBQyxDQUFBLFNBQUQsSUFBYyxFQUFmLENBQTlCLEdBQWdELEdBQWhELEdBQWtELENBQUMsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsbUJBQVgsQ0FBRCxDQUFsRCxHQUFrRixhQUF6SSxHQUEySjtRQUVoTCxTQUFBLEdBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLEtBQTJCLElBQTNCLElBQW1DLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxLQUEyQjtRQUMxRSxRQUFBLEdBQVcsQ0FBRSxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUEsS0FBNEIsSUFBNUIsSUFBb0MsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUFBLEtBQTRCLE1BQWxFLENBQUEsSUFBK0UsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQW1CO1FBRTdHLElBQXlFLFNBQXpFO1VBQUEsVUFBQSxHQUFhLGtDQUFBLEdBQW1DLEtBQUMsQ0FBQSxJQUFJLENBQUMsSUFBekMsR0FBOEMsWUFBM0Q7O1FBQ0EsSUFBaUYsUUFBakY7VUFBQSxVQUFBLEdBQWEsMENBQUEsR0FBMkMsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFqRCxHQUFzRCxZQUFuRTs7UUFHQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxNQUFBLEdBQ0gsQ0FBQyxLQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQUQsQ0FERyxHQUNnQixRQURoQixHQUVOLGNBRk0sR0FFUyxHQUZULEdBR04sYUFITSxHQUdRLHVFQUhSLEdBT0osaUJBUEksR0FPYyxHQVBkLEdBUUwsQ0FBQyxVQUFBLElBQWMsRUFBZixDQVJLLEdBUWEsMkNBUmIsR0FTb0MsS0FBQyxDQUFBLElBQUksQ0FBQyxJQVQxQyxHQVMrQyxZQVQvQyxHQVVMLENBQUMsVUFBQSxJQUFjLEVBQWYsQ0FWSyxHQVVhLFNBVnZCO1FBZ0JBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsTUFBTyxDQUFFLENBQUMsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUF1QixDQUFDLFFBQXhCLENBQUEsQ0FBRCxDQUFBLEdBQW9DLFNBQXRDLENBQVAsQ0FDbkI7VUFBQSxLQUFBLEVBQVMsS0FBQyxDQUFBLEtBQVY7VUFDQSxNQUFBLEVBQVMsS0FEVDtTQURtQjtRQUdyQixLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsVUFBbEIsRUFBaUMsU0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFZLFdBQVo7UUFBSCxDQUFqQztRQUNBLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixhQUFsQixFQUFpQyxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsYUFBVDtRQUFILENBQWpDO1FBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLFVBQWxCLEVBQWlDLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQTtRQUFILENBQWpDO1FBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLFVBQWxCLEVBQWlDLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQTtRQUFILENBQWpDO1FBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQWlDLFNBQUE7aUJBQUcsS0FBQyxDQUFBLGlCQUFELEdBQXFCO1FBQXhCLENBQWpDO1FBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWLENBQTFCO1FBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUE7ZUFFQSxLQUFDLENBQUEsVUFBRCxDQUFZLFNBQVo7TUExQ1E7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBOENWLElBQUEsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxVQUFYLENBQUEsSUFBMkIsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFBLEtBQTBCLEVBQXhELEdBQ0gsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQURHLEdBR0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QixVQUF2QjtJQUVKLElBQTZDLE9BQU8sU0FBUyxDQUFDLE9BQVEsQ0FBQSxJQUFBLENBQXpCLEtBQWtDLFdBQS9FO01BQUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsVUFBdkIsRUFBUDs7V0FFQSxLQUFLLENBQUMsY0FBTixDQUFxQixJQUFyQixFQUEyQixTQUFDLEdBQUQsRUFBTSxDQUFOO01BQ3pCLE1BQU0sQ0FBQyxDQUFQLEdBQVc7YUFDWCxPQUFBLENBQUE7SUFGeUIsQ0FBM0I7RUF2RE07OzJCQTJEUixVQUFBLEdBQVksU0FBRSxJQUFGO0lBQ1YsSUFBcUIsQ0FBSSxJQUFDLENBQUEsV0FBMUI7TUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQWY7O0lBQ0EsSUFBQyxDQUFBLFdBQVksQ0FBQSxJQUFBLENBQWIsR0FBcUI7SUFFckIsSUFBRyxJQUFDLENBQUEsV0FBWSxDQUFBLFNBQUEsQ0FBYixJQUEyQixJQUFDLENBQUEsV0FBWSxDQUFBLFdBQUEsQ0FBM0M7YUFDRSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQsRUFERjs7RUFKVTs7MkJBT1osV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBOzs7V0FBYyxDQUFFOzs7V0FDaEIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtFQUZXOzsyQkFJYixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFlBQVYsQ0FBdUIsQ0FBQyxJQUF4QixDQUFBO0VBQUg7OzJCQUNWLFFBQUEsR0FBVSxTQUFBO1dBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsWUFBVixDQUF1QixDQUFDLElBQXhCLENBQUE7RUFBSDs7MkJBRVYsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixhQUFqQjtJQUVkLElBQUcsQ0FBSSxDQUFDLENBQUMsYUFBRixDQUFnQixXQUFoQixDQUFQO0FBRUU7UUFDRSxZQUFZLENBQUMsTUFBRCxDQUFLLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEIsRUFBMkIsQ0FBQyxXQUFELENBQTNCLEVBREY7T0FBQSxjQUFBO1FBRU07UUFDSixJQUFBLEdBQU8sQ0FBRSxvQkFBcUIsQ0FBQyxJQUF2QixDQUE0QixLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWxCLENBQUEsQ0FBNUIsQ0FBMEQsQ0FBQSxDQUFBLENBQTNEO1FBQ1AsT0FBQSxHQUFVLEtBQUssQ0FBQztRQUNoQixLQUFBLENBQVMsSUFBRCxHQUFNLE1BQU4sR0FBWSxPQUFwQjtRQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQUEsR0FBd0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLENBQXBDLEVBTkY7T0FGRjs7a0dBVWMsQ0FBRSxtQkFBb0I7RUFiOUI7OzJCQWVSLFlBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUEsSUFBNEI7SUFDbkMsSUFBRyxJQUFBLEtBQVEsRUFBWDtBQUFtQixhQUFuQjs7SUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQXZCLENBQTJCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBM0I7SUFDUCxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBZixDQUE0QixJQUFJLENBQUMsRUFBakM7V0FDWjtFQUxZOzsyQkFPZCxrQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUFBLElBQTRCO0lBQ25DLElBQUcsSUFBQSxLQUFRLEVBQVg7QUFBbUIsYUFBbkI7O0lBQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUF2QixDQUEyQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQTNCO1dBQ1Asa0JBQUEsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWYsQ0FBa0MsSUFBSSxDQUFDLEVBQXZDO0VBSkg7OzJCQU1wQixPQUFBLEdBQVMsU0FBQTtBQUNQLFFBQUE7cUZBQWMsQ0FBRTtFQURUOzsyQkFHVCxPQUFBLEdBQVMsU0FBQTtJQUNQLElBQUcsQ0FBSSxJQUFDLENBQUEsaUJBQVI7QUFBK0IsYUFBTyxNQUF0Qzs7SUFDQSxJQUFHLGtDQUFIO0FBQ0UsYUFBTyxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURUO0tBQUEsTUFBQTtBQUdFLGFBQU8sTUFIVDs7V0FJQTtFQU5POzsyQkFRVCxVQUFBLEdBQVksU0FBQTtXQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBO0VBRFU7OzJCQUdaLE1BQUEsR0FBUSxTQUFBO0lBQ04sSUFBRyxpQ0FBSDtBQUNFLGFBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsRUFEVDtLQUFBLE1BQUE7QUFJRSxhQUFPO1FBQUMsT0FBQSxFQUFRLENBQVQ7UUFBVyxTQUFBLEVBQVUsQ0FBckI7UUFBdUIsT0FBQSxFQUFRLENBQS9CO1FBQWlDLEtBQUEsRUFBTSxDQUF2QztRQUpUOztFQURNOzsyQkFPUixLQUFBLEdBQU8sU0FBQTtXQUNMLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBO0VBREs7OzJCQUdQLFNBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQTtJQUNULElBQTZCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBN0I7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxFQUFQOztBQUNBLFdBQU87TUFDTCxNQUFBLEVBQVMsTUFESjtNQUVMLE1BQUEsRUFDRTtRQUFBLE1BQUEsRUFBUyxJQUFUO09BSEc7O0VBSEU7OzJCQVNYLFVBQUEsR0FBWSxTQUFBO0lBQ1YsSUFBRyxxQ0FBSDtBQUNFLGFBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQUEsRUFEVDtLQUFBLE1BQUE7QUFHRSxZQUFNLHFDQUhSOztFQURVOzsyQkFNWixJQUFBLEdBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsTUFBVDtFQUFIOzsyQkFDTixJQUFBLEdBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsTUFBVDtFQUFIOzsyQkFDTixJQUFBLEdBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFBO0VBQUg7Ozs7R0E1S3FCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvU3VidGVzdFJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdWJ0ZXN0UnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIlN1YnRlc3RSdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LW5leHQnIDogJ25leHQnXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LWJhY2snIDogJ2JhY2snXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0X2hlbHAnIDogJ3RvZ2dsZUhlbHAnXG4gICAgJ2NsaWNrIC5za2lwJyAgICAgICAgIDogJ3NraXAnXG5cbiAgdG9nZ2xlSGVscDogLT4gQCRlbC5maW5kKFwiLmVudW1lcmF0b3JfaGVscFwiKS5mYWRlVG9nZ2xlKDI1MClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBmb250U3R5bGUgPSBcInN0eWxlPVxcXCJmb250LWZhbWlseTogI3tAbW9kZWwuZ2V0KCdmb250RmFtaWx5Jyl9ICFpbXBvcnRhbnQ7XFxcIlwiIGlmIEBtb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCJcblxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IGZhbHNlXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgX3JlbmRlciA9ID0+XG5cbiAgICAgIEBkZWxlZ2F0ZUV2ZW50cygpXG5cbiAgICAgIGVudW1lcmF0b3JIZWxwID0gaWYgKEBtb2RlbC5nZXQoXCJlbnVtZXJhdG9ySGVscFwiKSB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8YnV0dG9uIGNsYXNzPSdzdWJ0ZXN0X2hlbHAgY29tbWFuZCc+I3tAdGV4dC5oZWxwfTwvYnV0dG9uPjxkaXYgY2xhc3M9J2VudW1lcmF0b3JfaGVscCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAnZW51bWVyYXRvckhlbHAnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgICAgc3R1ZGVudERpYWxvZyAgPSBpZiAoQG1vZGVsLmdldChcInN0dWRlbnREaWFsb2dcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3tAbW9kZWwuZ2V0ICdzdHVkZW50RGlhbG9nJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICAgIHRyYW5zaXRpb25Db21tZW50ICA9IGlmIChAbW9kZWwuZ2V0KFwidHJhbnNpdGlvbkNvbW1lbnRcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3tAbW9kZWwuZ2V0ICd0cmFuc2l0aW9uQ29tbWVudCd9PC9kaXY+IDxicj5cIiBlbHNlIFwiXCJcblxuICAgICAgc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICAgIGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG5cbiAgICAgIHNraXBCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3NraXAgbmF2aWdhdGlvbic+I3tAdGV4dC5za2lwfTwvYnV0dG9uPlwiIGlmIHNraXBwYWJsZVxuICAgICAgYmFja0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nc3VidGVzdC1iYWNrIG5hdmlnYXRpb24nPiN7QHRleHQuYmFja308L2J1dHRvbj5cIiBpZiBiYWNrYWJsZVxuXG5cbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8aDI+I3tAbW9kZWwuZ2V0ICduYW1lJ308L2gyPlxuICAgICAgICAje2VudW1lcmF0b3JIZWxwfVxuICAgICAgICAje3N0dWRlbnREaWFsb2d9XG4gICAgICAgIDxkaXYgaWQ9J3Byb3RvdHlwZV93cmFwcGVyJz48L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdjb250cm9sbHMgY2xlYXJmaXgnPlxuICAgICAgICAgICN7dHJhbnNpdGlvbkNvbW1lbnR9XG4gICAgICAgICAgI3tiYWNrQnV0dG9uIG9yICcnfVxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J3N1YnRlc3QtbmV4dCBuYXZpZ2F0aW9uJz4je0B0ZXh0Lm5leHR9PC9idXR0b24+XG4gICAgICAgICAgI3tza2lwQnV0dG9uIG9yICcnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICAgICMgUHJvdG90eXBlIHNwZWNpZmljIHZpZXdzIGZvbGxvdyB0aGlzIGNhcGl0YWxpemF0aW9uIGNvbnZlbnRpb246IEdwc1J1blZpZXdcblxuICAgICAgQHByb3RvdHlwZVZpZXcgPSBuZXcgd2luZG93W1wiI3tAbW9kZWwuZ2V0KCdwcm90b3R5cGUnKS50aXRsZWl6ZSgpfVJ1blZpZXdcIl1cbiAgICAgICAgbW9kZWwgIDogQG1vZGVsXG4gICAgICAgIHBhcmVudCA6IEBcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwicmVuZGVyZWRcIiwgICAgPT4gQGZsYWdSZW5kZXIoXCJwcm90b3R5cGVcIilcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwic3ViUmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcInNob3dOZXh0XCIsICAgID0+IEBzaG93TmV4dCgpXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcImhpZGVOZXh0XCIsICAgID0+IEBoaWRlTmV4dCgpXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcInJlYWR5XCIsICAgICAgID0+IEBwcm90b3R5cGVSZW5kZXJlZCA9IHRydWVcbiAgICAgIEBwcm90b3R5cGVWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKCcjcHJvdG90eXBlX3dyYXBwZXInKSlcbiAgICAgIEBwcm90b3R5cGVWaWV3LnJlbmRlcigpXG5cbiAgICAgIEBmbGFnUmVuZGVyIFwic3VidGVzdFwiXG5cblxuXG4gICAgY29kZSA9IGlmIEBtb2RlbC5oYXMoXCJsYW5ndWFnZVwiKSBhbmQgQG1vZGVsLmdldChcImxhbmd1YWdlXCIpICE9IFwiXCJcbiAgICAgICAgQG1vZGVsLmdldChcImxhbmd1YWdlXCIpXG4gICAgICBlbHNlXG4gICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJsYW5ndWFnZVwiKVxuXG4gICAgY29kZSA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJsYW5ndWFnZVwiKSBpZiB0eXBlb2YgVGFuZ2VyaW5lLmxvY2FsZXNbY29kZV0gPT0gXCJ1bmRlZmluZWRcIlxuXG4gICAgVXRpbHMuY2hhbmdlTGFuZ3VhZ2UgY29kZSwgKGVyciwgdCkgLT5cbiAgICAgIHdpbmRvdy50ID0gdFxuICAgICAgX3JlbmRlcigpXG5cbiAgZmxhZ1JlbmRlcjogKCBmbGFnICkgPT5cbiAgICBAcmVuZGVyRmxhZ3MgPSB7fSBpZiBub3QgQHJlbmRlckZsYWdzXG4gICAgQHJlbmRlckZsYWdzW2ZsYWddID0gdHJ1ZVxuXG4gICAgaWYgQHJlbmRlckZsYWdzWydzdWJ0ZXN0J10gJiYgQHJlbmRlckZsYWdzWydwcm90b3R5cGUnXVxuICAgICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgQHByb3RvdHlwZVZpZXc/LmFmdGVyUmVuZGVyPygpXG4gICAgQG9uU2hvdygpXG5cbiAgc2hvd05leHQ6ID0+IEAkZWwuZmluZChcIi5jb250cm9sbHNcIikuc2hvdygpXG4gIGhpZGVOZXh0OiA9PiBAJGVsLmZpbmQoXCIuY29udHJvbGxzXCIpLmhpZGUoKVxuXG4gIG9uU2hvdzogLT5cbiAgICBkaXNwbGF5Q29kZSA9IEBtb2RlbC5nZXRTdHJpbmcoXCJkaXNwbGF5Q29kZVwiKVxuXG4gICAgaWYgbm90IF8uaXNFbXB0eVN0cmluZyhkaXNwbGF5Q29kZSlcblxuICAgICAgdHJ5XG4gICAgICAgIENvZmZlZVNjcmlwdC5ldmFsLmFwcGx5KEAsIFtkaXNwbGF5Q29kZV0pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuICAgICAgICBjb25zb2xlLmxvZyBcImRpc3BsYXlDb2RlIEVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycm9yKVxuXG4gICAgQHByb3RvdHlwZVZpZXc/LnVwZGF0ZUV4ZWN1dGVSZWFkeT8odHJ1ZSlcblxuICBnZXRHcmlkU2NvcmU6IC0+XG4gICAgbGluayA9IEBtb2RlbC5nZXQoXCJncmlkTGlua0lkXCIpIHx8IFwiXCJcbiAgICBpZiBsaW5rID09IFwiXCIgdGhlbiByZXR1cm5cbiAgICBncmlkID0gQHBhcmVudC5tb2RlbC5zdWJ0ZXN0cy5nZXQgQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIilcbiAgICBncmlkU2NvcmUgPSBAcGFyZW50LnJlc3VsdC5nZXRHcmlkU2NvcmUgZ3JpZC5pZFxuICAgIGdyaWRTY29yZVxuXG4gIGdyaWRXYXNBdXRvc3RvcHBlZDogLT5cbiAgICBsaW5rID0gQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIikgfHwgXCJcIlxuICAgIGlmIGxpbmsgPT0gXCJcIiB0aGVuIHJldHVyblxuICAgIGdyaWQgPSBAcGFyZW50Lm1vZGVsLnN1YnRlc3RzLmdldCBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKVxuICAgIGdyaWRXYXNBdXRvc3RvcHBlZCA9IEBwYXJlbnQucmVzdWx0LmdyaWRXYXNBdXRvc3RvcHBlZCBncmlkLmlkXG5cbiAgb25DbG9zZTogLT5cbiAgICBAcHJvdG90eXBlVmlldz8uY2xvc2U/KClcblxuICBpc1ZhbGlkOiAtPlxuICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBpZiBAcHJvdG90eXBlVmlldy5pc1ZhbGlkP1xuICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIEBwcm90b3R5cGVWaWV3LnNob3dFcnJvcnMoKVxuXG4gIGdldFN1bTogLT5cbiAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTdW0/XG4gICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuZ2V0U3VtKClcbiAgICBlbHNlXG4gICAgICAjIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4gICAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBhYm9ydDogLT5cbiAgICBAcGFyZW50LmFib3J0KClcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID0gQHByb3RvdHlwZVZpZXcuZ2V0UmVzdWx0KClcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICByZXR1cm4ge1xuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4gICAgfVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U2tpcHBlZD9cbiAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTa2lwcGVkKClcbiAgICBlbHNlXG4gICAgICB0aHJvdyBcIlByb3RvdHlwZSBza2lwcGluZyBub3QgaW1wbGVtZW50ZWRcIlxuXG4gIG5leHQ6IC0+IEB0cmlnZ2VyIFwibmV4dFwiXG4gIGJhY2s6IC0+IEB0cmlnZ2VyIFwiYmFja1wiXG4gIHNraXA6IC0+IEBwYXJlbnQuc2tpcCgpXG4iXX0=
