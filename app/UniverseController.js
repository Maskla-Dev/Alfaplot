const fs = require('fs');

class UniverseController {
    #mAlphabet;
    #mClusters;
    #mProgressContainer;
    #mPathName;
    constructor(progress_container, alphabet = "01") {
        this.#mAlphabet = alphabet;
        this.#mClusters = [];
        this.#mProgressContainer = progress_container;
        this.#mPathName = `./app/universes/${this.#mAlphabet}`;
        for (let letter of alphabet) {
            this.#mClusters.push(letter);
        }
    }
    getAlphabet() {
        return this.getAlphabet;
    }
    getClusters() {
        return this.#mClusters;
    }
    createClusters(mith) {
        let i = 2;
        let last_cluster_checked = this.checkFiles(mith);
        if (last_cluster_checked <= mith && mith > 2)
            this.#getClusterFromFile(last_cluster_checked - 1);
        for (let j = last_cluster_checked; j <= mith; ++j) {
            this.#createClusters(j, mith)
        }
    }
    checkFiles(mith) {
        let i = 2;
        while (this.#isClusterExist(i) && i <= mith) {
            ++i;
        }
        return i;
    }
    #createClusters(i, mith) {
        this.#explodeStars();
        this.#saveClusters(i);
        if (this.#mProgressContainer)
            this.#mProgressContainer.innerHTML = `${(i / mith).toFixed(4) * 100}%`;
    }
    #explodeStars() {
        let original_cluster_size = this.#mClusters.length;
        //Expansion
        for (let alphabet_i = 1; alphabet_i < this.#mAlphabet.length; ++alphabet_i) {
            for (let clusters_i = 0; clusters_i < original_cluster_size; ++clusters_i) {
                this.#mClusters.push(this.#mClusters.at(clusters_i));
            }
        }
        //Insertion
        let cluster_i = 0;
        for (let letter of this.#mAlphabet) {
            for (let i = 0; i < original_cluster_size; ++i) {
                this.#mClusters[cluster_i] = `${letter}${this.#mClusters[cluster_i]}`;
                ++cluster_i
            }
        }
    }
    #saveClusters(mith_cluster) {
        this.#guaranteeDir();
        fs.writeFileSync(this.#getFullFileName(mith_cluster), "");
        for (let cluster of this.#mClusters) {
            try {
                fs.appendFileSync(this.#getFullFileName(mith_cluster), `${cluster}`);
            } catch (error) {
                console.error(`Error writing cluster #${mith_cluster}`, error);
                break;
            }
        }
    }
    #isClusterExist(mith_cluster) {
        this.#guaranteeDir();
        try {
            fs.accessSync(this.#getFullFileName(mith_cluster), fs.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    #getClusterFromFile(word_length) {
        this.#mClusters = [];
        let buffer = Buffer.alloc(word_length);
        let chunks = Math.pow(this.#mAlphabet.length, word_length);
        let cluster_descriptor = fs.openSync(this.#getFullFileName(word_length), fs.constants.O_RDONLY);
        let pos = 0;
        for (let i = 0; i < chunks; ++i) {
            pos = word_length * i;
            fs.readSync(cluster_descriptor, buffer, { position: pos });
            this.#mClusters.push(buffer.toString("utf8"));
        }
    }
    #getFullFileName(mith_cluster) {
        return `${this.#mPathName}/cluster${mith_cluster}.uni`;
    }
    #guaranteeDir() {
        if (!fs.existsSync(this.#mPathName))
            fs.mkdirSync(this.#mPathName, { recursive: true });
    }
}

module.exports = UniverseController;