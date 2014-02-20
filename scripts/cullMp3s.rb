#!/usr/bin/ruby
require 'rubygems'
require 'couchrest'
require 'cgi'
require 'json'
require 'net/http'
require 'rest_client'
require 'uri'

mp3_refs = {}

@db = CouchRest.database("http://localhost:5984/mmlp")
@db.all_docs({:include_docs => true})['rows'].each do |doc|
  doc = doc["doc"]
  if doc["lessonText"]
    doc["lessonText"].gsub!(/(lessons.*?\.mp3)/i) do |mp3|
      mp3_refs[URI.unescape(mp3)] = true
    end
  end
end

mp3_files = File.join("**", "lessons", "**", "*.mp3")
Dir.glob(mp3_files).each do |mp3|
  puts "rm \"#{mp3}\"" unless mp3_refs[mp3]
  `rm "#{mp3}"` unless mp3_refs[mp3]
end
