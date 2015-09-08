this["JST"] = this["JST"] || {};

this["JST"]["src/templates/DashboardLayout.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"dashboard-region\"></div>\n<div id=\"content-region\"></div>\n\n";
},"useData":true});

this["JST"]["src/templates/HomeView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<h2>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n<div id='progress'></div>\n<div id=\"survey\">\n</div>\n";
},"useData":true});

this["JST"]["src/templates/SubtestRunItemView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<h2>"
    + alias1(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.enumeratorHelp : stack1), depth0))
    + "\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.studentDialog : stack1), depth0))
    + "\n<div id='prototype_wrapper'></div>\n\n<div class='controlls clearfix'>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.transitionComment : stack1), depth0))
    + "\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.backButton : stack1), depth0))
    + "\n    <button class='subtest-next navigation'>"
    + alias1(alias2(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.next : stack1), depth0))
    + "</button>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.skipButton : stack1), depth0))
    + "\n</div>\n";
},"useData":true});