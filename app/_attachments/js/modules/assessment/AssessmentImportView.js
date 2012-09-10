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
    dKey = this.$el.find("#d_key").val();
    this.$el.find(".status").fadeIn(250);
    this.$el.find("#progress").html("Looking for " + dKey);
    $.ajax({
      type: "GET",
      url: "http://tangerine.iriscouch.com/tangerine/_design/tangerine/_view/byDKey?keys=[%22" + dKey + "%22]",
      dataType: "jsonp",
      success: function(data) {
        var doc, _i, _len, _ref, _results;
        console.log(data);
        _ref = data.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          doc = _ref[_i];
          doc = doc.value;
          _results.push(Tangerine.$db.openDoc(doc._id, {
            success: function(oldDoc) {
              console.log("work with this:");
              console.log(data);
              doc._rev = oldDoc._rev;
              return Tangerine.$db.saveDoc(doc, {
                success: function() {
                  return console.log("overwrote old doc");
                },
                error: function() {
                  console.log("could not overwrite old doc");
                  return console.log(arguments);
                }
              });
            },
            error: function() {
              console.log("no doc there: arguments[2]");
              if (arguments[2] === "deleted") {
                console.log("trying to undelete");
                return Tangerine.$db.compact({
                  complete: function() {
                    console.log("compacted database");
                    return Tangerine.$db.saveDoc(doc, {
                      success: function() {
                        return console.log("saved brand new doc");
                      },
                      error: function() {
                        console.log("could not save brand new doc");
                        return console.log(arguments);
                      }
                    });
                  },
                  error: function() {
                    return console.log("could not compact");
                  }
                });
              } else {
                return Tangerine.$db.saveDoc(doc, {
                  success: function() {
                    return console.log("saved brand new doc");
                  },
                  error: function() {
                    console.log("could not save brand new doc");
                    return console.log(arguments);
                  }
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
      error: function(a, b) {
        return _this.$el.find("#progress").html("<div>Import error</div><div>" + a + "</div><div>" + b);
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

  AssessmentImportView.prototype.render = function() {
    this.$el.html("    <button class='back navigation'>Back</button>    <h1>Tangerine Central Import</h1>    <div class='question'>      <label for='d_key'>Download key</label>      <input id='d_key' value=''>      <button class='import command'>Import</button><br>      <small>Server connection: <span id='server_connection'>" + this.serverStatus + "</span></small>    </div>    <div class='confirmation status'>      <h2>Status<h2>      <div class='info_box' id='progress'></div>    </div>    ");
    return this.trigger("rendered");
  };

  return AssessmentImportView;

})(Backbone.View);
