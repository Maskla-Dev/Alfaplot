const Plotly = require("plotly.js");
const fs = require("fs");
const UniverseController = require("./UniverseController");

let mith = document.getElementById("mith");
let graphics = document.getElementById("graphics");
let progress_container = document.getElementById("progress");
let progress_merged = document.getElementById("progress-merged");
let plotter = document.getElementById("plotter");

let worker;
let merger;
let total_clusters;

let pages = {
    binary: {
        current: 0,
        total: 0
    },
    decimal: {
        current: 0,
        total: 0
    },
    per_page: 10000
}

let normal_plot_available = true;
let log_plot_available = true;

graphics.getElementsByClassName("prev-page")[0].addEventListener("click", () => {
    if (normal_plot_available) {
        changePage(true, false);
        plotNormal(total_clusters);
    }
});

graphics.getElementsByClassName("next-page")[0].addEventListener("click", () => {
    if (normal_plot_available) {
        changePage(true, true);
        plotNormal(total_clusters);
    }
});

graphics.getElementsByClassName("prev-page")[1].addEventListener("click", () => {
    if (log_plot_available) {
        changePage(false, false);
        plotLog(total_clusters);
    }
});

graphics.getElementsByClassName("next-page")[1].addEventListener("click", () => {
    if (log_plot_available) {
        changePage(false, true);
        plotLog(total_clusters);
    }
});

plotter.addEventListener("click", () => {
    total_clusters = Number(mith.value);
    isInputDisabled(true);
    updateStatus(`0%`);
    worker = new Worker("./worker.js");
    worker.onmessage = mainWorkerListener;
    worker.postMessage(total_clusters);
    graphics.style.maxHeight = "100%";
    graphics.style.height = "fit-content";
    pages.binary.total = 0;
    if (normal_plot_available)
        plotNormal(total_clusters);
});

async function plotNormal(mith) {
    let data;
    normal_plot_available = false;
    if (pages.binary.total === 0) {
        graphics.getElementsByClassName("current-page")[0].innerHTML = pages.binary.current;
        pages.binary.total = Math.ceil(Math.pow(2, mith) / pages.per_page);
        pages.binary.current = pages.binary.current == 0 ? 1 : pages.binary.current;
    }
    graphics.getElementsByClassName("current-page")[0].innerHTML = pages.binary.current;
    graphics.getElementsByClassName("pages")[0].innerHTML = pages.binary.total;
    data = getGraphData(Math.max(((pages.binary.current - 1) * pages.per_page) + 1, 2), Math.min(getMithSum(total_clusters), pages.binary.current * pages.per_page));
    let plot_layout = {
        title: `1s count from E^1 to E^${total_clusters} (page ${pages.binary.current} of ${pages.binary.total})`,
        xaxis: {
            autotypenumbers: "strict"
        }
    }
    Plotly.newPlot("plot-binary", [data], plot_layout);
    normal_plot_available = true;
}

async function plotLog(mith) {
    let data;
    log_plot_available = false;
    if (pages.decimal.current === 0) {
        graphics.getElementsByClassName("current-page")[1].innerHTML = pages.decimal.current;
        pages.decimal.total = Math.ceil(Math.ceil(getMithSum(mith) / 64) / pages.per_page);
        pages.decimal.current = pages.decimal.current == 0 ? 1 : pages.decimal.current;
    }
    graphics.getElementsByClassName("current-page")[1].innerHTML = pages.decimal.current;
    graphics.getElementsByClassName("pages")[1].innerHTML = pages.decimal.total;
    data = getGraphData((pages.decimal.current - 1) * pages.per_page + 1, Math.min(Math.ceil(getMithSum(mith) / 64), pages.decimal.current * pages.per_page), true);
    let plot_layout = {
        title: `Log10 of 1s count from concatenated sets of E^1 to E^${total_clusters}  (page ${pages.binary.current} of ${pages.binary.total})`,
        xaxis: {
            autotypenumbers: "strict"
        }
    }
    Plotly.newPlot("plot-decimal", [data], plot_layout);
    normal_plot_available = true;
    isInputDisabled(false);
}

function mainWorkerListener(e) {
    if (e.data.activity === "update-loader") {
        updateStatus(`${e.data.value}%`);
    }
    else if (e.data.activity === "end") {
        updateStatus("100%");
        mergeFiles(total_clusters);
    }
}

function changePage(is_binary_plot, is_forward_step) {
    pageController(
        is_binary_plot ? "binary" : "decimal",
        (is_binary_plot ? pages.binary.current : pages.decimal.current) + (is_forward_step ? 1 : -1)
    );
}

function pageController(graph, toPage) {
    switch (graph) {
        case "binary":
            pages.binary.current = (toPage > 0 && toPage <= pages.binary.total) ? toPage : pages.binary.current;
            break;
        case "decimal":
            pages.binary.current = (toPage > 0 && toPage <= pages.decimal.total) ? toPage : pages.binary.current;
            break;
    }
}

function getMithSum(mith, multiply = false) {
    let sum = 0;
    for (let i = 0; i <= mith; ++i) {
        sum += Math.pow(2, i) * (multiply ? i : 1);
    }
    return sum;
}

function updateStatus(value, isForMerged = false) {
    if (!isForMerged) {
        progress_container.getElementsByClassName("load-status")[0].innerHTML = value;
        progress_container.getElementsByClassName("loader-bar")[0].style.width = value;
    }
    else {
        progress_merged.getElementsByClassName("load-status")[0].innerHTML = value;
        progress_merged.getElementsByClassName("loader-bar")[0].style.width = value;
    }
}

function isInputDisabled(state) {
    mith.disabled = state;
    plotter.disabled = state;
}

function getGraphData(from, until, isLog = false) {
    let strings = [];
    let count = [];
    let AlphaUniverse = new UniverseController(undefined);
    let current_mith = getMith(from);
    let current_item = !isLog ? Math.pow(2, current_mith) - from : 0;
    let file = !isLog ? fs.openSync(AlphaUniverse.getFullFileName(current_mith), fs.constants.O_RDONLY) : fs.openSync(`${AlphaUniverse.mPathName}/merged.uni`, fs.constants.O_RDONLY);
    let buffer = Buffer.alloc(!isLog ? current_mith : 64);
    if (!isLog) {
        for (let i = from === 2 ? 1 : from; i <= until; ++i) {
            if (current_item > Math.pow(2, current_mith)) {
                ++current_mith;
                file = fs.openSync(AlphaUniverse.getFullFileName(current_mith), fs.constants.O_RDONLY);
                buffer = Buffer.alloc(current_mith);
                current_item = 0;
            }
            fs.readSync(file, buffer, {
                position: current_item * current_mith
            });
            strings.push(buffer.toString("utf-8"));
            count.push(countOnes(buffer.toString("utf-8")));
            ++current_item;
        }
    }
    else {
        for (let i = from; i < until; ++i) {
            fs.readSync(file, buffer, {
                position: current_item * 64
            });
            strings.push(buffer.toString("utf-8"));
            count.push(Math.log10(countOnes(buffer.toString("utf-8"))));
            ++current_item
        }
        if (current_item * 64 != until * 64) {
            buffer.fill("0");
            fs.readSync(file, buffer, {
                position: current_item * 64
            });
            strings.push(buffer.toString("utf-8"));
            count.push(Math.log10(countOnes(buffer.toString("utf-8"))));
        }
    }
    return {
        x: strings,
        y: count,
        mode: `lines${isLog ? "+markers" : ""}`,
        name: "1\'s count"
    };
}

function countOnes(string) {
    let count = 0;
    for (let letter of string) {
        count += letter === "1" ? 1 : 0;
    }
    return count;
}

function getMith(number) {
    return Math.ceil(Math.log10(number) / Math.log10(2));
}

async function mergeFiles(mith) {
    updateStatus(`0%`, true);
    merger = new Worker("./merger.js");
    merger.onmessage = (e) => {
        if (e.data.activity === "end") {
            updateStatus(`100%`, true);
            pages.decimal.total = 0;
            if (log_plot_available)
                plotLog(total_clusters);
        }
        else if (e.data.activity === "update-loader") {
            updateStatus(`${e.data.value}%`, true);
        }
    }
    merger.postMessage(Number(mith));
}