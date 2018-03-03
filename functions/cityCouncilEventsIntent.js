const alexaUtils = require("./alexaUtils");
const moment = require("moment");
const events = require("./city-council-events.json");
moment.locale('de');

const getNextEventForAssembly = (assembly) => {
    if (!events[assembly.id]) {
        return {
            state: 'NOT_AVAILABLE'
        };
    }
    const now = moment.now();
    const assemblyEvents = events[assembly.id].sort((a, b) => a - b);
    const nextEvent = assemblyEvents.find(event => moment(event * 1000).isAfter(now));
    if (!nextEvent) {
        return {
            state: 'NO_NEXT_EVENT'
        };
    } else {
        return {
            state: 'FOUND',
            formattedDate: moment(nextEvent * 1000).format("dddd, [den] D. MMMM")
        };
    }
};

const getMessage = (assembly) => {
    if (!assembly) assembly = {
        id: "Gemeinderat",
        name: "Gemeinderat"
    };
    const nextEvent = getNextEventForAssembly(assembly);

    switch (nextEvent.state) {
        case 'NOT_AVAILABLE':
            return "Diesen Ausschuss gibt es nicht";
        case 'NO_NEXT_EVENT':
            return "Es wurde noch kein kommender Termin für " + assembly.name + " bekanntgegeben";
        case 'FOUND':
            return "Das nächste " + assembly.name + " Treffen findet am " + nextEvent.formattedDate + ' statt';
    }
};

function findResolution(resolutions) {
    const resolution = resolutions.find((element) => {
        return (element.status.code === "ER_SUCCESS_MATCH");
    });

    if (resolution) {
        return resolution.values[0];
    } else {
        return null;
    }
}

const getNextEvent = (request, res, shouldEndSession) => {
    console.log("Request: ", request);
    console.log("Intent: ", JSON.stringify(request.intent));

    const slots = request.intent && request.intent.slots ? request.intent.slots : null;
    let assembly = null;
    if(slots) {
        const assemblySlot = slots.assembly;
        const assemblySlotValue = findResolution(assemblySlot.resolutions.resolutionsPerAuthority);
        if(assemblySlotValue && assemblySlotValue.value) {
            assembly = assemblySlotValue.value;
        }
    }

    const result = alexaUtils.createResult(getMessage(assembly), shouldEndSession);
    res.send(result);
};

module.exports = {getNextEvent};