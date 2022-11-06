const Plotly = require("plotly.js");
const UniverseController = require("./UniverseController.js");
const PrinterController = require("./PrinterController");

let Printer = new PrinterController(1000, file_viewer);

plotter.addEventListener('click', (e) => {
    e.preventDefault();
    let cluster = mith.value;
    let AlphaUniverse = new UniverseController(progress_container);
    mith.disabled = true;
    plotter.disabled = true;
    countOnes(Math.pow(2, cluster));
    AlphaUniverse.createClusters(cluster);
    // console.log(AlphaUniverse.getClusters().length == Math.pow(2, cluster));
    // console.log(`Last access ${AlphaUniverse.checkFiles(cluster)}`);
    let plot_layout = {
        title: `1's count from 0 to ${Math.pow(2, cluster)}`
    }
    let data = [countOnes(Math.pow(2, cluster))];
    Plotly.newPlot("plot", data, plot_layout);
    Printer.mCurrentCluster = cluster;
    let pages = 0;
    for(let i = 0; i <= cluster; ++i)
        pages += Math.pow(2, i);
    pages = Math.floor(pages / 1000) + 1;
    Printer.mPages = pages;
    Printer.mCurrentPage = 1;
    Printer.printScreen(cluster);
    plotter.disabled = false;
    mith.disabled = false;
});


function countOnes(until) {
    let bitmask = 0b1;
    let exponent = 0;
    let count = [];
    let numbers = [];
    for (let number = 0; number <= until; ++number) {
        count.push(0);
        numbers.push(number);
        if (number > Math.pow(2, exponent))
            ++exponent;
        while (bitmask <= Math.pow(2, exponent)) {
            if ((number & bitmask) == bitmask) {
                ++count[number];
            }
            bitmask <<= 1;
        }
        bitmask = 0b1;
    }
    return {
        x: numbers,
        y: count,
        mode: "lines",
        name: "1\'s count"
    };
}