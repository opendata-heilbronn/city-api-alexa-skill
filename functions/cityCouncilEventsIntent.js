const alexaUtils = require("./alexaUtils");
const moment = require("moment");
const events = require("./city-council-events.json");
moment.locale('de');

const getNextEventForAssembly = (assembly) => {
    if (!events[assembly]) {
        return {
            state: 'NOT_AVAILABLE'
        };
    }
    const now = moment.now();
    const assemblyEvents = events[assembly].sort((a, b) => a - b);
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
    if (!assembly) assembly = "Gemeinderat";
    const nextEvent = getNextEventForAssembly(assembly);

    switch (nextEvent.state) {
        case 'NOT_AVAILABLE':
            return "Diesen Ausschuss gibt es nicht";
        case 'NO_NEXT_EVENT':
            return "Es wurde noch kein kommender Termin bekanntgegeben";
        case 'FOUND':
            return "Das nächste Treffen findet am " + nextEvent.formattedDate + ' statt';
    }
};

const getNextEvent = (request, res, shouldEndSession) => {
    console.log("Request: ", request);
    console.log("Intent: ", JSON.stringify(request.intent));

    const result = alexaUtils.createResult(getMessage(), shouldEndSession);
    res.send(result);
};

module.exports = {getNextEvent};