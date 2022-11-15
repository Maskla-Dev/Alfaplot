const fs = require("fs");

class BaseUniverse {
    //E^n={{...},...,{...}}
    static START_FORMAT_OFFSET = 4;
    static FORMAT_OFFSET = 3;
    static LOG_WORD_LENGTH = 64;
    #mPathName;
    #mAlphabet;
    mStatusUpdater;
    constructor(alphabet = "01", status_updater = undefined) {
        //Init members
        this.#mAlphabet = alphabet;
        this.#mPathName = `./app/universes/${this.#mAlphabet}`
        BaseUniverse.guaranteeDir(this.#mPathName);
        this.mStatusUpdater = status_updater
    }
    get alphabet() {
        return this.#mAlphabet;
    }
    get pathname() {
        return this.#mPathName;
    }
    //Gets a list of m-th E has been generated
    checkFiles(until_mith, ceil = true) {
        let last_cluster = 1;
        while (this.isClusterExist(last_cluster) && (ceil ? (last_cluster <= until_mith) : true)) {
            ++last_cluster
        }
        return last_cluster;
    }
    //Verifies if m-th E already exists
    isClusterExist(mith_cluster) {
        BaseUniverse.guaranteeDir(this.#mPathName);
        try {
            fs.accessSync(this.getFullFileName(mith_cluster), fs.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    //Get file name for the m-th E generated
    getFullFileName(name) {
        return `${this.#mPathName}/cluster${name}.uni`;
    }
    //Extract bitset from file
    getGalaxy(cluster_name, galaxy_number, galaxy_length) {
        BaseUniverse.guaranteeDir(this.#mPathName);
        let file = fs.openSync(this.getFullFileName(cluster_name), fs.constants.O_RDONLY);
        let buffer = Buffer.alloc(galaxy_length);
        let pos = BaseUniverse.getTotalStartFixed(cluster_name) + ((galaxy_length + BaseUniverse.FORMAT_OFFSET) * galaxy_number);
        fs.readSync(file, buffer, { position: pos });
        fs.closeSync(file);
        return buffer.toString("utf8");
    }
    initCluster(cluster_name) {
        BaseUniverse.guaranteeDir(this.#mPathName);
        fs.writeFileSync(this.getFullFileName(cluster_name), `E${cluster_name == "merged" ? "_" : "^"}${cluster_name}={`);
    }
    writeGalaxy(galaxie, cluster_name, coma_write = true) {
        fs.appendFileSync(this.getFullFileName(cluster_name), `{${galaxie}}${coma_write ? "," : ""}`);
    }
    //NON-Members
    static getTotalStartFixed(cluster) {
        return BaseUniverse.START_FORMAT_OFFSET + String(cluster).length + 1;
    }
    //Count ones from a bitset
    static countStars(galaxie) {
        let count = 0;
        for (let letter of galaxie) {
            count += letter === "1" ? 1 : 0;
        }
        return count;
    }
    //Create a dir path if it does not exist
    static guaranteeDir(path_name) {
        if (!fs.existsSync(path_name))
            fs.mkdirSync(path_name, { recursive: true });
    }
    //Gets wich m-th E belongs to item number 
    static getMith(galaxy, alphabet_length) {
        let items = 0, mith = 1;
        if (galaxy > 0) {
            while (true) {
                items += Math.pow(alphabet_length, mith);
                if (items > galaxy)
                    return mith;
                ++mith;
            }
        }
        return 0;
    }
    //Gets how much work needs to do from E^1 to m-ith E
    static getTotalGalaxies(alphabet_length, mith) {
        let nith_galaxie = 0;
        for (let i = 1; i < mith; ++i)
            nith_galaxie += Math.pow(alphabet_length, i);
        return nith_galaxie;
    }
    static getMithSum(mith, multiply = false) {
        let sum = 0;
        for (let i = 1; i <= mith; ++i) {
            sum += Math.pow(2, i) * (multiply ? i : 1);
        }
        return sum;
    }
}

module.exports = BaseUniverse;