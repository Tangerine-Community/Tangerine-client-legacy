#! /usr/bin/env node

var fs  = require('fs'); // for writeFile
var fse = require('fs-extra'); // for mkdirp
var unirest = require('unirest'); // a REST client

var PACK_DOC_SIZE = 50; // how many documents will be put into a pack at most.

var PACK_PATH = __dirname + '/../src/js/init';
console.log(PACK_PATH);

var groupName = "sweet_tree";

var source_group = "http://"+process.env.T_ADMIN+":"+process.env.T_PASS+"@databases.tangerinecentral.org/group-" + groupName;

// helper method for json post requests
// needs .data, .callback, .url
var post = function(options) {
  var data = options.data || {};
  unirest.post(options.url)
    .header('Accept', 'application/json')
    .header('Content-Type', 'application/json')
    .send(data)
    .end(options.callback);
};

var get = function(options) {
  var data = options.data || {};
  unirest.get(options.url)
    .header('Accept', 'application/json')
    .header('Content-Type', 'application/json')
    .end(options.callback);
};


// Get a list of _ids for the assessments not archived

assessments_view = post({
  url : source_group+"/_design/ojai/_view/assessmentsNotArchived",
  callback : function(res) {
    var list_query_data = { keys : res.body.rows.map(function(row){ return row.id.substr(-5);}) };

    // get a list of files associated with those assessments
    var id_view = post({
      url: source_group + "/_design/ojai/_view/byDKey",
      data: list_query_data,
      callback: function(res) {
        var id_list = res.body.rows.map(function(row){ return row.id;});
        id_list.push("settings");

        var pack_number = 0;
        var padding = "0000";

        fse.ensureDirSync(PACK_PATH); // make sure the directory is there

        var doOne = function() {

          var ids = id_list.splice(0, PACK_DOC_SIZE); // get X doc ids

          // get n docs
          get({
            url: source_group + "/_all_docs?include_docs=true&keys="+JSON.stringify(ids),
            callback: function(res) {

              var file_name = PACK_PATH + "/pack" + (padding + pack_number).substr(-4) + ".json";
              var docs = res.body.rows.map(function(row){return row.doc;});
              var body = JSON.stringify({docs:docs});

              fs.writeFile(file_name, body, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log(file_name + " saved");
                if (ids.length !== 0) {
                  pack_number++;
                  doOne();
                } else
                {
                  console.log("All done");
                }

              });
            } // END of callback
          });
        };

        doOne();

      } // END of byDKey callback
    });

  } // END of assessmentsNotArchived callback
});

