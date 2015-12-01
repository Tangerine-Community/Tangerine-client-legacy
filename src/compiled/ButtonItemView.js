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

  ButtonItemView.prototype.initialize = function(options) {
    var answer;
    this.mode = options.mode;
    this.options = options.options;
    if (this.mode === "single" || this.mode === "open") {
      answer = "";
    } else if (this.mode === "multiple") {
      answer = {};
      this.options.forEach(function(option) {
        return answer[option.value] = "unchecked";
      });
    }
    return this.answer = answer;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYnV0dG9uL0J1dHRvbkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MkJBRUosU0FBQSxHQUFZOzsyQkFDWixRQUFBLEdBQVUsR0FBSSxDQUFBLFFBQUE7OzJCQUVkLE1BQUEsR0FDSyxTQUFTLENBQUMsS0FBYixHQUNFO0lBQUEsb0JBQUEsRUFBdUIsU0FBdkI7R0FERixHQUdFO0lBQUEsZUFBQSxFQUF1QixTQUF2Qjs7OzJCQUVKLFFBQUEsR0FBVSxTQUFBO1dBQUcsSUFBQyxDQUFBO0VBQUo7OzJCQUVWLFFBQUEsR0FBVSxTQUFDLE1BQUQ7QUFFUixRQUFBOztNQUZTLFNBQVM7O0lBRWxCLElBQUEsQ0FBeUIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUF6QjtNQUFBLE1BQUEsR0FBUyxDQUFDLE1BQUQsRUFBVDs7SUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsT0FBakI7SUFFVixRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWEsU0FBQyxLQUFEO2FBQVcsZUFBQSxHQUFnQixLQUFoQixHQUFzQjtJQUFqQyxDQUFiLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsR0FBekQ7SUFFWCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsV0FBckIsQ0FBaUMsVUFBakM7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsUUFBcEIsQ0FBNkIsVUFBN0I7RUFUUTs7MkJBWVYsUUFBQSxHQUFVLFNBQUMsS0FBRDtBQUVSLFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLGlC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QUNmLEtBQUEsR0FBUSxNQUFNLENBQUM7TUFFZixhQUFBLEdBQ0ssSUFBQyxDQUFBLElBQUQsS0FBUyxVQUFULElBQXVCLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQSxDQUFSLEtBQWtCLFNBQTVDLEdBQ0UsVUFERixHQUVRLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBVCxJQUFxQixJQUFDLENBQUEsTUFBRCxLQUFXLEtBQW5DLEdBQ0gsVUFERyxHQUdIO2FBRUosV0FBQSxJQUFlLHFCQUFBLEdBQXNCLFVBQXRCLEdBQWlDLEdBQWpDLEdBQW9DLGFBQXBDLEdBQWtELGdCQUFsRCxHQUFrRSxLQUFsRSxHQUF3RSxJQUF4RSxHQUE0RSxLQUE1RSxHQUFrRjtJQXJCbEYsQ0FBakIsRUFzQkUsSUF0QkY7SUE0QkEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsWUFBZDtJQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsV0FBckI7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFyQ2U7Ozs7R0FuRlUsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL2J1dHRvbi9CdXR0b25JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJ1dHRvbkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5JdGVtVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiQnV0dG9uSXRlbVZpZXdcIlxuICB0ZW1wbGF0ZTogSlNUW1wiQnV0dG9uXCJdLFxuXG4gIGV2ZW50cyA6XG4gICAgaWYgTW9kZXJuaXpyLnRvdWNoXG4gICAgICBcInRvdWNoc3RhcnQgLmJ1dHRvblwiIDogXCJvbkNsaWNrXCJcbiAgICBlbHNlXG4gICAgICBcImNsaWNrIC5idXR0b25cIiAgICAgIDogXCJvbkNsaWNrXCJcblxuICBnZXRWYWx1ZTogLT4gQGFuc3dlclxuXG4gIHNldFZhbHVlOiAodmFsdWVzID0gW10pIC0+XG5cbiAgICB2YWx1ZXMgPSBbdmFsdWVzXSB1bmxlc3MgXyh2YWx1ZXMpLmlzQXJyYXkoKVxuXG4gICAgQGFuc3dlciA9IF8udW5pb24odmFsdWVzLCBAb3B0aW9ucylcblxuICAgIHNlbGVjdG9yID0gQGFuc3dlci5tYXAoICh2YWx1ZSkgLT4gXCJbZGF0YS12YWx1ZT0nI3t2YWx1ZX0nXVwiICkuam9pbignLCcpXG5cbiAgICBAJGVsLmZpbmQoXCIuYnV0dG9uXCIpLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuICAgIEAkZWwuZmluZChzZWxlY3RvcikuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG5cblxuICBvbkNoYW5nZTogKGV2ZW50KSAtPlxuXG4gICAgdmFsdWUgPSBfLm1hcCgkKGV2ZW50LnRhcmdldCkuZmluZChcIm9wdGlvbjpzZWxlY3RlZFwiKSwgKHgpIC0+ICQoeCkuYXR0cignZGF0YS1hbnN3ZXInKSlcbiAgICBAdHJpZ2dlciBcImNoYW5nZVwiLCB2YWx1ZVxuXG4gIGh5YnJpZENsaWNrOiAob3B0cykgLT5cbiAgICBAJGVsLmZpbmQoXCIuYnV0dG9uXCIpLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuXG4gICAgaWYgbm90IG9wdHMuY2hlY2tlZEJlZm9yZVxuICAgICAgb3B0cy4kdGFyZ2V0LmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuICAgICAgQGFuc3dlciA9IFwiXCJcbiAgICBlbHNlXG4gICAgICBAYW5zd2VyID0gb3B0cy52YWx1ZVxuXG4gIHNpbmdsZUNsaWNrOiAob3B0cykgLT5cbiAgICBAJGVsLmZpbmQoXCIuYnV0dG9uXCIpLnJlbW92ZUNsYXNzIFwic2VsZWN0ZWRcIlxuICAgIG9wdHMuJHRhcmdldC5hZGRDbGFzcyBcInNlbGVjdGVkXCJcbiAgICBAYW5zd2VyID0gb3B0cy52YWx1ZVxuXG5cbiAgbXVsdGlwbGVDbGljazogKG9wdHMpIC0+XG5cbiAgICBpZiBvcHRzLmNoZWNrZWRCZWZvcmVcbiAgICAgIG9wdHMuJHRhcmdldC5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcbiAgICBlbHNlXG4gICAgICBvcHRzLiR0YXJnZXQuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG5cbiAgICBAYW5zd2VyW29wdHMudmFsdWVdID1cbiAgICAgIGlmIG9wdHMuY2hlY2tlZEJlZm9yZVxuICAgICAgICBcInVuY2hlY2tlZFwiXG4gICAgICBlbHNlXG4gICAgICAgIFwiY2hlY2tlZFwiXG5cblxuICBvbkNsaWNrIDogKGV2ZW50KSAtPlxuXG4gICAgb3B0aW9ucyA9XG4gICAgICAkdGFyZ2V0ICAgICAgIDogJChldmVudC50YXJnZXQpXG4gICAgICB2YWx1ZSAgICAgICAgIDogJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtdmFsdWUnKVxuICAgICAgY2hlY2tlZEJlZm9yZSA6ICQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcyhcInNlbGVjdGVkXCIpXG5cbiAgICBAW1wiI3tAbW9kZX1DbGlja1wiXShvcHRpb25zKVxuICAgIEB0cmlnZ2VyIFwiY2hhbmdlXCIsIG9wdGlvbnMudmFsdWVcblxuICBpbml0aWFsaXplIDogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZSAgICA9IG9wdGlvbnMubW9kZVxuICAgIEBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG5cbiAgICBpZiBAbW9kZSA9PSBcInNpbmdsZVwiIG9yIEBtb2RlID09IFwib3BlblwiXG4gICAgICBhbnN3ZXIgPSBcIlwiXG4gICAgZWxzZSBpZiBAbW9kZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgIGFuc3dlciA9IHt9XG4gICAgICBAb3B0aW9ucy5mb3JFYWNoIChvcHRpb24pIC0+XG4gICAgICAgIGFuc3dlcltvcHRpb24udmFsdWVdID0gXCJ1bmNoZWNrZWRcIlxuXG4gICAgQGFuc3dlciA9IGFuc3dlclxuXG5cbiAgb25CZWZvcmVSZW5kZXIgOiAtPlxuXG4gICAgaHRtbE9wdGlvbnMgPSBcIlwiXG4jICAgIGh0bWxPcHRpb25zID0gXCJvcHQgLSBcIlxuXG4gICAgQG9wdGlvbnMuZm9yRWFjaCAob3B0aW9uLCBpKSAtPlxuXG4gICAgICBzdHlsZUNsYXNzID1cbiAgICAgICAgaWYgaSA9PSAwXG4gICAgICAgICAgXCJsZWZ0XCJcbiAgICAgICAgZWxzZSBpZiBpID09IEBvcHRpb25zLmxlbmd0aC0xXG4gICAgICAgICAgXCJyaWdodFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG5cbiAgICAgIHZhbHVlID0gb3B0aW9uLnZhbHVlXG4gICAgICBsYWJlbCA9IG9wdGlvbi5sYWJlbFxuXG4gICAgICBzZWxlY3RlZENsYXNzID1cbiAgICAgICAgaWYgQG1vZGUgPT0gXCJtdWx0aXBsZVwiICYmIEBhbnN3ZXJbdmFsdWVdID09IFwiY2hlY2tlZFwiXG4gICAgICAgICAgXCJzZWxlY3RlZFwiXG4gICAgICAgIGVsc2UgaWYgQG1vZGUgPT0gXCJzaW5nbGVcIiAmJiBAYW5zd2VyID09IHZhbHVlXG4gICAgICAgICAgXCJzZWxlY3RlZFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG5cbiAgICAgIGh0bWxPcHRpb25zICs9IFwiPGRpdiBjbGFzcz0nYnV0dG9uICN7c3R5bGVDbGFzc30gI3tzZWxlY3RlZENsYXNzfScgZGF0YS12YWx1ZT0nI3t2YWx1ZX0nPiN7bGFiZWx9PC9kaXY+XCJcbiAgICAsIEBcblxuIyAgICBAJGVsLmh0bWwoXCJcbiMgICAgICAje2h0bWxPcHRpb25zfVxuIyAgICBcIikuYWRkQ2xhc3MoQGNsYXNzTmFtZSkgIyBXaHkgZG8gSSBoYXZlIHRvIGRvIHRoaXM/XG5cbiAgICBAJGVsLmFkZENsYXNzKCdCdXR0b25WaWV3JylcblxuICAgIEBtb2RlbC5zZXQoXCJidXR0b25cIiwgaHRtbE9wdGlvbnMpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
