const featureName = 'docs';
const docsOpener = require('../src/openDocs');

module.exports = {
  name: featureName,
  run: async (context) => {
    if (/^win/.test(process.platform)) {
      try {
        const { run } = require(`./${featureName}/${context.parameters.first}`);
        return run(context);
      } catch (e) {
        context.print.error('Command not found');
      }
    }

    try {
      const { first } = context.parameters;
      if (first !== 'update') {
        docsOpener.openDoc(context);
      }
    } catch (ex) {
      context.print.error(ex.message);
    }
  },
};
