var git = require("nodegit");
var path = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');

module.exports = (context) => {
    context.updateDocs = async () => {
      await updateDocs(context);
    };
};


async function updateDocs(context){
    await git.Clone('https://github.com/aws-amplify/docs', './tmp');
    const fileNames = [];
    const params = {};
    dirScrapper('./tmp',/\.md$/,function(filename){
        fileNames.push(filename);
        let directory = filename.split('/');
        let url = directory[2].split('.')[0];
        if (params[directory[1]]){
            params[directory[1]].push(url);
        } else {
            params[directory[1]]= [];
            params[directory[1]].push(url);
        }
    });

    var jsonParams = JSON.stringify(params);
    fs.writeFile('src/docs.json', jsonParams, function(err){
        console.log(err);
    });
    fs_extra.removeSync('./tmp/'); 
}


function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }
    var files=fs.readdirSync(startPath);

    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)){
            callback(filename);
        }
    };
};

function dirScrapper(startPath, filter, callback){
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    let indexOfGithub = files.indexOf('.github');
    files.splice(indexOfGithub,1);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        } else {
            //Ignore all root directory stuff as it is mostly garbage 
        }
    };
}
//console.log(params);