var CurriculumView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculumView = (function(_super) {

  __extends(CurriculumView, _super);

  function CurriculumView() {
    CurriculumView.__super__.constructor.apply(this, arguments);
  }

  CurriculumView.prototype.className = "CurriculumView";

  CurriculumView.prototype.events = {
    "click .back": "goBack",
    "click .delete": "deleteCurriculum",
    "click .delete_subtest": "deleteSubtest",
    "click .edit_in_place": "editInPlace",
    'click .new_subtest': "newSubtest",
    "focusout .editing": "editing",
    "keyup    .editing": "editing",
    "keydown  .editing": "editing"
  };

  CurriculumView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    this.subtests = options.subtests;
    this.totalAssessments = Math.max.apply(Math, this.subtests.pluck("part"));
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    return this.subtestProperties = [
      {
        "key": "part",
        "label": "Assessment",
        "editable": true
      }, {
        "key": "name",
        "label": "Name",
        "editable": true,
        "escaped": true
      }, {
        "key": "items",
        "label": "Items",
        "count": true,
        "editable": true
      }, {
        "key": "timer",
        "label": "Time<br>allowed",
        "editable": true
      }, {
        "key": "reportType",
        "label": "Report",
        "editable": true
      }
    ];
  };

  CurriculumView.prototype.render = function() {
    var deleteButton, html, subtestTable;
    subtestTable = this.getSubtestTable();
    deleteButton = Tangerine.settings.get("context") === "server" ? "<button class='command_red delete'>Delete</button>" : "";
    html = "      <button class='navigation back'>" + (t('back')) + "</button>      <h1>" + (this.options.curriculum.get('name')) + "</h1>      <div class='small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></div>            <div id='subtest_table_container'>        " + subtestTable + "      </div>      <button class='command new_subtest'>New Subtest</button>      <br><br>            " + deleteButton + "    ";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  CurriculumView.prototype.updateTable = function() {
    return this.$el.find("#subtest_table_container").html(this.getSubtestTable());
  };

  CurriculumView.prototype.getSubtestTable = function() {
    var editOrNot, html, numberOrNot, part, prop, subtest, subtests, value, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    html = "<table class='subtests'>";
    html += "      <thead class='auto_fixed'>        <tr>    ";
    _ref = this.subtestProperties;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prop = _ref[_i];
      html += "<th>" + prop.label + "</th>";
    }
    html += "        </tr>      </thead>    ";
    html += "      <tbody>    ";
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    _ref2 = this.subtestsByPart;
    for (part in _ref2) {
      subtests = _ref2[part];
      html += "<tr><td>&nbsp;</td></tr>";
      for (_j = 0, _len2 = subtests.length; _j < _len2; _j++) {
        subtest = subtests[_j];
        html += "<tr>";
        _ref3 = this.subtestProperties;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          prop = _ref3[_k];
          value = prop.key != null ? subtest.get(prop.key) : "&nbsp;";
          value = prop.escape ? subtest.escape(prop.key) : value;
          if (prop.count != null) value = value.length;
          if (!(value != null)) value = "";
          editOrNot = prop.editable && Tangerine.settings.get("context") === "server" ? "class='edit_in_place'" : "";
          numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
          html += "<td class='edit_in_place'><span data-subtestId='" + subtest.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</div></td>";
        }
        if (Tangerine.settings.get("context") === "server") {
          html += "            <td>              <a href='#class/subtest/" + subtest.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>              <img class='link_icon delete_subtest' title='Delete' data-subtestId='" + subtest.id + "' src='images/icon_delete.png'>            </td>";
        }
        html += "</tr>";
      }
    }
    html += "      </tbody>    </table>    ";
    return html;
  };

  CurriculumView.prototype.editInPlace = function(event) {
    var $span, $td, $textarea, guid, isNumber, key, oldValue, subtest, subtestId, transferVariables;
    if (this.alreadyEditing) return;
    this.alreadyEditing = true;
    $span = $(event.target);
    if ($span.prop("tagName") === "TD") {
      $span = $span.find("span");
      if ($span.length === 0) return;
    }
    $td = $span.parent();
    this.$oldSpan = $span.clone();
    if ($span.prop("tagName") === "TEXTAREA") return;
    guid = Utils.guid();
    key = $span.attr("data-key");
    isNumber = $span.attr("data-isNumber") === "true";
    subtestId = $span.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    if (key === 'items') oldValue = oldValue.join(" ");
    transferVariables = "data-isNumber='" + "' data-key='" + key + "' data-subtestId='" + subtestId + "' ";
    $td.html("<textarea id='" + guid + "' " + transferVariables + " class='editing'>" + oldValue + "</textarea>");
    $textarea = $("#" + guid);
    return $textarea.focus();
  };

  CurriculumView.prototype.editing = function(event) {
    var $target, $td, attributes, isNumber, key, newValue, oldValue, subtest, subtestId,
      _this = this;
    $target = $(event.target);
    $td = $target.parent();
    if (event.which === 27 || event.type === "focusout") {
      $target.remove();
      $td.html(this.$oldSpan);
      this.alreadyEditing = false;
      return;
    }
    if (!(event.which === 13 && event.type === "keydown")) return true;
    this.alreadyEditing = false;
    key = $target.attr("data-key");
    isNumber = $target.attr("data-isNumber") === "true";
    subtestId = $target.attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    oldValue = subtest.get(key);
    newValue = $target.val();
    newValue = isNumber ? parseInt(newValue) : newValue;
    if (key === "items") {
      newValue = newValue.replace(/\s+/g, ' ');
      if (/\t|,/.test(newValue)) {
        alert("Please remember\n\nGrid items are space \" \" delimited");
      }
      newValue = _.compact(newValue.split(" "));
    }
    if (String(newValue) !== String(oldValue)) {
      attributes = {};
      attributes[key] = newValue;
      subtest.save(attributes, {
        success: function() {
          Utils.midAlert("Subtest saved");
          return subtest.fetch({
            success: function() {
              return _this.updateTable();
            }
          });
        },
        error: function() {
          return subtest.fetch({
            success: function() {
              _this.updateTable();
              return alert("Please try to save again, it didn't work that time.");
            }
          });
        }
      });
    }
    return false;
  };

  CurriculumView.prototype.goBack = function() {
    return history.back();
  };

  CurriculumView.prototype.deleteCurriculum = function() {
    var _this = this;
    if (confirm("Delete curriculum\n" + (this.curriculum.get('name')) + "?")) {
      return this.curriculum.destroy(function() {
        return Tangerine.router.navigate("assessments", true);
      });
    }
  };

  CurriculumView.prototype.newSubtest = function() {
    var guid, protoTemps, subtest, subtestAttributes;
    guid = Utils.guid();
    subtestAttributes = {
      "_id": guid,
      "curriculumId": this.curriculum.id,
      "prototype": "grid",
      "captureLastAttempted": false,
      "endOfLine": false
    };
    protoTemps = Tangerine.templates.get("prototypes");
    subtestAttributes = $.extend(protoTemps["grid"], subtestAttributes);
    subtest = new Subtest(subtestAttributes);
    return subtest.save(null, {
      success: function() {
        return Tangerine.router.navigate("class/subtest/" + guid, true);
      },
      error: function() {
        return alert("Please try again. There was a problem creating the new subtest.");
      }
    });
  };

  CurriculumView.prototype.deleteSubtest = function(event) {
    var subtest, subtestId,
      _this = this;
    subtestId = $(event.target).attr("data-subtestId");
    subtest = this.subtests.get(subtestId);
    if (confirm("Delete subtest\n" + (subtest.get('name')) + "?")) {
      return subtest.destroy({
        success: function() {
          _this.subtests.remove(subtestId);
          return _this.updateTable();
        },
        error: function() {
          return alert("Please try again, could not delete subtest.");
        }
      });
    }
  };

  return CurriculumView;

})(Backbone.View);
