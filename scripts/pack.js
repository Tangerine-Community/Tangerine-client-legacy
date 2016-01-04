#!/usr/bin/env node

var unirest = require('unirest')
var program = require('commander')

program
  .version('0.0.0')
  .option('--url <url>', 'The URL of the database containing the Assessment')
  .option('--id <id>', 'The ID of the Assessment')

program.on('--help', function(){
  console.log('  Examples:')
  console.log('')
  console.log('    $ ./scripts/pack.js --id a8587919-0d0e-9155-b41d-7a71b41be749 --url http://username:password@databases.tangerinecentral.org/group-sweet_tree > test/packs/be749-grid-with-autostop-and-subsequent-test-with-link-to-grid.json')
  console.log('')
});

program.parse(process.argv)

// helper method for json post requests
// needs opts.data and opts.url.
// Chain handlers to .end(f)
function post(opts) {
  var data = opts.data || {};
  return unirest.post(opts.url)
    .header('Accept', 'application/json')
    .header('Content-Type', 'application/json')
    .send(data);
}

// helper method for json get requests
// needs opts.url.
// Chain handlers to .end(f)
function get(opts) {
  var data = opts.data || {};
  return unirest.get(opts.url)
    .header('Accept', 'application/json')
    .header('Content-Type', 'application/json');
}

function main() {
  get({
    url: program.url + "/_design/ojai/_view/byDKey?keys=" + JSON.stringify([program.id.substr(program.id.length-5, 5)])
  })
  .end(function(res) {
    var id_list = res.body.rows.map(function(row) {
      return row.id;
    })
    get({
      url: program.url + "/_all_docs?include_docs=true&keys=" + JSON.stringify(id_list)
    })
    .end(function(res) {
      var data = []
      res.body.rows.forEach(function(row) {
        data.push(row.doc)
      })
      console.log(JSON.stringify(data, null, 2))
    })
  })
}

main()
