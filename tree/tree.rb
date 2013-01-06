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
#
#
#

$character_set = "abcdeghikmnoprstuwxyz".split("") # optimized for mobiles and human error
$logger = Logger.new "tree.log"
$couch_db_path = File.join( `locate *.couch`.split("\n")[0].split("/")[0..-2] )

#
# handle a request to make an APK
#

post "/production/:group" do

  content_type :json

  auth_errors = []
  auth_errors << "a username" if params[:user] == nil
  auth_errors << "a password" if params[:pass] == nil
  auth_errors << "a group"    if params[:group].length == 0

  #halt 403, { :error => "Please provide #{andify(auth_errors)}."} if auth_errors.length > 0

  #
  # Authenticate user for the group
  #

  auth_response = RestClient.post "http://localhost/robbert.php?", :action=> "am_admin", :group => params[:group], :user => params[:user]
  halt_error(403, "Sorry, you have to be an admin within the group to make an APK.") if JSON.parse(auth_response.body)["message"] == "no"

  #
  # Make APK, place it in token-directory for download
  #

  created = Time.now
  #storage = new Storage("tree")
  token = get_token()

  #
  # check to see if we have the "newest version"
  #
  #apk_list_response = RestClient.get("https://api.github.com/repos/tangerine-community/tangerine/downloads", :Origin => "http://localhost")
  #apk_list = JSON.parse(apk_list_response.body)
  #
  #for list in apk_list
  #  if apk["name"].include? "blank"
  #    stable_apk = apk
  #    break
  #  end
  #end
  
  #local_apk_date = Date.strptime(storage.get("apk")['created_at'], "%Y-%m-%d")
  #git_apk_date   = Date.strptime(apk_list[0]["created_at"], "%Y-%m-%d")

  if false#local_apk_date >= git_apk_date
    apk_response = RestClient.get( stable_apk['url'] )
    begin

      apk_f = File.new("tangerine.apk", "w")
      apk_f.write(apk_response.body)
    rescue
      $logger.error "Couldn't update tangerine.apk from github."
      halt_error 500, "Server error. Failed to update blank."
    ensure
      aok_f.close
    end
  end

  # replicate group to new local here
  replicate_response = RestClient.post("http://tree:tree-password@localhost:5984/_replicate", {
    :source => "group-#{params[:group]}", 
    :target => "copied-group-#{params[:group]}", # "copied-" because debugging on same server 
    :create_target => true
  }.to_json, :content_type => :json )

  halt_error 500, "Failed to replicate to tree." if replicate_response.code != 200

  begin
    # clear it out if it's there
    blank_dir = File.join( Dir.pwd, "tangerine" )
    `rm -rf #{blank_dir}`

    tangerine_apk = File.join( Dir.pwd, "tangerine.zip" )

    `unzip #{tangerine_apk}`
    db_file = "copied-group-#{params[:group]}.couch"
    group_db = File.join( $couch_db_path, db_file )

    # standardize all groups DBs here as tangerine.couch
    target_dir = File.join( Dir.pwd, "tangerine", "assets" )
    `cp #{group_db} #{target_dir}`

    old_database = File.join target_dir, db_file
    new_database = File.join target_dir, "tangerine.couch"

    "mv #{old_database} #{new_database}"

  rescue Exception => e
    $logger.error "Could not copy #{params[:group]}'s database into assets. #{e}"
    halt_error 500, "Failed to copy database."
  end

  
  # zip APK and place it in token download directory
  begin

    parent_dir = File.join( Dir.pwd.split("/")[0..-2] )
    ensure_dir parent_dir, "apks", token

    groupstamp_location = File.join( parent_dir, "apks", token, params[:group] )
    `touch #{groupstamp_location}`

    new_zip = File.join( parent_dir, "apks", token, "tangerine.apk" )
    tangerine_filling = File.join Dir.pwd, "tangerine"

    Dir.chdir(tangerine_filling){
      `zip -r #{new_zip} *`
    }
    `rm -rf #{tangerine_filling}`
  rescue Exception => e
    $logger.error "Could not copy #{params[:group]}'s database into assets. #{e}"
    halt_error 500, "Failed to prepare database."
  end
  
  return { :token => token }.to_json

end


get "/apk/:token" do

  content_type :json

  parent_dir = File.join( Dir.pwd.split("/")[0..-2] )

  apk_name = "tangerine.apk"
  apk_path = File.join( parent_dir, 'apks', params[:token], apk_name)

  if File.exist? apk_path
    send_file( apk_path ,
      :disposition => 'attachment', 
      :filename    => File.basename(apk_name)
    )
  else
    $logger.warn "(404) params[:token]."
    halt_error 404, "No APK found, invalid token."
  end

end


#
# Helper functions
#

def ensure_dir( *dirs )
  path = ""
  for current in dirs
    path = File.join path, current
    Dir::mkdir path if not File.directory? path
  end
rescue Exception => e
  $logger.error "Couldn't make directory. #{e}"
end

def andify( nouns )
  #last = nouns.pop()
  return nouns#nouns.join(", ") + ", and " + last
end

def orify( nouns )
  #last = nouns.pop()
  return nouns#nouns.join(", ") + ", or " + last
end

def rand_char()
  $character_set.sample
end

def get_token()
   (1..6).map{|x| $character_set.sample}.join()
end

def mkdir(dir)
  name = File.join Dir::pwd, dir
  return nil if File.directory? name
  Dir::mkdir(name)
rescue Exception => e
  $logger.error "Couldn't make directory. #{e}"
end

def halt_error(code, message)
  halt code, { :error => message }.to_json
end
