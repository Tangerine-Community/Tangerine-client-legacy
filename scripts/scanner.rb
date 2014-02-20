#!/usr/bin/ruby
require 'rubygems'
require 'couchrest'
require 'cgi'
require 'json'
require 'net/http'
require 'rest_client'
require 'uri'

@db = CouchRest.database("http://localhost:5984/mmlp")
docs = []
@db.all_docs({:include_docs => true})['rows'].each do |doc|
  doc = doc["doc"]
  if doc["lessonText"]
    doc["lessonText"].gsub!(/(lessons.*?\.pdf)/i) do |mp3|
      puts mp3
      URI.escape(URI.unescape(mp3).downcase)
    end
    docs.push doc
  end
end
#puts "SAVING"
#puts @db.bulk_save docs
