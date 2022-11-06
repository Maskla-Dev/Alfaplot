const UniverseController = require("./UniverseController.js");

onmessage = (e) => {
    if (typeof e.data === "number") {
        initMainProgram(e.data);
    }
}

function initMainProgram(clusters) {
    console.log(`Worker needs generate ${Math.pow(2, clusters)} galaxies`);
    let AlphaUniverse = new UniverseController(requestUpdateLoader);
    AlphaUniverse.createClusters(clusters);
    requestEnd();
}

function requestEnd() {
    postMessage({
        activity: "end",
    })
}

function requestUpdateLoader(value) {
    postMessage({
        activity: "update-loader",
        value: Number(value)
    })
}

module.exports = {
    requestEnd: requestEnd,
    requestUpdateLoader: requestUpdateLoader
}