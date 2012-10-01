var KlassSubtestRunView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

KlassSubtestRunView = (function(_super) {

  __extends(KlassSubtestRunView, _super);

  function KlassSubtestRunView() {
    this.onPrototypeRendered = __bind(this.onPrototypeRendered, this);
    KlassSubtestRunView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestRunView.prototype.events = {
    'click .done': 'done',
    'click .cancel': 'cancel',
    'click .subtest_help': 'toggleHelp'
  };

  KlassSubtestRunView.prototype.toggleHelp = function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  };

  KlassSubtestRunView.prototype.initialize = function(options) {
    this.protoViews = Tangerine.config.prototypeViews;
    this.prototypeRendered = false;
    return this.result = new KlassResult({
      resultBucket: options.subtest.get("resultBucket"),
      reportType: options.subtest.get("reportType"),
      studentId: options.student.id,
      subtestId: options.subtest.id,
      part: options.subtest.get("part"),
      klassId: options.student.get("klassId")
    });
  };

  KlassSubtestRunView.prototype.render = function() {
    var enumeratorHelp, studentDialog;
    enumeratorHelp = (this.options.subtest.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>help</button><div class='enumerator_help'>" + (this.options.subtest.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.options.subtest.get("studentDialog") || "") !== "" ? "<div class='student_dialog'>" + (this.options.subtest.get('studentDialog')) + "</div>" : "";
    this.$el.html("      <h2>" + (this.options.subtest.get('name')) + "</h2>      " + enumeratorHelp + "      " + studentDialog + "    ");
    this.prototypeView = new window[this.protoViews[this.options.subtest.get('prototype')]['run']]({
      model: this.options.subtest,
      parent: this
    });
    this.prototypeView.on("rendered", this.onPrototypeRendered);
    this.prototypeView.render();
    this.$el.append(this.prototypeView.el);
    this.prototypeRendered = true;
    this.$el.append("<button class='done navigation'>Done</button> <button class='cancel navigation'>Cancel</button>");
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.onPrototypeRendered = function() {
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.onClose = function() {
    var _ref;
    return (_ref = this.prototypeView) != null ? typeof _ref.close === "function" ? _ref.close() : void 0 : void 0;
  };

  KlassSubtestRunView.prototype.isValid = function() {
    if (!this.prototypeRendered) return false;
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  };

  KlassSubtestRunView.prototype.getResult = function() {
    var result;
    result = this.prototypeView.getResult();
    return result;
  };

  KlassSubtestRunView.prototype.getSkipped = function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  };

  KlassSubtestRunView.prototype.cancel = function() {
    return Tangerine.router.navigate("class/" + (this.options.student.get('klassId')) + "/" + (this.options.subtest.get('part')), true);
  };

  KlassSubtestRunView.prototype.done = function() {
    if (this.isValid()) {
      this.result.add(this.getResult());
      return Tangerine.router.navigate("class/" + (this.options.student.get('klassId')) + "/" + (this.options.subtest.get('part')), true);
    } else {
      return this.prototypeView.showErrors();
    }
  };

  return KlassSubtestRunView;

})(Backbone.View);
