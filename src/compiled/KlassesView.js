var KlassesView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassesView = (function(superClass) {
  extend(KlassesView, superClass);

  function KlassesView() {
    this.render = bind(this.render, this);
    this.onSubviewRendered = bind(this.onSubviewRendered, this);
    this.updatePullResult = bind(this.updatePullResult, this);
    this.updatePull = bind(this.updatePull, this);
    this.updateUploader = bind(this.updateUploader, this);
    return KlassesView.__super__.constructor.apply(this, arguments);
  }

  KlassesView.prototype.className = "KlassesView";

  KlassesView.prototype.events = {
    'click .klass_add': 'toggleAddForm',
    'click .klass_cancel': 'toggleAddForm',
    'click .klass_save': 'saveNewKlass',
    'click .klass_curricula': 'gotoCurricula',
    'click .goto_class': 'gotoKlass',
    'click .pull_data': 'pullData',
    'click .verify': 'ghostLogin',
    'click .upload_data': 'uploadData'
  };

  KlassesView.prototype.initialize = function(options) {
    var verReq;
    this.ipBlock = 32;
    this.totalIps = 256;
    this.tabletOffset = 0;
    this.views = [];
    this.klasses = options.klasses;
    this.curricula = options.curricula;
    this.teachers = options.teachers;
    this.klasses.on("add remove change", this.render);
    if (Tangerine.user.isAdmin()) {
      this.timer = setTimeout((function(_this) {
        return function() {
          return _this.updateUploader(false);
        };
      })(this), 20 * 1000);
      return verReq = $.ajax({
        url: Tangerine.settings.urlView("group", "byDKey"),
        dataType: "jsonp",
        data: {
          keys: ["testtest"]
        },
        timeout: 5000,
        success: (function(_this) {
          return function() {
            clearTimeout(_this.timer);
            return _this.updateUploader(true);
          };
        })(this)
      });
    }
  };

  KlassesView.prototype.ghostLogin = function() {
    return Tangerine.user.ghostLogin(Tangerine.settings.upUser, Tangerine.settings.upPass);
  };

  KlassesView.prototype.uploadData = function() {
    return $.ajax({
      "url": "/" + Tangerine.db_name + "/_design/tangerine/_view/byCollection?include_docs=false",
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json;charset=utf-8",
      "data": JSON.stringify({
        include_docs: false,
        keys: ['result', 'klass', 'student', 'teacher', 'logs', 'user']
      }),
      "success": (function(_this) {
        return function(data) {
          var docList;
          docList = _.pluck(data.rows, "id");
          return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlDB("group"), {
            success: function() {
              return Utils.midAlert("Sync successful");
            },
            error: function(a, b) {
              return Utils.midAlert("Sync error<br>" + a + " " + b);
            }
          }, {
            doc_ids: docList
          });
        };
      })(this)
    });
  };

  KlassesView.prototype.updateUploader = function(status) {
    var html;
    html = status === true ? "<button class='upload_data command'>Upload</button>" : status === false ? "<div class='menu_box'><small>No connection</small><br><button class='command verify'>Verify connection</button></div>" : "<button class='command' disabled='disabled'>Verifying connection...</button>";
    return this.$el.find(".uploader").html(html);
  };

  KlassesView.prototype.pullData = function() {
    if (this.tabletOffset === 0) {
      this.tablets = {
        checked: 0,
        complete: 0,
        successful: 0,
        okCount: 0,
        ips: [],
        result: 0
      };
      Utils.midAlert("Please wait, detecting tablets.");
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
                timeout: 10000
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
        return Utils.midAlert("Internal database error");
      }
    });
  };

  KlassesView.prototype.updatePull = function() {
    var i, ip, len, ref, results;
    if (this.tablets.checked < this.ipBlock + this.tabletOffset) {
      return;
    }
    if (this.tabletOffset !== this.totalIps - this.ipBlock) {
      this.tabletOffset += this.ipBlock;
      return this.pullData();
    } else {
      this.tablets.okCount = Math.max(this.tablets.okCount - 1, 0);
      if (this.tablets.okCount === 0) {
        this.tabletOffset = 0;
        Utils.working(false);
        Utils.midAlert(this.tablets.okCount + " tablets found.");
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      if (!confirm(this.tablets.okCount + " tablets found.\n\nStart data pull?")) {
        this.tabletOffset = 0;
        Utils.working(false);
        Tangerine.$db.removeDoc({
          "_id": this.randomDoc.id,
          "_rev": this.randomDoc.rev
        });
        return;
      }
      Utils.midAlert("Pulling from " + this.tablets.okCount + " tablets.");
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
            selfReq.success(function(data, xhr, error) {});
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
                    keys: JSON.stringify(['result', 'klass', 'student', 'curriculum', 'teacher', 'logs'])
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

  KlassesView.prototype.updatePullResult = function() {
    if (this.tablets.complete === this.tablets.okCount) {
      Utils.working(false);
      Utils.midAlert("Pull finished.<br>" + this.tablets.successful + " out of " + this.tablets.okCount + " successful.", 5000);
      Tangerine.$db.removeDoc({
        "_id": this.randomDoc.id,
        "_rev": this.randomDoc.rev
      });
      return this.klasses.fetch({
        success: (function(_this) {
          return function() {
            return _this.renderKlasses();
          };
        })(this)
      });
    }
  };

  KlassesView.prototype.gotoCurricula = function() {
    return Tangerine.router.navigate("curricula", true);
  };

  KlassesView.prototype.saveNewKlass = function() {
    var curriculum, errors, grade, i, klass, len, ref, schoolName, stream, teacherId, year;
    schoolName = $.trim(this.$el.find("#school_name").val());
    year = $.trim(this.$el.find("#year").val());
    grade = $.trim(this.$el.find("#grade").val());
    stream = $.trim(this.$el.find("#stream").val());
    curriculum = this.$el.find("#curriculum option:selected").attr("data-id");
    errors = [];
    if (schoolName === "") {
      errors.push(" - No school name.");
    }
    if (year === "") {
      errors.push(" - No year.");
    }
    if (grade === "") {
      errors.push(" - No grade.");
    }
    if (stream === "") {
      errors.push(" - No stream.");
    }
    if (curriculum === "_none") {
      errors.push(" - No curriculum selected.");
    }
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      if (klass.get("year") === year && klass.get("grade") === grade && klass.get("stream") === stream) {
        errors.push(" - Duplicate year, grade, stream.");
      }
    }
    if (errors.length === 0) {
      teacherId = Tangerine.user.has("teacherId") ? Tangerine.user.get("teacherId") : "admin";
      klass = new Klass;
      return klass.save({
        teacherId: teacherId,
        schoolName: schoolName,
        year: year,
        grade: grade,
        stream: stream,
        curriculumId: this.$el.find("#curriculum option:selected").attr("data-id"),
        startDate: (new Date()).getTime()
      }, {
        success: (function(_this) {
          return function() {
            return _this.klasses.add(klass);
          };
        })(this)
      });
    } else {
      return alert("Please correct the following errors:\n\n" + (errors.join('\n')));
    }
  };

  KlassesView.prototype.gotoKlass = function(event) {
    return Tangerine.router.navigate("class/edit/" + $(event.target).attr("data-id"));
  };

  KlassesView.prototype.toggleAddForm = function() {
    var schoolName;
    this.$el.find("#add_form, .add").toggle();
    if (!Tangerine.user.isAdmin()) {
      schoolName = this.teachers.get(Tangerine.user.get("teacherId")).get("school");
      this.$el.find("#school_name").val(schoolName);
      this.$el.find("#year").focus();
    } else {
      this.$el.find("#school_name").focus();
    }
    if (this.$el.find("#add_form").is(":visible")) {
      return this.$el.find("#add_form").scrollTo();
    }
  };

  KlassesView.prototype.renderKlasses = function() {
    var $ul, i, klass, len, ref, view;
    this.closeViews();
    $ul = $("<ul>").addClass("klass_list");
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      view = new KlassListElementView({
        klass: klass,
        curricula: this.curricula
      });
      view.on("rendered", this.onSubviewRendered);
      view.render();
      this.views.push(view);
      $ul.append(view.el);
    }
    this.$el.find("#klass_list_wrapper").empty();
    return this.$el.find("#klass_list_wrapper").append($ul);
  };

  KlassesView.prototype.onSubviewRendered = function() {
    return this.trigger("subRendered");
  };

  KlassesView.prototype.render = function() {
    var adminPanel, curricula, curriculaButton, curriculaOptionList, i, len, ref;
    curriculaOptionList = "<option data-id='_none' disabled='disabled' selected='selected'>" + (t('select a curriculum')) + "</option>";
    ref = this.curricula.models;
    for (i = 0, len = ref.length; i < len; i++) {
      curricula = ref[i];
      curriculaOptionList += "<option data-id='" + curricula.id + "'>" + (curricula.get('name')) + "</option>";
    }
    if (Tangerine.user.isAdmin() && Tangerine.settings.get("context") !== "server") {
      adminPanel = "<h1>Admin menu</h1> <button class='pull_data command'>Pull data</button> <div class='uploader'></div>";
    }
    if (Tangerine.settings.get("context") !== "server") {
      curriculaButton = "<button class='command curricula'>" + (t('all curricula')) + "</button>";
    }
    this.$el.html((adminPanel || "") + " <h1>" + (t('classes')) + "</h1> <div id='klass_list_wrapper'></div> <button class='klass_add command'>" + (t('add')) + "</button> <div id='add_form' class='confirmation'> <div class='menu_box'> <div class='label_value'> <label for='school_name'>School name</label> <input id='school_name'> </div> <div class='label_value'> <label for='year'>School year</label> <input id='year'> </div> <div class='label_value'> <label for='grade'>" + (t('grade')) + "</label> <input id='grade'> </div> <div class='label_value'> <label for='stream'>" + (t('stream')) + "</label> <input id='stream'> </div> <div class='label_value'> <label for='curriculum'>" + (t('curriculum')) + "</label><br> <select id='curriculum'>" + curriculaOptionList + "</select> </div> <button class='command klass_save'>" + (t('save')) + "</button><button class='command klass_cancel'>" + (t('cancel')) + "</button> </div> </div> " + (curriculaButton || ''));
    if (Tangerine.user.isAdmin()) {
      this.updateUploader();
    }
    this.renderKlasses();
    return this.trigger("rendered");
  };

  KlassesView.prototype.closeViews = function() {
    var i, len, ref, view;
    ref = this.views != null;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.close();
    }
    return this.views = [];
  };

  KlassesView.prototype.onClose = function() {
    return this.closeViews();
  };

  return KlassesView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3Nlc1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozt3QkFFSixTQUFBLEdBQVk7O3dCQUVaLE1BQUEsR0FDRTtJQUFBLGtCQUFBLEVBQTZCLGVBQTdCO0lBQ0EscUJBQUEsRUFBNkIsZUFEN0I7SUFFQSxtQkFBQSxFQUE2QixjQUY3QjtJQUdBLHdCQUFBLEVBQTZCLGVBSDdCO0lBSUEsbUJBQUEsRUFBNkIsV0FKN0I7SUFLQSxrQkFBQSxFQUF1QixVQUx2QjtJQU1BLGVBQUEsRUFBdUIsWUFOdkI7SUFPQSxvQkFBQSxFQUF1QixZQVB2Qjs7O3dCQVNGLFVBQUEsR0FBWSxTQUFFLE9BQUY7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLE9BQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUVoQixJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLE9BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFFBQUQsR0FBYSxPQUFPLENBQUM7SUFFckIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsSUFBQyxDQUFBLE1BQWxDO0lBRUEsSUFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQWYsQ0FBQSxDQUFIO01BRUUsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNsQixLQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQjtRQURrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQUVQLEVBQUEsR0FBSyxJQUZFO2FBS1QsTUFBQSxHQUFTLENBQUMsQ0FBQyxJQUFGLENBQ1A7UUFBQSxHQUFBLEVBQUssU0FBUyxD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O0FBQUE7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUksQ0FBQyxLQUFMLENBQUE7QUFERjtXQUVBLElBQUMsQ0FBQSxLQUFELEdBQVM7RUFIQzs7d0JBS1osT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87Ozs7R0E5VWUsUUFBUSxDQUFDIiwiZmlsZSI6Im1vZHVsZXMva2xhc3MvS2xhc3Nlc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc2VzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIktsYXNzZXNWaWV3XCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAua2xhc3NfYWRkJyAgICAgICAgIDogJ3RvZ2dsZUFkZEZvcm0nXG4gICAgJ2NsaWNrIC5rbGFzc19jYW5jZWwnICAgICAgOiAndG9nZ2xlQWRkRm9ybSdcbiAgICAnY2xpY2sgLmtsYXNzX3NhdmUnICAgICAgICA6ICdzYXZlTmV3S2xhc3MnXG4gICAgJ2NsaWNrIC5rbGFzc19jdXJyaWN1bGEnICAgOiAnZ290b0N1cnJpY3VsYSdcbiAgICAnY2xpY2sgLmdvdG9fY2xhc3MnICAgICAgICA6ICdnb3RvS2xhc3MnXG4gICAgJ2NsaWNrIC5wdWxsX2RhdGEnICAgOiAncHVsbERhdGEnXG4gICAgJ2NsaWNrIC52ZXJpZnknICAgICAgOiAnZ2hvc3RMb2dpbidcbiAgICAnY2xpY2sgLnVwbG9hZF9kYXRhJyA6ICd1cGxvYWREYXRhJ1xuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQGlwQmxvY2sgID0gMzJcbiAgICBAdG90YWxJcHMgPSAyNTZcbiAgICBAdGFibGV0T2Zmc2V0ID0gMFxuXG4gICAgQHZpZXdzID0gW11cbiAgICBAa2xhc3NlcyAgID0gb3B0aW9ucy5rbGFzc2VzXG4gICAgQGN1cnJpY3VsYSA9IG9wdGlvbnMuY3VycmljdWxhXG4gICAgQHRlYWNoZXJzICA9IG9wdGlvbnMudGVhY2hlcnNcbiAgICBcbiAgICBAa2xhc3Nlcy5vbiBcImFkZCByZW1vdmUgY2hhbmdlXCIsIEByZW5kZXJcblxuICAgIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgIyB0aW1lb3V0IGZvciB0aGUgdmVyaWZpY2F0aW9uIGF0dGVtcHRcbiAgICAgIEB0aW1lciA9IHNldFRpbWVvdXQgPT5cbiAgICAgICAgQHVwZGF0ZVVwbG9hZGVyKGZhbHNlKVxuICAgICAgLCAyMCAqIDEwMDBcblxuICAgICAgIyB0cnkgdG8gdmVyaWZ5IHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXJcbiAgICAgIHZlclJlcSA9ICQuYWpheCBcbiAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgIGRhdGFUeXBlOiBcImpzb25wXCJcbiAgICAgICAgZGF0YToga2V5czogW1widGVzdHRlc3RcIl1cbiAgICAgICAgdGltZW91dDogNTAwMFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIGNsZWFyVGltZW91dCBAdGltZXIgXG4gICAgICAgICAgQHVwZGF0ZVVwbG9hZGVyIHRydWVcblxuICBnaG9zdExvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLmdob3N0TG9naW4gVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlciwgVGFuZ2VyaW5lLnNldHRpbmdzLnVwUGFzc1xuXG4gIHVwbG9hZERhdGE6IC0+XG4gICAgJC5hamF4XG4gICAgICBcInVybFwiICAgICAgICAgOiBcIi9cIiArIFRhbmdlcmluZS5kYl9uYW1lICsgXCIvX2Rlc2lnbi90YW5nZXJpbmUvX3ZpZXcvYnlDb2xsZWN0aW9uP2luY2x1ZGVfZG9jcz1mYWxzZVwiXG4gICAgICBcInR5cGVcIiAgICAgICAgOiBcIlBPU1RcIlxuICAgICAgXCJkYXRhVHlwZVwiICAgIDogXCJqc29uXCJcbiAgICAgIFwiY29udGVudFR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBcImRhdGFcIiAgICAgICAgOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICBpbmNsdWRlX2RvY3M6IGZhbHNlXG4gICAgICAgICAga2V5cyA6IFsncmVzdWx0JywgJ2tsYXNzJywgJ3N0dWRlbnQnLCAndGVhY2hlcicsICdsb2dzJywgJ3VzZXInXVxuICAgICAgICApXG4gICAgICBcInN1Y2Nlc3NcIiA6IChkYXRhKSA9PlxuICAgICAgICBkb2NMaXN0ID0gXy5wbHVjayhkYXRhLnJvd3MsXCJpZFwiKVxuICAgICAgICAkLmNvdWNoLnJlcGxpY2F0ZShcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJsb2NhbFwiKSxcbiAgICAgICAgICBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgPT5cbiAgICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJTeW5jIHN1Y2Nlc3NmdWxcIlxuICAgICAgICAgICAgZXJyb3I6IChhLCBiKSA9PlxuICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN5bmMgZXJyb3I8YnI+I3thfSAje2J9XCJcbiAgICAgICAgICAsXG4gICAgICAgICAgICBkb2NfaWRzOiBkb2NMaXN0XG4gICAgICAgIClcblxuXG4gIHVwZGF0ZVVwbG9hZGVyOiAoc3RhdHVzKSA9PlxuICAgIGh0bWwgPVxuICAgICAgaWYgc3RhdHVzID09IHRydWVcbiAgICAgICAgXCI8YnV0dG9uIGNsYXNzPSd1cGxvYWRfZGF0YSBjb21tYW5kJz5VcGxvYWQ8L2J1dHRvbj5cIlxuICAgICAgZWxzZSBpZiBzdGF0dXMgPT0gZmFsc2UgXG4gICAgICAgIFwiPGRpdiBjbGFzcz0nbWVudV9ib3gnPjxzbWFsbD5ObyBjb25uZWN0aW9uPC9zbWFsbD48YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCB2ZXJpZnknPlZlcmlmeSBjb25uZWN0aW9uPC9idXR0b24+PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kJyBkaXNhYmxlZD0nZGlzYWJsZWQnPlZlcmlmeWluZyBjb25uZWN0aW9uLi4uPC9idXR0b24+XCJcblxuICAgIEAkZWwuZmluZChcIi51cGxvYWRlclwiKS5odG1sIGh0bWxcblxuXG4gIHB1bGxEYXRhOiAtPlxuICAgIGlmIEB0YWJsZXRPZmZzZXQgPT0gMFxuICAgICAgQHRhYmxldHMgPSAjIGlmIHlvdSBjYW4gdGhpbmsgb2YgYSBiZXR0ZXIgaWRlYSBJJ2QgbGlrZSB0byBzZWUgaXRcbiAgICAgICAgY2hlY2tlZCAgICA6IDBcbiAgICAgICAgY29tcGxldGUgICA6IDBcbiAgICAgICAgc3VjY2Vzc2Z1bCA6IDBcbiAgICAgICAgb2tDb3VudCAgICA6IDBcbiAgICAgICAgaXBzICAgICAgICA6IFtdXG4gICAgICAgIHJlc3VsdCAgICAgOiAwXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSB3YWl0LCBkZXRlY3RpbmcgdGFibGV0cy5cIlxuXG4gICAgVXRpbHMud29ya2luZyB0cnVlXG4gICAgQHJhbmRvbUlkRG9jID0gaGV4X3NoYTEoXCJcIitNYXRoLnJhbmRvbSgpKVxuICAgIFRhbmdlcmluZS4kZGIuc2F2ZURvYyBcbiAgICAgIFwiX2lkXCIgOiBAcmFuZG9tSWREb2NcbiAgICAsXG4gICAgICBzdWNjZXNzOiAoZG9jKSA9PlxuICAgICAgICBAcmFuZG9tRG9jID0gZG9jXG4gICAgICAgIGZvciBsb2NhbCBpbiBbQHRhYmxldE9mZnNldC4uKEBpcEJsb2NrLTEpK0B0YWJsZXRPZmZzZXRdXG4gICAgICAgICAgZG8gKGxvY2FsKSA9PlxuICAgICAgICAgICAgaXAgPSBUYW5nZXJpbmUuc2V0dGluZ3Muc3VibmV0SVAobG9jYWwpXG4gICAgICAgICAgICByZXEgPSAkLmFqYXhcbiAgICAgICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsU3VibmV0KGlwKVxuICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29ucFwiXG4gICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOFwiLFxuICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgcmVxLmNvbXBsZXRlICh4aHIsIGVycm9yKSA9PlxuICAgICAgICAgICAgICBAdGFibGV0cy5jaGVja2VkKytcbiAgICAgICAgICAgICAgaWYgcGFyc2VJbnQoeGhyLnN0YXR1cykgPT0gMjAwXG4gICAgICAgICAgICAgICAgQHRhYmxldHMub2tDb3VudCsrXG4gICAgICAgICAgICAgICAgQHRhYmxldHMuaXBzLnB1c2ggaXBcbiAgICAgICAgICAgICAgQHVwZGF0ZVB1bGwoKVxuICAgICAgZXJyb3I6IC0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJJbnRlcm5hbCBkYXRhYmFzZSBlcnJvclwiXG5cbiAgdXBkYXRlUHVsbDogPT5cbiAgICAjIGRvIG5vdCBwcm9jZXNzIHVubGVzcyB3ZSdyZSBkb25lIHdpdGggY2hlY2tpbmcgdGhpcyBibG9ja1xuICAgIHJldHVybiBpZiBAdGFibGV0cy5jaGVja2VkIDwgQGlwQmxvY2sgKyBAdGFibGV0T2Zmc2V0XG5cbiAgICAjIGdpdmUgdGhlIGNob2ljZSB0byBrZWVwIGxvb2tpbmcgaWYgbm90IGFsbCB0YWJsZXRzIGZvdW5kXG4gICAgaWYgQHRhYmxldE9mZnNldCAhPSBAdG90YWxJcHMgLSBAaXBCbG9jayAjJiYgY29uZmlybShcIiN7TWF0aC5tYXgoQHRhYmxldHMub2tDb3VudC0xLCAwKX0gdGFibGV0cyBmb3VuZC5cXG5cXG5Db250aW51ZSBzZWFyY2hpbmc/XCIpXG4gICAgICBAdGFibGV0T2Zmc2V0ICs9IEBpcEJsb2NrXG4gICAgICBAcHVsbERhdGEoKVxuICAgIGVsc2VcblxuICAgICAgIyAtMSBiZWNhdXNlIG9uZSBvZiB0aGVtIHdpbGwgYmUgdGhpcyBjb21wdXRlclxuICAgICAgQHRhYmxldHMub2tDb3VudCA9IE1hdGgubWF4KEB0YWJsZXRzLm9rQ291bnQtMSwgMClcblxuICAgICAgaWYgQHRhYmxldHMub2tDb3VudCA9PSAwXG4gICAgICAgIEB0YWJsZXRPZmZzZXQgPSAwXG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCIje0B0YWJsZXRzLm9rQ291bnR9IHRhYmxldHMgZm91bmQuXCJcbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5yZW1vdmVEb2NcbiAgICAgICAgICBcIl9pZFwiICA6IEByYW5kb21Eb2MuaWRcbiAgICAgICAgICBcIl9yZXZcIiA6IEByYW5kb21Eb2MucmV2XG4gICAgICAgIHJldHVyblxuXG4gICAgICB1bmxlc3MgY29uZmlybShcIiN7QHRhYmxldHMub2tDb3VudH0gdGFibGV0cyBmb3VuZC5cXG5cXG5TdGFydCBkYXRhIHB1bGw/XCIpXG4gICAgICAgIEB0YWJsZXRPZmZzZXQgPSAwXG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgVGFuZ2VyaW5lLiRkYi5yZW1vdmVEb2NcbiAgICAgICAgICBcIl9pZFwiICA6IEByYW5kb21Eb2MuaWRcbiAgICAgICAgICBcIl9yZXZcIiA6IEByYW5kb21Eb2MucmV2XG4gICAgICAgIHJldHVyblxuXG5cbiAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiUHVsbGluZyBmcm9tICN7QHRhYmxldHMub2tDb3VudH0gdGFibGV0cy5cIlxuICAgICAgZm9yIGlwIGluIEB0YWJsZXRzLmlwc1xuXG4gICAgICAgIGRvIChpcCkgPT5cbiAgICAgICAgICAjIHNlZSBpZiBvdXIgcmFuZG9tIGRvY3VtZW50IGlzIG9uIHRoZSBzZXJ2ZXIgd2UganVzdCBmb3VuZFxuICAgICAgICAgIHNlbGZSZXEgPSAkLmFqYXhcbiAgICAgICAgICAgIFwidXJsXCIgICAgICAgICA6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApICsgXCIvXCIgKyBAcmFuZG9tSWREb2NcbiAgICAgICAgICAgIFwiZGF0YVR5cGVcIiAgICA6IFwianNvbnBcIlxuICAgICAgICAgICAgXCJ0aW1lb3V0XCIgICAgIDogMTAwMDBcbiAgICAgICAgICAgIFwiY29udGVudFR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCJcblxuICAgICAgICAgIHNlbGZSZXEuc3VjY2VzcyAoZGF0YSwgeGhyLCBlcnJvcikgPT5cbiAgICAgICAgICAgICMgaWYgZm91bmQgc2VsZiB0aGVuIGRvIG5vdGhpbmdcblxuICAgICAgICAgIHNlbGZSZXEuY29tcGxldGUgKHhociwgZXJyb3IpID0+IGRvICh4aHIpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgcGFyc2VJbnQoeGhyLnN0YXR1cykgPT0gMjAwXG4gICAgICAgICAgICAjIGlmIG5vdCwgdGhlbiB3ZSBmb3VuZCBhbm90aGVyIHRhYmxldFxuICAgICAgICAgICAgdmlld1JlcSA9ICQuYWpheFxuICAgICAgICAgICAgICBcInVybFwiICAgICAgICAgOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsU3VibmV0KGlwKSArIFwiL19kZXNpZ24vdGFuZ2VyaW5lL192aWV3L2J5Q29sbGVjdGlvblwiXG4gICAgICAgICAgICAgIFwiZGF0YVR5cGVcIiAgICA6IFwianNvbnBcIlxuICAgICAgICAgICAgICBcImNvbnRlbnRUeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOFwiLFxuICAgICAgICAgICAgICBcImRhdGFcIiAgICAgICAgOiBcbiAgICAgICAgICAgICAgICBpbmNsdWRlX2RvY3MgOiBmYWxzZVxuICAgICAgICAgICAgICAgIGtleXMgOiBKU09OLnN0cmluZ2lmeShbJ3Jlc3VsdCcsICdrbGFzcycsICdzdHVkZW50JywnY3VycmljdWx1bScsICd0ZWFjaGVyJywgJ2xvZ3MnXSlcblxuICAgICAgICAgICAgdmlld1JlcS5zdWNjZXNzIChkYXRhKSA9PlxuICAgICAgICAgICAgICBkb2NMaXN0ID0gKGRhdHVtLmlkIGZvciBkYXR1bSBpbiBkYXRhLnJvd3MpXG4gICAgICAgICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxTdWJuZXQoaXApLFxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogICAgICA9PlxuICAgICAgICAgICAgICAgICAgICBAdGFibGV0cy5jb21wbGV0ZSsrXG4gICAgICAgICAgICAgICAgICAgIEB0YWJsZXRzLnN1Y2Nlc3NmdWwrK1xuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlUHVsbFJlc3VsdCgpXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKGEsIGIpID0+XG4gICAgICAgICAgICAgICAgICAgIEB0YWJsZXRzLmNvbXBsZXRlKytcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVB1bGxSZXN1bHQoKVxuICAgICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgICAgICAgKVxuXG4gIHVwZGF0ZVB1bGxSZXN1bHQ6ID0+XG4gICAgaWYgQHRhYmxldHMuY29tcGxldGUgPT0gQHRhYmxldHMub2tDb3VudFxuICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgVXRpbHMubWlkQWxlcnQgXCJQdWxsIGZpbmlzaGVkLjxicj4je0B0YWJsZXRzLnN1Y2Nlc3NmdWx9IG91dCBvZiAje0B0YWJsZXRzLm9rQ291bnR9IHN1Y2Nlc3NmdWwuXCIsIDUwMDBcbiAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jIFxuICAgICAgICBcIl9pZFwiICA6IEByYW5kb21Eb2MuaWRcbiAgICAgICAgXCJfcmV2XCIgOiBAcmFuZG9tRG9jLnJldlxuICAgICAgQGtsYXNzZXMuZmV0Y2ggc3VjY2VzczogPT4gQHJlbmRlcktsYXNzZXMoKVxuXG4gIGdvdG9DdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImN1cnJpY3VsYVwiLCB0cnVlXG5cbiAgc2F2ZU5ld0tsYXNzOiAtPlxuXG4gICAgc2Nob29sTmFtZSA9ICQudHJpbShAJGVsLmZpbmQoXCIjc2Nob29sX25hbWVcIikudmFsKCkpXG4gICAgeWVhciAgICAgICA9ICQudHJpbShAJGVsLmZpbmQoXCIjeWVhclwiKS52YWwoKSlcbiAgICBncmFkZSAgICAgID0gJC50cmltKEAkZWwuZmluZChcIiNncmFkZVwiKS52YWwoKSlcbiAgICBzdHJlYW0gICAgID0gJC50cmltKEAkZWwuZmluZChcIiNzdHJlYW1cIikudmFsKCkpXG4gICAgY3VycmljdWx1bSA9IEAkZWwuZmluZChcIiNjdXJyaWN1bHVtIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1pZFwiKVxuXG4gICAgZXJyb3JzID0gW11cbiAgICBlcnJvcnMucHVzaCBcIiAtIE5vIHNjaG9vbCBuYW1lLlwiICAgICAgICAgaWYgc2Nob29sTmFtZSA9PSBcIlwiXG4gICAgZXJyb3JzLnB1c2ggXCIgLSBObyB5ZWFyLlwiICAgICAgICAgICAgICAgIGlmIHllYXIgICAgICAgPT0gXCJcIiBcbiAgICBlcnJvcnMucHVzaCBcIiAtIE5vIGdyYWRlLlwiICAgICAgICAgICAgICAgaWYgZ3JhZGUgICAgICA9PSBcIlwiIFxuICAgIGVycm9ycy5wdXNoIFwiIC0gTm8gc3RyZWFtLlwiICAgICAgICAgICAgICBpZiBzdHJlYW0gICAgID09IFwiXCIgXG4gICAgZXJyb3JzLnB1c2ggXCIgLSBObyBjdXJyaWN1bHVtIHNlbGVjdGVkLlwiIGlmIGN1cnJpY3VsdW0gPT0gXCJfbm9uZVwiIFxuICAgIFxuICAgIGZvciBrbGFzcyBpbiBAa2xhc3Nlcy5tb2RlbHNcbiAgICAgIGlmIGtsYXNzLmdldChcInllYXJcIikgICA9PSB5ZWFyICYmIFxuICAgICAgICAga2xhc3MuZ2V0KFwiZ3JhZGVcIikgID09IGdyYWRlICYmXG4gICAgICAgICBrbGFzcy5nZXQoXCJzdHJlYW1cIikgPT0gc3RyZWFtXG4gICAgICAgIGVycm9ycy5wdXNoIFwiIC0gRHVwbGljYXRlIHllYXIsIGdyYWRlLCBzdHJlYW0uXCJcblxuICAgIGlmIGVycm9ycy5sZW5ndGggPT0gMFxuICAgICAgdGVhY2hlcklkID0gaWYgVGFuZ2VyaW5lLnVzZXIuaGFzKFwidGVhY2hlcklkXCIpXG4gICAgICAgIFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKVxuICAgICAgZWxzZVxuICAgICAgICBcImFkbWluXCJcbiAgICAgIGtsYXNzID0gbmV3IEtsYXNzXG4gICAgICBrbGFzcy5zYXZlIFxuICAgICAgICB0ZWFjaGVySWQgICAgOiB0ZWFjaGVySWRcbiAgICAgICAgc2Nob29sTmFtZSAgIDogc2Nob29sTmFtZVxuICAgICAgICB5ZWFyICAgICAgICAgOiB5ZWFyXG4gICAgICAgIGdyYWRlICAgICAgICA6IGdyYWRlXG4gICAgICAgIHN0cmVhbSAgICAgICA6IHN0cmVhbVxuICAgICAgICBjdXJyaWN1bHVtSWQgOiBAJGVsLmZpbmQoXCIjY3VycmljdWx1bSBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtaWRcIilcbiAgICAgICAgc3RhcnREYXRlICAgIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIEBrbGFzc2VzLmFkZCBrbGFzc1xuICAgIGVsc2VcbiAgICAgIGFsZXJ0IChcIlBsZWFzZSBjb3JyZWN0IHRoZSBmb2xsb3dpbmcgZXJyb3JzOlxcblxcbiN7ZXJyb3JzLmpvaW4oJ1xcbicpfVwiKVxuXG4gIGdvdG9LbGFzczogKGV2ZW50KSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy9lZGl0L1wiKyQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS1pZFwiKVxuXG4gIHRvZ2dsZUFkZEZvcm06IC0+XG4gICAgQCRlbC5maW5kKFwiI2FkZF9mb3JtLCAuYWRkXCIpLnRvZ2dsZSgpXG4gICAgaWYgbm90IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgc2Nob29sTmFtZSA9IEB0ZWFjaGVycy5nZXQoVGFuZ2VyaW5lLnVzZXIuZ2V0KFwidGVhY2hlcklkXCIpKS5nZXQoXCJzY2hvb2xcIilcbiAgICAgIEAkZWwuZmluZChcIiNzY2hvb2xfbmFtZVwiKS52YWwoc2Nob29sTmFtZSlcbiAgICAgIEAkZWwuZmluZChcIiN5ZWFyXCIpLmZvY3VzKClcbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjc2Nob29sX25hbWVcIikuZm9jdXMoKVxuICAgIGlmIEAkZWwuZmluZChcIiNhZGRfZm9ybVwiKS5pcyhcIjp2aXNpYmxlXCIpIHRoZW4gQCRlbC5maW5kKFwiI2FkZF9mb3JtXCIpLnNjcm9sbFRvKClcblxuICByZW5kZXJLbGFzc2VzOiAtPlxuICAgIEBjbG9zZVZpZXdzKClcblxuICAgICR1bCA9ICQoXCI8dWw+XCIpLmFkZENsYXNzKFwia2xhc3NfbGlzdFwiKVxuICAgIGZvciBrbGFzcyBpbiBAa2xhc3Nlcy5tb2RlbHNcbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NMaXN0RWxlbWVudFZpZXdcbiAgICAgICAga2xhc3MgICAgICA6IGtsYXNzXG4gICAgICAgIGN1cnJpY3VsYSAgOiBAY3VycmljdWxhXG4gICAgICB2aWV3Lm9uIFwicmVuZGVyZWRcIiwgQG9uU3Vidmlld1JlbmRlcmVkXG4gICAgICB2aWV3LnJlbmRlcigpXG4gICAgICBAdmlld3MucHVzaCB2aWV3XG4gICAgICAkdWwuYXBwZW5kIHZpZXcuZWxcbiAgICBAJGVsLmZpbmQoXCIja2xhc3NfbGlzdF93cmFwcGVyXCIpLmVtcHR5KClcbiAgICBAJGVsLmZpbmQoXCIja2xhc3NfbGlzdF93cmFwcGVyXCIpLmFwcGVuZCAkdWxcblxuICBvblN1YnZpZXdSZW5kZXJlZDogPT5cbiAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICByZW5kZXI6ID0+XG5cbiAgICBjdXJyaWN1bGFPcHRpb25MaXN0ID0gXCI8b3B0aW9uIGRhdGEtaWQ9J19ub25lJyBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+I3t0KCdzZWxlY3QgYSBjdXJyaWN1bHVtJyl9PC9vcHRpb24+XCJcbiAgICBmb3IgY3VycmljdWxhIGluIEBjdXJyaWN1bGEubW9kZWxzXG4gICAgICBjdXJyaWN1bGFPcHRpb25MaXN0ICs9IFwiPG9wdGlvbiBkYXRhLWlkPScje2N1cnJpY3VsYS5pZH0nPiN7Y3VycmljdWxhLmdldCAnbmFtZSd9PC9vcHRpb24+XCJcblxuICAgIGFkbWluUGFuZWwgPSBcIlxuICAgICAgPGgxPkFkbWluIG1lbnU8L2gxPlxuICAgICAgPGJ1dHRvbiBjbGFzcz0ncHVsbF9kYXRhIGNvbW1hbmQnPlB1bGwgZGF0YTwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzcz0ndXBsb2FkZXInPjwvZGl2PlxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKSAmJiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSBpc250IFwic2VydmVyXCJcblxuICAgIGN1cnJpY3VsYUJ1dHRvbiA9IFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGN1cnJpY3VsYSc+I3t0KCdhbGwgY3VycmljdWxhJyl9PC9idXR0b24+XG4gICAgXCIgaWYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgaXNudCBcInNlcnZlclwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgICN7YWRtaW5QYW5lbCB8fCBcIlwifVxuICAgICAgPGgxPiN7dCgnY2xhc3NlcycpfTwvaDE+XG4gICAgICA8ZGl2IGlkPSdrbGFzc19saXN0X3dyYXBwZXInPjwvZGl2PlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdrbGFzc19hZGQgY29tbWFuZCc+I3t0KCdhZGQnKX08L2J1dHRvbj5cbiAgICAgIDxkaXYgaWQ9J2FkZF9mb3JtJyBjbGFzcz0nY29uZmlybWF0aW9uJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPiBcbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzY2hvb2xfbmFtZSc+U2Nob29sIG5hbWU8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdzY2hvb2xfbmFtZSc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0neWVhcic+U2Nob29sIHllYXI8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSd5ZWFyJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdncmFkZSc+I3t0KCdncmFkZScpfTwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J2dyYWRlJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdzdHJlYW0nPiN7dCgnc3RyZWFtJyl9PC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD0nc3RyZWFtJz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdjdXJyaWN1bHVtJz4je3QoJ2N1cnJpY3VsdW0nKX08L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2N1cnJpY3VsdW0nPiN7Y3VycmljdWxhT3B0aW9uTGlzdH08L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGtsYXNzX3NhdmUnPiN7dCgnc2F2ZScpfTwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2NvbW1hbmQga2xhc3NfY2FuY2VsJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgI3tjdXJyaWN1bGFCdXR0b24gfHwgJyd9XG4gICAgXCJcblxuICAgIEB1cGRhdGVVcGxvYWRlcigpIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgQHJlbmRlcktsYXNzZXMoKVxuICAgIFxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGNsb3NlVmlld3M6IC0+XG4gICAgZm9yIHZpZXcgaW4gQHZpZXdzP1xuICAgICAgdmlldy5jbG9zZSgpXG4gICAgQHZpZXdzID0gW11cblxuICBvbkNsb3NlOiAtPlxuICAgIEBjbG9zZVZpZXdzKCkiXX0=
