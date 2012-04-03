var Assessment,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

$.assessment = null;

Assessment = (function(_super) {

  __extends(Assessment, _super);

  function Assessment() {
    this.fetch = __bind(this.fetch, this);
    Assessment.__super__.constructor.apply(this, arguments);
  }

  Assessment.prototype.url = '/assessment';

  Assessment.prototype.replicate = function(target, options) {
    var ajaxOptions, replicationLogEntry, replicationOptions;
    $("#message").html("Syncing to " + target);
    replicationLogEntry = new ReplicationLogEntry({
      timestamp: new Date().getTime(),
      source: this.get("_id"),
      target: target
    });
    replicationLogEntry.save();
    ajaxOptions = {
      success: function() {
        return options.success();
      },
      error: function(res) {
        return $("#message").html("Error: " + res);
      }
    };
    replicationOptions = {
      filter: Tangerine.design_doc_name + "/resultFilter",
      query_params: {
        assessmentId: this.get("_id")
      }
    };
    return $.couch.replicate(Tangerine.database_name, target, ajaxOptions, replicationOptions);
  };

  Assessment.prototype.lastCloudReplication = function(options) {
    var assessmentId, replicationLogEntryCollection;
    assessmentId = this.get("id");
    replicationLogEntryCollection = new ReplicationLogEntryCollection();
    return replicationLogEntryCollection.fetch({
      success: function() {
        var mostRecentReplicationLogEntry;
        mostRecentReplicationLogEntry = replicationLogEntryCollection.first();
        replicationLogEntryCollection.each(function(replicationLogEntry) {
          if (replicationLogEntry.source !== assessmentId) return;
          if (replicationLogEntry.timestamp > mostRecentReplicationLogEntry.timestamp) {
            return mostRecentReplicationLogEntry = replicationLogEntry;
          }
        });
        if (mostRecentReplicationLogEntry) {
          return options != null ? typeof options.success === "function" ? options.success(mostRecentReplicationLogEntry) : void 0 : void 0;
        } else {
          return options != null ? typeof options.error === "function" ? options.error() : void 0 : void 0;
        }
      }
    });
  };

  Assessment.prototype.fetch = function(options) {
    var superOptions,
      _this = this;
    superOptions = options;
    superOptions = {
      success: function() {
        var pages, url, urlPath, _i, _len, _ref;
        _this.changeName(_this.get("name"));
        pages = [];
        _ref = _this.get("urlPathsForPages");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          urlPath = _ref[_i];
          url = "/" + Tangerine.config.db_name + "/" + urlPath;
          JQueryMobilePage.loadFromHTTP({
            url: url,
            async: false
          }, function(page) {
            page.assessment = _this;
            return pages.push(page);
          });
        }
        _this.setPages(pages);
        return options != null ? options.success() : void 0;
      }
    };
    return Assessment.__super__.fetch.call(this, superOptions);
  };

  Assessment.prototype.changeName = function(newName) {
    var page, _i, _len, _ref, _results;
    this.name = newName;
    this.urlPath = "Assessment." + this.name;
    this.urlPathsForPages = [];
    if (this.pages != null) {
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        page.urlPath = this.urlPath + "." + page.pageId;
        _results.push(this.urlPathsForPages.push(page.urlPath));
      }
      return _results;
    }
  };

  Assessment.prototype.targetDatabase = function() {
    var name;
    name = this.name || this.get("name");
    return name.toLowerCase().dasherize();
  };

  Assessment.prototype.setPages = function(pages) {
    var index, page, _len, _ref, _results;
    this.pages = pages;
    this.urlPathsForPages = [];
    _ref = this.pages;
    _results = [];
    for (index = 0, _len = _ref.length; index < _len; index++) {
      page = _ref[index];
      page.assessment = this;
      page.pageNumber = index;
      if (index !== 0) page.previousPage = this.pages[index - 1];
      if (this.pages.length !== index + 1) page.nextPage = this.pages[index + 1];
      page.urlScheme = this.urlScheme;
      page.urlPath = this.urlPath + "." + page.pageId;
      _results.push(this.urlPathsForPages.push(page.urlPath));
    }
    return _results;
  };

  Assessment.prototype.getPage = function(pageId) {
    var page, _i, _len, _ref;
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      if (page.pageId === pageId) return page;
    }
  };

  Assessment.prototype.insertPage = function(page, pageNumber) {
    this.pages.splice(pageNumber, 0, page);
    return this.setPages(this.pages);
  };

  Assessment.prototype.loginPage = function() {
    return $.assessment.pages[0];
  };

  Assessment.prototype.currentUser = function() {
    return this.loginPage().results().username;
  };

  Assessment.prototype.currentPassword = function() {
    return this.loginPage().results().password;
  };

  Assessment.prototype.hasUserAuthenticated = function() {
    var loginResults;
    loginResults = this.loginPage().results();
    return loginResults.username !== "" && loginResults.password !== "";
  };

  Assessment.prototype.result = function(pageId) {
    var page, _i, _len, _ref;
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      if (page.pageId === pageId) return page.results();
    }
  };

  Assessment.prototype.results = function() {
    var page, results, _i, _len, _ref;
    results = {};
    _ref = this.pages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      page = _ref[_i];
      results[page.pageId] = page.results();
      results[page.pageId]["subtestType"] = page.pageType;
    }
    results.timestamp = new Date().valueOf();
    results.enumerator = $('#enumerator').html();
    results.assessmentId = this.get("_id");
    return results;
  };

  Assessment.prototype.saveResults = function(callback) {
    var result,
      _this = this;
    result = new Result(this.results());
    return result.save({}, {
      success: function(model, results) {
        return typeof callback === "function" ? callback(model, results) : void 0;
      },
      error: function() {
        alert("Results NOT saved - do you have permission to save?");
        throw "Could not save result " + (_this.results());
      }
    });
  };

  Assessment.prototype.resetURL = function() {
    return document.location.pathname + document.location.search;
  };

  Assessment.prototype.reset = function() {
    return document.location = this.resetURL();
  };

  Assessment.prototype.onReady = function(callback) {
    var checkIfLoading, maxTries, timesTried,
      _this = this;
    maxTries = 10;
    timesTried = 0;
    checkIfLoading = function() {
      var page, _i, _len, _ref;
      timesTried++;
      if (_this.loading) {
        if (timesTried >= maxTries) {
          throw "Timeout error while waiting for assessment: " + _this.name;
        }
        setTimeout(checkIfLoading, 1000);
        return;
      }
      _ref = _this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        if (page.loading) {
          if (timesTried >= maxTries) {
            throw "Timeout error while waiting for page: " + page.pageId;
          }
          setTimeout(checkIfLoading, 1000);
          return;
        }
      }
      return callback();
    };
    return checkIfLoading();
  };

  Assessment.prototype.render = function() {
    var _this = this;
    return this.onReady(function() {
      $.assessment = _this;
      return _this.pages[0].render();
    });
  };

  Assessment.prototype.flash = function() {
    $('body').addClass("flash");
    $('.controls').addClass("flash");
    $('.toggle-grid-with-timer td').addClass("flash");
    $("div[data-role=header]").toggleClass("flash");
    $("div[data-role=footer]").toggleClass("flash");
    return setTimeout(function() {
      $('body').removeClass("flash");
      $('.controls').removeClass("flash");
      $('.toggle-grid-with-timer td').removeClass("flash");
      $("div[data-role=header]").removeClass("flash");
      return $("div[data-role=footer]").removeClass("flash");
    }, 2000);
  };

  Assessment.prototype.toPaper = function(callback) {
    var _this = this;
    return this.onReady(function() {
      var i, page, result;
      result = (function() {
        var _len, _ref, _results;
        _ref = this.pages;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          page = _ref[i];
          _results.push(("<div class='subtest " + page.pageType + "'><h1>" + (page.name()) + "</h1>") + page.toPaper() + "</div>");
        }
        return _results;
      }).call(_this);
      result = result.join("<div class='page-break'><hr/></div>");
      if (callback != null) callback(result);
      return result;
    });
  };

  Assessment.prototype.handleURLParameters = function() {
    var a, d, e, param, q, r, value, _ref;
    if (this.urlParams != null) return;
    this.urlParams = {};
    a = /\+/g;
    r = /([^&=]+)=?([^&]*)/g;
    d = function(s) {
      return decodeURIComponent(s.replace(a, " "));
    };
    q = window.location.search.substring(1);
    while ((e = r.exec(q))) {
      this.urlParams[d(e[1])] = d(e[2]);
    }
    _ref = this.urlParams;
    for (param in _ref) {
      value = _ref[param];
      $("input#" + param).val(value);
    }
    if (this.urlParams.newAssessment) {
      if (!($.assessment.currentPage.pageId === "DateTime" || $.assessment.currentPage.pageId === "Login")) {
        if (!($.assessment.currentPage.pageId === "DateTime" || $.assessment.currentPage.pageId === "Login")) {
          $.mobile.changePage("DateTime");
        }
        return document.location = document.location.href;
      }
    }
  };

  return Assessment;

})(Backbone.Model);
