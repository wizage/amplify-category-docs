const opn = require('opn');
const inquirer = require('inquirer');
const availableDocs = require('./docs.json');

async function openDoc(context) {
  const { first, second } = context.parameters;

  if (first) {
    await useParams(context, first, second);
  } else {
    await noParams(context);
  }
}

function searchDocs(word) {
  const returnValue = {};
  if (availableDocs[word]) {
    returnValue[word] = availableDocs[word];
  } else {
    Object.keys(availableDocs).forEach((key) => {
      const a = availableDocs[key].indexOf(word);
      if (a > -1) {
        returnValue[key] = [word];
      }
    });
  }
  return returnValue;
}

async function noParams(context) {
  let amplifyFrontend = getCurrentFrontend(context);
  const chooseFrontend = [
    {
      type: 'list',
      name: 'choice',
      message: 'Choose what frontend you want?',
      choices: Object.keys(availableDocs),
      default: Object.keys(availableDocs)[0],
    },
  ];

  if (!amplifyFrontend) {
    const frontend = await inquirer.prompt(chooseFrontend);
    amplifyFrontend = frontend.choice;
  }

  const chooseDetails = [
    {
      type: 'list',
      name: 'choice',
      message: 'Choose what docs you want?',
      choices: availableDocs[amplifyFrontend],
      default: availableDocs[amplifyFrontend][0],
    },
  ];

  const detail = await inquirer.prompt(chooseDetails);

  opn(`https://aws-amplify.github.io/docs/${amplifyFrontend}/${detail.choice}`);
}

async function useParams(context, first, second) {
  const urlInfo = {};
  const results = await searchDocs(first);
  if (Object.keys(results).length < 1) {
    console.log(`Could not find '${first}'`);
    return;
  }
  if (second) {
    if (results[second]) {
      urlInfo.detail = first;
      urlInfo.frontend = second;
    } else if (results[first] && results[first].indexOf(second) > -1) {
      urlInfo.detail = second;
      urlInfo.frontend = first;
    } else {
      console.log(`Could not find '${second}' in ${first}`);
      return;
    }
  } else if (Object.keys(results).length > 1) {
    const amplifyFrontend = getCurrentFrontend(context);
    if (results[amplifyFrontend]) {
      urlInfo.frontend = amplifyFrontend;
      urlInfo.detail = first;
    } else {
      const chooseFrontend = [
        {
          type: 'list',
          name: 'choice',
          message: 'Choose what frontend you want?',
          choices: Object.keys(results),
          default: Object.keys(results)[0],
        },
      ];
      const frontend = await inquirer.prompt(chooseFrontend);
      urlInfo.detail = first;
      urlInfo.frontend = frontend.choice;
    }
  } else if (Object.keys(results).length === 1 && results[Object.keys(results)[0]].length > 1) {
    const frontend = Object.keys(results)[0];
    const chooseDetails = [
      {
        type: 'list',
        name: 'choice',
        message: 'Choose what docs you want?',
        choices: results[frontend],
        default: results[frontend][0],
      },
    ];
    const detail = await inquirer.prompt(chooseDetails);

    urlInfo.frontend = frontend;
    urlInfo.detail = detail.choice;
  } else if (Object.keys(results).length === 1 && results[Object.keys(results)[0]].length === 1) {
    const frontend = Object.keys(results)[0];
    const detail = results[frontend][0];
    urlInfo.frontend = frontend;
    urlInfo.detail = detail;
  }
  opn(`https://aws-amplify.github.io/docs/${urlInfo.frontend}/${urlInfo.detail}`);
}

function getCurrentFrontend(context) {
  if (context.amplify.pathManager.searchProjectRootPath()) {
    const projectConfig = context.amplify.getProjectConfig();
    if (projectConfig.frontend) {
      return projectConfig.frontend;
    }
  }
  return undefined;
}

module.exports = {
  openDoc,
};
