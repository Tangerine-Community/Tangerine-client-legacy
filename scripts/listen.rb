#!/usr/bin/env ruby

require 'listen'

thisDir = File.expand_path File.dirname(__FILE__)
srcDir = File.join thisDir.split("/")[0..-2], "src"
$jsDir = File.join srcDir, "js"
$uglify = File.join thisDir, "uglify.rb"
coffee = File.join thisDir.split("/")[0..-2], "node_modules", ".bin", "coffee"





class String
  # colorization
  def colorize(color_code)
    "\e[#{color_code}m#{self}\e[0m"
  end

  def red
    colorize(31)
  end

  def green
    colorize(32)
  end

  def yellow
    colorize(33)
  end

  def pink
    colorize(35)
  end
end

def push

  # Save current version info
  version = `git describe --tags`.gsub(/\n/,'')
  build   = `git rev-parse --short HEAD`.gsub(/\n/,'')

  versionFile = File.join($jsDir, "version.js")

  File.open( versionFile, "w") {|f| f.write("window.TangerineVersion = { buildVersion : \"#{build}\"\, version : \"#{version}\"\};") }

  `#{$uglify} dev`
  puts "\nGenerated:\t\tindex-dev.html"
  `#{$uglify} #{versionFile}`
  `#{$uglify} app`
  puts "\nCompiled\t\tapp.js\n\n"

end

def notify( type, message )
  printf "\a" # bell
  unless `which osascript`.empty? # on a mac?
    file = message.split(/[\/\:]/)[-5]
    message = /\.coffee\:(.*?)\n/.match(message)[1]
    `osascript -e 'tell app "System Events" to display dialog "#{type}\n#{file}\n\n#{message}"'`
  end
  unless `which notify-send`.empty? # on linux with notify-send
    `notify-send "#{type} - #{message}" -i /usr/share/icons/Humanity/status/128/dialog-warning.svg &`
  end
end

puts "\nGo ahead, programmer. I'm listening...\n\n"

listen = Listen.to(srcDir) do |modified, added, removed|

  files = modified.concat(added).concat(removed)

  removed.each { |file|
    /.*\.coffee$/.match(file) { |match|
      match = match.to_s
      puts `rm #{match.gsub(/\.coffee$/,'.js')}`
      minJsFile = match.split("/").last.(/\.coffee$/,'.min.js')
      puts `rm ../src/js/min/#{minJsFile}`
    }
  }

  files.each { |file|
    # Handle coffeescript files
    /.*\.coffee$/.match(file) { |match|

      match = match.to_s

      if match.index "translation.coffee"
        # special case for i18n translation files. We just want a basic JSON object, nothing else.
        path = match.split("/")
        puts "\nCompiling translation file for language: #{path[-2]}"
        newFile = path[0..path.length-2].join("/")+"/translation.json"
        result = `#{coffee} --compile --bare --print #{match}`
        bareJson = result.gsub(/[\;\(\)]|\/\/.*$\n/, '')
        File.open(newFile, "w") {|f| f.write(bareJson)}
        hasError = false # to pass error checking
      else
        # Otherwise, just compile
        puts "\nCompiling:\t\t#{match}"
        special = /shows\/|views\/|lists\/|\/tests\//.match(match)

        result = `#{coffee} --bare --compile "#{match}" 2>&1`

        hasError = result.index "error"

        if not hasError and not special
          jsFile = match.gsub(".coffee", ".js")
          puts `#{$uglify} "#{jsFile}"`
        end
      end

      if hasError
        # Show errors
        notify("CoffeeScript Error", result.gsub(/.*error.*\/(.*\.coffee)/,"\\1"))
        puts "\nCoffeescript error\n#{result}".red()
      else
        puts "Done".green()

      end

    } # END of coffeescripts

    # handle LESS -> CSS
    /.*\.less$/.match(file) { |match|
      puts "\nCompiling:\t\t#{match}"
      result = `lessc #{match} --yui-compress > #{match}.css`
      if result.index "Error"
        notify("LESS error",result)
        puts "\nLESS error\n#{result}".red()
      else
        puts "Done".green()
      end
    } # END of LESS

    # Handle all the resulting compiled files
    /.*\.css|.*\.js$|.*\.html$|.*\.json$/.match(file) { |match|
      # Don't trigger push for these files
      unless /version\.js|app\.js|index-dev|\/min\/|\/tests\/|testem/.match(file)
        puts "\nUpdating:\t\t#{match}"
        push()
      end
    } # END of compiled files

  } # END of each file

end

listen.start
sleep
