var Curriculum,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Curriculum = (function(_super) {

  __extends(Curriculum, _super);

  function Curriculum() {
    this.updateFromServer = __bind(this.updateFromServer, this);
    Curriculum.__super__.constructor.apply(this, arguments);
  }

  Curriculum.prototype.url = "curriculum";

  Curriculum.prototype.isArchived = function() {
    return false;
  };

  Curriculum.prototype.updateFromServer = function(dKey) {
    var dKeys,
      _this = this;
    if (dKey == null) dKey = this.id.substr(-5, 5);
    dKeys = JSON.stringify(dKey.replace(/[^a-f0-9]/g, " ").split(/\s+/));
    this.trigger("status", "import lookup");
    $.ajax(Tangerine.settings.urlView("group", "byDKey"), {
      type: "POST",
      dataType: "jsonp",
      data: {
        keys: dKeys
      },
      success: function(data) {
        var datum, docList, _i, _len, _ref;
        docList = [];
        _ref = data.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          datum = _ref[_i];
          docList.push(datum.id);
        }
        return $.couch.replicate(Tangerine.settings.urlDB("group"), Tangerine.settings.urlDB("local"), {
          success: function() {
            return _this.trigger("status", "import success");
          },
          error: function(a, b) {
            return _this.trigger("status", "import error", "" + a + " " + b);
          }
        }, {
          doc_ids: docList
        });
      }
    });
    return false;
  };

  Curriculum.prototype.destroy = function(callback) {
    var curriculumId, subtests,
      _this = this;
    curriculumId = this.id;
    subtests = new Subtests;
    subtests.fetch({
      key: curriculumId,
      success: function(collection) {
        var _results;
        _results = [];
        while (collection.length !== 0) {
          _results.push(collection.pop().destroy());
        }
        return _results;
      }
    });
    return Curriculum.__super__.destroy.call(this, {
      success: function() {
        return callback();
      }
    });
  };

  return Curriculum;

})(Backbone.Model);
