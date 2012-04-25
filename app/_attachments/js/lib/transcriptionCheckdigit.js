var Checkdigit;
Checkdigit = (function() {
  function Checkdigit() {}
  return Checkdigit;
})();
Checkdigit.allowedChars = "ABCEFGHKMNPQRSTUVWXYZ";
Checkdigit.weightings = [1, 2, 5, 11, 13];
Checkdigit.toBase10 = function(string) {
  return _.map(string.split(""), function(character) {
    var allowedChar, index, _len, _ref;
    _ref = Checkdigit.allowedChars;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      allowedChar = _ref[index];
      if (character === allowedChar) {
        return index;
      }
    }
    throw "" + character + " is not valid, must be part of " + Checkdigit.allowedChars;
  });
};
Checkdigit.generate = function(identifier) {
  var checkdigit, checkdigitBase10, identifierInBase10, index, sum, weight, _len, _ref;
  checkdigit = "";
  identifierInBase10 = Checkdigit.toBase10(identifier);
  sum = 0;
  _ref = Checkdigit.weightings;
  for (index = 0, _len = _ref.length; index < _len; index++) {
    weight = _ref[index];
    sum += identifierInBase10[index] * weight;
  }
  checkdigitBase10 = sum % Checkdigit.allowedChars.length;
  return Checkdigit.allowedChars[checkdigitBase10];
};
Checkdigit.isValidIdentifier = function(identifier) {
  try {
    if (identifier.slice(-1) === Checkdigit.generate(identifier.slice(0, -1))) {
      return true;
    } else {
      return "Invalid student identifier";
    }
  } catch (error) {
    console.log("ERROR!");
    return error;
  }
};
Checkdigit.randomIdentifier = function() {
  var base21Value, returnValue;
  returnValue = "";
  while (returnValue.length < Checkdigit.weightings.length) {
    base21Value = Math.floor(Math.random() * Checkdigit.allowedChars.length);
    returnValue += Checkdigit.allowedChars[base21Value];
  }
  return returnValue + Checkdigit.generate(returnValue);
};