( keys, values, rereduce ) ->

  result =
    subtests       : 0
    itemsPerMinute : []
    metBenchmark   : 0
    benchmarked    : 0

  for value in values
    for k, v of value
      if k is "subtests"
        result.subtests += v
      else if k is "itemsPerMinute" and not rereduce
        log "should have pushed"
        log v
        for ipm in v
          log "pushing now #{ipm}"
          result.itemsPerMinute.push ipm
          result.benchmarked += 1
      else
        # this only works if none of the other values have the same key
        result[k] = v

  #
  # benchmark
  #
  english = result.subject is "english_word"
  swahili = result.subject is "word"
  class1  = result.class is "1"
  class2  = result.class is "2"

  for ipm in result.itemsPerMinute
    result.metBenchmark++ if swahili and class1 and ipm >= 17
    result.metBenchmark++ if swahili and class2 and ipm >= 45
    result.metBenchmark++ if english and class1 and ipm >= 30
    result.metBenchmark++ if english and class2 and ipm >= 65


  return result