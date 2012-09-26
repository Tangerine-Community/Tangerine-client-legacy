def push
  version = `git log --pretty=format:'%h' -n 1`
  File.open("_attachments/js/version.js", "w") {|f| f.write("window.Tangerine.version = \"#{version}\"\;") }
  `couchapp push`
end

def notify(type,message)
  `growlnotify -t "#{type}" -m "#{message}" -w`
  `notify-send "#{type} - #{message}" -i /usr/share/icons/Humanity/status/128/dialog-warning.svg &`
end

watch ( '.*\.coffee$' ) { |match|
  puts "\nCompiling:\t\t#{match}"
  result = `coffee --bare --compile #{match} 2>&1`
  if result.index "In"
    notify("CoffeeScript error", result)
    puts "\n\nCoffeescript error\n******************\n#{result}"
  else
#    docco_result = `docco #{match}`
#    puts "\nDocco-menting:\t\t#{match}\n"
    push()
  end
}

watch ( '.*\.less$' ) { |match| 
  puts "\nCompiling:\t\t#{match}"
  result = `lessc #{match} > #{match}.css`
  if result.index "Error"
    notify("LESS error",result)
    puts "\n\nLESS error\n******************\n#{result}"
  else
    push()
  end
}

watch ( '.*\.css$|.*\.js$|.*\.html$|.*\.json$' ) { |match|
  if match.string().index("version.js") == nil
    puts "\nUpdating:\t\t#{match}\nPushing to couchapp\n\n"
    push()
  end
}

push()
