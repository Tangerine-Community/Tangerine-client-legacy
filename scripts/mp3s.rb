#!/usr/bin/ruby
require 'rubygems'
require 'couchrest'
require 'cgi'
require 'json'
require 'net/http'
require 'rest_client'

@db = CouchRest.database("http://localhost:5984/tangerine")
@db.all_docs({:include_docs => true})['rows'].each do |doc|
  doc = doc["doc"]
  puts doc["lessonText"].scan(/[^\"]*\.mp3/) if doc["lessonText"]
end
