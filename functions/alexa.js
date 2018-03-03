const admin = require("firebase-admin");
const carParkCostIntent = require("./carParkCostIntent");
const cityCouncilEventsIntent = require('./cityCouncilEventsIntent');

function createName(name) {
    if (name.toLowerCase().indexOf("parkhaus") !== -1) {
        return "\"" + name + "\"";
    } else {
        return "Parkhaus \"" + name + "\"";
    }
}

function convertSessionId(sessionId) {
    return sessionId.replace(/\./g, "-");
}

function startSession(sessionId, userId) {
    return admin.database().ref("session/" + convertSessionId(sessionId) + "/userId").set(userId);
}

function finishSession(sessionId) {
    return admin.database().ref("session/" + convertSessionId(sessionId)).remove();
}

function getSortedCarParks(snapshot) {
    const carparks = [];
    snapshot.forEach((carpark) => {
        const data = {
            "name": carpark.key,
            "free": carpark.child("free").val()
        };
        carparks.push(data);
    });
    carparks.sort((carparkA, carparkB) => {
        return carparkB.free - carparkA.free;
    });

    return carparks;
}

function getCarParks(success) {
    admin.database().ref("carpark/heilbronn/carparks").once("value", (snapshot) => {
        const carparks = getSortedCarParks(snapshot);
        const result = "Im " + createName(carparks[0].name) +
            " gibt es im Moment mit " + carparks[0].free + " die meisten freien Parkplätze";
        success(result);
    });
}

function getAllCarParks(success) {
    admin.database().ref("carpark/heilbronn/carparks").once("value", (snapshot) => {
        const carparks = getSortedCarParks(snapshot);
        let result = "<speak>In Heilbronn gibt es folgende Parkhäuser: ";

        for (let index = 0; index < carparks.length; index++) {
            if (index === carparks.length - 1) {
                result += " und ";
            } else if (index !== 0) {
                result += ", ";
            }
            result += "\"" + carparks[index].name + "\"";
        }
        result += "</speak>";

        success(result);
    });
}

function getStatusAllCarParks(success) {
    admin.database().ref("carpark/heilbronn/carparks").once("value", (snapshot) => {
        const carparks = getSortedCarParks(snapshot);
        let result = "<speak>Hier ist die Übersicht: ";

        for (let index = 0; index < carparks.length; index++) {
            if (index === carparks.length - 1) {
                result += " und ";
            } else if (index !== 0) {
                result += ", ";
            }
            if (carparks[index].free === 1) {
                result += "im " + createName(carparks[index].name) +
                    " gibt es nur noch einen freien Platz";
            } else {
                result += "im " + createName(carparks[index].name) +
                    " gibt es " + carparks[index].free + " freie Plätze";
            }
        }
        result += "</speak>";

        success(result);
    });
}

function getOneCarParks(name, success) {
    admin.database().ref("carpark/heilbronn/carparks").once("value", (snapshot) => {
        const carparks = getSortedCarParks(snapshot);

        let foundCarPark = null;
        carparks.forEach((carpark) => {
            if (carpark.name.toLowerCase().indexOf(name) !== -1) {
                foundCarPark = carpark;
            }
        });

        if (foundCarPark) {
            success("Im " + createName(foundCarPark.name) +
                " gibt es im Moment " + foundCarPark.free + " freie Parkplätze");
        } else {
            if (name) {
                success("Ich habe kein Parkhaus mit dem Namen " + name + " gefunden. Eventuell ist es im Moment nicht offen");
            } else {
                success("Ich habe den Namen vom Parkhaus nicht verstanden.");
            }
        }
    });
}

function getDataState(callback) {
    admin.database().ref("carpark/heilbronn/time").once("value", (snapshot) => {
        const lastUpdateSeconds = Number(snapshot.val());
        const now = Date.now() / 1000;
        console.log("now: ", now, " lastUpdateSeconds: ", lastUpdateSeconds);
        const diffMinutes = Number((now - lastUpdateSeconds) / 60).toFixed();
        if (diffMinutes > 60) {
            return callback("Die Daten sind leider über eine Stunde alt");
        } else {
            return callback("Die Daten sind " + diffMinutes + " Minuten alt");
        }
    });
}

function processIntents(req, res, shouldEndSession) {
    const request = req.body.request;
    if (request.type === "LaunchRequest") {
        const result = {
            "version": "1.0",
            "response": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": "Welche Informationen möchtest du haben?"
                },
                "shouldEndSession": false
            }
        };
        res.send(result);
    } else if (request.type === "IntentRequest") {
        if (request.intent.name === "CarParkCost") {
            carParkCostIntent.getCarParkCost(request, res);
        } else if (request.intent.name === "GetTownCouncilEventIntent") {
            cityCouncilEventsIntent.getNextEvent(request, res, shouldEndSession);
        } else if (request.intent.name === "GetCarParks") {
            getCarParks((message) => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": message
                        },
                        "shouldEndSession": shouldEndSession
                    }
                };
                res.send(result);
            });
        } else if (request.intent.name === "GetAllCarParks") {
            getAllCarParks((message) => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "SSML",
                            "ssml": message
                        },
                        "shouldEndSession": shouldEndSession
                    }
                };
                res.send(result);
            });
        } else if (request.intent.name === "GetStatusAllCarParks") {
            getStatusAllCarParks((message) => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "SSML",
                            "ssml": message
                        },
                        "shouldEndSession": shouldEndSession
                    }
                };
                res.send(result);
            });
        } else if (request.intent.name === "GetOneCarPark") {
            let name = null;
            console.log("slots: ", request.intent.slots);
            if (request.intent.slots && request.intent.slots.carpark) {
                name = request.intent.slots.carpark.value;
            }
            getOneCarParks(name, (message) => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": message
                        },
                        "shouldEndSession": shouldEndSession
                    }
                };
                res.send(result);
            });
        } else if (request.intent.name === "AMAZON.StopIntent") {
            finishSession(req.body.session.sessionId).then(() => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "shouldEndSession": true
                    }
                };
                res.send(result);
            });
        } else if (request.intent.name === "GetDataState") {
            getDataState((message) => {
                const result = {
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": message
                        },
                        "shouldEndSession": shouldEndSession
                    }
                };
                res.send(result);
            });
        } else {
            const result = {
                "version": "1.0",
                "response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": "Ich habe leider nicht verstanden"
                    },
                    "shouldEndSession": shouldEndSession
                }
            };
            res.send(result);
        }
    }
    else if (request.type === "SessionEndedRequest") {
        finishSession(req.body.session.sessionId).then(() => {
            const result = {
                "version": "1.0",
            };
            res.send(result);
        });
    }

}

module.exports = function (req, res) {
    console.log(req.body);
    if (req.body.session.new && req.body.request.type === "LaunchRequest") {
        startSession(req.body.session.sessionId, req.body.session.user.userId).then(() => {
            processIntents(req, res, false)
        });
    } else {
        processIntents(req, res, true);
    }
};