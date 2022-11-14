const fs = require("fs");
const BaseUniverse = require("./BaseUniverse");
const { UpdateType } = require("./utils/helpers");

class UniverseConstructor extends BaseUniverse {
    static MAX_MERGED_BUFFER = 64;
    constructor(alphabet = "01", status_updater = undefined) {
        super(alphabet, status_updater);
        if (!this.checkFiles(1)[1]) {
            this.initCluster(1);
            for (const letter of alphabet)
                this.writeGalaxy(letter, 1, letter != alphabet[alphabet.length - 1]);
            this.#closeCluster(1);
        }
    }
    makeClusters(until_mith) {
        let last_cluster = this.checkFiles(until_mith) - 1;
        let galaxy = "";
        for (let current_cluster = last_cluster; current_cluster <= until_mith; ++current_cluster) {
            this.mStatusUpdater ? this.mStatusUpdater(UpdateType.cluster, String(current_cluster)) : undefined;
            this.initCluster(current_cluster);
            for (const letter of this.alphabet) {
                this.mStatusUpdater ? this.mStatusUpdater(UpdateType.letter, letter) : undefined;
                for (let nith_galaxy = 0; nith_galaxy < Math.pow(this.alphabet.length, current_cluster - 1); ++nith_galaxy) {
                    galaxy = letter.concat(this.getGalaxy((current_cluster - 1), nith_galaxy, current_cluster - 1));
                    this.writeGalaxy(galaxy, current_cluster, !(letter == this.alphabet[this.alphabet.length - 1]) || !(nith_galaxy == (Math.pow(this.alphabet.length, current_cluster - 1) - 1)));
                    this.mStatusUpdater ? this.mStatusUpdater(UpdateType.galaxy, `${((nith_galaxy / Math.pow(this.alphabet.length, current_cluster - 1)) * 100).toFixed(2)}%`) : undefined;
                }
            }
            this.#closeCluster(current_cluster);
        }
        this.#makeClusterProcessDone();
    }
    #closeCluster(cluster) {
        fs.appendFileSync(this.getFullFileName(cluster), "}");
    }
    mergeClusters(until_mith) {
        this.initCluster("merged");
        let galaxy = "";
        for (let current_cluster = 1, work_done = 0, total_work = BaseUniverse.getTotalGalaxies(this.alphabet.length, until_mith); current_cluster <= until_mith; ++current_cluster) {
            for (let nith_galaxy = 0; nith_galaxy < Math.pow(this.alphabet.length, current_cluster); ++nith_galaxy) {
                galaxy += this.getGalaxy(current_cluster, nith_galaxy, current_cluster);
                if (galaxy.length > UniverseConstructor.MAX_MERGED_BUFFER) {
                    this.writeGalaxy(galaxy.substring(0, 64), "merged");
                    galaxy = galaxy.slice(64);
                    this.mStatusUpdater(UpdateType.merger, `${((work_done / total_work) * 100).toFixed(2)}%`);
                }
            }
        }
        this.writeGalaxy(galaxy, "merged", false);
        this.#closeCluster("merged");
        this.mStatusUpdater ? this.mStatusUpdater(UpdateType.merger, "Done") : undefined;
    }
    #makeClusterProcessDone() {
        this.mStatusUpdater ? this.mStatusUpdater(UpdateType.cluster, "Done") : undefined;
        this.mStatusUpdater ? this.mStatusUpdater(UpdateType.letter, "Done") : undefined;
        this.mStatusUpdater ? this.mStatusUpdater(UpdateType.galaxy, "Done") : undefined;
        this.mStatusUpdater ? this.mStatusUpdater(UpdateType.letter, "Done") : undefined;
    }
}

module.exports = UniverseConstructor;