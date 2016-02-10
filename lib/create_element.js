var CremeElement = require('./element');

module.exports = function(tagName, isVoid) {
  return CremeElement.createFactory(tagName, isVoid);
};
