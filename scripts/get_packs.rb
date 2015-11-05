require 'rest-client'
require 'json'

source_group = "http://user:password@server.org/group-me"

json_opts = { :content_type => :json, :accept => :json }

# get a list of _ids for the assessments not archived
assessments_view = JSON.parse(RestClient.post("#{source_group}/_design/ojai/_view/assessmentsNotArchived", {}.to_json, :content_type => :json, :accept => :json))
list_query_data = assessments_view['rows'].map { |row| row['id'][-5..-1] }
list_query_data = { "keys" => list_query_data }

# get a list of files associated with those assessments
id_view = JSON.parse(RestClient.post("#{source_group}/_design/ojai/_view/byDKey",list_query_data.to_json, json_opts ))

id_list = id_view['rows'].map { |row| row['id'] }

id_list << "settings"

pack_number = 0

while id_list.length != 0

  ids = id_list.pop(50)

  docs = JSON.parse RestClient.get "#{source_group}/_all_docs?include_docs=true&keys=#{ids.to_json}"
  doc_array = docs['rows'].map {|row| row['doc'] }

  file_name = "pack%04d.json" % pack_number
  File.open(file_name, 'w') { |f| f.write({"docs"=>doc_array}.to_json) }

  pack_number += 1

end

