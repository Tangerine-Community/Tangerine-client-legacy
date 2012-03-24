Tangerine =
  cloud :
    target   : "mikeymckay.iriscouch.com"
    username : "tangerine"
    password : "tangytangerine"
  subnet :
    base   : "http://192.168.1."
    start  : 100
    finish : 200
  port : "5985"
  database_name: "tangerine"
  design_doc_name: "tangerine"

Tangerine.cloud.url = "http://#{Tangerine.cloud.username}:#{Tangerine.cloud.password}@#{Tangerine.cloud.target}/#{Tangerine.database_name}"

Backbone.couch_connector.config.db_name = Tangerine.database_name
Backbone.couch_connector.config.ddoc_name = Tangerine.design_doc_name
Backbone.couch_connector.config.global_changes = false

