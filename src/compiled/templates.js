this["JST"] = this["JST"] || {};
this["JST"]["AssessmentView"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "    <button class='subtest_help command'>"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.text : stack1)) != null ? stack1.help : stack1), depth0))
    + "</button>\n    <div class='enumerator_help' "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.fontStyle : stack1), depth0))
    + ">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.enumeratorHelp : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda;

  return "    <div class='student_dialog' "
    + container.escapeExpression(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.fontStyle : stack1), depth0))
    + ">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.studentDialog : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "      <div class=\"controlls--transition-comment\">\n        "
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.transitionComment : stack1), depth0)) != null ? stack1 : "")
    + "\n      </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=container.escapeExpression, alias3=container.lambda;

  return "<h1>"
    + alias2(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h1>\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.enumeratorHelp : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.studentDialog : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<div id='progress'></div>\n<div id='subtest_wrapper'></div>\n<div class='controlls clearfix'>\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.subtest : depth0)) != null ? stack1.ui : stack1)) != null ? stack1.transitionComment : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <button class='subtest-back navigation hidden'>"
    + alias2(alias3(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.back : stack1), depth0))
    + "</button>\n    <button class='subtest-next navigation'>"
    + alias2(alias3(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.next : stack1), depth0))
    + "</button>\n    <button class='skip navigation hidden'>"
    + alias2(alias3(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.skip : stack1), depth0))
    + "</button>\n</div>\n";
},"useData":true});
this["JST"]["Button"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.button || (depth0 != null ? depth0.button : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"button","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["JST"]["DashboardLayout"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"header-region\"></div>\n<div id=\"content-region\"></div>\n<div id=\"footer-region\"></div>\n\n";
},"useData":true});
this["JST"]["Datetime"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class='question'>\n    <table>\n        <tr>\n            <td><label for='year'>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.labels : depth0)) != null ? stack1.text : stack1)) != null ? stack1.year : stack1), depth0))
    + "</label><input id='year' value='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.year : stack1), depth0))
    + "'></td>\n            <td>\n                <label for='month'>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.labels : depth0)) != null ? stack1.text : stack1)) != null ? stack1.month : stack1), depth0))
    + "</label><br>\n                <select id='month' value='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.month : stack1), depth0))
    + "'>"
    + ((stack1 = (helpers.monthDropdown || (depth0 && depth0.monthDropdown) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.months : stack1),((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.month : stack1),{"name":"monthDropdown","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select>\n            </td>\n            <td><label for='day'>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.labels : depth0)) != null ? stack1.text : stack1)) != null ? stack1.day : stack1), depth0))
    + "</label><input id='day' type='day' value='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.day : stack1), depth0))
    + "'></td>\n        </tr>\n        <tr>\n            <td><label for='time'>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.labels : depth0)) != null ? stack1.text : stack1)) != null ? stack1.time : stack1), depth0))
    + "</label><br><input type='text' id='time' value='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.formElements : depth0)) != null ? stack1.time : stack1), depth0))
    + "'></td>\n        </tr>\n    </table>\n</div>\n";
},"useData":true});
this["JST"]["Grid"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"grid","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"useData":true});
this["JST"]["GridExample"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression;

  return "<div class='timer_wrapper'>\n    <button class='start_time time'>"
    + alias1(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.ui : depth0)) != null ? stack1.text : stack1)) != null ? stack1.start : stack1), depth0))
    + "</button>\n    <div class='timer'>"
    + alias1(((helper = (helper = helpers.timer || (depth0 != null ? depth0.timer : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"timer","hash":{},"data":data}) : helper)))
    + "</div>\n</div>\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<table class='grid "
    + alias4(((helper = (helper = helpers.disabling || (depth0 != null ? depth0.disabling : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"disabling","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.displayRtl || (depth0 != null ? depth0.displayRtl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayRtl","hash":{},"data":data}) : helper)))
    + "'>\n"
    + ((stack1 = (helpers.startRow || (depth0 && depth0.startRow) || alias2).call(alias1,(data && data.index),(depth0 != null ? depth0.columns : depth0),{"name":"startRow","hash":{},"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        "
    + ((stack1 = (helpers.startCell || (depth0 && depth0.startCell) || alias2).call(alias1,(data && data.index),{"name":"startCell","hash":{},"data":data})) != null ? stack1 : "")
    + "\n            <td>\n                <button data-label='"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "' data-index='"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "' class='grid_element "
    + alias4(((helper = (helper = helpers.fontSizeClass || (depth0 != null ? depth0.fontSizeClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontSizeClass","hash":{},"data":data}) : helper)))
    + "' "
    + alias4(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + alias4((helpers.gridLabel || (depth0 && depth0.gridLabel) || alias2).call(alias1,(depths[1] != null ? depths[1].items : depths[1]),(depths[1] != null ? depths[1].itemMap : depths[1]),(data && data.index),{"name":"gridLabel","hash":{},"data":data}))
    + "</button>\n            </td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<h3>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.untimed : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.layoutMode_fixed : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.endRow || (depth0 && depth0.endRow) || alias2).call(alias1,(data && data.index),{"name":"endRow","hash":{},"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true,"useDepths":true});
this["JST"]["HomeView"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"survey\">\n</div>\n";
},"useData":true});
this["JST"]["QuestionView"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class='error_message'></div>\n<div class='prompt' "
    + alias4(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.prompt || (depth0 != null ? depth0.prompt : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prompt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n<div class='hint' "
    + alias4(((helper = (helper = helpers.fontStyle || (depth0 != null ? depth0.fontStyle : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fontStyle","hash":{},"data":data}) : helper)))
    + ">"
    + ((stack1 = ((helper = (helper = helpers.hint || (depth0 != null ? depth0.hint : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"hint","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isOpen : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isObservation : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.isMultiline : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <div><textarea id='"
    + alias4(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cid","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "' data-cid='"
    + alias4(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cid","hash":{},"data":data}) : helper)))
    + "' value='"
    + alias4(((helper = (helper = helpers.answerValue || (depth0 != null ? depth0.answerValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"answerValue","hash":{},"data":data}) : helper)))
    + "'></textarea></div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <div><input id='"
    + alias4(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cid","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "' data-cid='"
    + alias4(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cid","hash":{},"data":data}) : helper)))
    + "' value='"
    + alias4(((helper = (helper = helpers.answerValue || (depth0 != null ? depth0.answerValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"answerValue","hash":{},"data":data}) : helper)))
    + "'></div>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    <div class='button_container'></div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return "    <img src='images/icon_scroll.png' class='icon autoscroll_icon' data-cid='"
    + container.escapeExpression(((helper = (helper = helpers.cid || (depth0 != null ? depth0.cid : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"cid","hash":{},"data":data}) : helper)))
    + "'>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.notAsked : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["JST"]["Survey"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<h2>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper)))
    + "</h2>\n";
},"useData":true});