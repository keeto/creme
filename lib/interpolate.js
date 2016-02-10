var INTERPOLATION_EXP = /\{(.+?)\}/g;

function interpolate(str, data) {
  if (!data) {
    return str;
  }
  return str.replace(INTERPOLATION_EXP, function (_, match) {
      var keys = match.split('.');
      var context = data;
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        if (!(key in context)) {
          break;
        }
        context = context[key];
      }
      return context;
  });
}

module.exports = function(str) {
  return interpolate.bind(null, str);
};
