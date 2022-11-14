const fs = require("fs");
const BaseUniverse = require("./BaseUniverse");
const Plotly = require("plotly.js");

class Astronome extends BaseUniverse {
    #mCurrentPage = 0;
    #mTotalPages = 0;
    #mMaxElementsPerPage;
    #mGraphContainer;
    #mUntilMith;
    #mCallback;
    constructor(graph_container, until_mith, callback, alphabet = "01", max_elements_per_page = 10000) {
        super(alphabet);
        this.#mMaxElementsPerPage = max_elements_per_page;
        this.#mGraphContainer = graph_container;
        this.#mUntilMith = this.checkFiles(until_mith, false) - 1;
        console.log(this.#mUntilMith)
        this.#mCallback = callback;
        this.#makeButtons();
    }
    makeGraph() {
        let data;
        data = this.#getGraphData(Math.max(((this.#mCurrentPage - 1) * this.#mMaxElementsPerPage) + 1, 2), Math.min(BaseUniverse.getMith(this.#mUntilMith), this.#mCurrentPage * this.#mMaxElementsPerPage));
        let plot_layout = {
            title: `1s count from E^1 to E^${this.#mUntilMith} (page ${this.#mCurrentPage} of ${this.#mTotalPages})`,
            xaxis: {
                autotypenumbers: "strict"
            }
        }
        Plotly.newPlot("plot-binary", [data], plot_layout);
        normal_plot_available = true;
    }
    #getGraphdata() {

    }
    #makeButtons() {
        let buttons_container = document.createElement("div");
        let graph = document.createElement("div");
        buttons_container.className = "buttons-container";
        graph.className = "graph";
        buttons_container.innerHTML = `<button class="next">Next</button>
            <span class="current">${this.#mCurrentPage}</span>/<span class="total">${this.#mTotalPages}</span>
            <button class="prev">Prev</button>`;
        buttons_container.getElementsByClassName("next")[0].addEventListener("click", () => {
            this.goPage(this.#mCurrentPage + 1);
        });
        buttons_container.getElementsByClassName("prev")[0].addEventListener("click", () => {
            this.goPage(this.#mCurrentPage - 1);
        });
        this.#mGraphContainer.appendChild(buttons_container);
        this.#mGraphContainer.appendChild(graph);
    }
    goPage(to_page) {
        if ((this.#mCurrentPage < this.#mTotalPages) && (this.#mCurrentPage > 0)) {
            this.#mCurrentPage = to_page;
        }
    }
    updatePages(new_total_pages) {
        this.#mTotalPages = new_total_pages;
        this.#mGraphContainer.getElementsByClassName("total")[0].innerHTML = this.#mTotalPages;
        if (this.#mCurrentPage > this.#mTotalPages) {
            this.#mCurrentPage = this.#mTotalPages;

        }
    }

}

module.exports = Astronome;

// let cluster = [];
//         let current_mith = BaseUniverse.getMith(from, this.#mAlphabet.length);
//         let current_item = Math.pow(this.#mAlphabet.length, current_mith) - from;
//         let file = fs.openSync(this.getFullFileName(current_mith), fs.constants.O_RDONLY);
//         let file_metadata = fs.statSync(this.getFullFileName(current_mith));
//         let buffer = Buffer.alloc(current_item);
//         let pos = BaseUniverse.START_FORMAT_OFFSET + String(current_mith).length + 1 + (current_mith + BaseUniverse.FORMAT_OFFSET) * current_item;
//         while ((items_to_read--) > 0) {
//             //File switch
//             if (pos > file_metadata.size) {
//                 fs.closeSync(file);
//                 file = fs.openSync(this.getFullFileName(++current_mith), fs.constants.O_RDONLY);
//                 file_metadata = fs.statSync(this.getFullFileName(current_mith));
//                 pos = BaseUniverse.START_FORMAT_OFFSET + String(current_mith).length + 1;
//                 buffer = Buffer.alloc(current_item);
//             }
//             fs.readSync(file, buffer, { position: pos });
//             cluster.push(buffer.toString("utf8"));
//             pos += mith + BaseUniverse.FORMAT_OFFSET;
//         }
//         fs.close(file);
//         return cluster;