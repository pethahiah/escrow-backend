const path = require('path');
const randomize = require('randomatic');

exports.ProcessFile = function(file) {
    const newfile = file;
    const extensionName = path.extname(newfile.name); 

    const allowedExtension = ['.png','.jpg','.jpeg'];

    if(!allowedExtension.includes(extensionName.toLowerCase())){
       return null;
    }

    const filename = `${randomize('Aa0', 10)}${extensionName}`
    const pathtosave = __dirname + "/files/" + filename;
    return { path : pathtosave, filename : filename };
}

exports.ProcessDocument = function(file) {
    const newfile = file;
    const extensionName = path.extname(newfile.name); 

    const allowedExtension = ['.png','.jpg','.jpeg','.docx','.doc','.pdf'];

    if(!allowedExtension.includes(extensionName.toLowerCase())){
       return null;
    }

    const filename = `${randomize('Aa0', 10)}${extensionName}`
    const pathtosave = __dirname + "/documents/" + filename;
    return { path : pathtosave, filename : filename };
}