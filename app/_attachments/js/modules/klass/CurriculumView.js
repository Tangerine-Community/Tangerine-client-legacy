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
    "click .edit": "gotoEdit",
    'click .new_subtest': "newSubtest"
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

  CurriculumView.prototype.newSubtest = function() {
    var guid, subtest, subtestAttributes;
    guid = Utils.guid();
    subtestAttributes = {
      "_id": guid,
      "curriculumId": this.curriculum.id,
      "prototype": "grid",
      "captureLastAttempted": false,
      "endOfLine": false
    };
    subtestAttributes = $.extend(Tangerine.templates.prototypeTemplates["grid"], subtestAttributes);
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

  CurriculumView.prototype.deleteCurriculum = function() {
    var group,
      _this = this;
    if (confirm("Delete curriculum\n" + (this.curriculum.get('name')) + "?")) {
      group = this.curriculum.get("group");
      return this.curriculum.destroy(function() {
        return Tangerine.router.navigate("assessments/" + group, true);
      });
    }
  };

  CurriculumView.prototype.gotoEdit = function(event) {
    var subtestId;
    subtestId = $(event.target).attr("data-subtestId");
    return Tangerine.router.navigate("class/subtest/" + subtestId, true);
  };

  CurriculumView.prototype.editInPlace = function(event) {
    var $input, $td, guid, isNumber, key, oldValue, previousHTML, subtest,
      _this = this;
    $td = $(event.target);
    guid = Utils.guid();
    previousHTML = $td.html();
    key = $td.attr("data-key");
    subtest = this.subtests.get($td.attr("data-subtestId"));
    oldValue = subtest.get(key);
    isNumber = $td.attr("data-isNumber") === "true";
    if (key === 'items') oldValue = oldValue.join(" ");
    $td.html("<input id='" + guid + "' value='" + oldValue + "'>");
    $input = $("#" + guid);
    $input.focus();
    return $input.on("blur keyup", function(event) {
      var attributes, newValue;
      if (event.which === 27) {
        $input.off("blur keyup");
        $td.empty().html(previousHTML);
        return;
      }
      if (event.which !== 13) return true;
      $input.off("blur keyup");
      newValue = $input.val();
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
        return subtest.save(attributes, {
          success: function() {
            $td.empty().html(oldValue);
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
    });
  };

  CurriculumView.prototype.goBack = function() {
    return history.back();
  };

  CurriculumView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    this.subtests = options.subtests;
    this.totalAssessments = Math.max.apply(Math, this.subtests.pluck("part"));
    this.subtestsByPart = this.subtests.indexArrayBy("part");
    return this.subtestProperties = [
      {
        "key": null,
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
        "key": "part",
        "label": "Assessment",
        "editable": true
      }, {
        "key": "reportType",
        "label": "Report",
        "editable": true
      }
    ];
  };

  CurriculumView.prototype.updateTable = function() {
    return this.$el.find("#subtest_table_container").html(this.getSubtestTable());
  };

  CurriculumView.prototype.getSubtestTable = function() {
    var editOrNot, html, numberOrNot, part, prop, subtest, subtests, value, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    html = "<table class='subtests'>";
    html += "      <thead>        <tr>    ";
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
      html += "<tr class='auto_fixed'><th>" + part + "</th></tr>";
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
          editOrNot = prop.editable && Tangerine.settings.context === "server" ? "class='edit_in_place'" : "";
          numberOrNot = _.isNumber(value) ? "data-isNumber='true'" : "data-isNumber='false'";
          html += "<td data-subtestId='" + subtest.id + "' data-key='" + prop.key + "' data-value='" + value + "' " + editOrNot + " " + numberOrNot + ">" + value + "</td>";
        }
        if (Tangerine.settings.context === "server") {
          html += "            <td>              <img class='link_icon edit' title='Edit' data-subtestId='" + subtest.id + "' src='images/icon_edit.png'>              <img class='link_icon delete_subtest' title='Delete' data-subtestId='" + subtest.id + "' src='images/icon_delete.png'>            </td>";
        }
        html += "</tr>";
      }
    }
    html += "      </tbody>    </table>    ";
    return html;
  };

  CurriculumView.prototype.render = function() {
    var deleteButton, html, subtestTable;
    subtestTable = this.getSubtestTable();
    deleteButton = Tangerine.settings.context === "server" ? "<button class='command_red delete'>Delete</button>" : "";
    html = "      <button class='navigation back'>" + (t('back')) + "</button>      <h1>" + (this.options.curriculum.get('name')) + "</h1>      <div class='small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></div>            <div id='subtest_table_container'>        " + subtestTable + "      </div>      <button class='command new_subtest'>New Subtest</button>      <br><br>            " + deleteButton + "    ";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return CurriculumView;

})(Backbone.View);
