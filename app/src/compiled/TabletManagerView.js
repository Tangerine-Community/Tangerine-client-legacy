var TabletManagerView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TabletManagerView = (function(superClass) {
  extend(TabletManagerView, superClass);

  function TabletManagerView() {
    this.pushDocs = bind(this.pushDocs, this);
    this.updatePullResult = bind(this.updatePullResult, this);
    this.updatePull = bind(this.updatePull, this);
    this.pullDocs = bind(this.pullDocs, this);
    this.sync = bind(this.sync, this);
    return TabletManagerView.__super__.constructor.apply(this, arguments);
  }

  TabletManagerView.prototype.className = "KlassesView";

  TabletManagerView.prototype.i18n = function() {
    return this.text = {
      detectingTablets: t("TabletManagerView.message.detecting"),
      syncComplete: t("TabletManagerView.label.sync_complete")
    };
  };

  TabletManagerView.prototype.initialize = function(options) {
    this.i18n();
    this.ipBlock = 32;
    this.totalIps = 256;
    this.tabletOffset = 0;
    this.callbacks = options.callbacks;
    return this.docTypes = options.docTypes;
  };

  TabletManagerView.prototype.sync = function() {
    if (this.tabletOffset !== 0) {
      return;
    }
    return this.pullDocs();
  };

  TabletManagerView.prototype.pullDocs = function() {
    if (this.tabletOffset === 0) {
      this.tablets = {
        checked: 0,
        complete: 0,
        successful: 0,
        okCount: 0,
        ips: [],
        result: 0
      };
      Utils.midAlert(this.text.detectingTablets);
    }
    Utils.working(true);
    this.randomIdDoc = hex_sha1("" + Math.random());
    return Tangerine.$db.saveDoc({
      "_id": this.randomIdDoc
    }, {
      success: (function(_this) {
        return function(doc) {
          var i, local, ref, ref1, results;
          _this.randomDoc = doc;
          results = [];
          for (local = i = ref = _this.tabletOffset, ref1 = (_this.ipBlock - 1) + _this.tabletOffset; ref <= ref1 ? i <= ref1 : i >= ref1; local = ref <= ref1 ? ++i : --i) {
            results.push((function(local) {
              var ip, req;
              ip = Tangerine.settings.subnetIP(local);
              req = $.ajax({
                url: Tangerine.settings.urlSubnet(ip),
                dataType: "jsonp",
                contentType: "application/json;charset=utf-8",
                timeout: 20000
              });
              return req.complete(function(xhr, error) {
                _this.tablets.checked++;
                if (parseInt(xhr.status) === 200) {
                  _this.tablets.okCount++;
                  _this.tablets.ips.push(ip);
                }
                return _this.updatePull();
              });
            })(local));
          }
          return results;
        };
      })(this),
      error: function() {
        Utils.working(false);
        return Utils.midAlert(this.text.internalError);
      }
    });
  };

  TabletManagerView.prototype.updatePull = function() {
    var i, ip, len, percentage, ref, results;
    if (this.tablets.checked < this.ipBlock + this.tabletOffset) {
      return;
    }
    if (this.tabletOffset !== this.totalIps - this.ipBlock) {
      percentage = Math.round(this.tabletOffset / this.totalIps * 100);
      Utils.midAlert(t("TabletManagerView.message.searching", {
        percentage: percentage
      }));
      this.tabletOffset += this.ipBlock;
      return this.pullDocs();
    } else {
      this.tablets.okCount = Math.max(this.tablets.okCount - 1, 0);
      if (this.tablets.okCount === 0) {
        this.tabletOffset = 0;
        Utils.working(false);
        Utils.midAlert(t("TabletManagerView.message.found", {
          count: this.tablets.okCount
        }));
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      if (!confirm(t("TabletManagerView.message.confirm_pull", {
        __found__: this.tablets.okCount
      }))) {
        this.tabletOffset = 0;
        Utils.working(false);
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      Utils.midAlert(t("TabletManagerView.message.pull_status", {
        tabletCount: this.tablets.okCount
      }));
      ref = this.tablets.ips;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        results.push((function(_this) {
          return function(ip) {
            var selfReq;
            selfReq = $.ajax({
              "url": Tangerine.settings.urlSubnet(ip) + "/" + _this.randomIdDoc,
              "dataType": "jsonp",
              "timeout": 10000,
              "contentType": "application/json;charset=utf-8"
            });
            selfReq.success(function(data, xhr, error) {
              return _this.selfSubnetIp = ip;
            });
            return selfReq.complete(function(xhr, error) {
              return (function(xhr) {
                var viewReq;
                if (parseInt(xhr.status) === 200) {
                  return;
                }
                viewReq = $.ajax({
                  "url": Tangerine.settings.urlSubnet(ip) + "/_design/tangerine/_view/byCollection",
                  "dataType": "jsonp",
                  "contentType": "application/json;charset=utf-8",
                  "data": {
                    include_docs: false,
                    keys: JSON.stringify(_this.docTypes)
                  }
                });
                return viewReq.success(function(data) {
                  var datum, docList;
                  docList = (function() {
                    var j, len1, ref1, results1;
                    ref1 = data.rows;
                    results1 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      datum = ref1[j];
                      results1.push(datum.id);
                    }
                    return results1;
                  })();
                  return $.couch.replicate(Tangerine.settings.urlSubnet(ip), Tangerine.settings.urlDB("local"), {
                    success: function() {
                      _this.tablets.complete++;
                      _this.tablets.successful++;
                      return _this.updatePullResult();
                    },
                    error: function(a, b) {
                      _this.tablets.complete++;
                      return _this.updatePullResult();
                    }
                  }, {
                    doc_ids: docList
                  });
                });
              })(xhr);
            });
          };
        })(this)(ip));
      }
      return results;
    }
  };

  TabletManagerView.prototype.updatePullResult = function() {
    var base;
    if (this.tablets.complete === this.tablets.okCount) {
      Utils.working(false);
      Utils.midAlert(t("TabletManagerView.message.pull_complete", {
        successful: this.tablets.successful,
        total: this.tablets.okCount
      }));
      Tangerine.$db.removeDoc({
        "_id": this.randomDoc.id,
        "_rev": this.randomDoc.rev
      });
      return typeof (base = this.callbacks).completePull === "function" ? base.completePull() : void 0;
    }
  };

  TabletManagerView.prototype.pushDocs = function() {
    if (!_.isObject(this.push)) {
      Utils.working(true);
      return Tangerine.$db.view(Tangerine.design_doc + "/byCollection", {
        keys: this.docTypes,
        success: (function(_this) {
          return function(response) {
            var docIds;
            docIds = _.pluck(response.rows, "id");
            _this.push = {
              ips: _.without(_this.tablets.ips, _this.selfSubnetIp),
              docIds: docIds,
              current: 0,
              complete: 0,
              successful: 0
            };
            return _this.pushDocs();
          };
        })(this)
      });
    } else {
      if (this.push.complete === this.push.ips.length) {
        Utils.working(false);
        return Utils.sticky("<b>" + this.text.syncComplete + "</b><br>" + (t("TabletManagerView.message.successful_count", {
          successful: this.push.successful,
          total: this.push.complete
        })));
      } else {
        Utils.midAlert(t("TabletManagerView.message.syncing", {
          done: this.push.complete + 1,
          total: this.push.ips.length
        }));
        return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlSubnet(this.push.ips[this.push.current]), {
          success: (function(_this) {
            return function() {
              _this.push.complete++;
              _this.push.successful++;
              return _this.pushDocs();
            };
          })(this),
          error: (function(_this) {
            return function(a, b) {
              _this.push.complete++;
              return _this.pushDocs();
            };
          })(this)
        }, {
          doc_ids: this.push.docIds
        });
      }
    }
  };

  return TabletManagerView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvcmVzdWx0L1RhYmxldE1hbmFnZXJWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7OzhCQUVKLFNBQUEsR0FBWTs7OEJBRVosSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsZ0JBQUEsRUFBbUIsQ0FBQSxDQUFFLHFDQUFGLENBQW5CO01BQ0EsWUFBQSxFQUFtQixDQUFBLENBQUUsdUNBQUYsQ0FEbkI7O0VBRkU7OzhCQUtOLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFFVixJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLE9BQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUVoQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztXQUVyQixJQUFDLENBQUEsUUFBRCxHQUFZLE9BQU8sQ0FBQztFQVZWOzs4QkFZWixJQUFBLEdBQU0sU0FBQTtJQUNKLElBQWMsSUFBQyxDQUFBLFlBQUQsS0FBaUIsQ0FBL0I7QUFBQSxhQUFBOztXQUNBLElBQUMsQ0FBQSxRQUFELENBQUE7RUFGSTs7OEJBSU4sUUFBQSxHQUFVLFNBQUE7SUFDUixJQUFHLElBQUMsQ0FBQSxZQUFELEtBQWlCLENBQXBCO01BQ0UsSUFBQyxDQUFBLE9BQUQsR0FDRTtRQUFBLE9BQUEsRUFBYSxDQUFiO1FBQ0EsUUFBQSxFQUFhLENBRGI7UUFFQSxVQUFBLEVBQWEsQ0FGYjtRQUdBLE9BQUEsRUFBYSxDQUhiO1FBSUEsR0FBQSxFQUFhLEVBSmI7UUFLQSxNQUFBLEVBQWEsQ0FMYjs7TUFNRixLQUFLLENBQUMsUUFBTixDQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQXJCLEVBUkY7O0lBVUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO0lBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxR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Q0FBQSxJQUFBLENBQWQ7VUFJQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFELEVBQUksQ0FBSjtjQUNMLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTjtxQkFDQSxLQUFDLENBQUEsUUFBRCxDQUFBO1lBRks7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSlA7U0FISixFQVdJO1VBQUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBZjtTQVhKLEVBTEY7T0FqQkY7O0VBRFE7Ozs7R0FqSm9CLFFBQVEsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3Jlc3VsdC9UYWJsZXRNYW5hZ2VyVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFRhYmxldE1hbmFnZXJWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3Nlc1ZpZXdcIlxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgZGV0ZWN0aW5nVGFibGV0cyA6IHQoXCJUYWJsZXRNYW5hZ2VyVmlldy5tZXNzYWdlLmRldGVjdGluZ1wiKVxuICAgICAgc3luY0NvbXBsZXRlICAgICA6IHQoXCJUYWJsZXRNYW5hZ2VyVmlldy5sYWJlbC5zeW5jX2NvbXBsZXRlXCIpXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBpcEJsb2NrICA9IDMyXG4gICAgQHRvdGFsSXBzID0gMjU2XG4gICAgQHRhYmxldE9mZnNldCA9IDBcblxuICAgIEBjYWxsYmFja3MgPSBvcHRpb25zLmNhbGxiYWNrc1xuXG4gICAgQGRvY1R5cGVzID0gb3B0aW9ucy5kb2NUeXBlc1xuXG4gIHN5bmM6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGFibGV0T2Zmc2V0IGlzIDBcbiAgICBAcHVsbERvY3MoKVxuXG4gIHB1bGxEb2NzOiA9PlxuICAgIGlmIEB0YWJsZXRPZmZzZXQgPT0gMFxuICAgICAgQHRhYmxldHMgPSAjIGlmIHlvdSBjYW4gdGhpbmsgb2YgYSBiZXR0ZXIgaWRlYSBJJ2QgbGlrZSB0byBzZWUgaXRcbiAgICAgICAgY2hlY2tlZCAgICA6IDBcbiAgICAgICAgY29tcGxldGUgICA6IDBcbiAgICAgICAgc3VjY2Vzc2Z1bCA6IDBcbiAgICAgICAgb2tDb3VudCAgICA6IDBcbiAgICAgICAgaXBzICAgICAgICA6IFtdXG4gICAgICAgIHJlc3VsdCAgICAgOiAwXG4gICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5kZXRlY3RpbmdUYWJsZXRzXG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBAcmFuZG9tSWREb2MgPSBoZXhfc2hhMShcIlwiK01hdGgucmFuZG9tKCkpXG4gICAgVGFuZ2VyaW5lLiRkYi5zYXZlRG9jIFxuICAgICAgXCJfaWRcIiA6IEByYW5kb21JZERvY1xuICAgICxcbiAgICAgIHN1Y2Nlc3M6IChkb2MpID0+XG4gICAgICAgIEByYW5kb21Eb2MgPSBkb2NcbiAgICAgICAgZm9yIGxvY2FsIGluIFtAdGFibGV0T2Zmc2V0Li4oQGlwQmxvY2stMSkrQHRhYmxldE9mZnNldF1cbiAgICAgICAgICBkbyAobG9jYWwpID0+XG4gICAgICAgICAgICBpcCA9IFRhbmdlcmluZS5zZXR0aW5ncy5zdWJuZXRJUChsb2NhbClcbiAgICAgICAgICAgIHJlcSA9ICQuYWpheFxuICAgICAgICAgICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApXG4gICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IDIwMDAwXG4gICAgICAgICAgICByZXEuY29tcGxldGUgKHhociwgZXJyb3IpID0+XG4gICAgICAgICAgICAgIEB0YWJsZXRzLmNoZWNrZWQrK1xuICAgICAgICAgICAgICBpZiBwYXJzZUludCh4aHIuc3RhdHVzKSA9PSAyMDBcbiAgICAgICAgICAgICAgICBAdGFibGV0cy5va0NvdW50KytcbiAgICAgICAgICAgICAgICBAdGFibGV0cy5pcHMucHVzaCBpcFxuICAgICAgICAgICAgICBAdXBkYXRlUHVsbCgpXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5pbnRlcm5hbEVycm9yXG5cbiAgdXBkYXRlUHVsbDogPT5cbiAgICAjIGRvIG5vdCBwcm9jZXNzIHVubGVzcyB3ZSdyZSBkb25lIHdpdGggY2hlY2tpbmcgdGhpcyBibG9ja1xuICAgIHJldHVybiBpZiBAdGFibGV0cy5jaGVja2VkIDwgQGlwQmxvY2sgKyBAdGFibGV0T2Zmc2V0XG5cbiAgICAjIGdpdmUgdGhlIGNob2ljZSB0byBrZWVwIGxvb2tpbmcgaWYgbm90IGFsbCB0YWJsZXRzIGZvdW5kXG4gICAgaWYgQHRhYmxldE9mZnNldCAhPSBAdG90YWxJcHMgLSBAaXBCbG9jayAjJiYgY29uZmlybShcIiN7TWF0aC5tYXgoQHRhYmxldHMub2tDb3VudC0xLCAwKX0gdGFibGV0cyBmb3VuZC5cXG5cXG5Db250aW51ZSBzZWFyY2hpbmc/XCIpXG4gICAgICBwZXJjZW50YWdlID0gTWF0aC5yb3VuZChAdGFibGV0T2Zmc2V0IC8gQHRvdGFsSXBzICogMTAwKVxuICAgICAgVXRpbHMubWlkQWxlcnQgdChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2Uuc2VhcmNoaW5nXCIsIHBlcmNlbnRhZ2U6IHBlcmNlbnRhZ2UpXG4gICAgICBAdGFibGV0T2Zmc2V0ICs9IEBpcEJsb2NrXG4gICAgICBAcHVsbERvY3MoKVxuICAgIGVsc2VcblxuICAgICAgIyAtMSBiZWNhdXNlIG9uZSBvZiB0aGVtIHdpbGwgYmUgdGhpcyBjb21wdXRlclxuICAgICAgQHRhYmxldHMub2tDb3VudCA9IE1hdGgubWF4KEB0YWJsZXRzLm9rQ291bnQtMSwgMClcblxuICAgICAgaWYgQHRhYmxldHMub2tDb3VudCA9PSAwXG4gICAgICAgIEB0YWJsZXRPZmZzZXQgPSAwXG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgdChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2UuZm91bmRcIiwgY291bnQgOiBAdGFibGV0cy5va0NvdW50KVxuICAgICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvY1xuICAgICAgICAgIFwiX2lkXCIgIDogQHJhbmRvbURvYy5pZFxuICAgICAgICAgIFwiX3JldlwiIDogQHJhbmRvbURvYy5yZXZcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHVubGVzcyBjb25maXJtKHQoXCJUYWJsZXRNYW5hZ2VyVmlldy5tZXNzYWdlLmNvbmZpcm1fcHVsbFwiLCBfX2ZvdW5kX18gOiBAdGFibGV0cy5va0NvdW50KSlcbiAgICAgICAgQHRhYmxldE9mZnNldCA9IDBcbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvY1xuICAgICAgICAgIFwiX2lkXCIgIDogQHJhbmRvbURvYy5pZFxuICAgICAgICAgIFwiX3JldlwiIDogQHJhbmRvbURvYy5yZXZcbiAgICAgICAgcmV0dXJuXG5cblxuICAgICAgVXRpbHMubWlkQWxlcnQgdChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2UucHVsbF9zdGF0dXNcIiwgdGFibGV0Q291bnQgOiBAdGFibGV0cy5va0NvdW50KVxuICAgICAgZm9yIGlwIGluIEB0YWJsZXRzLmlwc1xuXG4gICAgICAgIGRvIChpcCkgPT5cbiAgICAgICAgICAjIHNlZSBpZiBvdXIgcmFuZG9tIGRvY3VtZW50IGlzIG9uIHRoZSBzZXJ2ZXIgd2UganVzdCBmb3VuZFxuICAgICAgICAgIHNlbGZSZXEgPSAkLmFqYXhcbiAgICAgICAgICAgIFwidXJsXCIgICAgICAgICA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApICsgXCIvXCIgKyBAcmFuZG9tSWREb2NcbiAgICAgICAgICAgIFwiZGF0YVR5cGVcIiAgICA6IFwianNvbnBcIlxuICAgICAgICAgICAgXCJ0aW1lb3V0XCIgICAgIDogMTAwMDBcbiAgICAgICAgICAgIFwiY29udGVudFR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCJcblxuICAgICAgICAgIHNlbGZSZXEuc3VjY2VzcyAoZGF0YSwgeGhyLCBlcnJvcikgPT5cbiAgICAgICAgICAgICMgaWYgZm91bmQgc2VsZiB0aGVuIHJlbWVtYmVyIHNlbGZcbiAgICAgICAgICAgIEBzZWxmU3VibmV0SXAgPSBpcFxuXG4gICAgICAgICAgc2VsZlJlcS5jb21wbGV0ZSAoeGhyLCBlcnJvcikgPT4gZG8gKHhocikgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiBwYXJzZUludCh4aHIuc3RhdHVzKSA9PSAyMDBcbiAgICAgICAgICAgICMgaWYgbm90LCB0aGVuIHdlIGZvdW5kIGFub3RoZXIgdGFibGV0XG4gICAgICAgICAgICB2aWV3UmVxID0gJC5hamF4XG4gICAgICAgICAgICAgIFwidXJsXCIgICAgICAgICA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApICsgXCIvX2Rlc2lnbi90YW5nZXJpbmUvX3ZpZXcvYnlDb2xsZWN0aW9uXCJcbiAgICAgICAgICAgICAgXCJkYXRhVHlwZVwiICAgIDogXCJqc29ucFwiXG4gICAgICAgICAgICAgIFwiY29udGVudFR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICAgICAgICAgIFwiZGF0YVwiICAgICAgICA6IFxuICAgICAgICAgICAgICAgIGluY2x1ZGVfZG9jcyA6IGZhbHNlXG4gICAgICAgICAgICAgICAga2V5cyA6IEpTT04uc3RyaW5naWZ5KEBkb2NUeXBlcylcblxuICAgICAgICAgICAgdmlld1JlcS5zdWNjZXNzIChkYXRhKSA9PlxuICAgICAgICAgICAgICBkb2NMaXN0ID0gKGRhdHVtLmlkIGZvciBkYXR1bSBpbiBkYXRhLnJvd3MpXG4gICAgICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApLFxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogICAgICA9PlxuICAgICAgICAgICAgICAgICAgICBAdGFibGV0cy5jb21wbGV0ZSsrXG4gICAgICAgICAgICAgICAgICAgIEB0YWJsZXRzLnN1Y2Nlc3NmdWwrK1xuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlUHVsbFJlc3VsdCgpXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKGEsIGIpID0+XG4gICAgICAgICAgICAgICAgICAgIEB0YWJsZXRzLmNvbXBsZXRlKytcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVB1bGxSZXN1bHQoKVxuICAgICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgICAgKVxuXG4gIHVwZGF0ZVB1bGxSZXN1bHQ6ID0+XG4gICAgaWYgQHRhYmxldHMuY29tcGxldGUgPT0gQHRhYmxldHMub2tDb3VudFxuICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgVXRpbHMubWlkQWxlcnQgdChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2UucHVsbF9jb21wbGV0ZVwiLCB7IHN1Y2Nlc3NmdWw6IEB0YWJsZXRzLnN1Y2Nlc3NmdWwsIHRvdGFsIDogQHRhYmxldHMub2tDb3VudH0pXG4gICAgICBUYW5nZXJpbmUuJGRiLnJlbW92ZURvYyBcbiAgICAgICAgXCJfaWRcIiAgOiBAcmFuZG9tRG9jLmlkXG4gICAgICAgIFwiX3JldlwiIDogQHJhbmRvbURvYy5yZXZcbiAgICAgIEBjYWxsYmFja3MuY29tcGxldGVQdWxsPygpXG5cbiAgcHVzaERvY3M6ID0+XG4gICAgaWYgbm90IF8uaXNPYmplY3QoQHB1c2gpXG4gICAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICAgIFRhbmdlcmluZS4kZGIudmlldyBUYW5nZXJpbmUuZGVzaWduX2RvYytcIi9ieUNvbGxlY3Rpb25cIiwgXG4gICAgICAgIGtleXMgOiBAZG9jVHlwZXNcbiAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICBkb2NJZHMgPSBfLnBsdWNrKHJlc3BvbnNlLnJvd3MsXCJpZFwiKVxuICAgICAgICBcbiAgICAgICAgICBAcHVzaCA9IFxuICAgICAgICAgICAgaXBzICAgIDogXy53aXRob3V0KEB0YWJsZXRzLmlwcywgQHNlbGZTdWJuZXRJcClcbiAgICAgICAgICAgIGRvY0lkcyA6IGRvY0lkc1xuICAgICAgICAgICAgY3VycmVudCAgICA6IDBcbiAgICAgICAgICAgIGNvbXBsZXRlICAgOiAwXG4gICAgICAgICAgICBzdWNjZXNzZnVsIDogMFxuXG4gICAgICAgICAgQHB1c2hEb2NzKClcbiAgICBlbHNlXG5cbiAgICAgIGlmIEBwdXNoLmNvbXBsZXRlID09IEBwdXNoLmlwcy5sZW5ndGhcbiAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICBVdGlscy5zdGlja3kgXCI8Yj4je0B0ZXh0LnN5bmNDb21wbGV0ZX08L2I+PGJyPiN7dChcIlRhYmxldE1hbmFnZXJWaWV3Lm1lc3NhZ2Uuc3VjY2Vzc2Z1bF9jb3VudFwiLCB7c3VjY2Vzc2Z1bCA6IEBwdXNoLnN1Y2Nlc3NmdWwsIHRvdGFsIDogQHB1c2guY29tcGxldGUgfSApIH1cIlxuICAgICAgZWxzZVxuICAgICAgICBVdGlscy5taWRBbGVydCB0KFwiVGFibGV0TWFuYWdlclZpZXcubWVzc2FnZS5zeW5jaW5nXCIseyBkb25lOiBAcHVzaC5jb21wbGV0ZSsxLCB0b3RhbCA6IEBwdXNoLmlwcy5sZW5ndGh9KVxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoIFwibG9jYWxcIiApLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoIEBwdXNoLmlwc1sgQHB1c2guY3VycmVudCBdICksXG4gICAgICAgICAgICBzdWNjZXNzOiAgICAgID0+XG4gICAgICAgICAgICAgIEBwdXNoLmNvbXBsZXRlKytcbiAgICAgICAgICAgICAgQHB1c2guc3VjY2Vzc2Z1bCsrXG4gICAgICAgICAgICAgIEBwdXNoRG9jcygpXG4gICAgICAgICAgICBlcnJvcjogKGEsIGIpID0+XG4gICAgICAgICAgICAgIEBwdXNoLmNvbXBsZXRlKytcbiAgICAgICAgICAgICAgQHB1c2hEb2NzKClcbiAgICAgICAgICAsXG4gICAgICAgICAgICBkb2NfaWRzOiBAcHVzaC5kb2NJZHNcbiAgICAgICAgKVxuXG5cbiJdfQ==
