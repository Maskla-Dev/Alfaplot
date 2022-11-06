const { requestEnd, requestUpdateLoader } = require("./worker");
const UniverseController = require("./UniverseController");
const fs = require("fs");

onmessage = (e) => {
    if (typeof e.data === "number") {
        initMerging(e.data);
        requestEnd();
    }
}

function initMerging(mith) {
    let AlphaUniverse = new UniverseController(undefined);
    let until_file = AlphaUniverse.checkFiles(mith);
    let merged_name = `${AlphaUniverse.mPathName}/merged.uni`;
    fs.writeFileSync(merged_name, "");
    let cluster_name;
    let buffer;
    for (let i = 1; i < until_file; ++i) {
        cluster_name = AlphaUniverse.getFullFileName(i);
        buffer = fs.readFileSync(cluster_name);
        fs.appendFileSync(merged_name, buffer);
        requestUpdateLoader((i / until_file).toFixed(2) * 100);
    }
}
