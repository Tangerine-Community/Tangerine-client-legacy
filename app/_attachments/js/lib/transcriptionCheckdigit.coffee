#This is a base21 encoding
# "ABCEFGHKMNPQRSTUVWXYZ"

# http://en.wikipedia.org/wiki/Check_digit
# A good checkdigit will catch all single character changes and most transcriptions
# This requires a weighted checkdigit scheme.
# We need our weightings to be comprime with 21
# This will catch all single digit errors and most transpositions

# A 5 character string will allow for more than 4 million possibilities:
# 21^5 = 4084101

# So we need 5 differnet numbers that are coprime to 21 to use as our weightings
# 1
# 2
# 5
# 11
# 13

# To calculate our checkdigit we multiply each character by its weighting which is determined by its position
# Example: "BABAS"
# Convert from Base 21 to base 10
# B=1, A=0, B=1, A=0, S=13
# Weight them
# 1*1, 0*2, 1*5, 0*11, 13*13
# Add them up
# 1 + 0 + 5 + 0 + 169 = 175
# Do a mod 21 on it
# 175%21 = 7
# Convert 20 from base 10 to our base21 encoding:
# K
# Hence our result:
# BABASK

class Checkdigit

Checkdigit.allowedChars = "ABCEFGHKMNPQRSTUVWXYZ"
# TODO automatically calculate coprimes
Checkdigit.weightings = [1,2,5,11,13]

Checkdigit.toBase10 = (string) ->
  _.map string.split(""), (character) ->
    for allowedChar, index in Checkdigit.allowedChars
      return index if character == allowedChar
    throw "#{character} is not valid, must be part of #{Checkdigit.allowedChars}"

Checkdigit.generate = (identifier) ->
  checkdigit = ""
  identifierInBase10 = Checkdigit.toBase10(identifier)
  sum = 0
  for weight, index in Checkdigit.weightings
    sum += identifierInBase10[index] * weight
  checkdigitBase10 = sum % Checkdigit.allowedChars.length
  return Checkdigit.allowedChars[checkdigitBase10]

Checkdigit.isValidIdentifier = (identifier) ->
  try
    if identifier.slice(-1) == Checkdigit.generate(identifier.slice(0,-1))
      return true
    else
      return "Invalid student identifier"
  catch error
    console.log "ERROR!"
    return error

Checkdigit.randomIdentifier = ->
  returnValue = ""
  #Checkdigit.weightings.length dictates how long the string needed is
  while returnValue.length < Checkdigit.weightings.length
    #Checkdigit.allowedChars.length is the upper limit (exclusive) of the range allowed for our random numbers
    base21Value = Math.floor(Math.random() * Checkdigit.allowedChars.length)
    returnValue += Checkdigit.allowedChars[base21Value]
  
  return returnValue + Checkdigit.generate(returnValue)
