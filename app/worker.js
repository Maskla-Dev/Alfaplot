const UniverseConstructor = require("./js/UniverseConstructor");
const { UpdateType, Activities } = require("./js/utils/helpers");
const god = new UniverseConstructor("01", updateStatus);

onmessage = (e) => {
    if (typeof e.data.activity == "number") {
        switch (e.data.activity) {
            case Activities.init_construction:
                god.makeClusters(e.data.payload.mith);
                informJobDone(Activities.construction_done);
                break;
            case Activities.init_merge:
                god.mergeClusters(e.data.payload.mith);
                updateStatus(UpdateType.done, undefined);
                informJobDone(Activities.merge_done);
                break;
            default:
                console.log(`Worker does not know about ${e.data.activity} activity`);
                break;
        }
    }
}

function updateStatus(type, status) {
    postMessage({
        activity: Activities.update_status,
        payload: {
            target: type,
            status: status
        }
    });
}

function informJobDone(job) {
    postMessage({
        activity: job
    });
}