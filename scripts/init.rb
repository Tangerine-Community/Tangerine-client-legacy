#!/usr/bin/env ruby

# this script
# builds all of the js files necessary to run the application
# builds all of the debug files used for routine debugging

print "building from coffeescript..."

# directories and files
thisDir = File.expand_path File.dirname(__FILE__)
jsDir = File.join thisDir.split("/")[0..-2], "src", "js"
minDir = File.join jsDir, "min"
coffee = File.join thisDir.split("/")[0..-2], "node_modules", ".bin", "coffee"
uglify = File.join thisDir, "uglify.rb"

# create or remove minified files
if Dir.exists? minDir
  `rm #{minDir}/*`
else
  Dir.mkdir minDir
end


# delete any old builds
File.delete "#{jsDir}/lib.js" if File.exists? "#{jsDir}/lib.js"
File.delete "#{jsDir}/app.js" if File.exists? "#{jsDir}/app.js"

# find all coffeescript and compile
`#{coffee} -bc \`find #{jsDir} -name "*.coffee"\``

# Save current version info
version = `git describe --tags`.gsub(/\n/,'')
build   = `git rev-parse --short HEAD`.gsub(/\n/,'')
File.open( File.join(jsDir, "version.js"), "w") {|f| f.write("window.TangerineVersion = { buildVersion : \"#{build}\"\, version : \"#{version}\"\};") }


# uglify/minify all js to min directory
`#{uglify} \`find #{jsDir}/modules -name "*.js"\``
`#{uglify} \`ls #{jsDir}/*.js\``

# create a lib.js file and an app.js file
`#{uglify} lib`
`#{uglify} app`

puts "done."
