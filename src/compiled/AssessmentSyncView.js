var AssessmentSyncView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

AssessmentSyncView = (function(superClass) {
  extend(AssessmentSyncView, superClass);

  function AssessmentSyncView() {
    this.ensureCredentials = bind(this.ensureCredentials, this);
    this.verifyTimeout = bind(this.verifyTimeout, this);
    this.onVerifySuccess = bind(this.onVerifySuccess, this);
    this.getDocIds = bind(this.getDocIds, this);
    this.upload = bind(this.upload, this);
    this.download = bind(this.download, this);
    return AssessmentSyncView.__super__.constructor.apply(this, arguments);
  }

  AssessmentSyncView.prototype.className = "AssessmentSyncView";

  AssessmentSyncView.prototype.events = {
    "click .back": "goBack",
    "click .show_details": "showDetails",
    "click .keep": "keep",
    "click .show_login": "showLogin",
    "click .login": "login",
    "click .download": "download",
    "click .upload": "upload"
  };

  AssessmentSyncView.prototype.download = function() {
    var groupDB, localDB;
    this.ensureCredentials();
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@");
    localDB = Tangerine.settings.urlDB("local");
    return this.getDocIds((function(_this) {
      return function(docIds) {
        return $.couch.replicate(groupDB, localDB, {
          success: function(response) {
            Utils.midAlert("Download success");
            return _this.updateConflicts();
          },
          error: function(a, b) {
            return Utils.midAlert("Pull Error<br>" + a + " " + b);
          }
        }, {
          doc_ids: docIds
        });
      };
    })(this));
  };

  AssessmentSyncView.prototype.upload = function() {
    var groupDB, localDB;
    this.ensureCredentials();
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@");
    localDB = Tangerine.settings.urlDB("local");
    return this.getDocIds((function(_this) {
      return function(docIds) {
        return $.couch.replicate(localDB, groupDB, {
          success: function(response) {
            Utils.midAlert("Upload success");
            return _this.updateConflicts();
          },
          error: function(a, b) {
            return Utils.midAlert("Pull Error<br>" + a + " " + b);
          }
        }, {
          doc_ids: docIds
        });
      };
    })(this));
  };

  AssessmentSyncView.prototype.getDocIds = function(callback) {
    var groupDB, groupDKey, localDKey, targetDB;
    groupDB = Tangerine.settings.urlDB("group").replace(/\/\/(.*)@/, "//");
    targetDB = Tangerine.settings.urlDB("local");
    localDKey = Tangerine.settings.urlView("local", "byDKey");
    groupDKey = (Tangerine.settings.location.group.db + Tangerine.settings.couch.view + "byDKey").replace(/\/\/(.*)@/, "//");
    return $.ajax({
      url: groupDKey,
      type: "GET",
      dataType: "jsonp",
      data: {
        keys: JSON.stringify([this.dKey])
      },
      error: (function(_this) {
        return function(a, b) {
          return Utils.midAlert("Pull error<br>" + a + " " + b);
        };
      })(this),
      success: (function(_this) {
        return function(data) {
          var datum, docList, i, len, ref;
          docList = [];
          ref = data.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            datum = ref[i];
            docList.push(datum.id);
          }
          return $.ajax({
            url: localDKey,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
              keys: [_this.dKey]
            }),
            error: function(a, b) {
              return Utils.midAlert("Pull error<br>" + a + " " + b);
            },
            success: function(data) {
              var j, len1, ref1;
              ref1 = data.rows;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                datum = ref1[j];
                docList.push(datum.id);
              }
              docList = _.uniq(docList);
              return callback(docList);
            }
          });
        };
      })(this)
    });
  };

  AssessmentSyncView.prototype.showLogin = function() {
    this.$el.find("#user").val("");
    this.$el.find("#pass").val("");
    this.$el.find(".login_box").toggleClass("confirmation");
    return this.$el.find(".show_login").toggle();
  };

  AssessmentSyncView.prototype.onVerifySuccess = function() {
    clearTimeout(this.timer);
    this.connectionVerified = true;
    this.$el.find("#connection").html("Ok");
    this.$el.find(".show_login").toggle();
    return this.$el.find(".loads").removeClass("confirmation");
  };

  AssessmentSyncView.prototype.login = function() {
    this.user = this.$el.find("#user").val();
    this.pass = this.$el.find("#pass").val();
    Tangerine.settings.save({
      "server_user": this.user,
      "server_pass": this.pass
    });
    return Tangerine.user.ghostLogin(this.user, this.pass);
  };

  AssessmentSyncView.prototype.verifyTimeout = function() {
    this.$el.find("#connection").html(this.loginButton({
      status: "<br>Failed. Check connection or try again."
    }));
    this.$el.find(".loads").addClass("confirmation");
    return this.removeCredentials();
  };

  AssessmentSyncView.prototype.keep = function(event) {
    var $target, doc, docId, docRev, docsById, i, j, len, len1, onComplete, ref, ref1, results;
    if (!confirm("This will permanently remove the other versions, are you sure?")) {
      return;
    }
    this.deletedCount = 0;
    this.toDeleteCount = 0;
    $target = $(event.target);
    docId = $target.attr("data-docId");
    docRev = $target.attr("data-docRev");
    docsById = _.indexBy("_id", this.loadedDocs);
    onComplete = (function(_this) {
      return function(response) {
        _this.deletedCount++;
        if (_this.deletedCount === _this.toDeleteCount) {
          return _this.updateConflicts();
        }
      };
    })(this);
    ref = docsById[docId];
    for (i = 0, len = ref.length; i < len; i++) {
      doc = ref[i];
      if (doc._rev !== docRev) {
        this.toDeleteCount++;
      }
    }
    ref1 = docsById[docId];
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      doc = ref1[j];
      if (doc._rev === docRev) {
        continue;
      }
      results.push(Tangerine.$db.removeDoc({
        "_id": doc._id,
        "_rev": doc._rev
      }, {
        success: (function(_this) {
          return function(response) {
            return onComplete(response);
          };
        })(this),
        error: (function(_this) {
          return function(a, b) {
            return Utils.alert("Error<br>" + a + "<br>" + b);
          };
        })(this)
      }));
    }
    return results;
  };

  AssessmentSyncView.prototype.showDetails = function(event) {
    var $target, docRev;
    $target = $(event.target);
    docRev = $target.attr("data-docRev");
    return this.$el.find("#table_" + docRev).toggleClass("confirmation");
  };

  AssessmentSyncView.prototype.initialize = function(options) {
    this.readyTemplates();
    this.docList = [];
    this.assessment = options.assessment;
    this.dKey = this.assessment.id.substr(-5, 5);
    this.connectionVerified = false;
    this.timer = setTimeout(this.verifyTimeout, 20 * 1000);
    return this.ensureCredentials();
  };

  AssessmentSyncView.prototype.ensureCredentials = function() {
    if (Tangerine.settings.get("server_user") && Tangerine.settings.get("server_pass")) {
      this.user = Tangerine.settings.get("server_user");
      return this.pass = Tangerine.settings.get("server_pass");
    }
  };

  AssessmentSyncView.prototype.goBack = function() {
    return Tangerine.router.landing();
  };

  AssessmentSyncView.prototype.render = function() {
    var connectionBox, name;
    name = this.assessment.getEscapedString("name");
    if (Tangerine.settings.get("context") !== "server") {
      connectionBox = "<div class='info_box grey'> Server connection<br> <span id='connection'>" + (this.loginButton({
        status: "Checking..."
      })) + "</span> </div>";
    }
    this.$el.html("<button class='back navigation'>Back</button> <h1>Assessment Sync</h1> <h2>" + name + "</h2> " + (connectionBox || "") + " <br> <div class='loads confirmation'> <div class='menu_box'> <button class='command upload'>Upload</button><br> <button class='command download'>Download</button> </div> </div> <h2>Conflicts</h2> <div id='conflicts'></div>");
    this.updateConflicts();
    return this.trigger("rendered");
  };

  AssessmentSyncView.prototype.afterRender = function() {
    if (this.user && this.pass) {
      return $.ajax({
        url: Tangerine.settings.urlView("group", "byDKey").replace(/\/\/(.*)@/, "//" + this.user + ":" + this.pass + "@"),
        dataType: "jsonp",
        data: {
          keys: ["testtest"]
        },
        timeout: 15000,
        success: (function(_this) {
          return function() {
            clearTimeout(_this.timer);
            return _this.onVerifySuccess();
          };
        })(this)
      });
    } else {
      clearTimeout(this.timer);
      return this.verifyTimeout();
    }
  };

  AssessmentSyncView.prototype.updateConflicts = function() {
    Utils.working(true);
    Tangerine.$db.view(Tangerine.design_doc + "/conflictsByDKey", {
      error: function(a, b) {
        Utils.midAlert("Error<br>" + a + "<br>" + b);
        return Utils.working(false);
      },
      success: (function(_this) {
        return function(response) {
          var i, len, onComplete, row, rows;
          Utils.working(false);
          if (response.rows.length === 0) {
            _this.$el.find("#conflicts").html("<div class='grey'>None</div>");
            return;
          }
          _this.loadedDocs = [];
          rows = _.pluck(response.rows, "value");
          onComplete = function(oneDoc) {
            var combined, differences, doc, docCount, docId, docsById, hKey, html, i, j, key, len, len1, presentables, rev, revCount, total, value;
            _this.loadedDocs.push(oneDoc);
            total = rows.length;
            if (_this.loadedDocs.length !== total) {
              return;
            }
            html = "";
            docsById = _.indexBy("_id", _this.loadedDocs);
            docCount = 1;
            for (docId in docsById) {
              doc = docsById[docId];
              html += "<b>Document Conflict " + docCount + " " + (doc[0].collection.capitalize()) + "</b>";
              combined = {};
              for (i = 0, len = doc.length; i < len; i++) {
                rev = doc[i];
                for (key in rev) {
                  value = rev[key];
                  if (combined[key] == null) {
                    combined[key] = [];
                  }
                  combined[key].push(JSON.stringify(value));
                }
              }
              differences = [];
              for (key in combined) {
                value = combined[key];
                if (_.uniq(value).length > 1) {
                  differences.push(key);
                }
              }
              revCount = 1;
              for (j = 0, len1 = doc.length; j < len1; j++) {
                rev = doc[j];
                presentables = {};
                for (key in rev) {
                  value = rev[key];
                  if (key === '_rev' || key === '_id' || key === 'hash' || key === 'updated' || key === 'editedBy' || key === "assessmentId" || key === "curriculumId") {
                    continue;
                  }
                  presentables[key] = value;
                }
                html += "<div class='menu_box'> <h3>Version " + (revCount++) + "</h3> <table class='conflict_table'> <tr><td><b>" + rev.name + "</b></td><td><button class='command keep' data-docId='" + rev._id + "' data-docRev='" + rev._rev + "'>Keep</button></td></tr> <tr><th>Updated</th><td>" + rev.updated + "</td></tr> <tr><th>Edited by</th><td>" + rev.editedBy + "</td></tr> </table> <button class='command show_details' data-docRev='" + rev._rev + "'>Show details</button> <table class='confirmation conflict_table' id='table_" + rev._rev + "'>";
                for (key in presentables) {
                  value = presentables[key];
                  hKey = indexOf.call(differences, key) >= 0 ? "<b class='conflict_key'>" + key + "</b>" : key;
                  html += "<tr><th>" + hKey + "</th><td>" + (JSON.stringify(value)) + "</td></tr>";
                }
                html += "</table> </div>";
              }
              docCount++;
            }
            return _this.$el.find("#conflicts").html(html);
          };
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            $.ajax({
              url: "/" + Tangerine.db_name + "/" + row._id + "?rev=" + row._rev,
              type: "get",
              dataType: "json",
              success: function(doc) {
                return onComplete(doc);
              }
            });
          }
        };
      })(this)
    });
    return {};
  };

  AssessmentSyncView.prototype.onClose = function() {
    return clearTimeout(this.timer);
  };

  AssessmentSyncView.prototype.removeCredentials = function() {
    Tangerine.settings.unset("server_user");
    Tangerine.settings.unset("server_pass");
    return Tangerine.settings.save();
  };

  AssessmentSyncView.prototype.readyTemplates = function() {
    return this.loginButton = _.template("{{status}} <button class='command show_login'>Login</button><br> <div class='confirmation login_box'> <div> <label for='user'>Username</label><input id='user' type='text'><br> <label for='pass'>Password</label><input id='pass' type='password'> <button class='command login'>Login</button> </div> </div>");
  };

  return AssessmentSyncView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvYXNzZXNzbWVudC9Bc3Nlc3NtZW50U3luY1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsa0JBQUE7RUFBQTs7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OzsrQkFFSixTQUFBLEdBQVc7OytCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBZ0IsUUFBaEI7SUFDQSxxQkFBQSxFQUF3QixhQUR4QjtJQUVBLGFBQUEsRUFBZ0IsTUFGaEI7SUFHQSxtQkFBQSxFQUFzQixXQUh0QjtJQUlBLGNBQUEsRUFBaUIsT0FKakI7SUFLQSxpQkFBQSxFQUFvQixVQUxwQjtJQU1BLGVBQUEsRUFBa0IsUUFObEI7OzsrQkFRRixRQUFBLEdBQVUsU0FBQTtBQUVSLFFBQUE7SUFBQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUVBLE9BQUEsR0FBVSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQXlCLE9BQXpCLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsV0FBMUMsRUFBc0QsSUFBQSxHQUFLLElBQUMsQ0FBQSxJQUFOLEdBQVcsR0FBWCxHQUFjLElBQUMsQ0FBQSxJQUFmLEdBQW9CLEdBQTFFO0lBQ1YsT0FBQSxHQUFVLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBbkIsQ0FBeUIsT0FBekI7V0FFVixJQUFDLENBQUEsU0FBRCxDQUFXLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBRSxNQUFGO2VBRVQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFSLENBQ0UsT0FERixFQUVFLE9BRkYsRUFHSTtVQUFBLE9BQUEsRUFBUyxTQUFDLFFBQUQ7WUFDUCxLQUFLLENBQUMsUUFBTixDQUFlLGtCQUFmO21CQUNBLEtBQUMsQ0FBQSxlQUFELENBQUE7VUFGTyxDQUFUO1VBR0EsS0FBQSxFQUFPLFNBQUMsQ0FBRCxFQUFJLENBQUo7bUJBQWUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxnQkFBQSxHQUFpQixDQUFqQixHQUFtQixHQUFuQixHQUFzQixDQUFyQztV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QVcsZ1RBQVg7RUFERDs7OztHQXZVZSxRQUFRLENBQUMiLCJmaWxlIjoibW9kdWxlcy9hc3Nlc3NtZW50L0Fzc2Vzc21lbnRTeW5jVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRTeW5jVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQXNzZXNzbWVudFN5bmNWaWV3XCJcblxuICBldmVudHM6IFxuICAgIFwiY2xpY2sgLmJhY2tcIiA6IFwiZ29CYWNrXCJcbiAgICBcImNsaWNrIC5zaG93X2RldGFpbHNcIiA6IFwic2hvd0RldGFpbHNcIlxuICAgIFwiY2xpY2sgLmtlZXBcIiA6IFwia2VlcFwiXG4gICAgXCJjbGljayAuc2hvd19sb2dpblwiIDogXCJzaG93TG9naW5cIlxuICAgIFwiY2xpY2sgLmxvZ2luXCIgOiBcImxvZ2luXCJcbiAgICBcImNsaWNrIC5kb3dubG9hZFwiIDogXCJkb3dubG9hZFwiXG4gICAgXCJjbGljayAudXBsb2FkXCIgOiBcInVwbG9hZFwiXG5cbiAgZG93bmxvYWQ6ID0+XG5cbiAgICBAZW5zdXJlQ3JlZGVudGlhbHMoKVxuXG4gICAgZ3JvdXBEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpLnJlcGxhY2UoL1xcL1xcLyguKilALyxcIi8vI3tAdXNlcn06I3tAcGFzc31AXCIpXG4gICAgbG9jYWxEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpXG5cbiAgICBAZ2V0RG9jSWRzICggZG9jSWRzICkgPT5cblxuICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoIFxuICAgICAgICBncm91cERCLCAjIGZyb21cbiAgICAgICAgbG9jYWxEQiwgIyB0b1xuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSk9PlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJEb3dubG9hZCBzdWNjZXNzXCIgXG4gICAgICAgICAgICBAdXBkYXRlQ29uZmxpY3RzKCkgXG4gICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgID0+IFV0aWxzLm1pZEFsZXJ0IFwiUHVsbCBFcnJvcjxicj4je2F9ICN7Yn1cIlxuICAgICAgICAsXG4gICAgICAgICAgZG9jX2lkczogZG9jSWRzXG4gICAgICApXG5cblxuICB1cGxvYWQ6ID0+XG5cbiAgICBAZW5zdXJlQ3JlZGVudGlhbHMoKVxuXG4gICAgZ3JvdXBEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpLnJlcGxhY2UoL1xcL1xcLyguKilALyxcIi8vI3tAdXNlcn06I3tAcGFzc31AXCIpXG4gICAgbG9jYWxEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpXG5cbiAgICBAZ2V0RG9jSWRzICggZG9jSWRzICkgPT5cblxuICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoIFxuICAgICAgICBsb2NhbERCLCAjIGZyb21cbiAgICAgICAgZ3JvdXBEQiwgIyB0b1xuICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSk9PiBcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBsb2FkIHN1Y2Nlc3NcIlxuICAgICAgICAgICAgQHVwZGF0ZUNvbmZsaWN0cygpIFxuICAgICAgICAgIGVycm9yOiAoYSwgYikgICAgICA9PiBVdGlscy5taWRBbGVydCBcIlB1bGwgRXJyb3I8YnI+I3thfSAje2J9XCJcbiAgICAgICAgLFxuICAgICAgICAgIGRvY19pZHM6IGRvY0lkc1xuICAgICAgKVxuXG4gIGdldERvY0lkczogKGNhbGxiYWNrKSA9PlxuXG4gICAgZ3JvdXBEQiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpLnJlcGxhY2UoL1xcL1xcLyguKilALyxcIi8vXCIpXG4gICAgdGFyZ2V0REIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKVxuXG4gICAgbG9jYWxES2V5ID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJsb2NhbFwiLCBcImJ5REtleVwiKVxuICAgIGdyb3VwREtleSA9IChUYW5nZXJpbmUuc2V0dGluZ3MubG9jYXRpb24uZ3JvdXAuZGIrVGFuZ2VyaW5lLnNldHRpbmdzLmNvdWNoLnZpZXcgKyBcImJ5REtleVwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvL1wiKVxuXG4gICAgJC5hamF4XG4gICAgICB1cmw6IGdyb3VwREtleVxuICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgZGF0YVR5cGU6IFwianNvbnBcIlxuICAgICAgZGF0YToga2V5czogSlNPTi5zdHJpbmdpZnkoW0BkS2V5XSlcbiAgICAgIGVycm9yOiAoYSwgYikgPT4gVXRpbHMubWlkQWxlcnQgXCJQdWxsIGVycm9yPGJyPiN7YX0gI3tifVwiIFxuICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBsb2NhbERLZXlcbiAgICAgICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGtleXM6W0BkS2V5XSlcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IFV0aWxzLm1pZEFsZXJ0IFwiUHVsbCBlcnJvcjxicj4je2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgICAgIGRvY0xpc3QgPSBfLnVuaXEoZG9jTGlzdClcbiAgICAgICAgICAgIGNhbGxiYWNrIGRvY0xpc3RcblxuXG4gIHNob3dMb2dpbjogLT5cbiAgICBAJGVsLmZpbmQoXCIjdXNlclwiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIjcGFzc1wiKS52YWwoXCJcIilcbiAgICBAJGVsLmZpbmQoXCIubG9naW5fYm94XCIpLnRvZ2dsZUNsYXNzIFwiY29uZmlybWF0aW9uXCJcbiAgICBAJGVsLmZpbmQoXCIuc2hvd19sb2dpblwiKS50b2dnbGUoKVxuXG4gIG9uVmVyaWZ5U3VjY2VzczogPT5cbiAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgQGNvbm5lY3Rpb25WZXJpZmllZCA9IHRydWVcbiAgICBAJGVsLmZpbmQoXCIjY29ubmVjdGlvblwiKS5odG1sKFwiT2tcIilcbiAgICBAJGVsLmZpbmQoXCIuc2hvd19sb2dpblwiKS50b2dnbGUoKVxuXG4gICAgQCRlbC5maW5kKFwiLmxvYWRzXCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG5cbiAgbG9naW46IC0+XG4gICAgQHVzZXIgPSBAJGVsLmZpbmQoXCIjdXNlclwiKS52YWwoKVxuICAgIEBwYXNzID0gQCRlbC5maW5kKFwiI3Bhc3NcIikudmFsKClcbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZVxuICAgICAgXCJzZXJ2ZXJfdXNlclwiIDogQHVzZXJcbiAgICAgIFwic2VydmVyX3Bhc3NcIiA6IEBwYXNzXG5cbiAgICBUYW5nZXJpbmUudXNlci5naG9zdExvZ2luKEB1c2VyLCBAcGFzcylcblxuICB2ZXJpZnlUaW1lb3V0OiA9PlxuICAgIEAkZWwuZmluZChcIiNjb25uZWN0aW9uXCIpLmh0bWwgQGxvZ2luQnV0dG9uKHN0YXR1czpcIjxicj5GYWlsZWQuIENoZWNrIGNvbm5lY3Rpb24gb3IgdHJ5IGFnYWluLlwiKVxuICAgIEAkZWwuZmluZChcIi5sb2Fkc1wiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuICAgIEByZW1vdmVDcmVkZW50aWFscygpXG5cbiAga2VlcDogKGV2ZW50KSAtPlxuXG4gICAgcmV0dXJuIHVubGVzcyBjb25maXJtIFwiVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgb3RoZXIgdmVyc2lvbnMsIGFyZSB5b3Ugc3VyZT9cIlxuXG4gICAgQGRlbGV0ZWRDb3VudCA9IDBcbiAgICBAdG9EZWxldGVDb3VudCA9IDBcbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG5cbiAgICBkb2NJZCAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWRvY0lkXCIpXG4gICAgZG9jUmV2ID0gJHRhcmdldC5hdHRyKFwiZGF0YS1kb2NSZXZcIilcblxuICAgIGRvY3NCeUlkID0gXy5pbmRleEJ5IFwiX2lkXCIsIEBsb2FkZWREb2NzXG5cbiAgICBvbkNvbXBsZXRlID0gKHJlc3BvbnNlKSA9PlxuICAgICAgQGRlbGV0ZWRDb3VudCsrXG5cbiAgICAgIEB1cGRhdGVDb25mbGljdHMoKSBpZiBAZGVsZXRlZENvdW50ID09IEB0b0RlbGV0ZUNvdW50XG5cbiAgICBmb3IgZG9jIGluIGRvY3NCeUlkW2RvY0lkXVxuICAgICAgQHRvRGVsZXRlQ291bnQrKyB1bmxlc3MgZG9jLl9yZXYgPT0gZG9jUmV2IFxuXG4gICAgZm9yIGRvYyBpbiBkb2NzQnlJZFtkb2NJZF1cblxuICAgICAgY29udGludWUgaWYgZG9jLl9yZXYgPT0gZG9jUmV2XG5cbiAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jXG4gICAgICAgIFwiX2lkXCIgIDogZG9jLl9pZFxuICAgICAgICBcIl9yZXZcIiA6IGRvYy5fcmV2XG4gICAgICAsXG4gICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4gb25Db21wbGV0ZSByZXNwb25zZVxuICAgICAgICBlcnJvcjogKGEsIGIpID0+XG4gICAgICAgICAgVXRpbHMuYWxlcnQgXCJFcnJvcjxicj4je2F9PGJyPiN7Yn1cIlxuXG4gIHNob3dEZXRhaWxzOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGRvY1JldiA9ICR0YXJnZXQuYXR0cihcImRhdGEtZG9jUmV2XCIpXG4gICAgQCRlbC5maW5kKFwiI3RhYmxlXyN7ZG9jUmV2fVwiKS50b2dnbGVDbGFzcyBcImNvbmZpcm1hdGlvblwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAcmVhZHlUZW1wbGF0ZXMoKVxuXG4gICAgQGRvY0xpc3QgPSBbXVxuXG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcblxuICAgIEBkS2V5ID0gQGFzc2Vzc21lbnQuaWQuc3Vic3RyKC01LCA1KVxuXG4gICAgQGNvbm5lY3Rpb25WZXJpZmllZCA9IGZhbHNlXG5cbiAgICBAdGltZXIgPSBzZXRUaW1lb3V0IEB2ZXJpZnlUaW1lb3V0LCAyMCAqIDEwMDBcblxuICAgIEBlbnN1cmVDcmVkZW50aWFscygpXG5cblxuICBlbnN1cmVDcmVkZW50aWFsczogPT5cbiAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwic2VydmVyX3VzZXJcIikgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcInNlcnZlcl9wYXNzXCIpXG4gICAgICBAdXNlciA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJzZXJ2ZXJfdXNlclwiKVxuICAgICAgQHBhc3MgPSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwic2VydmVyX3Bhc3NcIilcblxuXG4gIGdvQmFjazogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIG5hbWUgPSBAYXNzZXNzbWVudC5nZXRFc2NhcGVkU3RyaW5nKFwibmFtZVwiKVxuXG4gICAgY29ubmVjdGlvbkJveCA9IFwiXG4gICAgICA8ZGl2IGNsYXNzPSdpbmZvX2JveCBncmV5Jz5cbiAgICAgICAgU2VydmVyIGNvbm5lY3Rpb248YnI+XG4gICAgICAgIDxzcGFuIGlkPSdjb25uZWN0aW9uJz4je0Bsb2dpbkJ1dHRvbih7c3RhdHVzOlwiQ2hlY2tpbmcuLi5cIn0pfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwic2VydmVyXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdiYWNrIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj5cblxuICAgICAgPGgxPkFzc2Vzc21lbnQgU3luYzwvaDE+XG5cbiAgICAgIDxoMj4je25hbWV9PC9oMj5cblxuICAgICAgI3tjb25uZWN0aW9uQm94IHx8IFwiXCJ9XG4gICAgICA8YnI+XG4gICAgICA8ZGl2IGNsYXNzPSdsb2FkcyBjb25maXJtYXRpb24nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB1cGxvYWQnPlVwbG9hZDwvYnV0dG9uPjxicj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGRvd25sb2FkJz5Eb3dubG9hZDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyPkNvbmZsaWN0czwvaDI+XG4gICAgICA8ZGl2IGlkPSdjb25mbGljdHMnPjwvZGl2PlxuXG4gICAgXCJcblxuICAgIEB1cGRhdGVDb25mbGljdHMoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6IC0+XG4gICAgaWYgQHVzZXIgYW5kIEBwYXNzXG4gICAgICAkLmFqYXggXG4gICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKS5yZXBsYWNlKC9cXC9cXC8oLiopQC8sXCIvLyN7QHVzZXJ9OiN7QHBhc3N9QFwiKVxuICAgICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICAgIGRhdGE6IGtleXM6IFtcInRlc3R0ZXN0XCJdXG4gICAgICAgIHRpbWVvdXQ6IDE1MDAwXG4gICAgICAgIHN1Y2Nlc3M6ID0+IFxuICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXJcbiAgICAgICAgICBAb25WZXJpZnlTdWNjZXNzKClcbiAgICBlbHNlXG4gICAgICBjbGVhclRpbWVvdXQgQHRpbWVyXG4gICAgICBAdmVyaWZ5VGltZW91dCgpXG5cblxuICB1cGRhdGVDb25mbGljdHM6IC0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9jb25mbGljdHNCeURLZXlcIixcbiAgICAgIGVycm9yOiAoYSwgYikgLT4gVXRpbHMubWlkQWxlcnQgXCJFcnJvcjxicj4je2F9PGJyPiN7Yn1cIjsgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG5cbiAgICAgICAgaWYgcmVzcG9uc2Uucm93cy5sZW5ndGggPT0gMFxuICAgICAgICAgIEAkZWwuZmluZChcIiNjb25mbGljdHNcIikuaHRtbCBcIjxkaXYgY2xhc3M9J2dyZXknPk5vbmU8L2Rpdj5cIlxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIEBsb2FkZWREb2NzID0gW11cblxuICAgICAgICByb3dzID0gXy5wbHVjayhyZXNwb25zZS5yb3dzLCBcInZhbHVlXCIpXG5cbiAgICAgICAgb25Db21wbGV0ZSA9IChvbmVEb2MpID0+XG4gICAgICAgICAgQGxvYWRlZERvY3MucHVzaCBvbmVEb2NcbiAgICAgICAgICB0b3RhbCA9IHJvd3MubGVuZ3RoXG4gICAgICAgICAgcmV0dXJuIHVubGVzcyBAbG9hZGVkRG9jcy5sZW5ndGggPT0gdG90YWxcblxuICAgICAgICAgIGh0bWwgPSBcIlwiXG4gICAgICAgICAgZG9jc0J5SWQgPSBfLmluZGV4QnkgXCJfaWRcIiwgQGxvYWRlZERvY3NcblxuICAgICAgICAgIGRvY0NvdW50ID0gMVxuICAgICAgICAgIGZvciBkb2NJZCwgZG9jIG9mIGRvY3NCeUlkXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICAgICAgPGI+RG9jdW1lbnQgQ29uZmxpY3QgI3tkb2NDb3VudH0gI3tkb2NbMF0uY29sbGVjdGlvbi5jYXBpdGFsaXplKCl9PC9iPlxuICAgICAgICAgICAgXCJcblxuICAgICAgICAgICAgY29tYmluZWQgPSB7fVxuICAgICAgICAgICAgZm9yIHJldiBpbiBkb2NcbiAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmV2XG4gICAgICAgICAgICAgICAgY29tYmluZWRba2V5XSA9IFtdIGlmIG5vdCBjb21iaW5lZFtrZXldP1xuICAgICAgICAgICAgICAgIGNvbWJpbmVkW2tleV0ucHVzaCBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcblxuICAgICAgICAgICAgZGlmZmVyZW5jZXMgPSBbXVxuICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgY29tYmluZWRcbiAgICAgICAgICAgICAgZGlmZmVyZW5jZXMucHVzaChrZXkpIGlmIF8udW5pcSh2YWx1ZSkubGVuZ3RoID4gMVxuXG4gICAgICAgICAgICByZXZDb3VudCA9IDFcbiAgICAgICAgICAgIGZvciByZXYgaW4gZG9jXG4gICAgICAgICAgICAgIHByZXNlbnRhYmxlcyA9IHt9XG4gICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHJldlxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIGlmIGtleSBpbiBbJ19yZXYnLCAnX2lkJywnaGFzaCcsJ3VwZGF0ZWQnLCdlZGl0ZWRCeScsIFwiYXNzZXNzbWVudElkXCIsIFwiY3VycmljdWx1bUlkXCJdXG4gICAgICAgICAgICAgICAgcHJlc2VudGFibGVzW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgICA8aDM+VmVyc2lvbiAje3JldkNvdW50Kyt9PC9oMz5cbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9J2NvbmZsaWN0X3RhYmxlJz5cbiAgICAgICAgICAgICAgICAgIDx0cj48dGQ+PGI+I3tyZXYubmFtZX08L2I+PC90ZD48dGQ+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBrZWVwJyBkYXRhLWRvY0lkPScje3Jldi5faWR9JyBkYXRhLWRvY1Jldj0nI3tyZXYuX3Jldn0nPktlZXA8L2J1dHRvbj48L3RkPjwvdHI+XG4gICAgICAgICAgICAgICAgICA8dHI+PHRoPlVwZGF0ZWQ8L3RoPjx0ZD4je3Jldi51cGRhdGVkfTwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICAgIDx0cj48dGg+RWRpdGVkIGJ5PC90aD48dGQ+I3tyZXYuZWRpdGVkQnl9PC90ZD48L3RyPlxuICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzaG93X2RldGFpbHMnIGRhdGEtZG9jUmV2PScje3Jldi5fcmV2fSc+U2hvdyBkZXRhaWxzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPSdjb25maXJtYXRpb24gY29uZmxpY3RfdGFibGUnIGlkPSd0YWJsZV8je3Jldi5fcmV2fSc+XG4gICAgICAgICAgICAgICAgXCJcbiAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcHJlc2VudGFibGVzXG4gICAgICAgICAgICAgICAgaEtleSA9XG4gICAgICAgICAgICAgICAgICBpZiBrZXkgaW4gZGlmZmVyZW5jZXNcbiAgICAgICAgICAgICAgICAgICAgXCI8YiBjbGFzcz0nY29uZmxpY3Rfa2V5Jz4je2tleX08L2I+XCJcbiAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj48dGg+I3toS2V5fTwvdGg+PHRkPiN7SlNPTi5zdHJpbmdpZnkodmFsdWUpfTwvdGQ+PC90cj5cIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcIlxuXG5cbiAgICAgICAgICAgIGRvY0NvdW50KytcbiAgICAgICAgICBcbiAgICAgICAgICBAJGVsLmZpbmQoXCIjY29uZmxpY3RzXCIpLmh0bWwgaHRtbFxuXG4gICAgICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgICAgICQuYWpheCBcbiAgICAgICAgICAgIHVybDogXCIvI3tUYW5nZXJpbmUuZGJfbmFtZX0vI3tyb3cuX2lkfT9yZXY9I3tyb3cuX3Jldn1cIlxuICAgICAgICAgICAgdHlwZTogXCJnZXRcIlxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICBzdWNjZXNzOiAoZG9jKSAtPiBvbkNvbXBsZXRlIGRvY1xuXG5cbiAgICAgICAgcmV0dXJuXG5cblxuICAgIHJldHVybiB7fVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgY2xlYXJUaW1lb3V0IEB0aW1lclxuXG4gIHJlbW92ZUNyZWRlbnRpYWxzOiAtPlxuICAgIFRhbmdlcmluZS5zZXR0aW5ncy51bnNldChcInNlcnZlcl91c2VyXCIpXG4gICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVuc2V0KFwic2VydmVyX3Bhc3NcIilcbiAgICBUYW5nZXJpbmUuc2V0dGluZ3Muc2F2ZSgpXG5cbiAgcmVhZHlUZW1wbGF0ZXM6IC0+XG4gICAgQGxvZ2luQnV0dG9uID0gXy50ZW1wbGF0ZShcInt7c3RhdHVzfX1cbiAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHNob3dfbG9naW4nPkxvZ2luPC9idXR0b24+PGJyPlxuICAgIDxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbiBsb2dpbl9ib3gnPlxuICAgICAgPGRpdj5cbiAgICAgICAgPGxhYmVsIGZvcj0ndXNlcic+VXNlcm5hbWU8L2xhYmVsPjxpbnB1dCBpZD0ndXNlcicgdHlwZT0ndGV4dCc+PGJyPlxuICAgICAgICA8bGFiZWwgZm9yPSdwYXNzJz5QYXNzd29yZDwvbGFiZWw+PGlucHV0IGlkPSdwYXNzJyB0eXBlPSdwYXNzd29yZCc+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgbG9naW4nPkxvZ2luPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgXCIpXG4iXX0=
