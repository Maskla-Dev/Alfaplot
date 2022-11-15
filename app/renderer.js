const { UpdateType, Activities } = require("./js/utils/helpers");
const Astronome = require("./js/Astronome");

let mith = document.getElementById("mith");
let progress_container = document.getElementById("progress");
let plotter = document.getElementById("plotter");
let normal = document.getElementById("normal");
let log2 = document.getElementById("log2");
let log10 = document.getElementById("log10");

isInputDisabled(true);
const normal_graph = new Astronome(normal, 1);
const log2_graph = new Astronome(log2, "2", value => Math.log2(value));
const log10_graph = new Astronome(log10, "10", value => Math.log10(value));
isInputDisabled(false);

let worker = new Worker("./worker.js");
worker.onmessage = mainWorkerListener;
let total_clusters;


plotter.addEventListener("click", () => {
    total_clusters = Number(mith.value);
    isInputDisabled(true);
    updateStatus(UpdateType.galaxy, `0%`);
    worker.postMessage({
        activity: Activities.init_construction,
        payload: {
            mith: total_clusters
        }
    });

});

function updateStatus(type, status) {
    switch (type) {
        case UpdateType.galaxy:
            progress_container.getElementsByClassName("galaxy")[0].innerText = status;
            break;
        case UpdateType.cluster:
            progress_container.getElementsByClassName("cluster")[0].innerText = status;
            break;
        case UpdateType.letter:
            progress_container.getElementsByClassName("letter")[0].innerText = status;
            break;
        case UpdateType.merger:
            progress_container.getElementsByClassName("merge")[0].innerText = status;
            break;
        case UpdateType.done:
            isInputDisabled(false);
            break;
    }
}

function isInputDisabled(state) {
    mith.disabled = state;
    plotter.disabled = state;
}

function mainWorkerListener(e) {
    if (e.data ? typeof e.data.activity == "number" : e.activity == "number") {
        switch (e.data ? e.data.activity : e.activity) {
            case Activities.update_status:
                updateStatus(e.data.payload.target, e.data.payload.status);
                break;
            case Activities.construction_done:
                worker.postMessage({
                    activity: Activities.init_merge,
                    payload: {
                        mith: total_clusters
                    }
                });
                normal_graph.updatePages();
                break;
            case Activities.merge_done:
                updateStatus(UpdateType.done, undefined);
                log2_graph.updatePages();
                log10_graph.updatePages();
                break;
        }
    }
}