this["JST"] = this["JST"] || {};

this["JST"]["src/templates/AssessmentControls.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<h2>"
    + alias1(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n<div id='progress'></div>\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.enumeratorHelp : stack1), depth0))
    + "\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.studentDialog : stack1), depth0))
    + "\n<div id='subtest_wrapper'></div>\n<div class='controlls clearfix'>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.transitionComment : stack1), depth0))
    + "\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.backButton : stack1), depth0))
    + "\n    <button class='subtest-next navigation'>"
    + alias1(alias2(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.next : stack1), depth0))
    + "</button>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.skipButton : stack1), depth0))
    + "\n</div>\n\n\n";
},"useData":true});

this["JST"]["src/templates/AssessmentDashboardFooter.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class='controlls clearfix'>\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.transitionComment : stack1), depth0))
    + "\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.backButton : stack1), depth0))
    + "\n    <button class='subtest-next navigation'>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.next : stack1), depth0))
    + "</button>\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.skipButton : stack1), depth0))
    + "\n</div>\n";
},"useData":true});

this["JST"]["src/templates/AssessmentDashboardHeader.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<h2>"
    + alias1(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n<div id='progress'></div>\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.enumeratorHelp : stack1), depth0))
    + "\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.studentDialog : stack1), depth0))
    + "\n<div id='prototype_wrapper'></div>\n\n\n";
},"useData":true});

this["JST"]["src/templates/AssessmentView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<h2>"
    + alias1(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n<div id='progress'></div>\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.enumeratorHelp : stack1), depth0))
    + "\n"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.studentDialog : stack1), depth0))
    + "\n<div id='subtest_wrapper'></div>\n<div class='controlls clearfix'>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.transitionComment : stack1), depth0))
    + "\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.backButton : stack1), depth0))
    + "\n    <button class='subtest-next navigation'>"
    + alias1(alias2(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.next : stack1), depth0))
    + "</button>\n    "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.skipButton : stack1), depth0))
    + "\n</div>\n";
},"useData":true});

this["JST"]["src/templates/DashboardLayout.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"header-region\"></div>\n<div id=\"content-region\"></div>\n<div id=\"footer-region\"></div>\n\n";
},"useData":true});

this["JST"]["src/templates/HomeView.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"survey\">\n</div>\n";
},"useData":true});

this["JST"]["src/templates/QuestionView.handlebars"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "\n<div class='error_message'></div>\n<div class='prompt' "
    + alias3(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + alias3(((helper = (helper = helpers.prompt || (depth0 != null ? depth0.prompt : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"prompt","hash":{},"data":data}) : helper)))
    + "</div>\n<div class='hint' "
    + alias3(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + alias3(((helper = (helper = helpers.hint || (depth0 != null ? depth0.hint : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"hint","hash":{},"data":data}) : helper)))
    + "</div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isOpen : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(data && data.isObservation),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.multiline : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.program(5, data, 0),"data":data})) != null ? stack1 : "");
},"3":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div><textarea id='"
    + alias3(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"cid","hash":{},"data":data}) : helper)))
    + "_"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "' data-cid='"
    + alias3(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"cid","hash":{},"data":data}) : helper)))
    + "' value='"
    + alias3(((helper = (helper = helpers.answerValue || (depth0 != null ? depth0.answerValue : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"answerValue","hash":{},"data":data}) : helper)))
    + "'></textarea></div>\n";
},"5":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div><input id='"
    + alias3(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"cid","hash":{},"data":data}) : helper)))
    + "_"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "' data-cid='"
    + alias3(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"cid","hash":{},"data":data}) : helper)))
    + "' value='"
    + alias3(((helper = (helper = helpers.answerValue || (depth0 != null ? depth0.answerValue : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"answerValue","hash":{},"data":data}) : helper)))
    + "'></div>\n";
},"7":function(depth0,helpers,partials,data) {
    return "    <div class='button_container'></div>\n";
},"9":function(depth0,helpers,partials,data) {
    var helper;

  return "    <img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='"
    + this.escapeExpression(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"cid","hash":{},"data":data}) : helper)))
    + "'>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.notAsked : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
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

this["JST"]["src/templates/Survey.handlebars"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<h3>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"useData":true});