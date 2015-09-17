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
    + "</h2>\n<div id='progress'></div>\n<div id='subtest_wrapper'></div>\n<div class='controlls clearfix'>\n    "
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

this["JST"]["src/templates/Grid.handlebars"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=helpers.helperMissing, alias3="function";

  return "    <button class='subtest_help command'>"
    + alias1(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.help : stack1), depth0))
    + "</button>\n    <div class='enumerator_help'>"
    + alias1(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.enumeratorHelp || (depth0 != null ? depth0.enumeratorHelp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"enumeratorHelp","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "    <div class='student_dialog' "
    + this.escapeExpression(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.studentDialog || (depth0 != null ? depth0.studentDialog : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"studentDialog","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "<h3>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.enumeratorHelp : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.studentDialog : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"grid","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});

this["JST"]["src/templates/GridExample.handlebars"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression;

  return "<div class='timer_wrapper'>\n    <button class='start_time time'>"
    + alias1(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.start : stack1), depth0))
    + "</button>\n    <div class='timer'>"
    + alias1(((helper = (helper = helpers.timer || (depth0 != null ? depth0.timer : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"timer","hash":{},"data":data}) : helper)))
    + "</div>\n</div>\n";
},"3":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<table class='grid "
    + alias3(((helper = (helper = helpers.disabling || (depth0 != null ? depth0.disabling : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"disabling","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.displayRtl || (depth0 != null ? depth0.displayRtl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"displayRtl","hash":{},"data":data}) : helper)))
    + "'>\n"
    + ((stack1 = (helpers.startRow || (depth0 && depth0.startRow) || alias1).call(depth0,(data && data.index),(depth0 != null ? depth0.columns : depth0),{"name":"startRow","hash":{},"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":this.program(4, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        "
    + ((stack1 = (helpers.startCell || (depth0 && depth0.startCell) || alias1).call(depth0,(data && data.index),{"name":"startCell","hash":{},"data":data})) != null ? stack1 : "")
    + "\n            <td>\n                <button data-label='"
    + alias3(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"label","hash":{},"data":data}) : helper)))
    + "' data-index='"
    + alias3(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "' class='grid_element "
    + alias3(((helper = (helper = helpers.fontSizeClass || (depth0 != null ? depth0.fontSizeClass : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontSizeClass","hash":{},"data":data}) : helper)))
    + "' "
    + alias3(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + alias3((helpers.gridLabel || (depth0 && depth0.gridLabel) || alias1).call(depth0,(depths[1] != null ? depths[1].items : depths[1]),(depths[1] != null ? depths[1].itemMap : depths[1]),(data && data.index),{"name":"gridLabel","hash":{},"data":data}))
    + "</button>\n            </td>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing;

  return "<h3>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.untimed : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.layoutMode_fixed : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.endRow || (depth0 && depth0.endRow) || alias1).call(depth0,(data && data.index),{"name":"endRow","hash":{},"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true,"useDepths":true});

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

this["JST"]["src/templates/Survey.handlebars"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=helpers.helperMissing, alias3="function";

  return "    <button class='subtest_help command'>"
    + alias1(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.help : stack1), depth0))
    + "</button>\n    <div class='enumerator_help'>"
    + alias1(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.enumeratorHelp || (depth0 != null ? depth0.enumeratorHelp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"enumeratorHelp","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "    <div class='student_dialog' "
    + this.escapeExpression(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.studentDialog || (depth0 != null ? depth0.studentDialog : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"studentDialog","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.enumeratorHelp : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.studentDialog : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "<h3>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"useData":true});