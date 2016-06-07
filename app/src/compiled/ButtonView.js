var ButtonView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ButtonView = (function(superClass) {
  extend(ButtonView, superClass);

  function ButtonView() {
    return ButtonView.__super__.constructor.apply(this, arguments);
  }

  ButtonView.prototype.className = "ButtonView";

  ButtonView.prototype.events = Modernizr.touch ? {
    "touchstart .button": "onClick"
  } : {
    "click .button": "onClick"
  };

  ButtonView.prototype.getValue = function() {
    return this.answer;
  };

  ButtonView.prototype.setValue = function(values) {
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

  ButtonView.prototype.onChange = function(event) {
    var value;
    value = _.map($(event.target).find("option:selected"), function(x) {
      return $(x).attr('data-answer');
    });
    return this.trigger("change", this.el);
  };

  ButtonView.prototype.hybridClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    if (!opts.checkedBefore) {
      opts.$target.addClass("selected");
      return this.answer = "";
    } else {
      return this.answer = opts.value;
    }
  };

  ButtonView.prototype.singleClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    opts.$target.addClass("selected");
    return this.answer = opts.value;
  };

  ButtonView.prototype.multipleClick = function(opts) {
    if (opts.checkedBefore) {
      opts.$target.removeClass("selected");
    } else {
      opts.$target.addClass("selected");
    }
    return this.answer[opts.value] = opts.checkedBefore ? "unchecked" : "checked";
  };

  ButtonView.prototype.onClick = function(event) {
    var options;
    options = {
      $target: $(event.target),
      value: $(event.target).attr('data-value'),
      checkedBefore: $(event.target).hasClass("selected")
    };
    this[this.mode + "Click"](options);
    return this.trigger("change", this.el);
  };

  ButtonView.prototype.initialize = function(options) {
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

  ButtonView.prototype.render = function() {
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
    this.$el.html("" + htmlOptions).addClass(this.className);
    return this.trigger("rendered");
  };

  return ButtonView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYnV0dG9uL0J1dHRvblZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsVUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt1QkFFSixTQUFBLEdBQVk7O3VCQUVaLE1BQUEsR0FDSyxTQUFTLENBQUMsS0FBYixHQUNFO0lBQUEsb0JBQUEsRUFBdUIsU0FBdkI7R0FERixHQUdFO0lBQUEsZUFBQSxFQUF1QixTQUF2Qjs7O3VCQUVKLFFBQUEsR0FBVSxTQUFBO1dBQUcsSUFBQyxDQUFBO0VBQUo7O3VCQUVWLFFBQUEsR0FBVSxTQUFDLE1BQUQ7QUFFUixRQUFBOztNQUZTLFNBQVM7O0lBRWxCLElBQUEsQ0FBeUIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUF6QjtNQUFBLE1BQUEsR0FBUyxDQUFDLE1BQUQsRUFBVDs7SUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsTUFBUixFQUFnQixJQUFDLENBQUEsT0FBakI7SUFFVixRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWEsU0FBQyxLQUFEO2FBQVcsZUFBQSxHQUFnQixLQUFoQixHQUFzQjtJQUFqQyxDQUFiLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsR0FBekQ7SUFFWCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsV0FBckIsQ0FBaUMsVUFBakM7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsUUFBcEIsQ0FBNkIsVUFBN0I7RUFUUTs7dUJBWVYsUUFBQSxHQUFVLFNBQUMsS0FBRDtBQUVSLFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLGlCQUFyQixDQUFOLEVBQStDLFNBQUMsQ0FBRDthQUFPLENBQUEs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ZixhQUFBLEdBQ0ssSUFBQyxDQUFBLElBQUQsS0FBUyxVQUFULElBQXVCLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQSxDQUFSLEtBQWtCLFNBQTVDLEdBQ0UsVUFERixHQUVRLElBQUMsQ0FBQSxJQUFELEtBQVMsUUFBVCxJQUFxQixJQUFDLENBQUEsTUFBRCxLQUFXLEtBQW5DLEdBQ0gsVUFERyxHQUdIO2FBRUosV0FBQSxJQUFlLHFCQUFBLEdBQXNCLFVBQXRCLEdBQWlDLEdBQWpDLEdBQW9DLGFBQXBDLEdBQWtELGdCQUFsRCxHQUFrRSxLQUFsRSxHQUF3RSxJQUF4RSxHQUE0RSxLQUE1RSxHQUFrRjtJQXJCbEYsQ0FBakIsRUFzQkUsSUF0QkY7SUF3QkEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsRUFBQSxHQUNOLFdBREosQ0FFRSxDQUFDLFFBRkgsQ0FFWSxJQUFDLENBQUEsU0FGYjtXQUlBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWhDTzs7OztHQWpGYyxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9idXR0b24vQnV0dG9uVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJ1dHRvblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJCdXR0b25WaWV3XCJcblxuICBldmVudHMgOlxuICAgIGlmIE1vZGVybml6ci50b3VjaFxuICAgICAgXCJ0b3VjaHN0YXJ0IC5idXR0b25cIiA6IFwib25DbGlja1wiXG4gICAgZWxzZSBcbiAgICAgIFwiY2xpY2sgLmJ1dHRvblwiICAgICAgOiBcIm9uQ2xpY2tcIlxuXG4gIGdldFZhbHVlOiAtPiBAYW5zd2VyXG5cbiAgc2V0VmFsdWU6ICh2YWx1ZXMgPSBbXSkgLT5cblxuICAgIHZhbHVlcyA9IFt2YWx1ZXNdIHVubGVzcyBfKHZhbHVlcykuaXNBcnJheSgpXG5cbiAgICBAYW5zd2VyID0gXy51bmlvbih2YWx1ZXMsIEBvcHRpb25zKVxuXG4gICAgc2VsZWN0b3IgPSBAYW5zd2VyLm1hcCggKHZhbHVlKSAtPiBcIltkYXRhLXZhbHVlPScje3ZhbHVlfSddXCIgKS5qb2luKCcsJylcblxuICAgIEAkZWwuZmluZChcIi5idXR0b25cIikucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgQCRlbC5maW5kKHNlbGVjdG9yKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblxuXG4gIG9uQ2hhbmdlOiAoZXZlbnQpIC0+XG5cbiAgICB2YWx1ZSA9IF8ubWFwKCQoZXZlbnQudGFyZ2V0KS5maW5kKFwib3B0aW9uOnNlbGVjdGVkXCIpLCAoeCkgLT4gJCh4KS5hdHRyKCdkYXRhLWFuc3dlcicpKVxuICAgIEB0cmlnZ2VyIFwiY2hhbmdlXCIsIEBlbFxuXG4gIGh5YnJpZENsaWNrOiAob3B0cykgLT4gXG4gICAgQCRlbC5maW5kKFwiLmJ1dHRvblwiKS5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcblxuICAgIGlmIG5vdCBvcHRzLmNoZWNrZWRCZWZvcmVcbiAgICAgIG9wdHMuJHRhcmdldC5hZGRDbGFzcyBcInNlbGVjdGVkXCJcbiAgICAgIEBhbnN3ZXIgPSBcIlwiXG4gICAgZWxzZVxuICAgICAgQGFuc3dlciA9IG9wdHMudmFsdWVcblxuICBzaW5nbGVDbGljazogKG9wdHMpIC0+XG4gICAgQCRlbC5maW5kKFwiLmJ1dHRvblwiKS5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcbiAgICBvcHRzLiR0YXJnZXQuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgQGFuc3dlciA9IG9wdHMudmFsdWVcblxuXG4gIG11bHRpcGxlQ2xpY2s6IChvcHRzKSAtPlxuXG4gICAgaWYgb3B0cy5jaGVja2VkQmVmb3JlXG4gICAgICBvcHRzLiR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgZWxzZVxuICAgICAgb3B0cy4kdGFyZ2V0LmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuXG4gICAgQGFuc3dlcltvcHRzLnZhbHVlXSA9XG4gICAgICBpZiBvcHRzLmNoZWNrZWRCZWZvcmVcbiAgICAgICAgXCJ1bmNoZWNrZWRcIlxuICAgICAgZWxzZVxuICAgICAgICBcImNoZWNrZWRcIlxuXG5cbiAgb25DbGljayA6IChldmVudCkgLT5cblxuICAgIG9wdGlvbnMgPVxuICAgICAgJHRhcmdldCAgICAgICA6ICQoZXZlbnQudGFyZ2V0KVxuICAgICAgdmFsdWUgICAgICAgICA6ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLXZhbHVlJylcbiAgICAgIGNoZWNrZWRCZWZvcmUgOiAkKGV2ZW50LnRhcmdldCkuaGFzQ2xhc3MoXCJzZWxlY3RlZFwiKVxuXG4gICAgQFtcIiN7QG1vZGV9Q2xpY2tcIl0ob3B0aW9ucylcbiAgICBAdHJpZ2dlciBcImNoYW5nZVwiLCBAZWxcblxuICBpbml0aWFsaXplIDogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZSAgICA9IG9wdGlvbnMubW9kZVxuICAgIEBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG4gICAgXG4gICAgaWYgQG1vZGUgPT0gXCJzaW5nbGVcIiBvciBAbW9kZSA9PSBcIm9wZW5cIlxuICAgICAgYW5zd2VyID0gXCJcIlxuICAgIGVsc2UgaWYgQG1vZGUgPT0gXCJtdWx0aXBsZVwiXG4gICAgICBhbnN3ZXIgPSB7fVxuICAgICAgQG9wdGlvbnMuZm9yRWFjaCAob3B0aW9uKSAtPlxuICAgICAgICBhbnN3ZXJbb3B0aW9uLnZhbHVlXSA9IFwidW5jaGVja2VkXCJcblxuICAgIEBhbnN3ZXIgPSBhbnN3ZXJcblxuICByZW5kZXIgOiAtPlxuXG4gICAgaHRtbE9wdGlvbnMgPSBcIlwiXG5cbiAgICBAb3B0aW9ucy5mb3JFYWNoIChvcHRpb24sIGkpIC0+XG5cbiAgICAgIHN0eWxlQ2xhc3MgPVxuICAgICAgICBpZiBpID09IDBcbiAgICAgICAgICBcImxlZnRcIlxuICAgICAgICBlbHNlIGlmIGkgPT0gQG9wdGlvbnMubGVuZ3RoLTFcbiAgICAgICAgICBcInJpZ2h0XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcblxuICAgICAgdmFsdWUgPSBvcHRpb24udmFsdWVcbiAgICAgIGxhYmVsID0gb3B0aW9uLmxhYmVsXG5cbiAgICAgIHNlbGVjdGVkQ2xhc3MgPVxuICAgICAgICBpZiBAbW9kZSA9PSBcIm11bHRpcGxlXCIgJiYgQGFuc3dlclt2YWx1ZV0gPT0gXCJjaGVja2VkXCJcbiAgICAgICAgICBcInNlbGVjdGVkXCJcbiAgICAgICAgZWxzZSBpZiBAbW9kZSA9PSBcInNpbmdsZVwiICYmIEBhbnN3ZXIgPT0gdmFsdWVcbiAgICAgICAgICBcInNlbGVjdGVkXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcblxuICAgICAgaHRtbE9wdGlvbnMgKz0gXCI8ZGl2IGNsYXNzPSdidXR0b24gI3tzdHlsZUNsYXNzfSAje3NlbGVjdGVkQ2xhc3N9JyBkYXRhLXZhbHVlPScje3ZhbHVlfSc+I3tsYWJlbH08L2Rpdj5cIlxuICAgICwgQFxuXG4gICAgQCRlbC5odG1sKFwiXG4gICAgICAje2h0bWxPcHRpb25zfVxuICAgIFwiKS5hZGRDbGFzcyhAY2xhc3NOYW1lKSAjIFdoeSBkbyBJIGhhdmUgdG8gZG8gdGhpcz9cblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
