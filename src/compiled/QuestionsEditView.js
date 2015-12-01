var QuestionsEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QuestionsEditView = (function(superClass) {
  extend(QuestionsEditView, superClass);

  function QuestionsEditView() {
    this.render = bind(this.render, this);
    return QuestionsEditView.__super__.constructor.apply(this, arguments);
  }

  QuestionsEditView.prototype.className = "questions_edit_view";

  QuestionsEditView.prototype.tagName = "ul";

  QuestionsEditView.prototype.initialize = function(options) {
    this.views = [];
    return this.questions = options.questions;
  };

  QuestionsEditView.prototype.onClose = function() {
    return this.closeViews();
  };

  QuestionsEditView.prototype.closeViews = function() {
    var j, len, ref, results, view;
    ref = this.views;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      view = ref[j];
      results.push(view.close());
    }
    return results;
  };

  QuestionsEditView.prototype.render = function() {
    var i, j, len, question, ref, view;
    this.closeViews();
    ref = this.questions.models;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      question = ref[i];
      view = new QuestionsEditListElementView({
        "question": question
      });
      this.views.push(view);
      view.on("deleted", this.render);
      view.on("duplicate", (function(_this) {
        return function() {
          return _this.refetchAndRender();
        };
      })(this));
      view.on("question-edit", (function(_this) {
        return function(questionId) {
          return _this.trigger("question-edit", questionId);
        };
      })(this));
      view.render();
      this.$el.append(view.el);
    }
    return this.$el.sortable({
      forceHelperSize: true,
      forcePlaceholderSize: true,
      handle: '.sortable_handle',
      start: function(event, ui) {
        return ui.item.addClass("drag_shadow");
      },
      stop: function(event, ui) {
        return ui.item.removeClass("drag_shadow");
      },
      update: (function(_this) {
        return function(event, ui) {
          var id, idList, index, k, len1, li, newDoc, newDocs, requestData;
          idList = (function() {
            var k, len1, ref1, results;
            ref1 = this.$el.find("li.question_list_element");
            results = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              li = ref1[k];
              results.push($(li).attr("data-id"));
            }
            return results;
          }).call(_this);
          index = 0;
          newDocs = [];
          for (index = k = 0, len1 = idList.length; k < len1; index = ++k) {
            id = idList[index];
            newDoc = _this.questions.get(id).attributes;
            newDoc['order'] = index;
            newDocs.push(newDoc);
          }
          requestData = {
            "docs": newDocs
          };
          return $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            url: Tangerine.settings.urlBulkDocs(),
            data: JSON.stringify(requestData),
            success: function(responses) {
              return _this.refetchAndRender();
            },
            error: function() {
              return Utils.midAlert("Duplication error");
            }
          });
        };
      })(this)
    });
  };

  QuestionsEditView.prototype.refetchAndRender = function() {
    var anyQuestion;
    anyQuestion = this.questions.models[0];
    return this.questions.fetch({
      viewOptions: {
        key: "question-" + (anyQuestion.get("assessmentId"))
      },
      success: (function(_this) {
        return function() {
          _this.questions = new Questions(_this.questions.where({
            subtestId: anyQuestion.get("subtestId")
          }));
          return _this.render(true);
        };
      })(this)
    });
  };

  return QuestionsEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcXVlc3Rpb24vUXVlc3Rpb25zRWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsaUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs4QkFFSixTQUFBLEdBQVk7OzhCQUNaLE9BQUEsR0FBVTs7OEJBRVYsVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVM7V0FDVCxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztFQUZYOzs4QkFLWixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxVQUFELENBQUE7RUFETzs7OEJBR1QsVUFBQSxHQUFZLFNBQUE7QUFDVixRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOzttQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFBO0FBREY7O0VBRFU7OzhCQUlaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUMsQ0FBQSxVQUFELENBQUE7QUFDQTtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsSUFBQSxHQUFXLElBQUEsNEJBQUEsQ0FDVDtRQUFBLFVBQUEsRUFBYSxRQUFiO09BRFM7TUFFWCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO01BQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLEVBQW1CLElBQUMsQ0FBQSxNQUFwQjtNQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsV0FBUixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ25CLEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsZUFBUixFQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFBZ0IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxlQUFULEVBQTBCLFVBQTFCO1FBQWhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtNQUNBLElBQUksQ0FBQyxNQUFMLENBQUE7TUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxJQUFJLENBQUMsRUFBakI7QUFURjtXQVlBLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUNFO01BQUEsZUFBQSxFQUFpQixJQUFqQjtNQUNBLG9CQUFBLEVBQXNCLElBRHRCO01BRUEsTUFBQSxFQUFTLGtCQUZUO01BR0EsS0FBQSxFQUFPLFNBQUMsS0FBRCxFQUFRLEVBQVI7ZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVIsQ0FBaUIsYUFBakI7TUFBZixDQUhQO01BSUEsSUFBQSxFQUFPLFNBQUMsS0FBRCxFQUFRLEVBQVI7ZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFBZixDQUpQO01BTUEsTUFBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsRUFBUjtBQUNQLGNBQUE7VUFBQSxNQUFBOztBQUFVO0FBQUE7aUJBQUEsd0NBQUE7OzJCQUFBLENBQUEsQ0FBRSxFQUFGLENBQUssQ0FBQyxJQUFOLENBQVcsU0FBWDtBQUFBOzs7VUFDVixLQUFBLEdBQVE7VUFDUixPQUFBLEdBQVU7QUFDVixlQUFBLDBEQUFBOztZQUNFLE1BQUEsR0FBUyxLQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxFQUFmLENBQWtCLENBQUM7WUFDNUIsTUFBTyxDQUFBLE9BQUEsQ0FBUCxHQUFrQjtZQUNsQixPQUFPLENBQUMsSUFBUixDQUFhLE1BQWI7QUFIRjtVQUlBLFdBQUEsR0FBYztZQUFBLE1BQUEsRUFBUyxPQUFUOztpQkFDZCxDQUFDLENBQUMsSUFBRixDQUNFO1lBQUEsSUFBQSxFQUFPLE1BQVA7WUFDQSxXQUFBLEVBQWMsaUNBRGQ7WUFFQSxRQUFBLEVBQVcsTUFGWDtZQUdBLEdBQUEsRUFBTSxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQW5CLENBQUEsQ0FITjtZQUlBLElBQUEsRUFBTyxJQUFJLENBQUMsU0FBTCxDQUFlLFdBQWYsQ0FKUDtZQUtBLE9BQUEsRUFBVSxTQUFDLFNBQUQ7cUJBQWUsS0FBQyxDQUFBLGdCQUFELENBQUE7WUFBZixDQUxWO1lBTUEsS0FBQSxFQUFRLFNBQUE7cUJBQUcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxtQkFBZjtZQUFILENBTlI7V0FERjtRQVRPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5UO0tBREY7RUFmTTs7OEJBd0NSLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsUUFBQTtJQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU8sQ0FBQSxDQUFBO1dBQ2hDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsR0FBQSxFQUFLLFdBQUEsR0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFaLENBQWdCLGNBQWhCLENBQUQsQ0FBaEI7T0FERjtNQUVBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxLQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxLQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUI7WUFBQyxTQUFBLEVBQVksV0FBVyxDQUFDLEdBQVosQ0FBZ0IsV0FBaEIsQ0FBYjtXQUFqQixDQUFWO2lCQUNqQixLQUFDLENBQUEsTUFBRCxDQUFRLElBQVI7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGVDtLQURGO0VBRmdCOzs7O0dBekRZLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3F1ZXN0aW9uL1F1ZXN0aW9uc0VkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUXVlc3Rpb25zRWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJxdWVzdGlvbnNfZWRpdF92aWV3XCJcbiAgdGFnTmFtZSA6IFwidWxcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQHZpZXdzID0gW11cbiAgICBAcXVlc3Rpb25zID0gb3B0aW9ucy5xdWVzdGlvbnNcblxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQGNsb3NlVmlld3MoKVxuXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHZpZXdzXG4gICAgICB2aWV3LmNsb3NlKClcblxuICByZW5kZXI6ID0+XG5cbiAgICBAY2xvc2VWaWV3cygpXG4gICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvbnMubW9kZWxzXG4gICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uc0VkaXRMaXN0RWxlbWVudFZpZXdcbiAgICAgICAgXCJxdWVzdGlvblwiIDogcXVlc3Rpb25cbiAgICAgIEB2aWV3cy5wdXNoIHZpZXdcbiAgICAgIHZpZXcub24gXCJkZWxldGVkXCIsIEByZW5kZXJcbiAgICAgIHZpZXcub24gXCJkdXBsaWNhdGVcIiwgPT5cbiAgICAgICAgQHJlZmV0Y2hBbmRSZW5kZXIoKVxuICAgICAgdmlldy5vbiBcInF1ZXN0aW9uLWVkaXRcIiwgKHF1ZXN0aW9uSWQpID0+IEB0cmlnZ2VyIFwicXVlc3Rpb24tZWRpdFwiLCBxdWVzdGlvbklkXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICBAJGVsLmFwcGVuZCB2aWV3LmVsXG5cbiAgICAjIG1ha2UgaXQgc29ydGFibGVcbiAgICBAJGVsLnNvcnRhYmxlXG4gICAgICBmb3JjZUhlbHBlclNpemU6IHRydWVcbiAgICAgIGZvcmNlUGxhY2Vob2xkZXJTaXplOiB0cnVlXG4gICAgICBoYW5kbGUgOiAnLnNvcnRhYmxlX2hhbmRsZSdcbiAgICAgIHN0YXJ0OiAoZXZlbnQsIHVpKSAtPiB1aS5pdGVtLmFkZENsYXNzIFwiZHJhZ19zaGFkb3dcIlxuICAgICAgc3RvcDogIChldmVudCwgdWkpIC0+IHVpLml0ZW0ucmVtb3ZlQ2xhc3MgXCJkcmFnX3NoYWRvd1wiXG5cbiAgICAgIHVwZGF0ZSA6IChldmVudCwgdWkpID0+XG4gICAgICAgIGlkTGlzdCA9ICgkKGxpKS5hdHRyKFwiZGF0YS1pZFwiKSBmb3IgbGkgaW4gQCRlbC5maW5kKFwibGkucXVlc3Rpb25fbGlzdF9lbGVtZW50XCIpKVxuICAgICAgICBpbmRleCA9IDBcbiAgICAgICAgbmV3RG9jcyA9IFtdXG4gICAgICAgIGZvciBpZCwgaW5kZXggaW4gaWRMaXN0XG4gICAgICAgICAgbmV3RG9jID0gQHF1ZXN0aW9ucy5nZXQoaWQpLmF0dHJpYnV0ZXNcbiAgICAgICAgICBuZXdEb2NbJ29yZGVyJ10gPSBpbmRleFxuICAgICAgICAgIG5ld0RvY3MucHVzaCBuZXdEb2NcbiAgICAgICAgcmVxdWVzdERhdGEgPSBcImRvY3NcIiA6IG5ld0RvY3NcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdHlwZSA6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGUgOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIlxuICAgICAgICAgIGRhdGFUeXBlIDogXCJqc29uXCJcbiAgICAgICAgICB1cmwgOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsQnVsa0RvY3MoKVxuICAgICAgICAgIGRhdGEgOiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSlcbiAgICAgICAgICBzdWNjZXNzIDogKHJlc3BvbnNlcykgPT4gQHJlZmV0Y2hBbmRSZW5kZXIoKVxuICAgICAgICAgIGVycm9yIDogLT4gVXRpbHMubWlkQWxlcnQgXCJEdXBsaWNhdGlvbiBlcnJvclwiXG5cbiAgcmVmZXRjaEFuZFJlbmRlcjogLT5cbiAgICBhbnlRdWVzdGlvbiA9IEBxdWVzdGlvbnMubW9kZWxzWzBdXG4gICAgQHF1ZXN0aW9ucy5mZXRjaCBcbiAgICAgIHZpZXdPcHRpb25zOlxuICAgICAgICBrZXk6IFwicXVlc3Rpb24tI3thbnlRdWVzdGlvbi5nZXQoXCJhc3Nlc3NtZW50SWRcIil9XCJcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zKEBxdWVzdGlvbnMud2hlcmUge3N1YnRlc3RJZCA6IGFueVF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKSB9KVxuICAgICAgICBAcmVuZGVyIHRydWVcblxuIl19
