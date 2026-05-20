// Mock CSS modules and other static assets
module.exports = {
  process(src, filename) {
    return {
      code: `module.exports = {};`,
    };
  },
};