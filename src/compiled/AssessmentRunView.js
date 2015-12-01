var AssessmentRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentRunView = (function(superClass) {
  extend(AssessmentRunView, superClass);

  function AssessmentRunView() {
    this.saveResult = bind(this.saveResult, this);
    this.reset = bind(this.reset, this);
    this.step = bind(this.step, this);
    this.skip = bind(this.skip, this);
    return AssessmentRunView.__super__.constructor.apply(this, arguments);
  }

  AssessmentRunView.prototype.className = "AssessmentRunView";

  AssessmentRunView.prototype.initialize = function(options) {
    var hasSequences, i, j, places, ref, resultView, sequences;
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.orderMap = [];
    this.enableCorrections = false;
    Tangerine.tempData = {};
    this.rendered = {
      "assessment": false,
      "subtest": false
    };
    Tangerine.activity = "assessment run";
    this.subtestViews = [];
    this.model.subtests.sort();
    this.model.subtests.each((function(_this) {
      return function(model) {
        return _this.subtestViews.push(new SubtestRunView({
          model: model,
          parent: _this
        }));
      };
    })(this));
    hasSequences = this.model.has("sequences") && !_.isEmpty(_.compact(_.flatten(this.model.get("sequences"))));
    if (hasSequences) {
      sequences = this.model.get("sequences");
      places = Tangerine.settings.get("sequencePlaces");
      if (places == null) {
        places = {};
      }
      if (places[this.model.id] == null) {
        places[this.model.id] = 0;
      }
      if (places[this.model.id] < sequences.length - 1) {
        places[this.model.id]++;
      } else {
        places[this.model.id] = 0;
      }
      Tangerine.settings.save("sequencePlaces", places);
      this.orderMap = sequences[places[this.model.id]];
      this.orderMap[this.orderMap.length] = this.subtestViews.length;
    } else {
      for (i = j = 0, ref = this.subtestViews.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        this.orderMap[i] = i;
      }
    }
    this.result = new Result({
      assessmentId: this.model.id,
      assessmentName: this.model.get("name"),
      blank: true
    });
    if (hasSequences) {
      this.result.set({
        "order_map": this.orderMap
      });
    }
    resultView = new ResultView({
      model: this.result,
      assessment: this.model,
      assessmentView: this
    });
    return this.subtestViews.push(resultView);
  };

  AssessmentRunView.prototype.render = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (this.model.subtests.length === 0) {
      this.$el.html("<h1>Oops...</h1><p>\"" + (this.model.get('name')) + "\" is blank. Perhaps you meant to add some subtests.</p>");
      this.trigger("rendered");
    } else {
      this.$el.html("<h1>" + (this.model.get('name')) + "</h1> <div id='progress'></div>");
      this.$el.find('#progress').progressbar({
        value: (this.index + 1) / (this.model.subtests.length + 1) * 100
      });
      currentView.on("rendered", (function(_this) {
        return function() {
          return _this.flagRender("subtest");
        };
      })(this));
      currentView.on("subRendered", (function(_this) {
        return function() {
          return _this.trigger("subRendered");
        };
      })(this));
      currentView.on("next", (function(_this) {
        return function() {
          return _this.step(1);
        };
      })(this));
      currentView.on("back", (function(_this) {
        return function() {
          return _this.step(-1);
        };
      })(this));
      currentView.render();
      this.$el.append(currentView.el);
    }
    return this.flagRender("assessment");
  };

  AssessmentRunView.prototype.flagRender = function(object) {
    this.rendered[object] = true;
    if (this.rendered.assessment && this.rendered.subtest) {
      return this.trigger("rendered");
    }
  };

  AssessmentRunView.prototype.afterRender = function() {
    var ref;
    return (ref = this.subtestViews[this.orderMap[this.index]]) != null ? typeof ref.afterRender === "function" ? ref.afterRender() : void 0 : void 0;
  };

  AssessmentRunView.prototype.onClose = function() {
    var j, len, ref, view;
    ref = this.subtestViews;
    for (j = 0, len = ref.length; j < len; j++) {
      view = ref[j];
      view.close();
    }
    this.result.clear();
    return Tangerine.nav.setStudent("");
  };

  AssessmentRunView.prototype.abort = function() {
    this.abortAssessment = true;
    return this.step(1);
  };

  AssessmentRunView.prototype.skip = function() {
    var currentView;
    currentView = this.subtestViews[this.orderMap[this.index]];
    return this.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype")
    }, {
      success: (function(_this) {
        return function() {
          return _this.reset(1);
        };
      })(this)
    });
  };

  AssessmentRunView.prototype.step = function(increment) {
    var currentView;
    if (this.abortAssessment) {
      currentView = this.subtestViews[this.orderMap[this.index]];
      this.saveResult(currentView);
      return;
    }
    currentView = this.subtestViews[this.orderMap[this.index]];
    if (currentView.isValid()) {
      return this.saveResult(currentView, increment);
    } else {
      return currentView.showErrors();
    }
  };

  AssessmentRunView.prototype.reset = function(increment) {
    var currentView;
    this.rendered.subtest = false;
    this.rendered.assessment = false;
    currentView = this.subtestViews[this.orderMap[this.index]];
    currentView.close();
    this.index = this.abortAssessment === true ? this.subtestViews.length - 1 : this.index + increment;
    this.render();
    return window.scrollTo(0, 0);
  };

  AssessmentRunView.prototype.saveResult = function(currentView, increment) {
    var i, j, len, prototype, ref, result, subtestId, subtestReplace, subtestResult;
    subtestResult = currentView.getResult();
    subtestId = currentView.model.id;
    prototype = currentView.model.get("prototype");
    subtestReplace = null;
    ref = this.result.get('subtestData');
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      result = ref[i];
      if (subtestId === result.subtestId) {
        subtestReplace = i;
      }
    }
    if (subtestReplace !== null) {
      if (prototype !== 'gps') {
        this.result.insert({
          name: currentView.model.get("name"),
          data: subtestResult.body,
          subtestHash: subtestResult.meta.hash,
          subtestId: currentView.model.id,
          prototype: currentView.model.get("prototype"),
          sum: currentView.getSum()
        });
      }
      return this.reset(increment);
    } else {
      return this.result.add({
        name: currentView.model.get("name"),
        data: subtestResult.body,
        subtestHash: subtestResult.meta.hash,
        subtestId: currentView.model.id,
        prototype: currentView.model.get("prototype"),
        sum: currentView.getSum()
      }, {
        success: (function(_this) {
          return function() {
            return _this.reset(increment);
          };
        })(this)
      });
    }
  };

  return AssessmentRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50UnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxpQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzhCQUVKLFNBQUEsR0FBWTs7OEJBRVosVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtJQUNuQixJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFDakIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtJQUVyQixTQUFTLENBQUMsUUFBVixHQUFxQjtJQUVyQixJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1YsWUFBQSxFQUFlLEtBREw7TUFFVixTQUFBLEVBQVksS0FGRjs7SUFLWixTQUFTLENBQUMsUUFBVixHQUFxQjtJQUNyQixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUNoQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7ZUFDbkIsS0FBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQXVCLElBQUEsY0FBQSxDQUNyQjtVQUFBLEtBQUEsRUFBUyxLQUFUO1VBQ0EsTUFBQSxFQUFTLEtBRFQ7U0FEcUIsQ0FBdkI7TUFEbUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO0lBS0EsWUFBQSxHQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxJQUEyQixDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFDLENBQUMsT0FBRixDQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgs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Um9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXNzZXNzbWVudFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJBc3Nlc3NtZW50UnVuVmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAYWJvcnRBc3Nlc3NtZW50ID0gZmFsc2VcbiAgICBAaW5kZXggPSAwXG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBvcmRlck1hcCA9IFtdXG4gICAgQGVuYWJsZUNvcnJlY3Rpb25zID0gZmFsc2UgICMgdG9nZ2xlZCBpZiB1c2VyIGhpdHMgdGhlIGJhY2sgYnV0dG9uLlxuXG4gICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0ge31cblxuICAgIEByZW5kZXJlZCA9IHtcbiAgICAgIFwiYXNzZXNzbWVudFwiIDogZmFsc2VcbiAgICAgIFwic3VidGVzdFwiIDogZmFsc2VcbiAgICB9XG5cbiAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcImFzc2Vzc21lbnQgcnVuXCJcbiAgICBAc3VidGVzdFZpZXdzID0gW11cbiAgICBAbW9kZWwuc3VidGVzdHMuc29ydCgpXG4gICAgQG1vZGVsLnN1YnRlc3RzLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgQHN1YnRlc3RWaWV3cy5wdXNoIG5ldyBTdWJ0ZXN0UnVuVmlld1xuICAgICAgICBtb2RlbCAgOiBtb2RlbFxuICAgICAgICBwYXJlbnQgOiBAXG5cbiAgICBoYXNTZXF1ZW5jZXMgPSBAbW9kZWwuaGFzKFwic2VxdWVuY2VzXCIpICYmIG5vdCBfLmlzRW1wdHkoXy5jb21wYWN0KF8uZmxhdHRlbihAbW9kZWwuZ2V0KFwic2VxdWVuY2VzXCIpKSkpXG5cbiAgICBpZiBoYXNTZXF1ZW5jZXNcbiAgICAgIHNlcXVlbmNlcyA9IEBtb2RlbC5nZXQoXCJzZXF1ZW5jZXNcIilcblxuICAgICAgIyBnZXQgb3IgaW5pdGlhbGl6ZSBzZXF1ZW5jZSBwbGFjZXNcbiAgICAgIHBsYWNlcyA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJzZXF1ZW5jZVBsYWNlc1wiKVxuICAgICAgcGxhY2VzID0ge30gdW5sZXNzIHBsYWNlcz9cbiAgICAgIHBsYWNlc1tAbW9kZWwuaWRdID0gMCB1bmxlc3MgcGxhY2VzW0Btb2RlbC5pZF0/XG5cbiAgICAgIGlmIHBsYWNlc1tAbW9kZWwuaWRdIDwgc2VxdWVuY2VzLmxlbmd0aCAtIDFcbiAgICAgICAgcGxhY2VzW0Btb2RlbC5pZF0rK1xuICAgICAgZWxzZVxuICAgICAgICBwbGFjZXNbQG1vZGVsLmlkXSA9IDBcblxuICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnNhdmUoXCJzZXF1ZW5jZVBsYWNlc1wiLCBwbGFjZXMpXG5cbiAgICAgIEBvcmRlck1hcCA9IHNlcXVlbmNlc1twbGFjZXNbQG1vZGVsLmlkXV1cbiAgICAgIEBvcmRlck1hcFtAb3JkZXJNYXAubGVuZ3RoXSA9IEBzdWJ0ZXN0Vmlld3MubGVuZ3RoXG4gICAgZWxzZVxuICAgICAgZm9yIGkgaW4gWzAuLkBzdWJ0ZXN0Vmlld3MubGVuZ3RoXVxuICAgICAgICBAb3JkZXJNYXBbaV0gPSBpXG5cbiAgICBAcmVzdWx0ID0gbmV3IFJlc3VsdFxuICAgICAgYXNzZXNzbWVudElkICAgOiBAbW9kZWwuaWRcbiAgICAgIGFzc2Vzc21lbnROYW1lIDogQG1vZGVsLmdldCBcIm5hbWVcIlxuICAgICAgYmxhbmsgICAgICAgICAgOiB0cnVlXG5cbiAgICBpZiBoYXNTZXF1ZW5jZXMgdGhlbiBAcmVzdWx0LnNldChcIm9yZGVyX21hcFwiIDogQG9yZGVyTWFwKVxuXG4gICAgcmVzdWx0VmlldyA9IG5ldyBSZXN1bHRWaWV3XG4gICAgICBtb2RlbCAgICAgICAgICA6IEByZXN1bHRcbiAgICAgIGFzc2Vzc21lbnQgICAgIDogQG1vZGVsXG4gICAgICBhc3Nlc3NtZW50VmlldyA6IEBcbiAgICBAc3VidGVzdFZpZXdzLnB1c2ggcmVzdWx0Vmlld1xuXG4gIHJlbmRlcjogLT5cbiAgICBjdXJyZW50VmlldyA9IEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dXG5cbiAgICBpZiBAbW9kZWwuc3VidGVzdHMubGVuZ3RoID09IDBcbiAgICAgIEAkZWwuaHRtbCBcIjxoMT5Pb3BzLi4uPC9oMT48cD5cXFwiI3tAbW9kZWwuZ2V0ICduYW1lJ31cXFwiIGlzIGJsYW5rLiBQZXJoYXBzIHlvdSBtZWFudCB0byBhZGQgc29tZSBzdWJ0ZXN0cy48L3A+XCJcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIGVsc2VcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8aDE+I3tAbW9kZWwuZ2V0ICduYW1lJ308L2gxPlxuICAgICAgICA8ZGl2IGlkPSdwcm9ncmVzcyc+PC9kaXY+XG4gICAgICBcIlxuICAgICAgQCRlbC5maW5kKCcjcHJvZ3Jlc3MnKS5wcm9ncmVzc2JhciB2YWx1ZSA6ICggKCBAaW5kZXggKyAxICkgLyAoIEBtb2RlbC5zdWJ0ZXN0cy5sZW5ndGggKyAxICkgKiAxMDAgKVxuXG4gICAgICBjdXJyZW50Vmlldy5vbiBcInJlbmRlcmVkXCIsICAgID0+IEBmbGFnUmVuZGVyIFwic3VidGVzdFwiXG4gICAgICBjdXJyZW50Vmlldy5vbiBcInN1YlJlbmRlcmVkXCIsID0+IEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4gICAgICBjdXJyZW50Vmlldy5vbiBcIm5leHRcIiwgICAgPT4gQHN0ZXAgMVxuICAgICAgY3VycmVudFZpZXcub24gXCJiYWNrXCIsICAgID0+IEBzdGVwIC0xXG5cbiAgICAgIGN1cnJlbnRWaWV3LnJlbmRlcigpXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5lbFxuXG4gICAgQGZsYWdSZW5kZXIgXCJhc3Nlc3NtZW50XCJcblxuICBmbGFnUmVuZGVyOiAob2JqZWN0KSAtPlxuICAgIEByZW5kZXJlZFtvYmplY3RdID0gdHJ1ZVxuXG4gICAgaWYgQHJlbmRlcmVkLmFzc2Vzc21lbnQgJiYgQHJlbmRlcmVkLnN1YnRlc3RcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIEBzdWJ0ZXN0Vmlld3NbQG9yZGVyTWFwW0BpbmRleF1dPy5hZnRlclJlbmRlcj8oKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHN1YnRlc3RWaWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHJlc3VsdC5jbGVhcigpXG4gICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IFwiXCJcblxuICBhYm9ydDogLT5cbiAgICBAYWJvcnRBc3Nlc3NtZW50ID0gdHJ1ZVxuICAgIEBzdGVwIDFcblxuICBza2lwOiA9PlxuICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICBAcmVzdWx0LmFkZFxuICAgICAgbmFtZSAgICAgIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwibmFtZVwiXG4gICAgICBkYXRhICAgICAgOiBjdXJyZW50Vmlldy5nZXRTa2lwcGVkKClcbiAgICAgIHN1YnRlc3RJZCA6IGN1cnJlbnRWaWV3Lm1vZGVsLmlkXG4gICAgICBza2lwcGVkICAgOiB0cnVlXG4gICAgICBwcm90b3R5cGUgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEByZXNldCAxXG5cbiAgc3RlcDogKGluY3JlbWVudCkgPT5cblxuICAgIGlmIEBhYm9ydEFzc2Vzc21lbnRcbiAgICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICAgIEBzYXZlUmVzdWx0KCBjdXJyZW50VmlldyApXG4gICAgICByZXR1cm5cblxuICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICBpZiBjdXJyZW50Vmlldy5pc1ZhbGlkKClcbiAgICAgIEBzYXZlUmVzdWx0KCBjdXJyZW50VmlldywgaW5jcmVtZW50IClcbiAgICBlbHNlXG4gICAgICBjdXJyZW50Vmlldy5zaG93RXJyb3JzKClcblxuICByZXNldDogKGluY3JlbWVudCkgPT5cbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgIGN1cnJlbnRWaWV3ID0gQHN1YnRlc3RWaWV3c1tAb3JkZXJNYXBbQGluZGV4XV1cbiAgICBjdXJyZW50Vmlldy5jbG9zZSgpXG4gICAgQGluZGV4ID1cbiAgICAgIGlmIEBhYm9ydEFzc2Vzc21lbnQgPT0gdHJ1ZVxuICAgICAgICBAc3VidGVzdFZpZXdzLmxlbmd0aC0xXG4gICAgICBlbHNlXG4gICAgICAgIEBpbmRleCArIGluY3JlbWVudFxuICAgIEByZW5kZXIoKVxuICAgIHdpbmRvdy5zY3JvbGxUbyAwLCAwXG5cbiAgc2F2ZVJlc3VsdDogKCBjdXJyZW50VmlldywgaW5jcmVtZW50ICkgPT5cblxuICAgIHN1YnRlc3RSZXN1bHQgPSBjdXJyZW50Vmlldy5nZXRSZXN1bHQoKVxuICAgIHN1YnRlc3RJZCA9IGN1cnJlbnRWaWV3Lm1vZGVsLmlkXG4gICAgcHJvdG90eXBlID0gY3VycmVudFZpZXcubW9kZWwuZ2V0IFwicHJvdG90eXBlXCJcbiAgICBzdWJ0ZXN0UmVwbGFjZSA9IG51bGxcblxuICAgIGZvciByZXN1bHQsIGkgaW4gQHJlc3VsdC5nZXQoJ3N1YnRlc3REYXRhJylcbiAgICAgIGlmIHN1YnRlc3RJZCA9PSByZXN1bHQuc3VidGVzdElkXG4gICAgICAgIHN1YnRlc3RSZXBsYWNlID0gaVxuXG4gICAgaWYgc3VidGVzdFJlcGxhY2UgIT0gbnVsbFxuICAgICAgIyBEb24ndCB1cGRhdGUgdGhlIGdwcyBzdWJ0ZXN0LlxuICAgICAgaWYgcHJvdG90eXBlICE9ICdncHMnXG4gICAgICAgIEByZXN1bHQuaW5zZXJ0XG4gICAgICAgICAgbmFtZSAgICAgICAgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJuYW1lXCJcbiAgICAgICAgICBkYXRhICAgICAgICA6IHN1YnRlc3RSZXN1bHQuYm9keVxuICAgICAgICAgIHN1YnRlc3RIYXNoIDogc3VidGVzdFJlc3VsdC5tZXRhLmhhc2hcbiAgICAgICAgICBzdWJ0ZXN0SWQgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmlkXG4gICAgICAgICAgcHJvdG90eXBlICAgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJwcm90b3R5cGVcIlxuICAgICAgICAgIHN1bSAgICAgICAgIDogY3VycmVudFZpZXcuZ2V0U3VtKClcbiAgICAgIEByZXNldCBpbmNyZW1lbnRcblxuICAgIGVsc2VcbiAgICAgIEByZXN1bHQuYWRkXG4gICAgICAgIG5hbWUgICAgICAgIDogY3VycmVudFZpZXcubW9kZWwuZ2V0IFwibmFtZVwiXG4gICAgICAgIGRhdGEgICAgICAgIDogc3VidGVzdFJlc3VsdC5ib2R5XG4gICAgICAgIHN1YnRlc3RIYXNoIDogc3VidGVzdFJlc3VsdC5tZXRhLmhhc2hcbiAgICAgICAgc3VidGVzdElkICAgOiBjdXJyZW50Vmlldy5tb2RlbC5pZFxuICAgICAgICBwcm90b3R5cGUgICA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcInByb3RvdHlwZVwiXG4gICAgICAgIHN1bSAgICAgICAgIDogY3VycmVudFZpZXcuZ2V0U3VtKClcbiAgICAgICxcbiAgICAgICAgc3VjY2VzcyA6ID0+XG4gICAgICAgICAgQHJlc2V0IGluY3JlbWVudFxuIl19
