var ID = require('incremental-dom');
var elementOpenStart = ID.elementOpenStart;
var elementOpenEnd = ID.elementOpenEnd;
var elementClose = ID.elementClose;
var elementVoid = ID.elementVoid;
var text = ID.text;
var attr = ID.attr;
var patch = ID.patch;

var INTERNAL = {};

/**
 * @name CremeElementAttributes
 * @typedef {Object}
 * @param {string} $key A unique identifier for the Element instance that is
 *     used to identify the element during patch time.
 * @param {Object?} $static A key-value mapping of the static (i.e., constant)
 *     attributes of an Element.
 * @param {Object?} $computed A key-value mapping of the computed (i.e.,
 *     calculated at render-time) attributes of an Element.
 */

/**
 * @name CremeElementFactory
 * @typedef {function}
 * @param {CremeElementAttributes} attributes The attributes of the instance.
 */

/**
 * CremeElement is an abstraction of an actual DOMNode.
 *
 * @constructor
 * @param {string} tagName The name of the tag.
 * @param {boolean} isVoid Whether the tag is a void element, i.e. cannot have
 *     any children.
 * @param {CremeElementAttributes} attributes The attributes of the instance.
 */
function CremeElement(tagName, isVoid, attributes, children) {
  if (!(this instanceof CremeElement)) {
    return new CremeElement(tagName, isVoid, attributes, children);
  }

  /**
   * The tag name of the element.
   *
   * @type {string}
   * @protected
   */
  this._tagName = tagName;

  /**
   * Whether the element is a void element.
   *
   * Void elements are elements that cannot have children.
   *
   * @type {boolean}
   * @protected
   */
  this._isVoid = isVoid;

  /**
   * A unique identifier for the element instance that is used to identify the
   * element during patching.
   *
   * @type {string}
   * @protected
   */
  this._key = null;

  /**
   * A key-value map of the static properties of the element.
   *
   * Static properties do not change between renderings of the element.
   *
   * @type {Object}
   * @protected
   */
  this._static = null;

  /**
   * The attributes of the element.
   *
   * @type {Object}
   * @protected
   */
  this._attributes = attributes;

  /**
   * The computed properties of the element.
   *
   * Computed properties are calculated during render time.
   *
   * @type {Object.<string, function>}
   * @protected
   */
  this._computed = null;

  /**
   * Child elements of the element.
   *
   * @type {Array.<*>}
   * @protected
   */
  this._children = children;

  this._init();
}

/**
 * Creates a new Element factory function for a specific tagName.
 *
 * @param {string} tagName The tag name of the element.
 * @param {boolean} isVoid Whether the element is a void element.
 * @return {CremeElementFactory} The factory function.
 */
CremeElement.createFactory = function(tagName, isVoid) {
  return function(attributes, children) {
    var _attributes;
    var _children;
    if (Array.isArray(attributes)) {
      _children = attributes;
    } else if (attributes instanceof CremeElement ||
               typeof attributes === 'string' ||
               typeof attributes === 'function') {
      _children = [attributes];
    } else {
      _attributes = attributes;
      _children = Array.isArray(children) ? children : [children];
    }
    return new CremeElement(tagName, isVoid, _attributes, _children);
  }
};

/**
 * Initializes the Element instance.
 *
 * @protected
 */
CremeElement.prototype._init = function() {
  var attributes = this._attributes;
  if (!attributes) {
    return;
  }
  if (attributes.$key) {
    this._key = attributes.$key;
    attributes.$key = INTERNAL;
  }
  if (attributes.$static) {
    if (!this._key) {
      throw new TypeError('Missing $key for node with $static attributes.');
    }
    var statics = attributes.$static;
    if (!Array.isArray(statics)) {
      var _temp = [];
      for (var key in statics) {
        if (!statics.hasOwnProperty(key)) {
          continue;
        }
        _temp.push(key, statics[key]);
      }
      statics = _temp;
    }
    this._static = statics;
    attributes.$static = INTERNAL;
  }
  if (attributes.$computed) {
    this._computed = attributes.$computed;
    attributes.$computed = INTERNAL;
  }
};

/**
 * Renders a void element.
 *
 * @param {Object} data The data for this rendering.
 * @protected
 */
CremeElement.prototype._renderVoid = function(data) {
  var tagName = this._tagName;
  var element = elementOpenStart(tagName, this._key, this._static);
  this._renderComputedAttributes(data);
  this._renderAttributes();
  elementOpenEnd(tagName);
  elementClose(tagName);
  return element;
};

/**
 * Renders a non-void element
 *
 * @param {Object} data The data for this rendering.
 * @protected
 */
CremeElement.prototype._render = function(data) {
  var tagName = this._tagName;
  var children = this._children;
  var element = elementOpenStart(tagName, this._key, this._static);
  this._renderComputedAttributes(data);
  this._renderAttributes();
  elementOpenEnd(tagName);
  if (children && children.length) {
    for (var i = 0, l = children.length; i < l; i++) {
      this._renderItem(children[i], data);
    }
  }
  elementClose(tagName);
  return element;
};

/**
 * Renders the attributes of the element.
 *
 * @protected
 */
CremeElement.prototype._renderAttributes = function() {
  var attributes = this._attributes;
  if (!attributes) {
    return;
  }
  for (var name in attributes) {
    if (!attributes.hasOwnProperty(name)) {
      continue;
    }
    var value = attributes[name];
    if (value === INTERNAL) {
      continue;
    }
    attr(name, value);
  }
};

/**
 * Renders the computed attributes of the element.
 *
 * @param {Object} data The data for this rendering.
 * @protected
 */
CremeElement.prototype._renderComputedAttributes = function(data) {
  var computed = this._computed;
  if (!computed) {
    return;
  }
  for (var name in computed) {
    if (!computed.hasOwnProperty(name)) {
      continue;
    }
    var value = computed[name];
    if (typeof value === 'function') {
      value = value(data);
    }
    attr(name, value);
  }
};

/**
 * Renders a particular item inside the element.
 *
 * @param {*} item The item to render.
 * @param {Object} data The data for this rendering.
 * @protected
 */
CremeElement.prototype._renderItem = function(item, data) {
  if (typeof item === 'string') {
    text(item);
    return;
  } else if (typeof item == 'function') {
    var retVal = item(data);
    return this._renderItem(retVal, data);
  } else if (item instanceof CremeElement) {
    item.render(data);
    return;
  }
};

/**
 * Renders the Element instance.
 *
 * @return {DOMElement} A DOMElement instance.
 */
CremeElement.prototype.render = function(data) {
  return this._isVoid ? this._renderVoid(data) : this._render(data);
}

/**
 * Patches Element instance into the provided DOMElement instance.
 *
 *
 * @param {DOMElement} target The target element to patch to.
 * @param {Object} data The data for this rendering.
 */
CremeElement.prototype.patchInto = function(target, data) {
  var _this = this;
  return patch(target, function() {
    _this.render(data);
  });
};

module.exports = CremeElement;
