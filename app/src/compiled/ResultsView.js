var ResultsView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultsView = (function(superClass) {
  extend(ResultsView, superClass);

  function ResultsView() {
    this.afterRender = bind(this.afterRender, this);
    this.updateResults = bind(this.updateResults, this);
    this.updateOptions = bind(this.updateOptions, this);
    this.detectTablets = bind(this.detectTablets, this);
    return ResultsView.__super__.constructor.apply(this, arguments);
  }

  ResultsView.prototype.className = "ResultsView";

  ResultsView.prototype.events = {
    'click .cloud': 'cloud',
    'click .tablets': 'tablets',
    'click .detect': 'detectOptions',
    'click .details': 'showResultSumView',
    'change #limit': "setLimit",
    'change #page': "setOffset"
  };

  ResultsView.prototype.showResultSumView = function(event) {
    var $details, result, targetId;
    targetId = $(event.target).attr("data-result-id");
    $details = this.$el.find("#details_" + targetId);
    if ($details.html() !== '') {
      return $details.empty();
    }
    result = new Result({
      "_id": targetId
    });
    return result.fetch({
      success: function() {
        var view;
        view = new ResultSumView({
          model: result,
          finishCheck: true
        });
        view.render();
        $details.html("<div class='info_box'>" + $(view.el).html() + "</div>");
        return view.close();
      }
    });
  };

  ResultsView.prototype.oldCloud = function() {
    if (this.available.cloud.ok) {
      PouchDB.replicate(Tangerine.conf.db_name, Tangerine.settings.urlDB("group"), {
        doc_ids: this.docList
      }).on('error', function(err) {
        return this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + err + "</div>");
      }).on('complete', function(info) {
        if (info.docs.doc_write_failures === 0) {
          return this.$el.find(".status").find(".info_box").html("Results synced to cloud successfully");
        } else {
          return this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + err + "</div>");
        }
      });
    } else {
      Utils.midAlert("Cannot detect cloud");
    }
    return false;
  };

  ResultsView.prototype.cloud = function() {
    return Utils.uploadCompressed(this.docList);
  };

  ResultsView.prototype.tablets = function() {
    var fn, i, ip, len, ref;
    if (this.available.tablets.okCount > 0) {
      ref = this.available.tablets.ips;
      fn = (function(_this) {
        return function(ip) {
          return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlSubnet(ip), {
            success: function() {
              return _this.$el.find(".status").find(".info_box").html("Results synced to " + _this.available.tablets.okCount + " successfully");
            },
            error: function(a, b) {
              return _this.$el.find(".status").find(".info_box").html("<div>Sync error</div><div>" + a + " " + b + "</div>");
            }
          }, {
            doc_ids: _this.docList
          });
        };
      })(this);
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        fn(ip);
      }
    } else {
      Utils.midAlert("Cannot detect tablets");
    }
    return false;
  };

  ResultsView.prototype.initDetectOptions = function() {
    return this.available = {
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
  };

  ResultsView.prototype.detectOptions = function() {
    $("button.cloud, button.tablets").attr("disabled", "disabled");
    this.detectCloud();
    return this.detectTablets();
  };

  ResultsView.prototype.detectCloud = function() {
    return $.ajax({
      type: "GET",
      dataType: "json",
      url: Tangerine.settings.urlHost("group"),
      success: (function(_this) {
        return function(a, b) {
          console.log("cloudy");
          return _this.available.cloud.ok = true;
        };
      })(this),
      error: (function(_this) {
        return function(a, b) {
          console.log("error man");
          return _this.available.cloud.ok = false;
        };
      })(this),
      complete: (function(_this) {
        return function() {
          console.log("complete at least");
          _this.available.cloud.checked = true;
          return _this.updateOptions();
        };
      })(this)
    });
  };

  ResultsView.prototype.detectTablets = function() {
    var i, local, results;
    results = [];
    for (local = i = 0; i <= 255; local = ++i) {
      results.push((function(_this) {
        return function(local) {
          var ip;
          ip = Tangerine.settings.subnetIP(local);
          return $.ajax({
            url: Tangerine.settings.urlSubnet(ip),
            dataType: "jsonp",
            contentType: "application/json;charset=utf-8",
            timeout: 30000,
            complete: function(xhr, error) {
              _this.available.tablets.checked++;
              if (xhr.status === 200) {
                _this.available.tablets.okCount++;
                _this.available.tablets.ips.push(ip);
              }
              return _this.updateOptions();
            }
          });
        };
      })(this)(local));
    }
    return results;
  };

  ResultsView.prototype.updateOptions = function() {
    var message, percentage, tabletMessage;
    percentage = Math.decimals((this.available.tablets.checked / this.available.tablets.total) * 100, 2);
    if (percentage === 100) {
      message = "finished";
    } else {
      message = percentage + "%";
    }
    tabletMessage = "Searching for tablets: " + message;
    if (this.available.tablets.checked > 0) {
      this.$el.find(".checking_status").html("" + tabletMessage);
    }
    if (this.available.cloud.checked && this.available.tablets.checked === this.available.tablets.total) {
      this.$el.find(".status .info_box").html("Done detecting options");
      this.$el.find(".checking_status").hide();
    }
    if (this.available.cloud.ok) {
      this.$el.find('button.cloud').removeAttr('disabled');
    }
    if (this.available.tablets.okCount > 0 && percentage === 100) {
      return this.$el.find('button.tablets').removeAttr('disabled');
    }
  };

  ResultsView.prototype.i18n = function() {
    return this.text = {
      saveOptions: t("ResultsView.label.save_options"),
      cloud: t("ResultsView.label.cloud"),
      tablets: t("ResultsView.label.tablets"),
      csv: t("ResultsView.label.csv"),
      started: t("ResultsView.label.started"),
      results: t("ResultsView.label.results"),
      details: t("ResultsView.label.details"),
      page: t("ResultsView.label.page"),
      status: t("ResultsView.label.status"),
      perPage: t("ResultsView.label.par_page"),
      noResults: t("ResultsView.message.no_results"),
      detect: t("ResultsView.button.detect")
    };
  };

  ResultsView.prototype.initialize = function(options) {
    this.i18n();
    this.resultLimit = 100;
    this.resultOffset = 0;
    this.subViews = [];
    this.results = options.results;
    this.assessment = options.assessment;
    this.docList = this.results.pluck("_id");
    this.initDetectOptions();
    return this.detectCloud();
  };

  ResultsView.prototype.render = function() {
    var html;
    this.clearSubViews();
    html = "<h1>" + (this.assessment.getEscapedString('name')) + " " + this.text.results + "</h1> <h2>" + this.text.saveOptions + "</h2> <div class='menu_box'> <button class='cloud command' disabled='disabled'>" + this.text.cloud + "</button> <button class='tablets command' disabled='disabled'>" + this.text.tablets + "</button> </div> <button class='detect command'>" + this.text.detect + "</button> <div class='status'> <h2>" + this.text.status + "</h2> <div class='info_box'></div> <div class='checking_status'></div> </div> <h2 id='results_header'>" + this.text.results + " (<span id='result_position'>loading...</span>)</h2> <div class='confirmation' id='controls'> <label for='page' class='small_grey'>" + this.text.page + "</label><input id='page' type='number' value='0'> <label for='limit' class='small_grey'>" + this.text.perPage + "</label><input id='limit' type='number' value='0'> </div> <section id='results_container'></section>";
    this.$el.html(html);
    this.updateResults();
    return this.trigger("rendered");
  };

  ResultsView.prototype.setLimit = function(event) {
    this.resultLimit = +$("#limit").val() || 100;
    return this.updateResults();
  };

  ResultsView.prototype.setOffset = function(event) {
    var calculated, maxPage, val;
    val = +$("#page").val() || 1;
    calculated = (val - 1) * this.resultLimit;
    maxPage = Math.floor(this.results.length / this.resultLimit);
    this.resultOffset = Math.limit(0, calculated, maxPage * this.resultLimit);
    return this.updateResults();
  };

  ResultsView.prototype.updateResults = function(focus) {
    var previews, ref;
    if (((ref = this.results) != null ? ref.length : void 0) === 0) {
      this.$el.find('#results_header').html(this.text.noResults);
      return;
    }
    previews = new ResultPreviews;
    return previews.fetch({
      viewOptions: {
        key: "result-" + this.assessment.id
      },
      success: (function(_this) {
        return function() {
          var count, currentPage, end, htmlRows, maxResults, start, total;
          previews.sort();
          count = previews.labelngth;
          maxResults = 100;
          currentPage = Math.floor(_this.resultOffset / _this.resultLimit) + 1;
          if (_this.results.length > maxResults) {
            _this.$el.find("#controls").removeClass("confirmation");
            _this.$el.find("#page").val(currentPage);
            _this.$el.find("#limit").val(_this.resultLimit);
          }
          start = _this.resultOffset + 1;
          end = Math.min(_this.resultOffset + _this.resultLimit, _this.results.length);
          total = _this.results.length;
          _this.$el.find('#result_position').html(t("ResultsView.label.pagination", {
            start: start,
            end: end,
            total: total
          }));
          htmlRows = "";
          previews.sort(function(a, b) {});
          previews.each(function(preview) {
            var endTime, fromNow, id, long, startTime, time;
            id = preview.getString("participantId", "No ID");
            endTime = preview.get("endTime");
            if (endTime != null) {
              long = moment(endTime).format('YYYY-MMM-DD HH:mm');
              fromNow = moment(endTime).fromNow();
            } else {
              startTime = preview.get("startTime");
              long = ("<b>" + _this.text.started + "</b> ") + moment(startTime).format('YYYY-MMM-DD HH:mm');
              fromNow = moment(startTime).fromNow();
            }
            time = long + " (" + fromNow + ")";
            return htmlRows += "<div> " + id + " - " + time + " <button data-result-id='" + preview.id + "' class='details command'>" + _this.text.details + "</button> <div id='details_" + preview.id + "'></div> </div>";
          });
          _this.$el.find("#results_container").html(htmlRows);
          return _this.$el.find(focus).focus();
        };
      })(this)
    });
  };

  ResultsView.prototype.afterRender = function() {
    var i, len, ref, results, view;
    ref = this.subViews;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(typeof view.afterRender === "function" ? view.afterRender() : void 0);
    }
    return results;
  };

  ResultsView.prototype.clearSubViews = function() {
    var i, len, ref, view;
    ref = this.subViews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.subViews = [];
  };

  return ResultsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1Jlc3VsdHNWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7Ozt3QkFFSixTQUFBLEdBQVk7O3dCQUVaLE1BQUEsR0FDRTtJQUFBLGNBQUEsRUFBb0IsT0FBcEI7SUFDQSxnQkFBQSxFQUFvQixTQURwQjtJQUVBLGVBQUEsRUFBb0IsZUFGcEI7SUFHQSxnQkFBQSxFQUFvQixtQkFIcEI7SUFLQSxlQUFBLEVBQWtCLFVBTGxCO0lBTUEsY0FBQSxFQUFpQixXQU5qQjs7O3dCQVFGLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtBQUNqQixRQUFBO0lBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsZ0JBQXJCO0lBQ1gsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQUEsR0FBWSxRQUF0QjtJQUVYLElBQTJCLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FBQSxLQUFxQixFQUFoRDtBQUFBLGFBQU8sUUFBUSxDQUFDLEtBQVQsQ0FBQSxFQUFQOztJQUNBLE1BQUEsR0FBYSxJQUFBLE1BQUEsQ0FBTztNQUFBLEtBQUEsRUFBUSxRQUFSO0tBQVA7V0FDYixNQUFNLENBQUMsS0FBUCxDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxZQUFBO1FBQUEsSUFBQSxHQUFXLElBQUEsYUFBQSxDQUNUO1VBQUEsS0FBQSxFQUFjLE1BQWQ7VUFDQSxXQUFBLEVBQWMsSUFEZDtTQURTO1FBR1gsSUFBSSxDQUFDLE1BQUwsQ0FBQTtRQUNBLFFBQVEsQ0FBQyxJQUFULENBQWMsd0JBQUEsR0FBMkIsQ0FBQSxDQUFFLElBQUksQ0FBQyxFQUFQLENBQVUsQ0FBQyxJQUFYLENBQUEsQ0FBM0IsR0FBK0MsUUFBN0Q7ZUFDQSxJQUFJLENBQUMsS0FBTCxDQUFBO01BTk8sQ0FBVDtLQURGO0VBTmlC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QyxDQUFBLElBQUksQ0FBQyxPQUovRCxHQUl1RSw2QkFKdkUsR0FLVyxPQUFPLENBQUMsRUFMbkIsR0FLc0I7VUFsQnRCLENBQWQ7VUFzQkEsS0FBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0JBQVYsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxRQUFyQztpQkFFQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxLQUFWLENBQWdCLENBQUMsS0FBakIsQ0FBQTtRQWhETztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGVDtLQURGO0VBTmE7O3dCQTJEZixXQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7QUFBQTtBQUFBO1NBQUEscUNBQUE7OzREQUNFLElBQUksQ0FBQztBQURQOztFQURXOzt3QkFJYixhQUFBLEdBQWMsU0FBQTtBQUNaLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQTtBQURGO1dBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtFQUhBOzs7O0dBeFJVLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9SZXN1bHRzVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlc3VsdHNWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiUmVzdWx0c1ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmNsb3VkJyAgICA6ICdjbG91ZCdcbiAgICAnY2xpY2sgLnRhYmxldHMnICA6ICd0YWJsZXRzJ1xuICAgICdjbGljayAuZGV0ZWN0JyAgIDogJ2RldGVjdE9wdGlvbnMnXG4gICAgJ2NsaWNrIC5kZXRhaWxzJyAgOiAnc2hvd1Jlc3VsdFN1bVZpZXcnXG5cbiAgICAnY2hhbmdlICNsaW1pdCcgOiBcInNldExpbWl0XCJcbiAgICAnY2hhbmdlICNwYWdlJyA6IFwic2V0T2Zmc2V0XCJcblxuICBzaG93UmVzdWx0U3VtVmlldzogKGV2ZW50KSAtPlxuICAgIHRhcmdldElkID0gJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLXJlc3VsdC1pZFwiKVxuICAgICRkZXRhaWxzID0gQCRlbC5maW5kKFwiI2RldGFpbHNfI3t0YXJnZXRJZH1cIilcblxuICAgIHJldHVybiAkZGV0YWlscy5lbXB0eSgpIGlmICRkZXRhaWxzLmh0bWwoKSBpc250ICcnXG4gICAgcmVzdWx0ID0gbmV3IFJlc3VsdCBcIl9pZFwiIDogdGFyZ2V0SWRcbiAgICByZXN1bHQuZmV0Y2hcbiAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0U3VtVmlld1xuICAgICAgICAgIG1vZGVsICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgZmluaXNoQ2hlY2sgOiB0cnVlXG4gICAgICAgIHZpZXcucmVuZGVyKClcbiAgICAgICAgJGRldGFpbHMuaHRtbCBcIjxkaXYgY2xhc3M9J2luZm9fYm94Jz5cIiArICQodmlldy5lbCkuaHRtbCgpICsgXCI8L2Rpdj5cIlxuICAgICAgICB2aWV3LmNsb3NlKClcblxuICBvbGRDbG91ZDogLT5cbiAgICBpZiBAYXZhaWxhYmxlLmNsb3VkLm9rXG4gICAgICBQb3VjaERCLnJlcGxpY2F0ZShUYW5nZXJpbmUuY29uZi5kYl9uYW1lLCBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKSwgeyBkb2NfaWRzOiBAZG9jTGlzdCB9XG4gICAgICApLm9uKCAnZXJyb3InLCAoZXJyKSAtPlxuICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIjxkaXY+U3luYyBlcnJvcjwvZGl2PjxkaXY+I3tlcnJ9PC9kaXY+XCJcbiAgICAgICkub24oICdjb21wbGV0ZScsIChpbmZvKSAtPlxuICAgICAgICBpZiBpbmZvLmRvY3MuZG9jX3dyaXRlX2ZhaWx1cmVzIGlzIDBcbiAgICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIlJlc3VsdHMgc3luY2VkIHRvIGNsb3VkIHN1Y2Nlc3NmdWxseVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIjxkaXY+U3luYyBlcnJvcjwvZGl2PjxkaXY+I3tlcnJ9PC9kaXY+XCJcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBVdGlscy5taWRBbGVydCBcIkNhbm5vdCBkZXRlY3QgY2xvdWRcIlxuICAgIHJldHVybiBmYWxzZVxuXG5cbiAgY2xvdWQ6IC0+XG4gICAgVXRpbHMudXBsb2FkQ29tcHJlc3NlZCBAZG9jTGlzdFxuXG5cbiAgdGFibGV0czogLT5cbiAgICBpZiBAYXZhaWxhYmxlLnRhYmxldHMub2tDb3VudCA+IDBcbiAgICAgIGZvciBpcCBpbiBAYXZhaWxhYmxlLnRhYmxldHMuaXBzXG4gICAgICAgIGRvIChpcCkgPT5cbiAgICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLnVybFN1Ym5ldChpcCksXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgPT5cbiAgICAgICAgICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIlJlc3VsdHMgc3luY2VkIHRvICN7QGF2YWlsYWJsZS50YWJsZXRzLm9rQ291bnR9IHN1Y2Nlc3NmdWxseVwiXG4gICAgICAgICAgICAgIGVycm9yOiAoYSwgYikgPT5cbiAgICAgICAgICAgICAgICBAJGVsLmZpbmQoXCIuc3RhdHVzXCIpLmZpbmQoXCIuaW5mb19ib3hcIikuaHRtbCBcIjxkaXY+U3luYyBlcnJvcjwvZGl2PjxkaXY+I3thfSAje2J9PC9kaXY+XCJcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgZG9jX2lkczogQGRvY0xpc3RcbiAgICAgICAgICApXG4gICAgZWxzZVxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJDYW5ub3QgZGV0ZWN0IHRhYmxldHNcIlxuICAgIHJldHVybiBmYWxzZVxuXG4gIGluaXREZXRlY3RPcHRpb25zOiAtPlxuICAgIEBhdmFpbGFibGUgPVxuICAgICAgY2xvdWQgOlxuICAgICAgICBvayA6IGZhbHNlXG4gICAgICAgIGNoZWNrZWQgOiBmYWxzZVxuICAgICAgdGFibGV0cyA6XG4gICAgICAgIGlwcyA6IFtdXG4gICAgICAgIG9rQ291bnQgIDogMFxuICAgICAgICBjaGVja2VkICA6IDBcbiAgICAgICAgdG90YWwgOiAyNTZcblxuICBkZXRlY3RPcHRpb25zOiAtPlxuICAgICQoXCJidXR0b24uY2xvdWQsIGJ1dHRvbi50YWJsZXRzXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpXG4gICAgQGRldGVjdENsb3VkKClcbiAgICBAZGV0ZWN0VGFibGV0cygpXG5cbiAgZGV0ZWN0Q2xvdWQ6IC0+XG4gICAgIyBEZXRlY3QgQ2xvdWRcbiAgICAkLmFqYXhcbiAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSG9zdChcImdyb3VwXCIpXG4gICAgICBzdWNjZXNzOiAoYSwgYikgPT5cbiAgICAgICAgY29uc29sZS5sb2cgXCJjbG91ZHlcIlxuICAgICAgICBAYXZhaWxhYmxlLmNsb3VkLm9rID0gdHJ1ZVxuICAgICAgZXJyb3I6IChhLCBiKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBcImVycm9yIG1hblwiXG4gICAgICAgIEBhdmFpbGFibGUuY2xvdWQub2sgPSBmYWxzZVxuICAgICAgY29tcGxldGU6ID0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiY29tcGxldGUgYXQgbGVhc3RcIlxuICAgICAgICBAYXZhaWxhYmxlLmNsb3VkLmNoZWNrZWQgPSB0cnVlXG4gICAgICAgIEB1cGRhdGVPcHRpb25zKClcblxuICBkZXRlY3RUYWJsZXRzOiA9PlxuICAgIGZvciBsb2NhbCBpbiBbMC4uMjU1XVxuICAgICAgZG8gKGxvY2FsKSA9PlxuICAgICAgICBpcCA9IFRhbmdlcmluZS5zZXR0aW5ncy5zdWJuZXRJUChsb2NhbClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsU3VibmV0KGlwKVxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIixcbiAgICAgICAgICB0aW1lb3V0OiAzMDAwMFxuICAgICAgICAgIGNvbXBsZXRlOiAgKHhociwgZXJyb3IpID0+XG4gICAgICAgICAgICBAYXZhaWxhYmxlLnRhYmxldHMuY2hlY2tlZCsrXG4gICAgICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgICAgICBAYXZhaWxhYmxlLnRhYmxldHMub2tDb3VudCsrXG4gICAgICAgICAgICAgIEBhdmFpbGFibGUudGFibGV0cy5pcHMucHVzaCBpcFxuICAgICAgICAgICAgQHVwZGF0ZU9wdGlvbnMoKVxuXG4gIHVwZGF0ZU9wdGlvbnM6ID0+XG4gICAgcGVyY2VudGFnZSA9IE1hdGguZGVjaW1hbHMoKEBhdmFpbGFibGUudGFibGV0cy5jaGVja2VkIC8gQGF2YWlsYWJsZS50YWJsZXRzLnRvdGFsKSAqIDEwMCwgMilcbiAgICBpZiBwZXJjZW50YWdlID09IDEwMFxuICAgICAgbWVzc2FnZSA9IFwiZmluaXNoZWRcIlxuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UgPSBcIiN7cGVyY2VudGFnZX0lXCJcbiAgICB0YWJsZXRNZXNzYWdlID0gXCJTZWFyY2hpbmcgZm9yIHRhYmxldHM6ICN7bWVzc2FnZX1cIlxuXG4gICAgQCRlbC5maW5kKFwiLmNoZWNraW5nX3N0YXR1c1wiKS5odG1sIFwiI3t0YWJsZXRNZXNzYWdlfVwiIGlmIEBhdmFpbGFibGUudGFibGV0cy5jaGVja2VkID4gMFxuXG4gICAgaWYgQGF2YWlsYWJsZS5jbG91ZC5jaGVja2VkICYmIEBhdmFpbGFibGUudGFibGV0cy5jaGVja2VkID09IEBhdmFpbGFibGUudGFibGV0cy50b3RhbFxuICAgICAgQCRlbC5maW5kKFwiLnN0YXR1cyAuaW5mb19ib3hcIikuaHRtbCBcIkRvbmUgZGV0ZWN0aW5nIG9wdGlvbnNcIlxuICAgICAgQCRlbC5maW5kKFwiLmNoZWNraW5nX3N0YXR1c1wiKS5oaWRlKClcblxuICAgIGlmIEBhdmFpbGFibGUuY2xvdWQub2tcbiAgICAgIEAkZWwuZmluZCgnYnV0dG9uLmNsb3VkJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgIGlmIEBhdmFpbGFibGUudGFibGV0cy5va0NvdW50ID4gMCAmJiBwZXJjZW50YWdlID09IDEwMFxuICAgICAgQCRlbC5maW5kKCdidXR0b24udGFibGV0cycpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJylcblxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgc2F2ZU9wdGlvbnMgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwuc2F2ZV9vcHRpb25zXCIpXG4gICAgICBjbG91ZCAgICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5jbG91ZFwiKVxuICAgICAgdGFibGV0cyAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwudGFibGV0c1wiKVxuICAgICAgY3N2ICAgICAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwuY3N2XCIpXG4gICAgICBzdGFydGVkICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5zdGFydGVkXCIpXG4gICAgICByZXN1bHRzICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5yZXN1bHRzXCIpXG4gICAgICBkZXRhaWxzICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5kZXRhaWxzXCIpXG4gICAgICBwYWdlICAgICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5wYWdlXCIpXG4gICAgICBzdGF0dXMgICAgICA6IHQoXCJSZXN1bHRzVmlldy5sYWJlbC5zdGF0dXNcIilcblxuICAgICAgcGVyUGFnZSAgICAgOiB0KFwiUmVzdWx0c1ZpZXcubGFiZWwucGFyX3BhZ2VcIilcblxuICAgICAgbm9SZXN1bHRzICAgOiB0KFwiUmVzdWx0c1ZpZXcubWVzc2FnZS5ub19yZXN1bHRzXCIpXG5cbiAgICAgIGRldGVjdCAgICAgIDogdChcIlJlc3VsdHNWaWV3LmJ1dHRvbi5kZXRlY3RcIilcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQHJlc3VsdExpbWl0ICA9IDEwMFxuICAgIEByZXN1bHRPZmZzZXQgPSAwXG5cbiAgICBAc3ViVmlld3MgPSBbXVxuICAgIEByZXN1bHRzICAgID0gb3B0aW9ucy5yZXN1bHRzXG4gICAgQGFzc2Vzc21lbnQgPSBvcHRpb25zLmFzc2Vzc21lbnRcbiAgICBAZG9jTGlzdCA9IEByZXN1bHRzLnBsdWNrKFwiX2lkXCIpXG4gICAgQGluaXREZXRlY3RPcHRpb25zKClcbiAgICBAZGV0ZWN0Q2xvdWQoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIEBjbGVhclN1YlZpZXdzKClcblxuICAgIGh0bWwgPSBcIlxuICAgICAgPGgxPiN7QGFzc2Vzc21lbnQuZ2V0RXNjYXBlZFN0cmluZygnbmFtZScpfSAje0B0ZXh0LnJlc3VsdHN9PC9oMT5cbiAgICAgIDxoMj4je0B0ZXh0LnNhdmVPcHRpb25zfTwvaDI+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2Nsb3VkIGNvbW1hbmQnIGRpc2FibGVkPSdkaXNhYmxlZCc+I3tAdGV4dC5jbG91ZH08L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ndGFibGV0cyBjb21tYW5kJyBkaXNhYmxlZD0nZGlzYWJsZWQnPiN7QHRleHQudGFibGV0c308L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdkZXRlY3QgY29tbWFuZCc+I3tAdGV4dC5kZXRlY3R9PC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICA8aDI+I3tAdGV4dC5zdGF0dXN9PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdjaGVja2luZ19zdGF0dXMnPjwvZGl2PlxuXG4gICAgICA8L2Rpdj5cblxuICAgICAgPGgyIGlkPSdyZXN1bHRzX2hlYWRlcic+I3tAdGV4dC5yZXN1bHRzfSAoPHNwYW4gaWQ9J3Jlc3VsdF9wb3NpdGlvbic+bG9hZGluZy4uLjwvc3Bhbj4pPC9oMj5cbiAgICAgIDxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbicgaWQ9J2NvbnRyb2xzJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncGFnZScgY2xhc3M9J3NtYWxsX2dyZXknPiN7QHRleHQucGFnZX08L2xhYmVsPjxpbnB1dCBpZD0ncGFnZScgdHlwZT0nbnVtYmVyJyB2YWx1ZT0nMCc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2xpbWl0JyBjbGFzcz0nc21hbGxfZ3JleSc+I3tAdGV4dC5wZXJQYWdlfTwvbGFiZWw+PGlucHV0IGlkPSdsaW1pdCcgdHlwZT0nbnVtYmVyJyB2YWx1ZT0nMCc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxzZWN0aW9uIGlkPSdyZXN1bHRzX2NvbnRhaW5lcic+PC9zZWN0aW9uPlxuICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgaHRtbFxuXG4gICAgQHVwZGF0ZVJlc3VsdHMoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgc2V0TGltaXQ6IChldmVudCkgLT5cbiAgICAjIEByZXN1bHRPZmZzZXRcbiAgICAjIEByZXN1bHRMaW1pdFxuXG4gICAgQHJlc3VsdExpbWl0ID0gKyQoXCIjbGltaXRcIikudmFsKCkgfHwgMTAwICMgZGVmYXVsdCAxMDBcbiAgICBAdXBkYXRlUmVzdWx0cygpXG5cbiAgc2V0T2Zmc2V0OiAoZXZlbnQpIC0+XG5cbiAgICB2YWwgICAgICAgICAgID0gKyQoXCIjcGFnZVwiKS52YWwoKSB8fCAxXG4gICAgY2FsY3VsYXRlZCAgICA9ICh2YWwgLSAxKSAqIEByZXN1bHRMaW1pdFxuICAgIG1heFBhZ2UgICAgICAgPSBNYXRoLmZsb29yKEByZXN1bHRzLmxlbmd0aCAvIEByZXN1bHRMaW1pdCApXG4gICAgQHJlc3VsdE9mZnNldCA9IE1hdGgubGltaXQoMCwgY2FsY3VsYXRlZCwgbWF4UGFnZSAqIEByZXN1bHRMaW1pdCkgIyBkZWZhdWx0IHBhZ2UgMSA9PSAwX29mZnNldFxuXG4gICAgQHVwZGF0ZVJlc3VsdHMoKVxuXG4gIHVwZGF0ZVJlc3VsdHM6IChmb2N1cykgPT5cbiAgICBpZiBAcmVzdWx0cz8ubGVuZ3RoID09IDBcbiAgICAgIEAkZWwuZmluZCgnI3Jlc3VsdHNfaGVhZGVyJykuaHRtbCBAdGV4dC5ub1Jlc3VsdHNcbiAgICAgIHJldHVyblxuXG4gICAgcHJldmlld3MgPSBuZXcgUmVzdWx0UHJldmlld3NcbiAgICBwcmV2aWV3cy5mZXRjaFxuICAgICAgdmlld09wdGlvbnM6XG4gICAgICAgIGtleTogXCJyZXN1bHQtI3tAYXNzZXNzbWVudC5pZH1cIlxuICAgICAgc3VjY2VzczogPT5cblxuICAgICAgICBwcmV2aWV3cy5zb3J0KClcblxuICAgICAgICBjb3VudCA9IHByZXZpZXdzLmxhYmVsbmd0aFxuXG4gICAgICAgIG1heFJlc3VsdHMgID0gMTAwXG4gICAgICAgIGN1cnJlbnRQYWdlID0gTWF0aC5mbG9vciggQHJlc3VsdE9mZnNldCAvIEByZXN1bHRMaW1pdCApICsgMVxuXG4gICAgICAgIGlmIEByZXN1bHRzLmxlbmd0aCA+IG1heFJlc3VsdHNcbiAgICAgICAgICBAJGVsLmZpbmQoXCIjY29udHJvbHNcIikucmVtb3ZlQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICAgICAgICBAJGVsLmZpbmQoXCIjcGFnZVwiKS52YWwoY3VycmVudFBhZ2UpXG4gICAgICAgICAgQCRlbC5maW5kKFwiI2xpbWl0XCIpLnZhbChAcmVzdWx0TGltaXQpXG5cbiAgICAgICAgc3RhcnQgPSBAcmVzdWx0T2Zmc2V0ICsgMVxuICAgICAgICBlbmQgICA9IE1hdGgubWluIEByZXN1bHRPZmZzZXQgKyBAcmVzdWx0TGltaXQsIEByZXN1bHRzLmxlbmd0aFxuICAgICAgICB0b3RhbCA9IEByZXN1bHRzLmxlbmd0aFxuXG4gICAgICAgIEAkZWwuZmluZCgnI3Jlc3VsdF9wb3NpdGlvbicpLmh0bWwgdChcIlJlc3VsdHNWaWV3LmxhYmVsLnBhZ2luYXRpb25cIiwge3N0YXJ0OnN0YXJ0LCBlbmQ6ZW5kLCB0b3RhbDp0b3RhbH0gKVxuXG4gICAgICAgIGh0bWxSb3dzID0gXCJcIlxuXG4gICAgICAgIHByZXZpZXdzLnNvcnQoKGEsYiktPilcblxuICAgICAgICBwcmV2aWV3cy5lYWNoIChwcmV2aWV3KSA9PlxuXG4gICAgICAgICAgaWQgICAgICA9IHByZXZpZXcuZ2V0U3RyaW5nKFwicGFydGljaXBhbnRJZFwiLCBcIk5vIElEXCIpXG4gICAgICAgICAgZW5kVGltZSA9IHByZXZpZXcuZ2V0KFwiZW5kVGltZVwiKVxuICAgICAgICAgIGlmIGVuZFRpbWU/XG4gICAgICAgICAgICBsb25nICAgID0gbW9tZW50KGVuZFRpbWUpLmZvcm1hdCgnWVlZWS1NTU0tREQgSEg6bW0nKVxuICAgICAgICAgICAgZnJvbU5vdyA9IG1vbWVudChlbmRUaW1lKS5mcm9tTm93KClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBwcmV2aWV3LmdldChcInN0YXJ0VGltZVwiKVxuICAgICAgICAgICAgbG9uZyAgICA9IFwiPGI+I3tAdGV4dC5zdGFydGVkfTwvYj4gXCIgKyBtb21lbnQoc3RhcnRUaW1lKS5mb3JtYXQoJ1lZWVktTU1NLUREIEhIOm1tJylcbiAgICAgICAgICAgIGZyb21Ob3cgPSBtb21lbnQoc3RhcnRUaW1lKS5mcm9tTm93KClcblxuICAgICAgICAgIHRpbWUgICAgPSBcIiN7bG9uZ30gKCN7ZnJvbU5vd30pXCJcbiAgICAgICAgICBodG1sUm93cyArPSBcIlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgI3sgaWQgfSAtXG4gICAgICAgICAgICAgICN7IHRpbWUgfVxuICAgICAgICAgICAgICA8YnV0dG9uIGRhdGEtcmVzdWx0LWlkPScje3ByZXZpZXcuaWR9JyBjbGFzcz0nZGV0YWlscyBjb21tYW5kJz4je0B0ZXh0LmRldGFpbHN9PC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgaWQ9J2RldGFpbHNfI3twcmV2aWV3LmlkfSc+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlxuXG4gICAgICAgIEAkZWwuZmluZChcIiNyZXN1bHRzX2NvbnRhaW5lclwiKS5odG1sIGh0bWxSb3dzXG5cbiAgICAgICAgQCRlbC5maW5kKGZvY3VzKS5mb2N1cygpXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgZm9yIHZpZXcgaW4gQHN1YlZpZXdzXG4gICAgICB2aWV3LmFmdGVyUmVuZGVyPygpXG5cbiAgY2xlYXJTdWJWaWV3czotPlxuICAgIGZvciB2aWV3IGluIEBzdWJWaWV3c1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHN1YlZpZXdzID0gW11cbiJdfQ==
