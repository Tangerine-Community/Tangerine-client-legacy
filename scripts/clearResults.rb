#!/usr/bin/ruby
require 'rubygems'
require 'couchrest'
require 'cgi'
require 'json'
require 'net/http'
require 'rest_client'
require 'uri'

@db = CouchRest.database("http://admin:password@localhost:5984/tangerine")

docs = @db.view('tangerine/results', {:include_docs => true})['rows'].map do |result|
  print "."
  @db.delete_doc(result["doc"],true)
end

docs = @db.view('tangerine/tripsAndUsers', {:include_docs => true})['rows'].map do |result|
  print "."
  @db.delete_doc(result["doc"],true)
end

puts "Bulk deleting"
@db.bulk_save()  
@db.compact!
