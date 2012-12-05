#
# Tangerine Tree
# This program generates APKs and a download link for a group.
#
# It works by using the AndroidCouchbaseCallback generated APK as a shell.
# Then we replace the database from another source. We peel the Tangerine
# and insert any kind of fruit we want.
#
# Note: the database that is being replicated should contain a couchapp.
#

require 'sinatra'
require 'rest-client'
require 'json'
require 'sqlite3'
require 'logger'

#
#
#

$character_set = "123467890AaCDdEeFfGHhJmNnpQRtuvwxyz".split("")
$logger = Logger.new "tree.log"
$couchdb_path = File.join( `locate tangerine.couch`.split("/")[0..-2] )

#
# handle a request to make an APK
#

post "/production/:group" do

  content_type :json

  auth_errors = []
  auth_errors << "a username" if params[:user] == nil
  auth_errors << "a password" if params[:pass] == nil
  auth_errors << "a group"    if params[:group].length == 0

  halt 403, { :error => "Please provide #{andify(auth_requirements)}."} if auth_errors.length > 0

  #
  # Authenticate user for the group
  #

  auth_response = RestClient.get("https://www.tangerinecentra.org/robbert.php?action=am_admin&group=#{:group}&user=#{:user}")

  halt_error(403, "Sorry, you have to be an admin within the group to make an APK.") if JSON.parse(auth_response.body).answer == "no"

  #
  # Make APK, place it in token-directory for download
  #

  created = Time.now
  storage = new Storage("tree")
  token = get_token()

  #
  # check to see if we have the "newest version"
  #
  apk_list_response = RestClient.get("https://api.github.com/repos/tangerine-community/tangerine/downloads")
  apk_list = JSON.parse(apk_list_response.body)

  for list in apk_list
    if apk["name"].include? "blank"
      stable_apk = apk
      break
    end
  end

  local_apk_date = Date.strptime(storage.get("apk")['created_at'], "%Y-%m-%d")
  git_apk_date   = Date.strptime(apk_list[0]["created_at"], "%Y-%m-%d")

  if local_apk_date >= git_apk_date
    apk_response = RestClient.get( stable_apk['url'] )
    begin

      apk_f = File.new("tangerine.apk", "w")
      apk_f.write(apk_response.body)
    rescue
      log.error "Couldn't update tangerine.apk from github."
      halt_error 500, "Server error. Failed to update blank."
    ensure
      aok_f.close
    end
  end

  # replicate group to new local here
  replicate_response = RestClient.post("http://admin:password@tangerine.iriscouch.com:5984/_replicate", {
    :source => "group-#{params[:group]}", 
    :target => "http://tangerine.xen.prgmr.com:5984/group-#{params[:group]}",
    :create_target => true
  }.to_json, :content_type => :json )

  halt_error 500, "Failed to replicate to tree." if replicate_response.code != 200

  begin
    # clear it out if it's there
    `rm -rf tangerine/`

    #
    `unzip tangerine.apk -d blank/`
    group_db = File.join( $couch_db_path, "group-#{params[:group]}.couch" )
    target_directory = File.join("blank", "assets")
    `cp #{group_db} #{target_directory}`

  rescue Exception => e
    log.error "Could not copy #{param[:group]}'s database into assets. #{e}"
    halt_error 500, "Failed to prepare database."
  end

  
  # zip APK and place it in token download directory
  begin
    mkdir(token)
    new_zip = File.join( "..", "apks", token, "tangerine.apk" )
    `cd blank`
    `unzip -r #{new_zip} *`
    `cd ..`
    `rm -rf blank/`
  rescue Exception => e
    log.error "Could not copy #{param[:group]}'s database into assets. #{e}"
    halt_error 500, "Failed to prepare database."
  end
  
  return { :token => token }.to_json

end


get "/apk/:token" do

  content_type :json

  apk_name = "tangerine.apk"
  apk_path = File.join('apks', params[:token], apk_name)

  if File.directory? apk_directory
    send_file( apk_name ,
      :disposition => 'attachment', 
      :filename    => File.basename(apk_name)
    )
  else
    log.warning "(404) params[:token]."
    halt_error 404, "No APK with that name."
  end

end


#
# Helper functions
#

def andify( nouns )
  last = words.pop()
  return words.join(", ") + ", and " + last
end

def orify( nouns )
  last = words.pop()
  return words.join(", ") + ", and " + last
end

def rand_char()
  $character_set.sample
end

def get_token()
   (1..6).map{|x| $character_set.sample}.join()
end

def mkdir(dir)
  name = File.join Dir::pwd, dir
  return nil if FileTest::directory? name
  Dir::mkdir(name)
rescue Exception => e
  log.error "Couldn't make directory. #{e}"
end

def halt_error(code, message)
  halt code, { :error => message }.to_json
end

class Storage
  
  def initialize(table_name)
    @@db = SQLite3::Database.new( DB_NAME )
    @db_name = table_name
    @@db.execute( %~ CREATE TABLE IF NOT EXISTS #{db_name} (key varchar(100) PRIMARY KEY, value varchar(1000), modified timestamp(20)) ~ )
  end

  def self.get(key)
    @@db.get_first_row( %~ SELECT * FROM #{db_name} WHERE key='#{key}' ~ )
  end

  def self.set(key, val)
    result = @@db.execute( %~ REPLACE INTO #{db_name} (key, value, modified) VALUES ('%s', '%s', %d) ~ % [key, val, Time.now.to_i] )
  end
  
  DB_NAME = 'com.rti.tangerine'
  
end