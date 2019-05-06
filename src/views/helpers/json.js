module.exports = function(string, options) {
  return options.fn(JSON.parse(string));
};
