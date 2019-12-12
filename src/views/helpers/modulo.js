module.exports = function (options) {
  const index = options.data.index + 1;
  const { nth } = options.hash;

  if (index % nth === 0) {
    return options.fn(this);
  }

  return options.inverse(this);
};
