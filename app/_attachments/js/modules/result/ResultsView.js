var ResultsView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResultsView = (function(_super) {

  __extends(ResultsView, _super);

  function ResultsView() {
    this.afterRender = __bind(this.afterRender, this);
    this.updateOptions = __bind(this.updateOptions, this);
    this.detectTablets = __bind(this.detectTablets, this);
    ResultsView.__super__.constructor.apply(this, arguments);
  }

  ResultsView.prototype.events = {
    'click .cloud': 'cloud',
    'click .csv': 'csv',
    'click .tablets': 'tablets',
    'click .detect': 'detectOptions'
  };

  ResultsView.prototype.cloud = function() {
    var ajaxOptions, replicationOptions,
      _this = this;
    if (!this.available.cloud) {
      Utils.midAlert("Cannot detect cloud");
      return false;
    }
    this.$el.find(".status").find(".info_box").html("");
    ajaxOptions = {
      success: function() {
        return _this.$el.find(".status").find(".info_box").html("Results uploaded successfully");
      },
      error: function(res) {
        return _this.$el.find(".status").find(".info_box").html("<div>Upload error</div><div>" + res + "</div>");
      }
    };
    replicationOptions = {
      filter: Tangerine.config.address.local.dbName + "/resultFilter",
      query_params: {
        assessmentId: this.assessment.id
      }
    };
    return $.couch.replicate(Tangerine.config.address.local.dbName, Tangerine.config.address.cloud.host + "/" + Tangerine.config.address.cloud.dbName, ajaxOptions, replicationOptions);
  };

  ResultsView.prototype.tablets = function() {
    var ip, _fn, _i, _len, _ref;
    console.log("Syncing to " + this.availableTablets + " tablets");
    if (!this.available.tablets.okCount) {
      _ref = this.available.tablets.ips;
      _fn = function(ip) {
        var ajaxOptions, replicationOptions,
          _this = this;
        ajaxOptions = {
          success: function() {
            return _this.$el.find(".status").find(".info_box").html("Results synced successfully");
          },
          error: function(res) {
            return _this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + res + "</div>");
          }
        };
        replicationOptions = {
          "filter": Tangerine.config.address.local.dbName + "/resultFilter",
          "query_params": {
            "assessmentId": this.assessment.id
          }
        };
        return $.couch.replicate(Tangerine.config.address.local.dbName, ("http://" + ip + ":5984/") + Tangerine.config.address.local.dbName, ajaxOptions, replicationOptions);
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ip = _ref[_i];
        _fn(ip);
      }
    } else {
      Utils.midAlert("Cannot detect tablets");
    }
    return false;
  };

  ResultsView.prototype.csv = function() {
    return Tangerine.router.navigate("csv/" + this.assessment.id, true);
  };

  ResultsView.prototype.detectOptions = function() {
    this.available = {
      cloud: {
        ok: false,
        checked: false
      },
      tablets: {
        ips: [],
        okCount: 0,
        checked: 0,
        total: 256
      }
    };
    this.detectCloud();
    return this.detectTablets();
  };

  ResultsView.prototype.detectCloud = function() {
    var _this = this;
    return $.ajax({
      dataType: "jsonp",
      url: Tangerine.config.address.cloud.host + ":" + Tangerine.config.address.port + "/",
      success: function(a, b) {
        return _this.available.cloud.ok = true;
      },
      error: function(a, b) {
        return _this.available.cloud.ok = false;
      },
      complete: function() {
        return _this.updateOptions();
      }
    });
  };

  ResultsView.prototype.detectTablets = function() {
    var local, port, _results,
      _this = this;
    port = Tangerine.config.address.port;
    _results = [];
    for (local = 0; local <= 255; local++) {
      _results.push((function(local, port) {
        var ip;
        ip = "192.168.1." + local;
        return $.ajax({
          dataType: "jsonp",
          contentType: "application/json;charset=utf-8",
          timeout: 30000,
          url: "http://" + ip + ":" + port + "/",
          complete: function(xhr, error) {
            _this.available.tablets.checked++;
            if (xhr.status === 200) {
              _this.available.tablets.okCount++;
              _this.available.tablets.ips.push(ip);
            }
            return _this.updateOptions;
          }
        });
      })(local, port));
    }
    return _results;
  };

  ResultsView.prototype.updateOptions = function() {
    var tabletMessage;
    if (this.available.cloud.ok) {
      this.$el.find('button.cloud').removeAttr('disabled');
    }
    if (this.available.tablets.okCount > 0) {
      this.$el.find('button.tablets').removeAttr('disabled');
    }
    tabletMessage = "Tablet detection: " + (Math.decimals((this.available.tablets.checked / this.available.tablets.total) * 100, 2)) + "%";
    this.$el.find(".checking_status").html("" + tabletMessage);
    if (this.available.cloud.checked && this.available.tablets.checked === this.available.tablets.total) {
      return this.$el.find(".status .info_box").html("Done detecting options");
    }
  };

  ResultsView.prototype.initialize = function(options) {
    this.subViews = [];
    this.results = options.results;
    this.model = options.model;
    return this.assessment = options.assessment;
  };

  ResultsView.prototype.render = function() {
    var cloudButton, csvButton, html, result, tabletButton, view, _i, _len, _ref, _ref2;
    this.clearSubViews();
    cloudButton = "<button class='cloud command' disabled='disabled'>Cloud</button>";
    tabletButton = "<button class='tablets command' disabled='disabled'>Tablets</button>";
    csvButton = "<button class='csv command'>CSV</button>";
    html = "      <h1>" + (this.assessment.get('name')) + "</h1>      <h2>Save options</h2>      <div class='menu_box'>        " + (Tangerine.settings.context === "mobile" ? cloudButton : "") + "        " + (Tangerine.settings.context === "mobile" ? tabletButton : "") + "        " + csvButton + "        <div class='checking_status'></div>      </div>";
    if (Tangerine.settings.context === "mobile") {
      html += "        <button class='detect command'>Detect options</button>        <div class='status'>          <h2>Status</h2>          <div class='info_box'></div>        </div>        ";
    }
    html += "      <h2>Results</h2>    ";
    this.$el.html(html);
    if (((_ref = this.results) != null ? _ref.length : void 0) === 0) {
      this.$el.append("No results yet!");
    } else {
      _ref2 = this.results;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        result = _ref2[_i];
        view = new ResultSumView({
          model: result
        });
        view.render();
        this.subViews.push(view);
        this.$el.append(view.el);
      }
    }
    return this.trigger("rendered");
  };

  ResultsView.prototype.afterRender = function() {
    var view, _i, _len, _ref, _results;
    _ref = this.subViews;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(typeof view.afterRender === "function" ? view.afterRender() : void 0);
    }
    return _results;
  };

  ResultsView.prototype.clearSubViews = function() {
    var view, _i, _len, _ref;
    _ref = this.subViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.close();
    }
    return this.subViews = [];
  };

  return ResultsView;

})(Backbone.View);
