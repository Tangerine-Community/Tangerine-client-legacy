var AccountView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AccountView = (function(superClass) {
  extend(AccountView, superClass);

  function AccountView() {
    this.renderGroups = bind(this.renderGroups, this);
    return AccountView.__super__.constructor.apply(this, arguments);
  }

  AccountView.prototype.className = "AccountView";

  AccountView.prototype.events = {
    'click .leave': 'leaveGroup',
    'click .join_cancel': 'joinToggle',
    'click .join': 'joinToggle',
    'click .join_group': 'join',
    'click .back': 'goBack',
    'click .update': 'update',
    'click .restart': 'restart',
    'click .send_debug': 'sendDebug',
    "click .edit_in_place": "editInPlace",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing",
    'click .change_password': "togglePassword",
    'click .confirm_password': "saveNewPassword"
  };

  AccountView.prototype.togglePassword = function() {
    var $menu;
    $menu = this.$el.find(".password_menu");
    $menu.toggle();
    if ($menu.is(":visible")) {
      return this.$el.find("#new_password").focus().scrollTo();
    }
  };

  AccountView.prototype.saveNewPassword = function() {
    var pass;
    pass = this.$el.find(".new_password").val();
    Tangerine.user.setPassword(pass);
    return Tangerine.user.save(null, {
      success: (function(_this) {
        return function() {
          _this.$el.find(".new_password").val('');
          _this.togglePassword();
          return Utils.midAlert("Password changed");
        };
      })(this)
    });
  };

  AccountView.prototype.sendDebug = function() {
    return Tangerine.$db.view(Tangerine.design_doc + "/byCollection", {
      keys: ["teacher", "klass", "student", "config", "settings"],
      success: function(response) {
        var docId, saveReport;
        docId = "debug-report-" + (Tangerine.settings.get('instanceId'));
        saveReport = function(response, oldRev, docId) {
          var doc;
          if (oldRev == null) {
            oldRev = null;
          }
          doc = {
            _id: docId,
            _rev: oldRev,
            docs: _.pluck(response.rows, "value"),
            collection: "debug_report"
          };
          if (doc._rev == null) {
            delete doc._rev;
          }
          return Tangerine.$db.saveDoc(doc, {
            success: function() {
              return $.couch.replicate(Tangerine.db_name, Tangerine.settings.urlDB("group"), {
                success: function() {
                  return Utils.sticky("Debug report sent", "Ok");
                }
              }, {
                doc_ids: [docId]
              });
            }
          });
        };
        return Tangerine.$db.openDoc(docId, {
          success: function(oldDoc) {
            return saveReport(response, oldDoc._rev, docId);
          },
          error: function(error) {
            return saveReport(response, null, docId);
          }
        });
      }
    });
  };

  AccountView.prototype.update = function() {
    var doResolve;
    doResolve = this.$el.find("#attempt_resolve").is(":checked");
    return Utils.updateTangerine(doResolve);
  };

  AccountView.prototype.restart = function() {
    return Utils.restartTangerine();
  };

  AccountView.prototype.goBack = function() {
    if (Tangerine.settings.get("context") === "server") {
      return Tangerine.router.navigate("groups", true);
    } else {
      return window.history.back();
    }
  };

  AccountView.prototype.joinToggle = function() {
    this.$el.find(".join, .join_confirmation").fadeToggle(0);
    return this.$el.find("#group_name").val("");
  };

  AccountView.prototype.join = function() {
    var group;
    group = this.$el.find("#group_name").val().databaseSafetyDance();
    if (group.length === 0) {
      return;
    }
    return this.user.joinGroup(group, (function(_this) {
      return function() {
        return _this.joinToggle();
      };
    })(this));
  };

  AccountView.prototype.leaveGroup = function(event) {
    var group;
    group = $(event.target).parent().attr('data-group');
    return this.user.leaveGroup(group);
  };

  AccountView.prototype.initialize = function(options) {
    var models;
    this.user = options.user;
    this.teacher = options.teacher;
    models = [];
    if (this.user != null) {
      models.push(this.user);
    }
    if (this.teacher != null) {
      models.push(this.teacher);
    }
    this.models = new Backbone.Collection(models);
    return this.user.on("group-join group-leave group-refresh", this.renderGroups);
  };

  AccountView.prototype.renderGroups = function() {
    var group, html, i, len, ref;
    html = "<ul>";
    ref = this.user.get("groups") || [];
    for (i = 0, len = ref.length; i < len; i++) {
      group = ref[i];
      html += "<li data-group='" + (_.escape(group)) + "'>" + group + " <button class='command leave'>Leave</button></li>";
    }
    html += "</ul>";
    return this.$el.find("#group_wrapper").html(html);
  };

  AccountView.prototype.render = function() {
    var applicationMenu, groupSection, html, logsButton, passwordReset, settingsButton, teachersButton, userEdits;
    if (Tangerine.settings.get("context") === "server") {
      groupSection = "<section> <div class='label_value'> <label>Groups</label> <div id='group_wrapper'></div> <button class='command join'>Join or create a group</button> <div class='confirmation join_confirmation'> <div class='menu_box'> <input id='group_name' placeholder='Group name'> <div class='small_grey'>Please be specific.<br> Good examples: malawi_jun_2012, mike_test_group_2012, egra_group_aug-2012<br> Bad examples: group, test, mine</div><br> <button class='command join_group'>Join Group</button> <button class='command join_cancel'>Cancel</button> </div> </div> </section>";
    }
    if (Tangerine.settings.get("context") !== "server" && Tangerine.user.isAdmin()) {
      settingsButton = "<a href='#settings' class='navigation'><button class='navigation'>Settings</button></a>";
      logsButton = "<a href='#logs' class='navigation'><button class='navigation'>Logs</button></a>";
    }
    if (Tangerine.user.isAdmin() && Tangerine.settings.get("context") !== "server") {
      applicationMenu = "<section> <h2>Application</h2> <table class='menu_box'> <tr> <td><button class='command update'>Update</button></td> <td><input type='checkbox' id='attempt_resolve'></td> <td><label for='attempt_resolve'>Legacy method</label></td> </tr> </table><br> <button class='command restart'>Restart</button><br> <button class='command send_debug'>Send debug report</button> </section>";
    }
    if (Tangerine.user.isAdmin() && Tangerine.settings.get("context") === "class") {
      teachersButton = "<a href='#teachers' class='navigation'><button class='navigation'>Teachers</button></a>";
    }
    userEdits = "server" === Tangerine.settings.get("context") ? this.getEditableRow({
      key: "email",
      name: "Email"
    }, this.user) + this.getEditableRow({
      key: "first",
      name: "First name"
    }, this.user) + this.getEditableRow({
      key: "last",
      name: "Last name"
    }, this.user) : "mobile" === Tangerine.settings.get("context") ? this.getEditableRow({
      key: "email",
      name: "Email"
    }, this.user) : "class" === Tangerine.settings.get("context") ? this.getEditableRow({
      key: "first",
      name: "First name"
    }, this.teacher) + this.getEditableRow({
      key: "last",
      name: "Last name"
    }, this.teacher) + this.getEditableRow({
      key: "gender",
      name: "Gender"
    }, this.teacher) + this.getEditableRow({
      key: "school",
      name: "School"
    }, this.teacher) + this.getEditableRow({
      key: "contact",
      name: "Contact info"
    }, this.teacher) : void 0;
    if ("class" === Tangerine.settings.get("context")) {
      passwordReset = "<button class='change_password command'>Change password</button></td> <div class='password_menu' style='display:none;'> <label for='new_password'>New Password</label><br> <input id='new_password'><br> <button class='confirm_password command'>Change</button> </div>";
    }
    html = "<button class='back navigation'>Back</button> <h1>Manage</h1> " + (settingsButton || "") + " " + (logsButton || "") + " " + (teachersButton || "") + " " + (applicationMenu || "") + " <section> <h2>Account</h2> <table class='class_table'> <tr> <td style='color:black'>Name</td> <td style='color:black'>" + (this.user.name()) + "</td> </tr> " + (userEdits || '') + " </table> " + (passwordReset || '') + " </section> " + (groupSection || "") + " </div>";
    this.$el.html(html);
    if (Tangerine.settings.get("context") === "server") {
      this.renderGroups();
    }
    return this.trigger("rendered");
  };

  AccountView.prototype.getEditableRow = function(prop, model) {
    return "<tr><td>" + prop.name + "</td><td>" + (this.getEditable(prop, model)) + "</td></tr>";
  };

  AccountView.prototype.getEditable = function(prop, model) {
    var editOrNot, numberOrNot, value;
    value = prop.key != null ? model.get(prop.key) : "&nbsp;";
    value = prop.escape ? model.escape(prop.key) : value;
    if ((value == null) || _.isEmptyString(value)) {
      value = "not set";
    }
    editOrNot = prop.editable && Tangerine.settings.get("context") === "server" ? "class='edit_in_place'" : "";
    numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
    return "<div class='edit_in_place'><span data-modelId='" + model.id + "' data-key='" + prop.key + "' data-value='" + value + "' data-name='" + prop.name + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></div>";
  };

  AccountView.prototype.editInPlace = function(event) {
    var $span, $target, $td, $textarea, classes, guid, isNumber, key, margins, model, modelId, name, oldValue, transferVariables;
    if (this.alreadyEditing) {
      return;
    }
    this.alreadyEditing = true;
    $span = $(event.target);
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.hasClass("editing")) {
      return;
    }
    guid = Utils.guid();
    key = $span.attr("data-key");
    name = $span.attr("data-name");
    isNumber = $span.attr("data-isNumber") === "true";
    modelId = $span.attr("data-modelId");
    model = this.models.get(modelId);
    oldValue = model.get(key) || "";
    if (oldValue === "not set") {
      oldValue = "";
    }
    $target = $(event.target);
    classes = ($target.attr("class") || "").replace("settings", "");
    margins = $target.css("margin");
    transferVariables = "data-isNumber='" + isNumber + "' data-key='" + key + "' data-modelId='" + modelId + "' ";
    $td.html("<textarea placeholder='" + name + "' id='" + guid + "' rows='" + (1 + oldValue.count("\n")) + "' " + transferVariables + " class='editing " + classes + "' style='margin:" + margins + "' data-name='" + name + "'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  AccountView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, model, modelId, name, newValue, oldValue;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) {
      return true;
    }
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    modelId = $target.attr("data-modelId");
    name = $target.attr("data-name");
    model = this.models.get(modelId);
    oldValue = model.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      model.save(attributes, {
        success: (function(_this) {
          return function() {
            Utils.midAlert(name + " saved");
            return model.fetch({
              success: function() {
                if (_this.updateDisplay != null) {
                  return _this.updateDisplay();
                } else {
                  return _this.render();
                }
              }
            });
          };
        })(this),
        error: (function(_this) {
          return function() {
            return model.fetch({
              success: function() {
                if (_this.updateDisplay != null) {
                  _this.updateDisplay();
                } else {
                  _this.render();
                }
                return alert("Please try to save again, it didn't work that time.");
              }
            });
          };
        })(this)
      });
    }
    return false;
  };

  AccountView.prototype.goBack = function() {
    return window.history.back();
  };

  return AccountView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvdXNlci9BY2NvdW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7d0JBRUosU0FBQSxHQUFXOzt3QkFFWCxNQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQXVCLFlBQXZCO0lBQ0Esb0JBQUEsRUFBdUIsWUFEdkI7SUFFQSxhQUFBLEVBQXVCLFlBRnZCO0lBR0EsbUJBQUEsRUFBdUIsTUFIdkI7SUFJQSxhQUFBLEVBQXVCLFFBSnZCO0lBS0EsZUFBQSxFQUFrQixRQUxsQjtJQU1BLGdCQUFBLEVBQW1CLFNBTm5CO0lBT0EsbUJBQUEsRUFBc0IsV0FQdEI7SUFTQSxzQkFBQSxFQUEwQixhQVQxQjtJQVVBLG1CQUFBLEVBQXNCLFNBVnRCO0lBV0EsbUJBQUEsRUFBc0IsU0FYdEI7SUFZQSxtQkFBQSxFQUFzQixTQVp0QjtJQWNBLHdCQUFBLEVBQTJCLGdCQWQzQjtJQWVBLHlCQUFBLEVBQTRCLGlCQWY1Qjs7O3dCQWlCRixjQUFBLEdBQWdCLFNBQUE7QUFDZCxRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWO0lBQ1IsS0FBSyxDQUFDLE1BQU4sQ0FBQTtJQUNBLElBQUcsS0FBSyxDQUFDLEVBQU4sQ0FBUyxVQUFULENBQUg7YUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBQTBCLENBQUMsS0FBM0IsQ0FBQSxDQUFrQyxDQUFDLFFBQW5DLENBQUEsRUFERjs7RUFIYzs7d0JBT2hCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLEdBQTNCLENBQUE7SUFDUCxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQWYsQ0FBMkIsSUFBM0I7V0FDQSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQWYsQ0FBb0Is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QUFpQixRQUFBLENBQVMsUUFBVCxDQUFqQixHQUF5QztJQUdwRCxJQUFHLE1BQUEsQ0FBTyxRQUFQLENBQUEsS0FBb0IsTUFBQSxDQUFPLFFBQVAsQ0FBdkI7TUFDRSxVQUFBLEdBQWE7TUFDYixVQUFXLENBQUEsR0FBQSxDQUFYLEdBQWtCO01BQ2xCLEtBQUssQ0FBQyxJQUFOLENBQVcsVUFBWCxFQUNFO1FBQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDUCxLQUFLLENBQUMsUUFBTixDQUFrQixJQUFELEdBQU0sUUFBdkI7bUJBQ0EsS0FBSyxDQUFDLEtBQU4sQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO2dCQUNQLElBQUcsMkJBQUg7eUJBQ0UsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQURGO2lCQUFBLE1BQUE7eUJBR0UsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUhGOztjQURPLENBQVQ7YUFERjtVQUZPO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO1FBUUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0wsS0FBSyxDQUFDLEtBQU4sQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO2dCQUNQLElBQUcsMkJBQUg7a0JBQ0UsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQURGO2lCQUFBLE1BQUE7a0JBR0UsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUhGOzt1QkFNQSxLQUFBLENBQU0scURBQU47Y0FQTyxDQUFUO2FBREY7VUFESztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSUDtPQURGLEVBSEY7O0FBd0JBLFdBQU87RUF2REE7O3dCQXlEVCxNQUFBLEdBQVEsU0FBQTtXQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixDQUFBO0VBRE07Ozs7R0FqVmdCLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3VzZXIvQWNjb3VudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBY2NvdW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiQWNjb3VudFZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmxlYXZlJyAgICAgICA6ICdsZWF2ZUdyb3VwJ1xuICAgICdjbGljayAuam9pbl9jYW5jZWwnIDogJ2pvaW5Ub2dnbGUnXG4gICAgJ2NsaWNrIC5qb2luJyAgICAgICAgOiAnam9pblRvZ2dsZSdcbiAgICAnY2xpY2sgLmpvaW5fZ3JvdXAnICA6ICdqb2luJ1xuICAgICdjbGljayAuYmFjaycgICAgICAgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLnVwZGF0ZScgOiAndXBkYXRlJ1xuICAgICdjbGljayAucmVzdGFydCcgOiAncmVzdGFydCdcbiAgICAnY2xpY2sgLnNlbmRfZGVidWcnIDogJ3NlbmREZWJ1ZydcblxuICAgIFwiY2xpY2sgLmVkaXRfaW5fcGxhY2VcIiAgOiBcImVkaXRJblBsYWNlXCJcbiAgICBcImZvY3Vzb3V0IC5lZGl0aW5nXCIgOiBcImVkaXRpbmdcIlxuICAgIFwia2V5dXAgICAgLmVkaXRpbmdcIiA6IFwiZWRpdGluZ1wiXG4gICAgXCJrZXlkb3duICAuZWRpdGluZ1wiIDogXCJlZGl0aW5nXCJcblxuICAgICdjbGljayAuY2hhbmdlX3Bhc3N3b3JkJyA6IFwidG9nZ2xlUGFzc3dvcmRcIlxuICAgICdjbGljayAuY29uZmlybV9wYXNzd29yZCcgOiBcInNhdmVOZXdQYXNzd29yZFwiXG5cbiAgdG9nZ2xlUGFzc3dvcmQ6IC0+IFxuICAgICRtZW51ID0gQCRlbC5maW5kKFwiLnBhc3N3b3JkX21lbnVcIilcbiAgICAkbWVudS50b2dnbGUoKVxuICAgIGlmICRtZW51LmlzKFwiOnZpc2libGVcIilcbiAgICAgIEAkZWwuZmluZChcIiNuZXdfcGFzc3dvcmRcIikuZm9jdXMoKS5zY3JvbGxUbygpXG5cblxuICBzYXZlTmV3UGFzc3dvcmQ6IC0+XG4gICAgcGFzcyA9IEAkZWwuZmluZChcIi5uZXdfcGFzc3dvcmRcIikudmFsKClcbiAgICBUYW5nZXJpbmUudXNlci5zZXRQYXNzd29yZChwYXNzKVxuICAgIFRhbmdlcmluZS51c2VyLnNhdmUgbnVsbCxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEAkZWwuZmluZChcIi5uZXdfcGFzc3dvcmRcIikudmFsKCcnKVxuICAgICAgICBAdG9nZ2xlUGFzc3dvcmQoKVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIlBhc3N3b3JkIGNoYW5nZWRcIlxuXG5cbiAgc2VuZERlYnVnOiAtPlxuICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L2J5Q29sbGVjdGlvblwiXG4gICAgLFxuXG4gICAgICBrZXlzOiBbXCJ0ZWFjaGVyXCIsIFwia2xhc3NcIiwgXCJzdHVkZW50XCIsIFwiY29uZmlnXCIsIFwic2V0dGluZ3NcIl1cblxuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRvY0lkID0gXCJkZWJ1Zy1yZXBvcnQtI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdpbnN0YW5jZUlkJyl9XCJcblxuICAgICAgICBzYXZlUmVwb3J0ID0gKHJlc3BvbnNlLCBvbGRSZXYgPSBudWxsLCBkb2NJZCkgLT5cbiAgICAgICAgICBkb2MgPVxuICAgICAgICAgICAgX2lkICAgICAgICA6IGRvY0lkXG4gICAgICAgICAgICBfcmV2ICAgICAgIDogb2xkUmV2XG4gICAgICAgICAgICBkb2NzICAgICAgIDogXy5wbHVjayhyZXNwb25zZS5yb3dzLFwidmFsdWVcIilcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gOiBcImRlYnVnX3JlcG9ydFwiXG5cbiAgICAgICAgICBkZWxldGUgZG9jLl9yZXYgdW5sZXNzIGRvYy5fcmV2P1xuXG4gICAgICAgICAgVGFuZ2VyaW5lLiRkYi5zYXZlRG9jIGRvYywgXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZSBUYW5nZXJpbmUuZGJfbmFtZSwgVGFuZ2VyaW5lLnNldHRpbmdzLnVybERCKFwiZ3JvdXBcIiksXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkRlYnVnIHJlcG9ydCBzZW50XCIsIFwiT2tcIlxuICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgZG9jX2lkczogW2RvY0lkXVxuXG5cbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvY0lkLCBcbiAgICAgICAgICBzdWNjZXNzOiAob2xkRG9jKSAtPlxuICAgICAgICAgICAgc2F2ZVJlcG9ydCByZXNwb25zZSwgb2xkRG9jLl9yZXYsIGRvY0lkXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgIHNhdmVSZXBvcnQgcmVzcG9uc2UsIG51bGwsIGRvY0lkXG5cblxuICB1cGRhdGU6IC0+XG4gICAgZG9SZXNvbHZlID0gQCRlbC5maW5kKFwiI2F0dGVtcHRfcmVzb2x2ZVwiKS5pcyhcIjpjaGVja2VkXCIpXG4gICAgXG4gICAgVXRpbHMudXBkYXRlVGFuZ2VyaW5lKGRvUmVzb2x2ZSlcblxuICByZXN0YXJ0OiAtPlxuICAgIFV0aWxzLnJlc3RhcnRUYW5nZXJpbmUoKVxuXG4gIGdvQmFjazogLT5cbiAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSA9PSBcInNlcnZlclwiXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcbiAgICBlbHNlXG4gICAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcblxuICBqb2luVG9nZ2xlOiAtPlxuICAgIEAkZWwuZmluZChcIi5qb2luLCAuam9pbl9jb25maXJtYXRpb25cIikuZmFkZVRvZ2dsZSgwKVxuICAgIEAkZWwuZmluZChcIiNncm91cF9uYW1lXCIpLnZhbCBcIlwiXG5cbiAgam9pbjogLT5cbiAgICBncm91cCA9IEAkZWwuZmluZChcIiNncm91cF9uYW1lXCIpLnZhbCgpLmRhdGFiYXNlU2FmZXR5RGFuY2UoKVxuICAgIHJldHVybiBpZiBncm91cC5sZW5ndGggPT0gMFxuICAgIEB1c2VyLmpvaW5Hcm91cCBncm91cCwgPT5cbiAgICAgIEBqb2luVG9nZ2xlKClcblxuICBsZWF2ZUdyb3VwOiAoZXZlbnQpIC0+XG4gICAgZ3JvdXAgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpXG4gICAgQHVzZXIubGVhdmVHcm91cCBncm91cFxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICBAdXNlciA9IG9wdGlvbnMudXNlclxuICAgIEB0ZWFjaGVyID0gb3B0aW9ucy50ZWFjaGVyXG5cbiAgICBtb2RlbHMgPSBbXVxuICAgIG1vZGVscy5wdXNoIEB1c2VyIGlmIEB1c2VyP1xuICAgIG1vZGVscy5wdXNoIEB0ZWFjaGVyIGlmIEB0ZWFjaGVyP1xuXG4gICAgQG1vZGVscyA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKG1vZGVscylcbiAgICBAdXNlci5vbiBcImdyb3VwLWpvaW4gZ3JvdXAtbGVhdmUgZ3JvdXAtcmVmcmVzaFwiLCBAcmVuZGVyR3JvdXBzXG4gIFxuICByZW5kZXJHcm91cHM6ID0+XG4gICAgaHRtbCA9IFwiPHVsPlwiXG4gICAgZm9yIGdyb3VwIGluIChAdXNlci5nZXQoXCJncm91cHNcIikgfHwgW10pXG4gICAgICBodG1sICs9IFwiPGxpIGRhdGEtZ3JvdXA9JyN7Xy5lc2NhcGUoZ3JvdXApfSc+I3tncm91cH0gPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBsZWF2ZSc+TGVhdmU8L2J1dHRvbj48L2xpPlwiXG4gICAgaHRtbCArPSBcIjwvdWw+XCJcbiAgICBAJGVsLmZpbmQoXCIjZ3JvdXBfd3JhcHBlclwiKS5odG1sIGh0bWxcblxuICByZW5kZXI6IC0+XG5cbiAgICBncm91cFNlY3Rpb24gPSBcIlxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWw+R3JvdXBzPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGlkPSdncm91cF93cmFwcGVyJz48L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGpvaW4nPkpvaW4gb3IgY3JlYXRlIGEgZ3JvdXA8L2J1dHRvbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24gam9pbl9jb25maXJtYXRpb24nPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgICA8aW5wdXQgaWQ9J2dyb3VwX25hbWUnIHBsYWNlaG9sZGVyPSdHcm91cCBuYW1lJz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nc21hbGxfZ3JleSc+UGxlYXNlIGJlIHNwZWNpZmljLjxicj5cbiAgICAgICAgICAgICAgR29vZCBleGFtcGxlczogbWFsYXdpX2p1bl8yMDEyLCBtaWtlX3Rlc3RfZ3JvdXBfMjAxMiwgZWdyYV9ncm91cF9hdWctMjAxMjxicj5cbiAgICAgICAgICAgICAgQmFkIGV4YW1wbGVzOiBncm91cCwgdGVzdCwgbWluZTwvZGl2Pjxicj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBqb2luX2dyb3VwJz5Kb2luIEdyb3VwPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQgam9pbl9jYW5jZWwnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICBcIiBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSA9PSBcInNlcnZlclwiXG5cblxuICAgIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpICE9IFwic2VydmVyXCIgJiYgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICBzZXR0aW5nc0J1dHRvbiA9IFwiPGEgaHJlZj0nI3NldHRpbmdzJyBjbGFzcz0nbmF2aWdhdGlvbic+PGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbic+U2V0dGluZ3M8L2J1dHRvbj48L2E+XCJcbiAgICAgIGxvZ3NCdXR0b24gPSBcIjxhIGhyZWY9JyNsb2dzJyBjbGFzcz0nbmF2aWdhdGlvbic+PGJ1dHRvbiBjbGFzcz0nbmF2aWdhdGlvbic+TG9nczwvYnV0dG9uPjwvYT5cIlxuXG4gICAgYXBwbGljYXRpb25NZW51ID0gXCJcbiAgICAgIDxzZWN0aW9uPlxuICAgICAgICA8aDI+QXBwbGljYXRpb248L2gyPlxuICAgICAgICA8dGFibGUgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB1cGRhdGUnPlVwZGF0ZTwvYnV0dG9uPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PGlucHV0IHR5cGU9J2NoZWNrYm94JyBpZD0nYXR0ZW1wdF9yZXNvbHZlJz48L3RkPlxuICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9J2F0dGVtcHRfcmVzb2x2ZSc+TGVnYWN5IG1ldGhvZDwvbGFiZWw+PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPjxicj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCByZXN0YXJ0Jz5SZXN0YXJ0PC9idXR0b24+PGJyPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHNlbmRfZGVidWcnPlNlbmQgZGVidWcgcmVwb3J0PC9idXR0b24+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIFxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKSAmJiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSAhPSBcInNlcnZlclwiXG5cbiAgICB0ZWFjaGVyc0J1dHRvbiA9IFwiXG4gICAgICA8YSBocmVmPScjdGVhY2hlcnMnIGNsYXNzPSduYXZpZ2F0aW9uJz48YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uJz5UZWFjaGVyczwvYnV0dG9uPjwvYT5cbiAgICBcIiBpZiBUYW5nZXJpbmUudXNlci5pc0FkbWluKCkgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJjbGFzc1wiXG5cbiAgICB1c2VyRWRpdHMgPSBcbiAgICAgIGlmIFwic2VydmVyXCIgaXMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIilcbiAgICAgICAgQGdldEVkaXRhYmxlUm93KHtrZXk6XCJlbWFpbFwiLCBuYW1lOlwiRW1haWxcIn0sIEB1c2VyKSArXG4gICAgICAgIEBnZXRFZGl0YWJsZVJvdyh7a2V5OlwiZmlyc3RcIiwgbmFtZTpcIkZpcnN0IG5hbWVcIn0sIEB1c2VyKSArXG4gICAgICAgIEBnZXRFZGl0YWJsZVJvdyh7a2V5OlwibGFzdFwiLCBuYW1lOlwiTGFzdCBuYW1lXCJ9LCBAdXNlcilcblxuICAgICAgZWxzZSBpZiBcIm1vYmlsZVwiIGlzIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpXG4gICAgICAgIEBnZXRFZGl0YWJsZVJvdyh7a2V5OlwiZW1haWxcIiwgbmFtZTpcIkVtYWlsXCJ9LCBAdXNlcilcblxuICAgICAgZWxzZSBpZiBcImNsYXNzXCIgaXMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIilcbiAgICAgICAgQGdldEVkaXRhYmxlUm93KHtrZXk6XCJmaXJzdFwiLCAgIG5hbWU6XCJGaXJzdCBuYW1lXCJ9LCBAdGVhY2hlcikgICArXG4gICAgICAgIEBnZXRFZGl0YWJsZVJvdyh7a2V5OlwibGFzdFwiLCAgICBuYW1lOlwiTGFzdCBuYW1lXCJ9LCBAdGVhY2hlcikgICAgK1xuICAgICAgICBAZ2V0RWRpdGFibGVSb3coe2tleTpcImdlbmRlclwiLCAgbmFtZTpcIkdlbmRlclwifSwgQHRlYWNoZXIpICAgICAgICtcbiAgICAgICAgQGdldEVkaXRhYmxlUm93KHtrZXk6XCJzY2hvb2xcIiwgIG5hbWU6XCJTY2hvb2xcIn0sIEB0ZWFjaGVyKSAgICAgICArXG4gICAgICAgIEBnZXRFZGl0YWJsZVJvdyh7a2V5OlwiY29udGFjdFwiLCBuYW1lOlwiQ29udGFjdCBpbmZvXCJ9LCBAdGVhY2hlcilcbiAgICBcbiAgICBwYXNzd29yZFJlc2V0ID0gXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2NoYW5nZV9wYXNzd29yZCBjb21tYW5kJz5DaGFuZ2UgcGFzc3dvcmQ8L2J1dHRvbj48L3RkPlxuICAgICAgPGRpdiBjbGFzcz0ncGFzc3dvcmRfbWVudScgc3R5bGU9J2Rpc3BsYXk6bm9uZTsnPlxuICAgICAgICA8bGFiZWwgZm9yPSduZXdfcGFzc3dvcmQnPk5ldyBQYXNzd29yZDwvbGFiZWw+PGJyPlxuICAgICAgICA8aW5wdXQgaWQ9J25ld19wYXNzd29yZCc+PGJyPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb25maXJtX3Bhc3N3b3JkIGNvbW1hbmQnPkNoYW5nZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgXCIgaWYgXCJjbGFzc1wiIGlzIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpXG5cbiAgICBodG1sID0gXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPlxuICAgICAgPGgxPk1hbmFnZTwvaDE+XG4gICAgICAje3NldHRpbmdzQnV0dG9uIHx8IFwiXCJ9XG4gICAgICAje2xvZ3NCdXR0b24gfHwgXCJcIn1cbiAgICAgICN7dGVhY2hlcnNCdXR0b24gfHwgXCJcIn1cbiAgICAgIFxuICAgICAgI3thcHBsaWNhdGlvbk1lbnUgfHwgXCJcIn1cblxuICAgICAgPHNlY3Rpb24+XG4gICAgICAgIDxoMj5BY2NvdW50PC9oMj5cbiAgICAgICAgICA8dGFibGUgY2xhc3M9J2NsYXNzX3RhYmxlJz5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIHN0eWxlPSdjb2xvcjpibGFjayc+TmFtZTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZCBzdHlsZT0nY29sb3I6YmxhY2snPiN7QHVzZXIubmFtZSgpfTwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgI3t1c2VyRWRpdHMgfHwgJyd9XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAje3Bhc3N3b3JkUmVzZXQgfHwgJyd9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgICAje2dyb3VwU2VjdGlvbiB8fCBcIlwifVxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG4gICAgQHJlbmRlckdyb3VwcygpIGlmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpID09IFwic2VydmVyXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiAgZ2V0RWRpdGFibGVSb3c6IChwcm9wLCBtb2RlbCkgLT5cbiAgICBcIjx0cj48dGQ+I3twcm9wLm5hbWV9PC90ZD48dGQ+I3tAZ2V0RWRpdGFibGUocHJvcCwgbW9kZWwpfTwvdGQ+PC90cj5cIlxuXG4gIGdldEVkaXRhYmxlOiAocHJvcCwgbW9kZWwpIC0+XG5cbiAgICAjIGNvb2sgdGhlIHZhbHVlXG4gICAgdmFsdWUgPSBpZiBwcm9wLmtleT8gICB0aGVuIG1vZGVsLmdldChwcm9wLmtleSkgICAgZWxzZSBcIiZuYnNwO1wiXG4gICAgdmFsdWUgPSBpZiBwcm9wLmVzY2FwZSB0aGVuIG1vZGVsLmVzY2FwZShwcm9wLmtleSkgZWxzZSB2YWx1ZVxuICAgIHZhbHVlID0gXCJub3Qgc2V0XCIgaWYgbm90IHZhbHVlPyBvciBfLmlzRW1wdHlTdHJpbmcodmFsdWUpXG5cbiAgICAjIHdoYXQgaXMgaXRcbiAgICBlZGl0T3JOb3QgICA9IGlmIHByb3AuZWRpdGFibGUgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJzZXJ2ZXJcIiB0aGVuIFwiY2xhc3M9J2VkaXRfaW5fcGxhY2UnXCIgZWxzZSBcIlwiXG5cbiAgICBudW1iZXJPck5vdCA9IGlmIF8uaXNOdW1iZXIodmFsdWUpIHRoZW4gXCJkYXRhLWlzTnVtYmVyPSd0cnVlJ1wiIGVsc2UgXCJkYXRhLWlzTnVtYmVyPSdmYWxzZSdcIiBcblxuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9J2VkaXRfaW5fcGxhY2UnPjxzcGFuIGRhdGEtbW9kZWxJZD0nI3ttb2RlbC5pZH0nIGRhdGEta2V5PScje3Byb3Aua2V5fScgZGF0YS12YWx1ZT0nI3t2YWx1ZX0nIGRhdGEtbmFtZT0nI3twcm9wLm5hbWV9JyAje2VkaXRPck5vdH0gI3tudW1iZXJPck5vdH0+I3t2YWx1ZX08L2Rpdj48L2Rpdj5cIlxuXG5cbiAgZWRpdEluUGxhY2U6IChldmVudCkgLT5cblxuICAgIHJldHVybiBpZiBAYWxyZWFkeUVkaXRpbmdcbiAgICBAYWxyZWFkeUVkaXRpbmcgPSB0cnVlXG5cbiAgICAjIHNhdmUgc3RhdGVcbiAgICAjIHJlcGxhY2Ugd2l0aCB0ZXh0IGFyZWFcbiAgICAjIG9uIHNhdmUsIHNhdmUgYW5kIHJlLXJlcGxhY2VcbiAgICAkc3BhbiA9ICQoZXZlbnQudGFyZ2V0KVxuXG4gICAgJHRkICA9ICRzcGFuLnBhcmVudCgpXG5cbiAgICBAJG9sZFNwYW4gPSAkc3Bhbi5jbG9uZSgpXG5cbiAgICByZXR1cm4gaWYgJHNwYW4uaGFzQ2xhc3MoXCJlZGl0aW5nXCIpXG5cbiAgICBndWlkICAgICA9IFV0aWxzLmd1aWQoKVxuXG4gICAga2V5ICAgICAgPSAkc3Bhbi5hdHRyKFwiZGF0YS1rZXlcIilcbiAgICBuYW1lICAgICA9ICRzcGFuLmF0dHIoXCJkYXRhLW5hbWVcIilcbiAgICBpc051bWJlciA9ICRzcGFuLmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICBtb2RlbElkICA9ICRzcGFuLmF0dHIoXCJkYXRhLW1vZGVsSWRcIilcbiAgICBtb2RlbCAgICA9IEBtb2RlbHMuZ2V0KG1vZGVsSWQpXG4gICAgb2xkVmFsdWUgPSBtb2RlbC5nZXQoa2V5KSB8fCBcIlwiXG4gICAgb2xkVmFsdWUgPSBcIlwiIGlmIG9sZFZhbHVlID09IFwibm90IHNldFwiXG5cbiAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgY2xhc3NlcyA9ICgkdGFyZ2V0LmF0dHIoXCJjbGFzc1wiKSB8fCBcIlwiKS5yZXBsYWNlKFwic2V0dGluZ3NcIixcIlwiKVxuICAgIG1hcmdpbnMgPSAkdGFyZ2V0LmNzcyhcIm1hcmdpblwiKVxuXG4gICAgdHJhbnNmZXJWYXJpYWJsZXMgPSBcImRhdGEtaXNOdW1iZXI9JyN7aXNOdW1iZXJ9JyBkYXRhLWtleT0nI3trZXl9JyBkYXRhLW1vZGVsSWQ9JyN7bW9kZWxJZH0nIFwiXG5cbiAgICAjIHNldHMgd2lkdGgvaGVpZ2h0IHdpdGggc3R5bGUgYXR0cmlidXRlXG4gICAgJHRkLmh0bWwoXCI8dGV4dGFyZWEgcGxhY2Vob2xkZXI9JyN7bmFtZX0nIGlkPScje2d1aWR9JyByb3dzPScjezErb2xkVmFsdWUuY291bnQoXCJcXG5cIil9JyAje3RyYW5zZmVyVmFyaWFibGVzfSBjbGFzcz0nZWRpdGluZyAje2NsYXNzZXN9JyBzdHlsZT0nbWFyZ2luOiN7bWFyZ2luc30nIGRhdGEtbmFtZT0nI3tuYW1lfSc+I3tvbGRWYWx1ZX08L3RleHRhcmVhPlwiKVxuICAgICMgc3R5bGU9J3dpZHRoOiN7b2xkV2lkdGh9cHg7IGhlaWdodDogI3tvbGRIZWlnaHR9cHg7J1xuICAgICR0ZXh0YXJlYSA9ICQoXCIjI3tndWlkfVwiKVxuICAgICR0ZXh0YXJlYS5mb2N1cygpXG5cbiAgZWRpdGluZzogKGV2ZW50KSAtPlxuXG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgICR0ZCA9ICR0YXJnZXQucGFyZW50KClcblxuICAgIGlmIGV2ZW50LndoaWNoID09IDI3IG9yIGV2ZW50LnR5cGUgPT0gXCJmb2N1c291dFwiXG4gICAgICAkdGFyZ2V0LnJlbW92ZSgpXG4gICAgICAkdGQuaHRtbChAJG9sZFNwYW4pXG4gICAgICBAYWxyZWFkeUVkaXRpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICAjIGFjdCBub3JtYWwsIHVubGVzcyBpdCdzIGFuIGVudGVyIGtleSBvbiBrZXlkb3duXG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzIGFuZCBldmVudC50eXBlID09IFwia2V5ZG93blwiXG5cbiAgICAjcmV0dXJuIHRydWUgaWYgZXZlbnQud2hpY2ggPT0gMTMgYW5kIGV2ZW50LmFsdEtleVxuXG4gICAgQGFscmVhZHlFZGl0aW5nID0gZmFsc2VcblxuICAgIGtleSAgICAgICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWtleVwiKVxuICAgIGlzTnVtYmVyICAgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLWlzTnVtYmVyXCIpID09IFwidHJ1ZVwiXG5cbiAgICBtb2RlbElkICAgID0gJHRhcmdldC5hdHRyKFwiZGF0YS1tb2RlbElkXCIpXG4gICAgbmFtZSAgICAgICA9ICR0YXJnZXQuYXR0cihcImRhdGEtbmFtZVwiKVxuXG4gICAgbW9kZWwgICAgICA9IEBtb2RlbHMuZ2V0KG1vZGVsSWQpXG4gICAgb2xkVmFsdWUgICA9IG1vZGVsLmdldChrZXkpXG5cbiAgICBuZXdWYWx1ZSA9ICR0YXJnZXQudmFsKClcbiAgICBuZXdWYWx1ZSA9IGlmIGlzTnVtYmVyIHRoZW4gcGFyc2VJbnQobmV3VmFsdWUpIGVsc2UgbmV3VmFsdWVcblxuICAgICMgSWYgdGhlcmUgd2FzIGEgY2hhbmdlLCBzYXZlIGl0XG4gICAgaWYgU3RyaW5nKG5ld1ZhbHVlKSAhPSBTdHJpbmcob2xkVmFsdWUpXG4gICAgICBhdHRyaWJ1dGVzID0ge31cbiAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IG5ld1ZhbHVlXG4gICAgICBtb2RlbC5zYXZlIGF0dHJpYnV0ZXMsXG4gICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje25hbWV9IHNhdmVkXCJcbiAgICAgICAgICBtb2RlbC5mZXRjaCBcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIGlmIEB1cGRhdGVEaXNwbGF5P1xuICAgICAgICAgICAgICAgIEB1cGRhdGVEaXNwbGF5KClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEByZW5kZXIoKVxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBtb2RlbC5mZXRjaCBcbiAgICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICAgIGlmIEB1cGRhdGVEaXNwbGF5P1xuICAgICAgICAgICAgICAgIEB1cGRhdGVEaXNwbGF5KClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEByZW5kZXIoKVxuICAgICAgICAgICAgICAjIGlkZWFsbHkgd2Ugd291bGRuJ3QgaGF2ZSB0byBzYXZlIHRoaXMgYnV0IGNvbmZsaWN0cyBoYXBwZW4gc29tZXRpbWVzXG4gICAgICAgICAgICAgICMgQFRPRE8gbWFrZSB0aGUgbW9kZWwgdHJ5IGFnYWluIHdoZW4gdW5zdWNjZXNzZnVsLlxuICAgICAgICAgICAgICBhbGVydCBcIlBsZWFzZSB0cnkgdG8gc2F2ZSBhZ2FpbiwgaXQgZGlkbid0IHdvcmsgdGhhdCB0aW1lLlwiXG4gICAgXG4gICAgIyB0aGlzIGVuc3VyZXMgd2UgZG8gbm90IGluc2VydCBhIG5ld2xpbmUgY2hhcmFjdGVyIHdoZW4gd2UgcHJlc3MgZW50ZXJcbiAgICByZXR1cm4gZmFsc2VcblxuICBnb0JhY2s6IC0+XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG4iXX0=
