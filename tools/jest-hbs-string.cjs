const fs = require('node:fs');

module.exports = {
  process(_sourceText, sourcePath) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    return {
      code: `module.exports = { __esModule: true, default: ${JSON.stringify(content)} };`,
    };
  },
};
