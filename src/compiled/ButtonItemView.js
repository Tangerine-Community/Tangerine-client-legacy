var ButtonItemView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ButtonItemView = (function(superClass) {
  extend(ButtonItemView, superClass);

  function ButtonItemView() {
    return ButtonItemView.__super__.constructor.apply(this, arguments);
  }

  ButtonItemView.prototype.className = "ButtonItemView";

  ButtonItemView.prototype.template = JST["Button"];

  ButtonItemView.prototype.events = Modernizr.touch ? {
    "touchstart .button": "onClick"
  } : {
    "click .button": "onClick"
  };

  ButtonItemView.prototype.initialize = function(options) {
    var answer, i, previous;
    this.mode = options.mode;
    this.options = options.options;
    previous = options.answer;
    if (this.mode === "single" || this.mode === "open") {
      if (previous == null) {
        answer = "";
      } else {
        answer = previous;
      }
    } else if (this.mode === "multiple") {
      answer = {};
      i = 0;
      this.options.forEach(function(option) {
        if (previous == null) {
          return answer[option.value] = "unchecked";
        } else {
          return answer[option.value] = previous[option.value];
        }
      });
      i++;
    }
    return this.answer = answer;
  };

  ButtonItemView.prototype.getValue = function() {
    return this.answer;
  };

  ButtonItemView.prototype.setValue = function(values) {
    var selector;
    if (values == null) {
      values = [];
    }
    if (!_(values).isArray()) {
      values = [values];
    }
    this.answer = _.union(values, this.options);
    selector = this.answer.map(function(value) {
      return "[data-value='" + value + "']";
    }).join(',');
    this.$el.find(".button").removeClass("selected");
    return this.$el.find(selector).addClass("selected");
  };

  ButtonItemView.prototype.onChange = function(event) {
    var value;
    value = _.map($(event.target).find("option:selected"), function(x) {
      return $(x).attr('data-answer');
    });
    return this.trigger("change", value);
  };

  ButtonItemView.prototype.hybridClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    if (!opts.checkedBefore) {
      opts.$target.addClass("selected");
      return this.answer = "";
    } else {
      return this.answer = opts.value;
    }
  };

  ButtonItemView.prototype.singleClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    opts.$target.addClass("selected");
    return this.answer = opts.value;
  };

  ButtonItemView.prototype.multipleClick = function(opts) {
    if (opts.checkedBefore) {
      opts.$target.removeClass("selected");
    } else {
      opts.$target.addClass("selected");
    }
    return this.answer[opts.value] = opts.checkedBefore ? "unchecked" : "checked";
  };

  ButtonItemView.prototype.onClick = function(event) {
    var options;
    options = {
      $target: $(event.target),
      value: $(event.target).attr('data-value'),
      checkedBefore: $(event.target).hasClass("selected")
    };
    this[this.mode + "Click"](options);
    return this.trigger("change", options.value);
  };

  ButtonItemView.prototype.onBeforeRender = function() {
    var htmlOptions;
    htmlOptions = "";
    this.options.forEach(function(option, i) {
      var label, selectedClass, styleClass, value;
      styleClass = i === 0 ? "left" : i === this.options.length - 1 ? "right" : "";
      value = option.value;
      label = option.label;
      selectedClass = this.mode === "multiple" && this.answer[value] === "checked" ? "selected" : this.mode === "single" && this.answer === value ? "selected" : "";
      return htmlOptions += "<div class='button " + styleClass + " " + selectedClass + "' data-value='" + value + "'>" + label + "</div>";
    }, this);
    this.$el.addClass('ButtonView');
    this.model.set("button", htmlOptions);
    return this.trigger("rendered");
  };

  return ButtonItemView;

})(Backbone.Marionette.ItemView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYnV0dG9uL0J1dHRvbkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MkJBRUosU0FBQSxHQUFZOzsyQkFDWixRQUFBLEdBQVUsR0FBSSxDQUFBLFFBQUE7OzJCQUVkLE1BQUEsR0FDSyxTQUFTLENBQUMsS0FBYixHQUNFO0lBQUEsb0JBQUEsRUFBdUIsU0FBdkI7R0FERixHQUdFO0lBQUEsZUFBQSxFQUF1QixTQUF2Qjs7OzJCQUdKLFVBQUEsR0FBYSxTQUFFLE9BQUY7QUFDWCxRQUFBO0lBQUEsSUFBQyxDQUFBLElBQUQsR0FBVyxPQUFPLENBQUM7SUFDbkIsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUM7SUFFbkIsUUFBQSxHQUFXLE9BQU8sQ0FBQztJQUVuQixJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBVCxJQUFxQixJQUFDLENBQUEsSUFBRCxLQUFTLE1BQWpDO01BQ0UsSUFBSSxnQkFBSjtRQUNFLE1BQUEsR0FBUyxHQURYO09BQUEsTUFBQTtRQUdFLE1BQUEsR0FBUyxTQUhYO09BREY7S0FBQSxNQUtLLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxVQUFaO01BQ0gsTUFBQSxHQUFTO01BQ1QsQ0FBQSxHQUFFO01BQ0YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLFNBQUMsTUFBRDtRQUNmLElBQUksZ0JBQUo7aUJBQ0UsTUFBTyxDQUFBLE1BQU0sQ0FBQyxLQUFQLENBQVAsR0FBdUIsWUFEekI7U0FBQSxNQUFBO2lCQUdFLE1BQU8sQ0FBQSxNQUFNLENBQUMsS0FBUCxDQUFQLEdBQXVCLFFBQVMsQ0FBQSxNQUFNLENBQUMsS0FBUCxFQUhsQzs7TUFEZSxDQUFqQjtNQUtBLENBQUEsR0FSRzs7V0FVTCxJQUFDLENBQUEsTUFBRCxHQUFVO0VBckJDOzsyQkF1QmIsUUFBQSxHQUFVLFNBQUE7V0FBRyxJQUFDLENBQUE7RUFBSjs7MkJBRVYsUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUVSLFFBQUE7O01BRlMsU0FBUzs7SUFFbEIsSUFBQSxDQUF5QixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUFBLENBQXpCO01BQUEsTUFBQSxHQUFTLENBQUMsTUFBRCxFQUFUOztJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxNQUFSLEVBQWdCLElBQUMsQ0FBQSxPQUFqQjtJQUVWLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBYSxTQUFDLEtBQUQ7YUFBVyxlQUFBLEdBQWdCLEtBQWhCLEdBQXNCO0lBQWpDLENBQWIsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxHQUF6RDtJQUVYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxXQUFyQixDQUFpQyxVQUFqQztXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBQyxRQUFwQixDQUE2QixVQUE3QjtFQVRROzsyQkFZVixRQUFBLEdBQVUsU0FBQyxLQUFEO0FBRVIsUUFBQTtJQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FBRixDQUFNLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsaUJBQXJCLENBQU4sRUFBK0MsU0FBQyxDQUFEO2FBQU8sQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxhQUFWO0lBQVAsQ0FBL0M7V0FDUixJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsS0FBbkI7RUFIUTs7MkJBS1YsV0FBQSxHQUFhLFNBQUMsSUFBRDtJQUNYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxXQUFyQixDQUFpQyxVQUFqQztJQUVBLElBQUcsQ0FBSSxJQUFJLENBQUMsYUFBWjtNQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixVQUF0QjthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsR0FGWjtLQUFBLE1BQUE7YUFJRSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxNQUpqQjs7RUFIVzs7MkJBU2IsV0FBQSxHQUFhLFNBQUMsSUFBRDtJQUNYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxXQUFyQixDQUFpQyxVQUFqQztJQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixVQUF0QjtXQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDO0VBSEo7OzJCQU1iLGFBQUEsR0FBZSxTQUFDLElBQUQ7SUFFYixJQUFHLElBQUksQ0FBQyxhQUFSO01BQ0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFiLENBQXlCLFVBQXpCLEVBREY7S0FBQSxNQUFBO01BR0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLFVBQXRCLEVBSEY7O1dBS0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFJLENBQUMsS0FBTCxDQUFSLEdBQ0ssSUFBSSxDQUFDLGFBQVIsR0FDRSxXQURGLEdBR0U7RUFYUzs7MkJBY2YsT0FBQSxHQUFVLFNBQUMsS0FBRDtBQUVSLFFBQUE7SUFBQSxPQUFBLEdBQ0U7TUFBQSxPQUFBLEVBQWdCLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFoQjtNQUNBLEtBQUEsRUFBZ0IsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixZQUFyQixDQURoQjtNQUVBLGFBQUEsRUFBZ0IsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxRQUFoQixDQUF5QixVQUF6QixDQUZoQjs7SUFJRixJQUFFLENBQUcsSUFBQyxDQUFBLElBQUYsR0FBTyxPQUFULENBQUYsQ0FBbUIsT0FBbkI7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFBbUIsT0FBTyxDQUFDLEtBQTNCO0VBUlE7OzJCQVlWLGNBQUEsR0FBaUIsU0FBQTtBQUVmLFFBQUE7SUFBQSxXQUFBLEdBQWM7SUFHZCxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxNQUFELEVBQVMsQ0FBVDtBQUVmLFVBQUE7TUFBQSxVQUFBLEdBQ0ssQ0FBQSxLQUFLLENBQVIsR0FDRSxNQURGLEdBRVEsQ0FBQSxLQUFLLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFnQixDQUF4QixHQUNILE9BREcsR0FHSDtNQUVKLEtBQUEsR0FBUSxNQUFNLENBQUM7TUFDZixLQUFBLEdBQVEsTUFBTSxDQUFDO01BRWYsYUFBQSxHQUNLLElBQUMsQ0FBQSxJQUFELEtBQVMsVUFBVCxJQUF1QixJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixLQUFrQixTQUE1QyxHQUNFLFVBREYsR0FFUSxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVQsSUFBcUIsSUFBQyxDQUFBLE1BQUQsS0FBVyxLQUFuQyxHQUNILFVBREcsR0FHSDthQUVKLFdBQUEsSUFBZSxxQkFBQSxHQUFzQixVQUF0QixHQUFpQyxHQUFqQyxHQUFvQyxhQUFwQyxHQUFrRCxnQkFBbEQsR0FBa0UsS0FBbEUsR0FBd0UsSUFBeEUsR0FBNEUsS0FBNUUsR0FBa0Y7SUFyQmxGLENBQWpCLEVBc0JFLElBdEJGO0lBNEJBLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFlBQWQ7SUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLFdBQXJCO1dBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBckNlOzs7O0dBL0ZVLFFBQVEsQ0FBQyxVQUFVLENBQUMiLCJmaWxlIjoibW9kdWxlcy9idXR0b24vQnV0dG9uSXRlbVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBCdXR0b25JdGVtVmlldyBleHRlbmRzIEJhY2tib25lLk1hcmlvbmV0dGUuSXRlbVZpZXdcblxuICBjbGFzc05hbWUgOiBcIkJ1dHRvbkl0ZW1WaWV3XCJcbiAgdGVtcGxhdGU6IEpTVFtcIkJ1dHRvblwiXSxcblxuICBldmVudHMgOlxuICAgIGlmIE1vZGVybml6ci50b3VjaFxuICAgICAgXCJ0b3VjaHN0YXJ0IC5idXR0b25cIiA6IFwib25DbGlja1wiXG4gICAgZWxzZVxuICAgICAgXCJjbGljayAuYnV0dG9uXCIgICAgICA6IFwib25DbGlja1wiXG5cblxuICBpbml0aWFsaXplIDogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZSAgICA9IG9wdGlvbnMubW9kZVxuICAgIEBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG5cbiAgICBwcmV2aW91cyA9IG9wdGlvbnMuYW5zd2VyXG5cbiAgICBpZiBAbW9kZSA9PSBcInNpbmdsZVwiIG9yIEBtb2RlID09IFwib3BlblwiXG4gICAgICBpZiAhcHJldmlvdXM/XG4gICAgICAgIGFuc3dlciA9IFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgYW5zd2VyID0gcHJldmlvdXNcbiAgICBlbHNlIGlmIEBtb2RlID09IFwibXVsdGlwbGVcIlxuICAgICAgYW5zd2VyID0ge31cbiAgICAgIGk9MFxuICAgICAgQG9wdGlvbnMuZm9yRWFjaCAob3B0aW9uKSAtPlxuICAgICAgICBpZiAhcHJldmlvdXM/XG4gICAgICAgICAgYW5zd2VyW29wdGlvbi52YWx1ZV0gPSBcInVuY2hlY2tlZFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhbnN3ZXJbb3B0aW9uLnZhbHVlXSA9IHByZXZpb3VzW29wdGlvbi52YWx1ZV1cbiAgICAgIGkrK1xuXG4gICAgQGFuc3dlciA9IGFuc3dlclxuXG4gIGdldFZhbHVlOiAtPiBAYW5zd2VyXG5cbiAgc2V0VmFsdWU6ICh2YWx1ZXMgPSBbXSkgLT5cblxuICAgIHZhbHVlcyA9IFt2YWx1ZXNdIHVubGVzcyBfKHZhbHVlcykuaXNBcnJheSgpXG5cbiAgICBAYW5zd2VyID0gXy51bmlvbih2YWx1ZXMsIEBvcHRpb25zKVxuXG4gICAgc2VsZWN0b3IgPSBAYW5zd2VyLm1hcCggKHZhbHVlKSAtPiBcIltkYXRhLXZhbHVlPScje3ZhbHVlfSddXCIgKS5qb2luKCcsJylcblxuICAgIEAkZWwuZmluZChcIi5idXR0b25cIikucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgQCRlbC5maW5kKHNlbGVjdG9yKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblxuXG4gIG9uQ2hhbmdlOiAoZXZlbnQpIC0+XG5cbiAgICB2YWx1ZSA9IF8ubWFwKCQoZXZlbnQudGFyZ2V0KS5maW5kKFwib3B0aW9uOnNlbGVjdGVkXCIpLCAoeCkgLT4gJCh4KS5hdHRyKCdkYXRhLWFuc3dlcicpKVxuICAgIEB0cmlnZ2VyIFwiY2hhbmdlXCIsIHZhbHVlXG5cbiAgaHlicmlkQ2xpY2s6IChvcHRzKSAtPlxuICAgIEAkZWwuZmluZChcIi5idXR0b25cIikucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG5cbiAgICBpZiBub3Qgb3B0cy5jaGVja2VkQmVmb3JlXG4gICAgICBvcHRzLiR0YXJnZXQuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgICBAYW5zd2VyID0gXCJcIlxuICAgIGVsc2VcbiAgICAgIEBhbnN3ZXIgPSBvcHRzLnZhbHVlXG5cbiAgc2luZ2xlQ2xpY2s6IChvcHRzKSAtPlxuICAgIEAkZWwuZmluZChcIi5idXR0b25cIikucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgb3B0cy4kdGFyZ2V0LmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuICAgIEBhbnN3ZXIgPSBvcHRzLnZhbHVlXG5cblxuICBtdWx0aXBsZUNsaWNrOiAob3B0cykgLT5cblxuICAgIGlmIG9wdHMuY2hlY2tlZEJlZm9yZVxuICAgICAgb3B0cy4kdGFyZ2V0LnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuICAgIGVsc2VcbiAgICAgIG9wdHMuJHRhcmdldC5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblxuICAgIEBhbnN3ZXJbb3B0cy52YWx1ZV0gPVxuICAgICAgaWYgb3B0cy5jaGVja2VkQmVmb3JlXG4gICAgICAgIFwidW5jaGVja2VkXCJcbiAgICAgIGVsc2VcbiAgICAgICAgXCJjaGVja2VkXCJcblxuXG4gIG9uQ2xpY2sgOiAoZXZlbnQpIC0+XG5cbiAgICBvcHRpb25zID1cbiAgICAgICR0YXJnZXQgICAgICAgOiAkKGV2ZW50LnRhcmdldClcbiAgICAgIHZhbHVlICAgICAgICAgOiAkKGV2ZW50LnRhcmdldCkuYXR0cignZGF0YS12YWx1ZScpXG4gICAgICBjaGVja2VkQmVmb3JlIDogJChldmVudC50YXJnZXQpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIilcblxuICAgIEBbXCIje0Btb2RlfUNsaWNrXCJdKG9wdGlvbnMpXG4gICAgQHRyaWdnZXIgXCJjaGFuZ2VcIiwgb3B0aW9ucy52YWx1ZVxuXG5cblxuICBvbkJlZm9yZVJlbmRlciA6IC0+XG5cbiAgICBodG1sT3B0aW9ucyA9IFwiXCJcbiMgICAgaHRtbE9wdGlvbnMgPSBcIm9wdCAtIFwiXG5cbiAgICBAb3B0aW9ucy5mb3JFYWNoIChvcHRpb24sIGkpIC0+XG5cbiAgICAgIHN0eWxlQ2xhc3MgPVxuICAgICAgICBpZiBpID09IDBcbiAgICAgICAgICBcImxlZnRcIlxuICAgICAgICBlbHNlIGlmIGkgPT0gQG9wdGlvbnMubGVuZ3RoLTFcbiAgICAgICAgICBcInJpZ2h0XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcblxuICAgICAgdmFsdWUgPSBvcHRpb24udmFsdWVcbiAgICAgIGxhYmVsID0gb3B0aW9uLmxhYmVsXG5cbiAgICAgIHNlbGVjdGVkQ2xhc3MgPVxuICAgICAgICBpZiBAbW9kZSA9PSBcIm11bHRpcGxlXCIgJiYgQGFuc3dlclt2YWx1ZV0gPT0gXCJjaGVja2VkXCJcbiAgICAgICAgICBcInNlbGVjdGVkXCJcbiAgICAgICAgZWxzZSBpZiBAbW9kZSA9PSBcInNpbmdsZVwiICYmIEBhbnN3ZXIgPT0gdmFsdWVcbiAgICAgICAgICBcInNlbGVjdGVkXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcblxuICAgICAgaHRtbE9wdGlvbnMgKz0gXCI8ZGl2IGNsYXNzPSdidXR0b24gI3tzdHlsZUNsYXNzfSAje3NlbGVjdGVkQ2xhc3N9JyBkYXRhLXZhbHVlPScje3ZhbHVlfSc+I3tsYWJlbH08L2Rpdj5cIlxuICAgICwgQFxuXG4jICAgIEAkZWwuaHRtbChcIlxuIyAgICAgICN7aHRtbE9wdGlvbnN9XG4jICAgIFwiKS5hZGRDbGFzcyhAY2xhc3NOYW1lKSAjIFdoeSBkbyBJIGhhdmUgdG8gZG8gdGhpcz9cblxuICAgIEAkZWwuYWRkQ2xhc3MoJ0J1dHRvblZpZXcnKVxuXG4gICAgQG1vZGVsLnNldChcImJ1dHRvblwiLCBodG1sT3B0aW9ucylcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
