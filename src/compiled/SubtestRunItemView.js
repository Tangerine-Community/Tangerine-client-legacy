var SubtestRunItemView;

SubtestRunItemView = Backbone.Marionette.ItemView.extend({
  tagName: 'p',
  template: JST["SubtestRunItemView"],
  className: "SubtestRunItemView",
  events: {
    'click .subtest-next': 'next',
    'click .subtest-back': 'back',
    'click .subtest_help': 'toggleHelp',
    'click .skip': 'skip'
  },
  toggleHelp: function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  },
  i18n: function() {
    return this.text = {
      "next": t("SubtestRunView.button.next"),
      "back": t("SubtestRunView.button.back"),
      "skip": t("SubtestRunView.button.skip"),
      "help": t("SubtestRunView.button.help")
    };
  },
  initialize: function(options) {
    var backable, skippable, ui;
    this.i18n();
    this.model = options.model;
    this.parent = this.model.parent;
    if (this.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.model.get('fontFamily')) + " !important;\"";
    }
    this.prototypeRendered = false;
    this.delegateEvents();
    ui = {};
    ui.enumeratorHelp = (this.model.get("enumeratorHelp") || "") !== "" ? "<div class='enumerator_help' " + (this.fontStyle || "") + ">" + (this.model.get('enumeratorHelp')) + "</div>" : "";
    ui.studentDialog = (this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog' " + (this.fontStyle || "") + ">" + (this.model.get('studentDialog')) + "</div>" : "";
    ui.transitionComment = (this.model.get("transitionComment") || "") !== "" ? "<div class='student_dialog' " + (this.fontStyle || "") + ">" + (this.model.get('transitionComment')) + "</div> <br>" : "";
    skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    if (skippable) {
      ui.skipButton = "<button class='skip navigation'>" + this.text.skip + "</button>";
    }
    if (backable) {
      ui.backButton = "<button class='subtest-back navigation'>" + this.text.back + "</button>";
    }
    ui.text = this.text;
    return this.model.set('ui', ui);
  },
  onRender: function() {
    var _render, languageCode;
    _render = (function(_this) {
      return function() {
        console.log(_this.model);
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
    languageCode = this.model.get("language");
    if (languageCode) {
      return i18n.setLng(languageCode, (function(_this) {
        return function(t) {
          window.t = t;
          return _render();
        };
      })(this));
    } else {
      return i18n.setLng(Tangerine.settings.get("language"), (function(_this) {
        return function(t) {
          return _render();
        };
      })(this));
    }
  },
  flagRender: (function(_this) {
    return function(flag) {
      if (!_this.renderFlags) {
        _this.renderFlags = {};
      }
      _this.renderFlags[flag] = true;
      if (_this.renderFlags['subtest'] && _this.renderFlags['prototype']) {
        return _this.trigger("rendered");
      }
    };
  })(this),
  afterRender: (function(_this) {
    return function() {
      var ref;
      if ((ref = _this.prototypeView) != null) {
        if (typeof ref.afterRender === "function") {
          ref.afterRender();
        }
      }
      return _this.onShow();
    };
  })(this),
  showNext: (function(_this) {
    return function() {
      return _this.$el.find(".controlls").show();
    };
  })(this),
  hideNext: (function(_this) {
    return function() {
      return _this.$el.find(".controlls").hide();
    };
  })(this),
  onShow: function() {
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
  },
  getGridScore: function() {
    var grid, gridScore, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    gridScore = this.parent.result.getGridScore(grid.id);
    return gridScore;
  },
  gridWasAutostopped: function() {
    var grid, gridWasAutostopped, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    return gridWasAutostopped = this.parent.result.gridWasAutostopped(grid.id);
  },
  onClose: function() {
    var ref;
    return (ref = this.prototypeView) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  },
  isValid: function() {
    if (!this.prototypeRendered) {
      return false;
    }
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  },
  showErrors: function() {
    return this.prototypeView.showErrors();
  },
  getSum: function() {
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
  },
  abort: function() {
    return this.parent.abort();
  },
  getResult: function() {
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
  },
  getSkipped: function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  },
  next: function() {
    return this.trigger("next");
  },
  back: function() {
    return this.trigger("back");
  },
  skip: function() {
    return this.parent.skip();
  }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0UnVuSXRlbVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFDLElBQUE7O0FBQUEsa0JBQUEsR0FBcUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBN0IsQ0FFcEI7RUFBQSxPQUFBLEVBQVMsR0FBVDtFQUNBLFFBQUEsRUFBVSxHQUFJLENBQUEsb0JBQUEsQ0FEZDtFQUdBLFNBQUEsRUFBWSxvQkFIWjtFQUtBLE1BQUEsRUFDRTtJQUFBLHFCQUFBLEVBQXdCLE1BQXhCO0lBQ0EscUJBQUEsRUFBd0IsTUFEeEI7SUFFQSxxQkFBQSxFQUF3QixZQUZ4QjtJQUdBLGFBQUEsRUFBd0IsTUFIeEI7R0FORjtFQVdBLFVBQUEsRUFBWSxTQUFBO1dBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxVQUE5QixDQUF5QyxHQUF6QztFQUFILENBWFo7RUFhQSxJQUFBLEVBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBQVQ7TUFDQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRFQ7TUFFQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRlQ7TUFHQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBSFQ7O0VBRkUsQ0FiTjtFQW9CQSxVQUFBLEVBQVksU0FBQyxPQUFEO0FBRVYsUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFlLE9BQU8sQ0FBQztJQUN2QixJQUFDLENBQUEsTUFBRCxHQUFlLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDdEIsSUFBaUYsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxDQUFBLEtBQTRCLEVBQTdHO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSx1QkFBQSxHQUF1QixDQUFDLElB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TztNQUNMLE1BQUEsRUFBUyxNQURKO01BRUwsTUFBQSxFQUNFO1FBQUEsTUFBQSxFQUFTLElBQVQ7T0FIRzs7RUFIRSxDQTNJWDtFQW9KQSxVQUFBLEVBQVksU0FBQTtJQUNWLElBQUcscUNBQUg7QUFDRSxhQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBLEVBRFQ7S0FBQSxNQUFBO0FBR0UsWUFBTSxxQ0FIUjs7RUFEVSxDQXBKWjtFQTBKQSxJQUFBLEVBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsTUFBVDtFQUFILENBMUpOO0VBMkpBLElBQUEsRUFBTSxTQUFBO1dBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxNQUFUO0VBQUgsQ0EzSk47RUE0SkEsSUFBQSxFQUFNLFNBQUE7V0FBRyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtFQUFILENBNUpOO0NBRm9CIiwiZmlsZSI6Im1vZHVsZXMvc3VidGVzdC9TdWJ0ZXN0UnVuSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIgU3VidGVzdFJ1bkl0ZW1WaWV3ID0gQmFja2JvbmUuTWFyaW9uZXR0ZS5JdGVtVmlldy5leHRlbmRcblxuICB0YWdOYW1lOiAncCdcbiAgdGVtcGxhdGU6IEpTVFtcIlN1YnRlc3RSdW5JdGVtVmlld1wiXVxuXG4gIGNsYXNzTmFtZSA6IFwiU3VidGVzdFJ1bkl0ZW1WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LW5leHQnIDogJ25leHQnXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LWJhY2snIDogJ2JhY2snXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0X2hlbHAnIDogJ3RvZ2dsZUhlbHAnXG4gICAgJ2NsaWNrIC5za2lwJyAgICAgICAgIDogJ3NraXAnXG5cbiAgdG9nZ2xlSGVscDogLT4gQCRlbC5maW5kKFwiLmVudW1lcmF0b3JfaGVscFwiKS5mYWRlVG9nZ2xlKDI1MClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAbW9kZWwgICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICAgID0gQG1vZGVsLnBhcmVudFxuICAgIEBmb250U3R5bGUgPSBcInN0eWxlPVxcXCJmb250LWZhbWlseTogI3tAbW9kZWwuZ2V0KCdmb250RmFtaWx5Jyl9ICFpbXBvcnRhbnQ7XFxcIlwiIGlmIEBtb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCJcblxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IGZhbHNlXG5cbiAgICBAZGVsZWdhdGVFdmVudHMoKVxuXG4gICAgdWkgPSB7fVxuICAgIHVpLmVudW1lcmF0b3JIZWxwID0gaWYgKEBtb2RlbC5nZXQoXCJlbnVtZXJhdG9ySGVscFwiKSB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8ZGl2IGNsYXNzPSdlbnVtZXJhdG9yX2hlbHAnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ2VudW1lcmF0b3JIZWxwJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICB1aS5zdHVkZW50RGlhbG9nICA9IGlmIChAbW9kZWwuZ2V0KFwic3R1ZGVudERpYWxvZ1wiKSAgfHwgXCJcIikgIT0gXCJcIiB0aGVuIFwiPGRpdiBjbGFzcz0nc3R1ZGVudF9kaWFsb2cnICN7QGZvbnRTdHlsZSB8fCBcIlwifT4je0Btb2RlbC5nZXQgJ3N0dWRlbnREaWFsb2cnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgIHVpLnRyYW5zaXRpb25Db21tZW50ICA9IGlmIChAbW9kZWwuZ2V0KFwidHJhbnNpdGlvbkNvbW1lbnRcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3tAbW9kZWwuZ2V0ICd0cmFuc2l0aW9uQ29tbWVudCd9PC9kaXY+IDxicj5cIiBlbHNlIFwiXCJcblxuICAgIHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgYmFja2FibGUgPSAoIEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IHRydWUgfHwgQG1vZGVsLmdldChcImJhY2tCdXR0b25cIikgPT0gXCJ0cnVlXCIgKSBhbmQgQHBhcmVudC5pbmRleCBpc250IDBcblxuICAgIHVpLnNraXBCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3NraXAgbmF2aWdhdGlvbic+I3tAdGV4dC5za2lwfTwvYnV0dG9uPlwiIGlmIHNraXBwYWJsZVxuICAgIHVpLmJhY2tCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3N1YnRlc3QtYmFjayBuYXZpZ2F0aW9uJz4je0B0ZXh0LmJhY2t9PC9idXR0b24+XCIgaWYgYmFja2FibGVcbiAgICB1aS50ZXh0ID0gQHRleHRcbiAgICBAbW9kZWwuc2V0KCd1aScsIHVpKVxuXG4gIG9uUmVuZGVyOiAtPlxuXG4gICAgX3JlbmRlciA9ID0+XG5cbiAgICAgICMgUHJvdG90eXBlIHNwZWNpZmljIHZpZXdzIGZvbGxvdyB0aGlzIGNhcGl0YWxpemF0aW9uIGNvbnZlbnRpb246IEdwc1J1blZpZXdcbiAgICAgIGNvbnNvbGUubG9nIEBtb2RlbFxuICAgICAgQHByb3RvdHlwZVZpZXcgPSBuZXcgd2luZG93W1wiI3tAbW9kZWwuZ2V0KCdwcm90b3R5cGUnKS50aXRsZWl6ZSgpfVJ1blZpZXdcIl1cbiAgICAgICAgbW9kZWwgIDogQG1vZGVsXG4gICAgICAgIHBhcmVudCA6IEBcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwicmVuZGVyZWRcIiwgICAgPT4gQGZsYWdSZW5kZXIoXCJwcm90b3R5cGVcIilcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwic3ViUmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcInNob3dOZXh0XCIsICAgID0+IEBzaG93TmV4dCgpXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcImhpZGVOZXh0XCIsICAgID0+IEBoaWRlTmV4dCgpXG4gICAgICBAcHJvdG90eXBlVmlldy5vbiBcInJlYWR5XCIsICAgICAgID0+IEBwcm90b3R5cGVSZW5kZXJlZCA9IHRydWVcbiAgICAgIEBwcm90b3R5cGVWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKCcjcHJvdG90eXBlX3dyYXBwZXInKSlcbiAgICAgIEBwcm90b3R5cGVWaWV3LnJlbmRlcigpXG5cbiAgICAgIEBmbGFnUmVuZGVyIFwic3VidGVzdFwiXG5cbiAgICBsYW5ndWFnZUNvZGUgPSBAbW9kZWwuZ2V0KFwibGFuZ3VhZ2VcIilcbiAgICBpZiBsYW5ndWFnZUNvZGVcbiAgICAgIGkxOG4uc2V0TG5nIGxhbmd1YWdlQ29kZSwgKHQpID0+XG4gICAgICAgIHdpbmRvdy50ID0gdFxuICAgICAgICBfcmVuZGVyKClcbiAgICBlbHNlXG4gICAgICBpMThuLnNldExuZyBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwibGFuZ3VhZ2VcIiksICh0KSA9PlxuICAgICAgICBfcmVuZGVyKClcblxuICBmbGFnUmVuZGVyOiAoIGZsYWcgKSA9PlxuICAgIEByZW5kZXJGbGFncyA9IHt9IGlmIG5vdCBAcmVuZGVyRmxhZ3NcbiAgICBAcmVuZGVyRmxhZ3NbZmxhZ10gPSB0cnVlXG5cbiAgICBpZiBAcmVuZGVyRmxhZ3NbJ3N1YnRlc3QnXSAmJiBAcmVuZGVyRmxhZ3NbJ3Byb3RvdHlwZSddXG4gICAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBhZnRlclJlbmRlcjogPT5cbiAgICBAcHJvdG90eXBlVmlldz8uYWZ0ZXJSZW5kZXI/KClcbiAgICBAb25TaG93KClcblxuICBzaG93TmV4dDogPT4gQCRlbC5maW5kKFwiLmNvbnRyb2xsc1wiKS5zaG93KClcbiAgaGlkZU5leHQ6ID0+IEAkZWwuZmluZChcIi5jb250cm9sbHNcIikuaGlkZSgpXG5cbiAgb25TaG93OiAtPlxuICAgIGRpc3BsYXlDb2RlID0gQG1vZGVsLmdldFN0cmluZyhcImRpc3BsYXlDb2RlXCIpXG5cbiAgICBpZiBub3QgXy5pc0VtcHR5U3RyaW5nKGRpc3BsYXlDb2RlKVxuXG4gICAgICB0cnlcbiAgICAgICAgQ29mZmVlU2NyaXB0LmV2YWwuYXBwbHkoQCwgW2Rpc3BsYXlDb2RlXSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgYWxlcnQgXCIje25hbWV9XFxuXFxuI3ttZXNzYWdlfVwiXG4gICAgICAgIGNvbnNvbGUubG9nIFwiZGlzcGxheUNvZGUgRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpXG5cbiAgICBAcHJvdG90eXBlVmlldz8udXBkYXRlRXhlY3V0ZVJlYWR5Pyh0cnVlKVxuXG4gIGdldEdyaWRTY29yZTogLT5cbiAgICBsaW5rID0gQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIikgfHwgXCJcIlxuICAgIGlmIGxpbmsgPT0gXCJcIiB0aGVuIHJldHVyblxuICAgIGdyaWQgPSBAcGFyZW50Lm1vZGVsLnN1YnRlc3RzLmdldCBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKVxuICAgIGdyaWRTY29yZSA9IEBwYXJlbnQucmVzdWx0LmdldEdyaWRTY29yZSBncmlkLmlkXG4gICAgZ3JpZFNjb3JlXG5cbiAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAtPlxuICAgIGxpbmsgPSBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKSB8fCBcIlwiXG4gICAgaWYgbGluayA9PSBcIlwiIHRoZW4gcmV0dXJuXG4gICAgZ3JpZCA9IEBwYXJlbnQubW9kZWwuc3VidGVzdHMuZ2V0IEBtb2RlbC5nZXQoXCJncmlkTGlua0lkXCIpXG4gICAgZ3JpZFdhc0F1dG9zdG9wcGVkID0gQHBhcmVudC5yZXN1bHQuZ3JpZFdhc0F1dG9zdG9wcGVkIGdyaWQuaWRcblxuICBvbkNsb3NlOiAtPlxuICAgIEBwcm90b3R5cGVWaWV3Py5jbG9zZT8oKVxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgaWYgbm90IEBwcm90b3R5cGVSZW5kZXJlZCB0aGVuIHJldHVybiBmYWxzZVxuICAgIGlmIEBwcm90b3R5cGVWaWV3LmlzVmFsaWQ/XG4gICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuaXNWYWxpZCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgQHByb3RvdHlwZVZpZXcuc2hvd0Vycm9ycygpXG5cbiAgZ2V0U3VtOiAtPlxuICAgIGlmIEBwcm90b3R5cGVWaWV3LmdldFN1bT9cbiAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTdW0oKVxuICAgIGVsc2VcbiAgICAgICMgbWF5YmUgYSBiZXR0ZXIgZmFsbGJhY2tcbiAgICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGFib3J0OiAtPlxuICAgIEBwYXJlbnQuYWJvcnQoKVxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXN1bHQgPSBAcHJvdG90eXBlVmlldy5nZXRSZXN1bHQoKVxuICAgIGhhc2ggPSBAbW9kZWwuZ2V0KFwiaGFzaFwiKSBpZiBAbW9kZWwuaGFzKFwiaGFzaFwiKVxuICAgIHJldHVybiB7XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiAgICB9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTa2lwcGVkP1xuICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmdldFNraXBwZWQoKVxuICAgIGVsc2VcbiAgICAgIHRocm93IFwiUHJvdG90eXBlIHNraXBwaW5nIG5vdCBpbXBsZW1lbnRlZFwiXG5cbiAgbmV4dDogLT4gQHRyaWdnZXIgXCJuZXh0XCJcbiAgYmFjazogLT4gQHRyaWdnZXIgXCJiYWNrXCJcbiAgc2tpcDogLT4gQHBhcmVudC5za2lwKClcbiJdfQ==
