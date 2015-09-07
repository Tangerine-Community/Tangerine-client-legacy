this["JST"] = this["JST"] || {};

this["JST"]["src/templates/DashboardLayout.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"dashboard-region\"></div>\n<div id=\"content-region\"></div>\n\n";
},"useData":true});

this["JST"]["src/templates/HomeView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<p>Select Form</p>\n<div class=\"form-group\">\n  <select id=\"formDropdown\" class=\"form-control\">\n      <option value=\"\"> -- Select One -- </option>\n      <option value=\"TrichiasisSurgery\">trichiasisSurgery</option>\n      <option value=\"PostOperativeEpilation\">PostOperativeEpilationAbbrev</option>\n  </select>\n</div>\n<table id=\"records\">\n    <thead><tr>\n        <th>Question</th>\n        <th>dateModified</th>\n    </tr></thead>\n    <tbody></tbody>\n</table>\n";
},"useData":true});

this["JST"]["src/templates/SubtestRunItemView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<h2>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n        "
    + alias3(((helper = (helper = helpers.enumeratorHelp || (depth0 != null ? depth0.enumeratorHelp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"enumeratorHelp","hash":{},"data":data}) : helper)))
    + "\n        "
    + alias3(((helper = (helper = helpers.studentDialog || (depth0 != null ? depth0.studentDialog : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"studentDialog","hash":{},"data":data}) : helper)))
    + "\n        <div id='prototype_wrapper'></div>\n\n        <div class='controlls clearfix'>\n              "
    + alias3(((helper = (helper = helpers.transitionComment || (depth0 != null ? depth0.transitionComment : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"transitionComment","hash":{},"data":data}) : helper)))
    + "\n              "
    + alias3(((helper = (helper = helpers.backButton || (depth0 != null ? depth0.backButton : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"backButton","hash":{},"data":data}) : helper)))
    + "\n              <button class='subtest-next navigation'>"
    + alias3(this.lambda(((stack1 = (data && data.text)) && stack1.next), depth0))
    + "</button>\n              "
    + alias3(((helper = (helper = helpers.skipButton || (depth0 != null ? depth0.skipButton : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"skipButton","hash":{},"data":data}) : helper)))
    + "\n            </div>\n";
},"useData":true});