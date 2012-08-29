var CurriculumImportView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

CurriculumImportView = (function(_super) {

  __extends(CurriculumImportView, _super);

  function CurriculumImportView() {
    CurriculumImportView.__super__.constructor.apply(this, arguments);
  }

  CurriculumImportView.prototype.events = {
    'click .import': 'import',
    'click .back': 'back'
  };

  CurriculumImportView.prototype.back = function() {
    Tangerine.router.navigate("", true);
    return false;
  };

  CurriculumImportView.prototype["import"] = function() {
    var dKey, opts, repOps,
      _this = this;
    dKey = this.$el.find("#d_key").val();
    this.$el.find(".status").fadeIn(250);
    this.$el.find("#progress").html("Looking for " + dKey);
    repOps = {
      'filter': Tangerine.config.address.designDoc + '/importFilter',
      'create_target': true,
      'query_params': {
        'downloadKey': dKey
      }
    };
    opts = {
      success: function(a, b) {
        _this.$el.find("#progress").html("Import successful <h3>Imported</h3>");
        return $.couch.db("tangerine").view(Tangerine.config.address.designDoc + '/byDKey', {
          keys: [dKey],
          success: function(data) {
            var curriculumName, datum, doc, subtests, _i, _len, _ref;
            console.log(data);
            subtests = 0;
            curriculumName = "";
            _ref = data.rows;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              datum = _ref[_i];
              doc = datum.value;
              if (doc.collection === 'subtest') subtests++;
              if (doc.collection === 'curriculum') curriculumName = doc.name;
            }
            return _this.$el.find("#progress").append("              <div>" + assessmentName + "</div>              <div>Subtests - " + subtests + "</div>            ");
          },
          error: function(a, b, c) {
            return this.$el.find("#progress").html("<div>Error after data imported</div><div>" + a + "</div><div>" + b);
          }
        });
      },
      error: function(a, b) {
        return _this.$el.find("#progress").html("<div>Import error</div><div>" + a + "</div><div>" + b);
      }
    };
    $.couch.replicate(Tangerine.config.address.cloud.host + ":" + Tangerine.config.address.port + "/" + Tangerine.config.address.cloud.dbName, Tangerine.config.address.local.dbName, opts, repOps);
    return false;
  };

  CurriculumImportView.prototype.render = function() {
    this.$el.html("    <button class='back navigation'>Back</button>    <h1>Import Curriculum</h1>    <div class='question'>      <label for='d_key'>Download key</label>      <input id='d_key' value=''>      <button class='import command'>Import</button>    </div>    <div class='confirmation status'>      <h2>Status<h2>      <div class='info_box' id='progress'></div>    </div>    ");
    return this.trigger("rendered");
  };

  return CurriculumImportView;

})(Backbone.View);
