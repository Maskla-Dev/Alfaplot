const fs = require('fs');

class PrinterController {
    #mCurrentPage;
    #mPages;
    #mMaxElementsPerPage;
    #mCurrentCluster;
    #mCurrentChunk;
    #mElementsReaded;
    #mViewer;
    constructor(max_elements_per_page, viewer) {
        this.#mPages = 0;
        this.#mCurrentPage = 0;
        this.#mMaxElementsPerPage = max_elements_per_page;
        this.#mViewer = viewer;
        this.#mCurrentChunk = 0;
        this.#mCurrentCluster = 0;
        this.#mElementsReaded = 0;
    }
    set mCurrentPage(page) {
        this.#mCurrentPage = page;
    }
    get mCurrentPage() {
        return this.#mCurrentPage;
    }
    get mPages() {
        return this.#mPages;
    }
    set mPages(pages) {
        this.#mPages = pages;
    }
    clearScreen() {
        this.#mViewer.innerHTML = "";
    }
    set mCurrentCluster(cluster) {
        this.#mCurrentCluster = cluster;
    }
    printScreen(mith) {
        let screen = "";
        this.#mCurrentCluster = 1;
        screen = "e<br>";
        let fd;
        let buffer;
        let chunks;
        for (let i = 1; i <= mith; ++i) {
            fd = fs.openSync(`./app/universes/01/cluster${i}.uni`, fs.constants.O_RDONLY);
            buffer = Buffer.alloc(i);
            chunks = Math.pow(2, i);
            for (let j = 0; j < chunks; ++j) {
                this.#mCurrentChunk = i * j;
                fs.readSync(fd, buffer, { position: this.#mCurrentChunk });
                screen += buffer.toString("utf8") + "<br>";
            }
            this.#mCurrentChunk = 0;
            fs.closeSync(fd);
        }
        this.#mViewer.innerHTML = screen;
    }
}

module.exports = PrinterController;