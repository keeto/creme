var ID = require('incremental-dom');
var notifications = ID.notifications;

var DATA_ATTRIBUTE = '__incrementalDOMData';
var listeners = {};

notifications.nodesCreated = function(nodes) {
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (!node) {
      continue;
    }
    var data = node[DATA_ATTRIBUTE];
    if (!data) {
      continue;
    }
    if (data.key in listeners) {
      var fn = listeners[data.key];
      if (typeof fn === 'function') {
        fn(node, false);
      }
    }
  }
};

notifications.nodesRemoved = function() {
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (!node) {
      continue;
    }
    var data = node[DATA_ATTRIBUTE];
    if (!data) {
      continue;
    }
    if (data.key in listeners) {
      var fn = listeners[data.key];
      if (typeof fn === 'function') {
        fn(node, true);
      }
    }
  }
};

module.exports = {
  add: function(key, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Notification handler must be a function.');
    }
    listeners[key] = fn;
  },
  remove: function(key, fn) {
    if (listeners[key] && listeners[key] === fn) {
      listeners[key] = null;
    }
  }
};
