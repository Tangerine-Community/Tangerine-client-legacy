var AssessmentImportView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentImportView = (function(_super) {

  __extends(AssessmentImportView, _super);

  function AssessmentImportView() {
    AssessmentImportView.__super__.constructor.apply(this, arguments);
  }

  AssessmentImportView.prototype.events = {
    'click .import': 'import',
    'click .back': 'back'
  };

  AssessmentImportView.prototype.initialize = function() {
    var _this = this;
    this.docsRemaining = 0;
    this.serverStatus = "checking...";
    return $.ajax({
      dataType: "jsonp",
      url: Tangerine.config.address.cloud.host + ":" + Tangerine.config.address.port + "/",
      success: function(a, b) {
        _this.serverStatus = "Ok";
        return _this.updateServerStatus();
      },
      error: function(a, b) {
        _this.serverStatus = "Not available";
        return _this.updateServerStatus();
      }
    });
  };

  AssessmentImportView.prototype.updateServerStatus = function() {
    return this.$el.find("#server_connection").html(this.serverStatus);
  };

  AssessmentImportView.prototype.back = function() {
    Tangerine.router.navigate("", true);
    return false;
  };

  AssessmentImportView.prototype["import"] = function() {
    var dKey,
      _this = this;
    this.importList = {};
    dKey = this.$el.find("#d_key").val();
    this.$el.find(".status").fadeIn(250);
    this.$el.find("#progress").html("Looking for " + dKey);
    $.getJSON("http://localhost:5984/tangerine/_changes", null, function(data) {
      var i, limit, result, toPurge, _i, _len, _ref;
      toPurge = {};
      limit = 10;
      i = 0;
      _ref = data.results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        if (i > limit) break;
        if (result.deleted === true) {
          i++;
          toPurge[result.id] = result.changes.shift().rev;
        }
      }
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "http://localhost:5984/tangerine/_purge",
        data: JSON.stringify(toPurge),
        success: function() {
          return console.log(arguments);
        }
      });
      return console.log(toPurge);
    });
    return $.ajax({
      type: "GET",
      url: "http://tangerine.iriscouch.com/tangerine/_design/tangerine/_view/byDKey?keys=[%22" + dKey + "%22]",
      dataType: "jsonp",
      success: function(data) {
        var doc, row, _i, _len, _ref, _results;
        _this.docsRemaining = data.rows.length;
        _ref = data.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          doc = row.value;
          console.log(doc.collection);
          _results.push(Tangerine.$db.openDoc(doc._id, {
            async: false,
            success: function(oldDoc) {
              var newDoc;
              newDoc = doc;
              doc._rev = oldDoc._rev;
              return Tangerine.$db.saveDoc(newDoc, {
                async: false,
                success: function(data) {
                  return _this.updateProgress(newDoc.collection);
                },
                error: function() {
                  return _this.updateProgress(newDoc.collection + " save error");
                }
              }, {
                async: false
              });
            },
            error: function() {
              var newDoc;
              newDoc = doc;
              if (arguments[2] === "deleted") {
                return Tangerine.$db.saveDoc(doc, {
                  success: function() {},
                  error: function() {
                    return console.log(arguments);
                  }
                });
              } else {
                return Tangerine.$db.saveDoc(newDoc, {
                  async: false,
                  success: function() {
                    return _this.updateProgress(newDoc.collection);
                  },
                  error: function() {
                    return _this.updateProgress(newDoc.collection + " save error");
                  }
                }, {
                  async: false
                });
              }
            }
          }, {
            async: false,
            revs_info: true
          }));
        }
        return _results;
      },
      error: function() {
        return updateProgress(null, "Download key not found. Please check and try again.");
      }
    });
  };

  AssessmentImportView.prototype.showProgress = function(status, info) {
    var _this = this;
    if (status === "good") {
      this.$el.find("#progress").html("Import successful <h3>Imported</h3>");
      return Tangerine.$db.view(Tangerine.config.address.designDoc + "/byDKey", {
        keys: [dKey],
        success: function(data) {
          var assessmentName, assessments, datum, doc, questions, subtests, _i, _len, _ref;
          questions = 0;
          assessments = 0;
          subtests = 0;
          assessmentName = "";
          _ref = data.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            datum = _ref[_i];
            doc = datum.value;
            if (doc.collection === 'subtest') subtests++;
            if (doc.collection === 'question') questions++;
            if (doc.collection === 'assessment') assessmentName = doc.name;
          }
          return _this.$el.find("#progress").append("            <div>" + assessmentName + "</div>            <div>Subtests - " + subtests + "</div>            <div>Questions - " + questions + "</div>");
        },
        error: function(a, b, c) {
          return this.$el.find("#progress").html("<div>Error after data imported</div><div>" + a + "</div><div>" + b);
        }
      });
    } else if (status === "bad") {
      return this.$el.find("#progress").html("<div>Import error</div>" + (arguments.join(',')));
    }
  };

  AssessmentImportView.prototype.updateProgress = function(key) {
    var progressHTML, value, _ref;
    this.docsRemaining--;
    if (this.importList[key] != null) {
      this.importList[key]++;
    } else {
      this.importList[key] = 1;
    }
    progressHTML = "<table>";
    _ref = this.importList;
    for (key in _ref) {
      value = _ref[key];
      progressHTML += "<tr><td>" + (key.titleize().pluralize()) + "</td><td>" + value + "</td></tr>";
    }
    if (this.docsRemaining > 0) {
      progressHTML += "<tr><td>Documents remaining</td><td>" + this.docsRemaining + "</td></tr>";
    } else {
      progressHTML += "<tr><td colspan='2'>Import Successful</td></tr>";
    }
    progressHTML += "</table>";
    return this.$el.find("#progress").html(progressHTML);
  };

  AssessmentImportView.prototype.render = function() {
    this.$el.html("    <button class='back navigation'>Back</button>    <h1>Tangerine Central Import</h1>    <div class='question'>      <label for='d_key'>Download key</label>      <input id='d_key' value=''>      <button class='import command'>Import</button><br>      <small>Server connection: <span id='server_connection'>" + this.serverStatus + "</span></small>    </div>    <div class='confirmation status'>      <h2>Status<h2>      <div class='info_box' id='progress'></div>    </div>    ");
    return this.trigger("rendered");
  };

  return AssessmentImportView;

})(Backbone.View);
