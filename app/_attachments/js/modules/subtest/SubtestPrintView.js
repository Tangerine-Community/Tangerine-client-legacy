var SubtestPrintView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SubtestPrintView = (function(_super) {

  __extends(SubtestPrintView, _super);

  function SubtestPrintView() {
    SubtestPrintView.__super__.constructor.apply(this, arguments);
  }

  SubtestPrintView.prototype.initialize = function(options) {
    this.protoViews = Tangerine.config.prototypeViews;
    this.model = options.model;
    this.parent = options.parent;
    return this.prototypeRendered = false;
  };

  SubtestPrintView.prototype.render = function() {
    var enumeratorHelp, skipButton, skippable, studentDialog,
      _this = this;
    enumeratorHelp = (this.model.get("enumeratorHelp") || "") !== "" ? "<div class='enumerator_help_print'>" + (this.model.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog_print'>" + (this.model.get('studentDialog')) + "</div>" : "";
    skipButton = "<button class='skip navigation'>Skip</button>";
    skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.$el.html("      <h2>" + (this.model.get('name')) + "</h2>      Enumerator Help:<br/>      " + enumeratorHelp + "      Student Dialog:<br/>      " + studentDialog + "      <div id='prototype_wrapper'></div>      <hr/>    ");
    this.prototypeView = new window[this.model.get('prototype').humanize() + 'PrintView']({
      model: this.model,
      parent: this
    });
    this.prototypeView.on("rendered", function() {
      return _this.trigger("rendered");
    });
    this.prototypeView.on("subRendered", function() {
      return _this.trigger("subRendered");
    });
    this.prototypeView.on("showNext", function() {
      return _this.showNext();
    });
    this.prototypeView.on("hideNext", function() {
      return _this.hideNext();
    });
    this.prototypeView.setElement(this.$el.find('#prototype_wrapper'));
    this.prototypeView.render();
    this.prototypeRendered = true;
    return this.trigger("rendered");
  };

  return SubtestPrintView;

})(Backbone.View);
