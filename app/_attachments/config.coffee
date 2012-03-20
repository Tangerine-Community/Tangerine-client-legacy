Tangerine =
  cloud
    target   : "mikeymckay.iriscouch.com"
    username : "tangerine"
    password : "tangytangerine"
    url      : "http://#{Tangerine.cloud.username}:#{Tangerine.cloud.password}@#{Tangerine.cloud.target}"
  subnet
    base   : "http://192.168.1."
    start  : 100
    finish : 200
  port : "5985"

Backbone.couch_connector.config.db_name = "tangerine"
Backbone.couch_connector.config.ddoc_name = "tangerine"
Backbone.couch_connector.config.global_changes = false

