const fs = require("fs");
const BaseUniverse = require("./BaseUniverse");
const Plotly = require("plotly.js");

class Astronome extends BaseUniverse {
    #mCurrentPage = 1;
    #mTotalPages = 0;
    #mMaxElementsPerPage;
    #mGraphContainer;
    #mUntilMith;
    #mCallback;
    #mTitle = "Log"
    constructor(graph_container, until_mith, callback = undefined, alphabet = "01", max_elements_per_page = 10000) {
        super(alphabet);
        this.#mMaxElementsPerPage = max_elements_per_page;
        this.#mGraphContainer = graph_container;
        this.#mCallback = callback;
        this.#mTitle += until_mith;
        this.#makeButtons();
        this.updatePages();
    }
    #makeGraph() {
        let data = this.#getGraphData(this.#getFrom(), this.#getTo());
        let plot_layout = {
            title: `${this.#mCallback ? this.#mTitle : ""} of 1s count from E^1 to E^${this.#mUntilMith} (page ${this.#mCurrentPage} of ${this.#mTotalPages})`,
            xaxis: {
                autotypenumbers: "strict"
            }
        }
        Plotly.newPlot(this.#mGraphContainer.getElementsByClassName("graph")[0], [data], plot_layout);
    }
    #getGraphData(from, to) {
        let data = {
            x: [],
            y: [],
            mode: `lines${this.#mCallback ? "+markers" : ""}`,
            name: "1\'s count"
        };
        let galaxy = "";
        let tmp = 0;
        if(!this.#mCallback){
            let current_mith = BaseUniverse.getMith(from, this.alphabet.length);
            let current_item = Math.pow(2, current_mith) - (from - BaseUniverse.getMithSum(current_mith - 1));
            for (let i = from; i <= to; ++i) {
                if (current_item > Math.pow(2, current_mith)) {
                    ++current_mith;
                    current_item = 1;
                }
                galaxy = this.getGalaxy(current_mith, current_item - 1, current_mith);
                data.x.push(galaxy);
                tmp = BaseUniverse.countStars(galaxy);
                data.y.push(tmp);
                ++current_item;
            }
        }
        else{
            for(let i = from; i <= to; ++i){
                galaxy = this.getGalaxy("merged", i, BaseUniverse.LOG_WORD_LENGTH);
                data.x.push(galaxy);
                tmp = BaseUniverse.countStars(galaxy);
                data.y.push(this.#mCallback(tmp));
            }
        }
        return data;
    }
    #getFrom() {
        return Math.max(((this.#mCurrentPage - 1) * this.#mMaxElementsPerPage) + 1, 1);
    }
    #getTo() {
        return Math.min(BaseUniverse.getMithSum(this.#mUntilMith), this.#mCurrentPage * this.#mMaxElementsPerPage)
    }
    #makeButtons() {
        let buttons_container = document.createElement("div");
        let graph = document.createElement("div");
        buttons_container.className = "buttons-container";
        graph.className = "graph";
        buttons_container.innerHTML = `<button class="prev">prev</button>
            <span class="current">${this.#mCurrentPage}</span>/<span class="total">${this.#mTotalPages}</span>
            <button class="next">next</button>`;
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
        if ((to_page <= this.#mTotalPages) && (to_page > 0)) {
            this.#mCurrentPage = to_page;
            this.#mGraphContainer.getElementsByClassName("current")[0].innerHTML = this.#mCurrentPage;
            this.#makeGraph();
        }
    }
    updatePages(until_mith) {
        this.#mUntilMith = this.checkFiles(until_mith, false) - 1;
        this.#mTotalPages = Math.ceil((BaseUniverse.getMithSum(this.#mUntilMith, this.#mCallback != undefined) / (this.#mCallback ? 65 : 1)) / this.#mMaxElementsPerPage);
        this.#mCurrentPage = (this.#mCurrentPage > this.#mTotalPages) ? this.#mTotalPages : this.#mCurrentPage;
        this.#mGraphContainer.getElementsByClassName("total")[0].innerHTML = this.#mTotalPages;
        this.#mGraphContainer.getElementsByClassName("current")[0].innerHTML = this.#mCurrentPage;
        this.#makeGraph();
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