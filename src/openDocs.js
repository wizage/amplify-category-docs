const opn = require('opn');
const inquirer = require('inquirer');
const availableDocs = require('./docs.json');
async function openDoc(context){
  const first = ""; 
  if (context.amplify.pathManager.searchProjectRootPath() && false){
    
    const projectConfig = context.amplify.getProjectConfig();
    if (projectConfig.frontend){
        opn('https://aws-amplify.github.io/docs/'+ projectConfig.frontend.toLowerCase() + '/' + first.toLowerCase());
    }
  } else {

      const chooseFrontend = [
        {
          type: 'list',
          name: 'choice',
          message: 'Choose what frontend you want?',
          choices: Object.keys(availableDocs),
          default: Object.keys(availableDocs)[0],
        },
      ];

      let frontend = await inquirer.prompt(chooseFrontend);
      const chooseDetails = [
        {
          type: 'list',
          name: 'choice',
          message: 'Choose what docs you want?',
          choices: availableDocs[frontend.choice],
          default: availableDocs[frontend.choice][0],
        },
      ];

      let detail = await inquirer.prompt(chooseDetails);

      opn('https://aws-amplify.github.io/docs/' + frontend.choice +'/' + detail.choice);
      
  }
}

module.exports = {
  openDoc
} 