var KlassListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassListElementView = (function(superClass) {
  extend(KlassListElementView, superClass);

  function KlassListElementView() {
    this.render = bind(this.render, this);
    return KlassListElementView.__super__.constructor.apply(this, arguments);
  }

  KlassListElementView.prototype.className = "KlassListElementView";

  KlassListElementView.prototype.tagName = "li";

  KlassListElementView.prototype.events = {
    'click .klass_run': 'run',
    'click .klass_results': 'showReportSelect',
    'change #report': 'getReportMenu',
    'click .cancel_report': 'cancelReport',
    'click .klass_edit': 'edit',
    'click .klass_delete': 'toggleDelete',
    'click .klass_delete_cancel': 'toggleDelete',
    'click .klass_delete_delete': 'delete'
  };

  KlassListElementView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.availableReports = Tangerine.config.get("reports");
    if (options.klass.has("curriculumId")) {
      this.curriculum = new Curriculum({
        "_id": options.klass.get("curriculumId" || "")
      });
      return this.curriculum.fetch({
        success: this.render
      });
    } else {
      return this.curriculum = new Curriculum;
    }
  };

  KlassListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/edit/" + this.klass.id, true);
  };

  KlassListElementView.prototype.getReportMenu = function(event) {
    var ref;
    if ((ref = this.subMenuView) != null) {
      ref.close();
    }
    this.subMenuView = new window[$(event.target).find(":selected").attr("data-menu_view")]({
      parent: this
    });
    this.$el.find("#report_menu_container").append("<div class='report_menu'></div>");
    this.subMenuView.setElement(this.$el.find("#report_menu_container .report_menu"));
    return this.subMenuView.render();
  };

  KlassListElementView.prototype.showReportSelect = function() {
    return this.$el.find(".report_select_container").removeClass("confirmation");
  };

  KlassListElementView.prototype.cancelReport = function() {
    var ref;
    this.$el.find('div#report_menu').empty();
    this.$el.find('#report :nth-child(1)').attr('selected', 'selected');
    this.$el.find(".report_select_container").addClass("confirmation");
    return (ref = this.subMenuView) != null ? ref.close() : void 0;
  };

  KlassListElementView.prototype.onClose = function() {
    var ref;
    return (ref = this.subMenuView) != null ? ref.close() : void 0;
  };

  KlassListElementView.prototype.run = function() {
    return Tangerine.router.navigate("class/" + this.klass.id, true);
  };

  KlassListElementView.prototype.toggleDelete = function() {
    return this.$el.find(".klass_delete_confirm").toggle();
  };

  KlassListElementView.prototype["delete"] = function() {
    return this.klass.collection.get(this.klass).destroy();
  };

  KlassListElementView.prototype.render = function() {
    var htmlTeacher, i, klass, len, menuOptions, ref, report, teacher, teacherName;
    klass = this.klass;
    if (klass.get("teacherId") === "admin") {
      teacherName = "admin";
    } else {
      teacher = vm.currentView.teachers.get(klass.get("teacherId"));
      teacherName = (teacher != null ? teacher.getEscapedString('name') : void 0) || "";
    }
    if (Tangerine.user.isAdmin()) {
      htmlTeacher = "<tr><th>Teacher</th><td>" + teacherName + "</td></tr>";
    }
    menuOptions = "";
    ref = this.availableReports;
    for (i = 0, len = ref.length; i < len; i++) {
      report = ref[i];
      if ((report.context == null) || report.context === Tangerine.settings.get('context')) {
        menuOptions += "<option data-menu_view='" + report.menuView + "'>" + (t(report.name)) + "</option>";
      }
    }
    this.$el.html("<table> " + (htmlTeacher || "") + " <tr><th>School name</th><td>" + (klass.getEscapedString('schoolName')) + "</td></tr> <tr><th>School year</th><td>" + (klass.getString('year')) + "</td></tr> <tr><th>" + (t('grade')) + "</th><td>" + (klass.getString('grade')) + "</td></tr> <tr><th>" + (t('stream')) + "</th><td>" + (klass.getString('stream')) + "</td></tr> <tr><th>" + (t('curriculum')) + "</th><td>" + (this.curriculum.getEscapedString('name')) + "</td></tr> </table> <img src='images/icon_run.png'     class='icon klass_run'> <img src='images/icon_results.png' class='icon klass_results'> <img src='images/icon_edit.png'    class='icon klass_edit'> <img src='images/icon_delete.png'  class='icon klass_delete'> <div class='report_select_container confirmation'> <div class='menu_box'> <select id='report'> <option selected='selected' disabled='disabled'>" + (t('select report type')) + "</option> " + menuOptions + " </select> </div> <div id='report_menu_container'></div> <button class='command cancel_report'>" + (t('cancel')) + "</button> </div> <div class='klass_delete_confirm confirmation'> <div class='menu_box'> " + (t('confirm')) + "<br> <button class='klass_delete_delete command_red'>" + (t('delete')) + "</button> <button class='klass_delete_cancel command'>" + (t('cancel')) + "</button> </div> </div>");
    return this.trigger("rendered");
  };

  return KlassListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMva2xhc3MvS2xhc3NMaXN0RWxlbWVudFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsb0JBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztpQ0FFSixTQUFBLEdBQVk7O2lDQUVaLE9BQUEsR0FBUzs7aUNBRVQsTUFBQSxHQUNFO0lBQUEsa0JBQUEsRUFBK0IsS0FBL0I7SUFDQSxzQkFBQSxFQUErQixrQkFEL0I7SUFFQSxnQkFBQSxFQUF5QixlQUZ6QjtJQUdBLHNCQUFBLEVBQXlCLGNBSHpCO0lBSUEsbUJBQUEsRUFBK0IsTUFKL0I7SUFLQSxxQkFBQSxFQUErQixjQUwvQjtJQU1BLDRCQUFBLEVBQStCLGNBTi9CO0lBT0EsNEJBQUEsRUFBK0IsUUFQL0I7OztpQ0FTRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7SUFFakIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBakIsQ0FBcUIsU0FBckI7SUFDcEIsSUFBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBa0IsY0FBbEIsQ0FBSDtNQUNFLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUNoQjtRQUFBLEtBQUEsRUFBUSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBa0IsY0FBQSxJQUFrQixFQUFwQyxDQUFSO09BRGdCO2FBRWxCLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUNFO1FBQUEsT0FBQSxFQUFVLElBQUMsQ0FBQSxNQUFYO09BREYsRUFIRjtLQUFBLE1BQUE7YUFNRSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksV0FOcEI7O0VBTFU7O2lDQWFaLElBQUEsR0FBTSxTQUFBO1dBQ0osU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixhQUFBLEdBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBakQsRUFBcUQsSUFBckQ7RUFE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bGFzc0xpc3RFbGVtZW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzTGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3NMaXN0RWxlbWVudFZpZXdcIlxuXG4gIHRhZ05hbWU6IFwibGlcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmtsYXNzX3J1bicgICAgICAgICAgIDogJ3J1bidcbiAgICAnY2xpY2sgLmtsYXNzX3Jlc3VsdHMnICAgICAgIDogJ3Nob3dSZXBvcnRTZWxlY3QnXG4gICAgJ2NoYW5nZSAjcmVwb3J0JyAgICAgICA6ICdnZXRSZXBvcnRNZW51J1xuICAgICdjbGljayAuY2FuY2VsX3JlcG9ydCcgOiAnY2FuY2VsUmVwb3J0J1xuICAgICdjbGljayAua2xhc3NfZWRpdCcgICAgICAgICAgOiAnZWRpdCdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZScgICAgICAgIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZV9jYW5jZWwnIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZV9kZWxldGUnIDogJ2RlbGV0ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBrbGFzcyA9IG9wdGlvbnMua2xhc3NcblxuICAgIEBhdmFpbGFibGVSZXBvcnRzID0gVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJyZXBvcnRzXCIpXG4gICAgaWYgb3B0aW9ucy5rbGFzcy5oYXMgXCJjdXJyaWN1bHVtSWRcIlxuICAgICAgQGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcbiAgICAgICAgXCJfaWRcIiA6IG9wdGlvbnMua2xhc3MuZ2V0IFwiY3VycmljdWx1bUlkXCIgfHwgXCJcIlxuICAgICAgQGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgc3VjY2VzcyA6IEByZW5kZXJcbiAgICBlbHNlXG4gICAgICBAY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFxuXG4gIGVkaXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzL2VkaXQvXCIgKyBAa2xhc3MuaWQsIHRydWVcblxuICBnZXRSZXBvcnRNZW51OiAoZXZlbnQpIC0+XG4gICAgQHN1Yk1lbnVWaWV3Py5jbG9zZSgpXG4gICAgQHN1Yk1lbnVWaWV3ID0gbmV3IHdpbmRvd1skKGV2ZW50LnRhcmdldCkuZmluZChcIjpzZWxlY3RlZFwiKS5hdHRyKFwiZGF0YS1tZW51X3ZpZXdcIildXG4gICAgICBwYXJlbnQgOiBAXG4gICAgQCRlbC5maW5kKFwiI3JlcG9ydF9tZW51X2NvbnRhaW5lclwiKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdyZXBvcnRfbWVudSc+PC9kaXY+XCIpXG4gICAgQHN1Yk1lbnVWaWV3LnNldEVsZW1lbnQgQCRlbC5maW5kKFwiI3JlcG9ydF9tZW51X2NvbnRhaW5lciAucmVwb3J0X21lbnVcIilcbiAgICBAc3ViTWVudVZpZXcucmVuZGVyKClcblxuICBzaG93UmVwb3J0U2VsZWN0OiAtPiBAJGVsLmZpbmQoXCIucmVwb3J0X3NlbGVjdF9jb250YWluZXJcIikucmVtb3ZlQ2xhc3MgXCJjb25maXJtYXRpb25cIlxuXG4gIGNhbmNlbFJlcG9ydDogLT5cbiAgICBAJGVsLmZpbmQoJ2RpdiNyZXBvcnRfbWVudScpLmVtcHR5KClcbiAgICBAJGVsLmZpbmQoJyNyZXBvcnQgOm50aC1jaGlsZCgxKScpLmF0dHIoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJylcbiAgICBAJGVsLmZpbmQoXCIucmVwb3J0X3NlbGVjdF9jb250YWluZXJcIikuYWRkQ2xhc3MgXCJjb25maXJtYXRpb25cIlxuICAgIEBzdWJNZW51Vmlldz8uY2xvc2UoKVxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHN1Yk1lbnVWaWV3Py5jbG9zZSgpXG5cbiAgcnVuOiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy9cIiArIEBrbGFzcy5pZCwgdHJ1ZVxuXG4gIHRvZ2dsZURlbGV0ZTogLT4gQCRlbC5maW5kKFwiLmtsYXNzX2RlbGV0ZV9jb25maXJtXCIpLnRvZ2dsZSgpXG5cbiAgZGVsZXRlOiAtPlxuICAgIEBrbGFzcy5jb2xsZWN0aW9uLmdldChAa2xhc3MpLmRlc3Ryb3koKVxuXG4gIHJlbmRlcjogPT5cbiAgICBrbGFzcyA9IEBrbGFzc1xuXG4gICAgaWYga2xhc3MuZ2V0KFwidGVhY2hlcklkXCIpID09IFwiYWRtaW5cIlxuICAgICAgdGVhY2hlck5hbWUgPSBcImFkbWluXCJcbiAgICBlbHNlXG4gICAgICB0ZWFjaGVyID0gdm0uY3VycmVudFZpZXcudGVhY2hlcnMuZ2V0KGtsYXNzLmdldChcInRlYWNoZXJJZFwiKSlcbiAgICAgIHRlYWNoZXJOYW1lID0gdGVhY2hlcj8uZ2V0RXNjYXBlZFN0cmluZygnbmFtZScpIHx8IFwiXCJcblxuICAgIGh0bWxUZWFjaGVyID0gXCJcbiAgICAgIDx0cj48dGg+VGVhY2hlcjwvdGg+PHRkPiN7dGVhY2hlck5hbWV9PC90ZD48L3RyPlxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKSBcblxuICAgIG1lbnVPcHRpb25zID0gXCJcIlxuICAgIGZvciByZXBvcnQgaW4gQGF2YWlsYWJsZVJlcG9ydHNcbiAgICAgIGlmIG5vdCByZXBvcnQuY29udGV4dD8gb3IgcmVwb3J0LmNvbnRleHQgaXMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnY29udGV4dCcpXG4gICAgICAgIG1lbnVPcHRpb25zICs9IFwiPG9wdGlvbiBkYXRhLW1lbnVfdmlldz0nI3tyZXBvcnQubWVudVZpZXd9Jz4je3QocmVwb3J0Lm5hbWUpfTwvb3B0aW9uPlwiIFxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8dGFibGU+XG4gICAgICAgICN7aHRtbFRlYWNoZXIgfHwgXCJcIn1cbiAgICAgICAgPHRyPjx0aD5TY2hvb2wgbmFtZTwvdGg+PHRkPiN7a2xhc3MuZ2V0RXNjYXBlZFN0cmluZygnc2Nob29sTmFtZScpfTwvdGQ+PC90cj5cbiAgICAgICAgPHRyPjx0aD5TY2hvb2wgeWVhcjwvdGg+PHRkPiN7a2xhc3MuZ2V0U3RyaW5nKCd5ZWFyJyl9PC90ZD48L3RyPlxuICAgICAgICA8dHI+PHRoPiN7dCgnZ3JhZGUnKX08L3RoPjx0ZD4je2tsYXNzLmdldFN0cmluZygnZ3JhZGUnKX08L3RkPjwvdHI+XG4gICAgICAgIDx0cj48dGg+I3t0KCdzdHJlYW0nKX08L3RoPjx0ZD4je2tsYXNzLmdldFN0cmluZygnc3RyZWFtJyl9PC90ZD48L3RyPlxuICAgICAgICA8dHI+PHRoPiN7dCgnY3VycmljdWx1bScpfTwvdGg+PHRkPiN7QGN1cnJpY3VsdW0uZ2V0RXNjYXBlZFN0cmluZygnbmFtZScpfTwvdGQ+PC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fcnVuLnBuZycgICAgIGNsYXNzPSdpY29uIGtsYXNzX3J1bic+IFxuICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX3Jlc3VsdHMucG5nJyBjbGFzcz0naWNvbiBrbGFzc19yZXN1bHRzJz4gXG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZWRpdC5wbmcnICAgIGNsYXNzPSdpY29uIGtsYXNzX2VkaXQnPiBcbiAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJyAgY2xhc3M9J2ljb24ga2xhc3NfZGVsZXRlJz4gXG4gICAgICA8ZGl2IGNsYXNzPSdyZXBvcnRfc2VsZWN0X2NvbnRhaW5lciBjb25maXJtYXRpb24nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPHNlbGVjdCBpZD0ncmVwb3J0Jz5cbiAgICAgICAgICAgIDxvcHRpb24gc2VsZWN0ZWQ9J3NlbGVjdGVkJyBkaXNhYmxlZD0nZGlzYWJsZWQnPiN7dCgnc2VsZWN0IHJlcG9ydCB0eXBlJyl9PC9vcHRpb24+XG4gICAgICAgICAgICAje21lbnVPcHRpb25zfVxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD0ncmVwb3J0X21lbnVfY29udGFpbmVyJz48L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBjYW5jZWxfcmVwb3J0Jz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdrbGFzc19kZWxldGVfY29uZmlybSBjb25maXJtYXRpb24nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgI3t0KCdjb25maXJtJyl9PGJyPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J2tsYXNzX2RlbGV0ZV9kZWxldGUgY29tbWFuZF9yZWQnPiN7dCgnZGVsZXRlJyl9PC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0na2xhc3NfZGVsZXRlX2NhbmNlbCBjb21tYW5kJz4je3QoJ2NhbmNlbCcpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuXG4iXX0=
