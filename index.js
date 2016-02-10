var createFactory = require('./lib/element').createFactory;

var factories = {};

// Create elements
[
  'html', 'body', 'div', 'span', 'applet', 'object', 'iframe',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre',
  'a', 'abbr', 'acronym', 'address', 'big', 'cite', 'code',
  'del', 'dfn', 'em', 'ins', 'kbd', 'q', 's', 'samp',
  'small', 'strike', 'strong', 'sub', 'sup', 'tt', 'var',
  'b', 'u', 'i', 'center',
  'dl', 'dt', 'dd', 'ol', 'ul', 'li',
  'fieldset', 'form', 'label', 'legend', 'button',
  'select', 'option', 'optgroup', 'textarea',
  'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td',
  'article', 'aside', 'canvas', 'details',
  'figure', 'figcaption', 'footer', 'header', 'hgroup',
  'menu', 'nav', 'output', 'ruby', 'section', 'summary',
  'time', 'mark', 'audio', 'video'
].forEach(function(tagName) {
  factories[tagName] = createFactory(tagName);
});

[
  'area', 'base', 'br', 'col', 'command', 'embed',
  'hr', 'img', 'input', 'link', 'meta', 'param', 'source'
].forEach(function(tagName) {
  factories[tagName] = createFactory(tagName, true);
});

module.exports = factories;
