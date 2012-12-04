var CurriculumImportView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculumImportView = (function(_super) {

  __extends(CurriculumImportView, _super);

  function CurriculumImportView() {
    this.updateProgress = __bind(this.updateProgress, this);
    this.updateActivity = __bind(this.updateActivity, this);
    this.updateFromActiveTasks = __bind(this.updateFromActiveTasks, this);
    this["import"] = __bind(this["import"], this);
    CurriculumImportView.__super__.constructor.apply(this, arguments);
  }

  CurriculumImportView.prototype.events = {
    'click .import': 'import',
    'click .back': 'back'
  };

  CurriculumImportView.prototype.initialize = function() {
    var _this = this;
    this.docsRemaining = 0;
    this.serverStatus = "checking...";
    return $.ajax({
      dataType: "jsonp",
      url: Tangerine.config.address["class"].host + ":" + Tangerine.config.address.port + "/",
      success: function() {
        _this.serverStatus = "Ok";
        return _this.updateServerStatus();
      },
      error: function() {
        _this.serverStatus = "Not available";
        return _this.updateServerStatus();
      }
    });
  };

  CurriculumImportView.prototype.updateServerStatus = function() {
    return this.$el.find("#server_connection").html(this.serverStatus);
  };

  CurriculumImportView.prototype.back = function() {
    Tangerine.router.navigate("", true);
    return false;
  };

  CurriculumImportView.prototype["import"] = function() {
    var dKey;
    this.updateActivity();
    dKey = this.$el.find("#d_key").val();
    this.newCurriculum = new Curriculum;
    this.newCurriculum.on("status", this.updateActivity);
    this.newCurriculum.updateFromServer(dKey);
    return this.activeTaskInterval = setInterval(this.updateFromActiveTasks, 3000);
  };

  CurriculumImportView.prototype.updateFromActiveTasks = function() {
    var _this = this;
    return $.couch.activeTasks({
      success: function(tasks) {
        var task, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tasks.length; _i < _len; _i++) {
          task = tasks[_i];
          if (task.type.toLowerCase() === "replication") {
            if (!_.isEmpty(task.status)) _this.activity = task.status;
            _results.push(_this.updateProgress());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
  };

  CurriculumImportView.prototype.updateActivity = function(status, message) {
    this.$el.find(".status").fadeIn(250);
    this.activity = "";
    if (status === "import lookup") {
      this.activity = "Finding curriculum";
    } else if (status === "import success") {
      clearInterval(this.activeTaskInterval);
      this.activity = "Import successful";
      this.updateProgress();
      Utils.askToLogout();
    } else if (status === "import error") {
      clearInterval(this.activeTaskInterval);
      this.activity = "Import error: " + message;
    }
    return this.updateProgress();
  };

  CurriculumImportView.prototype.updateProgress = function(key) {
    var progressHTML, value, _ref;
    if (key != null) {
      if (this.importList[key] != null) {
        this.importList[key]++;
      } else {
        this.importList[key] = 1;
      }
    }
    progressHTML = "<table>";
    _ref = this.importList;
    for (key in _ref) {
      value = _ref[key];
      progressHTML += "<tr><td>" + (key.titleize().pluralize()) + "</td><td>" + value + "</td></tr>";
    }
    if (this.activity != null) {
      progressHTML += "<tr><td colspan='2'>" + this.activity + "</td></tr>";
    }
    progressHTML += "</table>";
    return this.$el.find("#progress").html(progressHTML);
  };

  CurriculumImportView.prototype.render = function() {
    this.$el.html("    <button class='back navigation'>Back</button>    <h1>Curriculum Import</h1>    <div class='question'>      <label for='d_key'>Download keys</label>      <input id='d_key' value=''>      <button class='import command'>Import</button><br>      <small>Server connection: <span id='server_connection'>" + this.serverStatus + "</span></small>    </div>    <div class='confirmation status'>      <h2>Status<h2>      <div class='info_box' id='progress'></div>    </div>    ");
    return this.trigger("rendered");
  };

  return CurriculumImportView;

})(Backbone.View);
