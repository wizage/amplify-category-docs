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
        if (first && first !== 'update') {
          docsOpener.openDoc(context);
         // opn('https://aws-amplify.github.io/docs/' + );
        } else {
          const header = `amplify ${featureName} <subcommand>`;
          const commands = [
              {
                  name: 'add',
                  description: `Takes you through a CLI flow to add a ${featureName} resource to your local backend`,
              },
              {
                  name: 'remove',
                  description: `Removes ${featureName} resource from your local backend and will remove them on amplify push`,
              },
          ];

          context.amplify.showHelp(header, commands);
          context.print.info('');
        }
      } catch (ex) {
        context.print.error(ex.message);
    }
  },
};
