const fs = require('fs');
const { readFile, writeFile, mkdir, readdir, rename } = require('fs/promises');
const { error } = require('../core/constants');

// const DEFAULT_OPTIONS = {
//     maxLines: 3,
//     fields: [ "id","name","profession","age" ]
// }

class File {

    static async txtForArrayString(filePath) {
        const content = await File.getFileContent(filePath);
        return content.split('\n').map(item => item.replace('\r', ''));
    }

    static async getFileContent(filePath) {
        return (await readFile(filePath)).toString("utf8");
    }

    static readdir(dirPath) {
        return readdir(dirPath);
    }

    static existsSync(dirPath) {
        return fs.existsSync(dirPath);
    }

    static mkdir(dirPath) {
        return mkdir(dirPath);
    }

    static async writeFile(filePath, file) {
        return await writeFile(filePath, file);
    }

    static rename(actualPath, newPath) {
        rename(actualPath, newPath);
    }

    static createWriteStream(filePath) {
        return fs.createWriteStream(filePath);
    }

    // static async csvToJson(filePath) {
    //     const content = await File.getFileContent(filePath);
    //     const validation = File.isValid(content);
    //     if(!validation.valid) throw new Error(validation.error);

    //     const users = File.parseCSVToJson(content);
    //     return users;
    // }

    // static isValid(csvString, options = DEFAULT_OPTIONS) {
    //     const [header, ...fileWithoutHeader] = csvString.split('\n');
    //     const isHeaderValid = header.replace('\r', '') === options.fields.join(',');
    //     if(!isHeaderValid) {
    //         return {
    //             error: error.FILE_FIELDS_ERROR_MESSAGE,
    //             valid: false
    //         }
    //     }

    //     const isContentLengthAccepted = (
    //         fileWithoutHeader.length > 0 &&
    //         fileWithoutHeader.length <= options.maxLines
    //     );
    //     if(!isContentLengthAccepted) {
    //         return {
    //             error: error.FILE_LENGTH_ERROR_MESSAGE,
    //             valid: false
    //         }
    //     }

    //     return { valid: true };
    // }

    // static parseCSVToJson(csvString) {
    //     const lines = csvString.split('\n');
    //     const firstLine = lines.shift();
    //     const header = firstLine.split(',');
    //     const users = lines.map(line => {
    //         const columns = line.split(',');
    //         let user = {};
    //         for(const index in columns) {
    //             user[header[index].replace('\r', '')] = columns[index].replace('\r', '');
    //         }
    //         return new User(user);
    //     });
        
    //     return users;
    // }
}

module.exports = File;