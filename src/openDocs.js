const opn = require('opn');
const inquirer = require('inquirer');
const availableDocs = require('./docs.json');
async function openDoc(context){
  const { first, second } = context.parameters;

  if (first){
    await useParams(context, first, second);
  } else {
    await noParams(context);
  }
  //const first = ""; 
}
/*
Add the way to auto fill the frontend. For now we just dont check....

 if (context.amplify.pathManager.searchProjectRootPath()){
      let first = "";
      const projectConfig = context.amplify.getProjectConfig();
      if (projectConfig.frontend){
          opn('https://aws-amplify.github.io/docs/'+ projectConfig.frontend.toLowerCase() + '/' + first.toLowerCase());
      }
  }

*/

function searchDocs(word){
  let returnValue = {}
  let urlInfo = {}
  if(availableDocs[word]){
    returnValue[word] = availableDocs[word];
  } else {
    Object.keys(availableDocs).forEach(key => {
      var a = availableDocs[key].indexOf(word);
      if (a > -1){
        returnValue[key] = [word];
      }
    });
  }
  return returnValue;
}

async function noParams(context){
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

async function useParams(context, first, second){
  let urlInfo = {}
  let results = await searchDocs(first);
  if (Object.keys(results).length < 1){
    console.log("Could not find '" + first + "'")
    return;
  }
  if (second){
    if (results[second]){
      urlInfo['detail'] = first;
      urlInfo['frontend'] = second;
    } else if (results[first] && results[first].indexOf(second) > -1) {
      urlInfo['detail'] = second;
      urlInfo['frontend'] = first;
    } else {
      console.log("Could not find '" + second + "' in " + first)
      return; 
    }
  } else {
    if (Object.keys(results).length > 1 ){
      const chooseFrontend = [
        {
          type: 'list',
          name: 'choice',
          message: 'Choose what frontend you want?',
          choices: Object.keys(results),
          default: Object.keys(results)[0],
        },
      ];
      let frontend = await inquirer.prompt(chooseFrontend);
      urlInfo['detail'] = first;
      urlInfo['frontend'] = frontend.choice;
    } else if (Object.keys(results).length === 1 && results[Object.keys(results)[0]].length > 1){
      const chooseDetails = [
        {
          type: 'list',
          name: 'choice',
          message: 'Choose what docs you want?',
          choices: results[Object.keys(results)[0]],
          default: results[Object.keys(results)[0]][0],
        },
      ];
      let detail = await inquirer.prompt(chooseDetails);

      urlInfo['frontend'] = Object.keys(results)[0];
      urlInfo['detail'] = detail.choice;
    } else if (Object.keys(results).length === 1 && results[Object.keys(results)[0]].length === 1){
      urlInfo['frontend'] = Object.keys(results)[0];
      urlInfo['detail'] = results[Object.keys(results)[0]][0];
    }
  }
  opn('https://aws-amplify.github.io/docs/' + urlInfo['frontend'] +'/' + urlInfo['detail']);
}

module.exports = {
  openDoc
} 