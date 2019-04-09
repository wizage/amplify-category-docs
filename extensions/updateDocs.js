const git = require('nodegit');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

module.exports = (context) => {
  context.updateDocs = async () => {
    await updateDocs();
  };
};


async function updateDocs() {
  console.log('Cloning amplify docs...');
  await git.Clone('https://github.com/aws-amplify/docs', './tmp');
  const fileNames = [];
  const params = {};
  console.log('Going through repo finding documents...');
  dirScrapper('./tmp', /\.md$/, (filename) => {
    fileNames.push(filename);
    const directory = filename.split('/');
    const url = directory[2].split('.')[0];
    if (params[directory[1]]) {
      params[directory[1]].push(url);
    } else {
      params[directory[1]] = [];
      params[directory[1]].push(url);
    }
  });
  console.log('Writing results...');
  const jsonParams = JSON.stringify(params);
  fs.writeFile('src/docs.json', jsonParams, (err) => {
    if (err) {
      console.log(err);
    }
  });
  fsExtra.removeSync('./tmp/');
}


function fromDir(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }
  const files = fs.readdirSync(startPath);

  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, callback); // recurse
    } else if (filter.test(filename)) {
      callback(filename);
    }
  }
}

function dirScrapper(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  const indexOfGithub = files.indexOf('.github');
  files.splice(indexOfGithub, 1);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, callback); // recurse
    } else {
      // Ignore all root directory stuff as it is mostly garbage
    }
  }
}
// console.log(params);
