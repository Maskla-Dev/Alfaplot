const fs = require("fs");
const path = require("path");

console.log(fs.existsSync(path.resolve(__dirname, "universes")));
console.log(path.resolve(__dirname, "universes"));