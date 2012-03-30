watch ( '.*\.coffee$' ) { |match|
  puts "\nCompiling:\t#{match}"
  result = `coffee --bare --compile #{match} 2>&1`
  if result.index "In"
    puts "\n\nCoffeescript error\n******************\n#{result}"
  else
    `couchapp push`
  end
}

watch ( '.*\.js$|.*\.html$|.*\.json$' ) { |match| 
  puts "\nUpdating:\t#{match}\nPushing to couchapp\n\n"
  `couchapp push`
}

