#! /usr/bin/ruby

require 'listen'

def push

  # Save current version number
  version = `git log --pretty=format:'%h' -n 1`
  File.open("_attachments/js/version.js", "w") {|f| f.write("window.Tangerine.version = \"#{version}\"\;") }

  # builds index-dev.html from files listed in uglify.js
  Dir.chdir( File.join Dir.pwd, "_attachments", "js" ) {
    `./uglify.rb dev`
    puts "\nGenerated:\t\tindex-dev.html"
  }

  # Do this twice so you don't have to wait for uglify to compile app.js
  puts "\nPushing with couchapp\n\n"
  `couchapp push`

  Dir.chdir( File.join Dir.pwd, "_attachments", "js" ) {
    `./uglify.rb app`
    puts "\nCompiled\t\tapp.js\n\n"
    puts "\nCompiled\t\tapp.js\n\n"
  }
  `couchapp push`
end

def notify( type, message )
  `growlnotify -t "#{type}" -m "#{message}" -w`
  `notify-send "#{type} - #{message}" -i /usr/share/icons/Humanity/status/128/dialog-warning.svg &`
end

puts "\nGo ahead, programmer. I'm listening...\n\n"

Listen.to(".") do |modified, added, removed|

  files = modified.concat(added).concat(removed)

  files.each { |file|

    # Handle coffeescript files
    /.*\.coffee$/.match(file) { |match|

      match = match.to_s

      if match.index "translation.coffee"
        # special case for i18n translation files. We just want a basic JSON object, nothing else.
        path = match.split("/")
        puts "\nCompiling translation file for language: #{path[-2]}"
        newFile = path[0..path.length-2].join("/")+"/translation.json"
        result = `coffee --bare --compile --print #{match}`
        bareJson = result.gsub(/[\;\(\)]|\/\/.*$\n/, '')
        File.open(newFile, "w") {|f| f.write(bareJson) }
      else
        # Otherwise, just compile
        puts "\nCompiling:\t\t#{match}"
        result = `coffee --bare --compile #{match} 2>&1`
      end

      if result.index "Error: In"
        # Show errors
        notify("CoffeeScript", result.gsub(/.*Error: In.*\/(.*\.coffee)/,"\\1"))
        puts "\n\nCoffeescript error\n******************\n#{result}"
      end

    } # END of coffeescripts


    # handle LESS -> CSS
    /.*\.less$/.match(file) { |match|
      puts "\nCompiling:\t\t#{match}"
      result = `lessc #{match} --yui-compress > #{match}.css`
      if result.index "Error"
        notify("LESS error",result)
        puts "\n\nLESS error\n******************\n#{result}"
      end
    } # END of LESS

    # Handle all the resulting compiled files
    /.*\.css|.*\.js$|.*\.html$|.*\.json$/.match(file) { |match|

      # Don't trigger push for these files
      unless /version\.js|app\.js|index-dev/.match(file)
        puts "\nUpdating:\t\t#{match}"
        push()
      end
    } # END of compiled files

  } # END of each file

end