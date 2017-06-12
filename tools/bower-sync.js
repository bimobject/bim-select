const fs = require('fs');

const bowerPath = `${__dirname}/../bower.json`;
const bower = require(bowerPath);
const npm = require(`${__dirname}/../package.json`);

[
    'dependencies',
    'description',
    'homepage',
    'keywords',
    'license',
    'main',
    'name',
].forEach(key => bower[key] = npm[key]);

bower.authors[0] = npm.author;

const json = JSON.stringify(bower, null, 2);
fs.writeFileSync(bowerPath, json);
