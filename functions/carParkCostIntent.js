const alexaUtils = require("./alexaUtils");
const moment = require("moment");
const carParks = require("./car-parks.json");

function createTextResponse(carPark, duration, startTime, response) {
    const durationHours = duration.hours();
    const durationMinutes = duration.minutes();

    let durationLabel = "";
    if (durationHours > 0) {
        durationLabel += " für " + durationHours;
        if (durationHours === 1) {
            durationLabel += " Stunde ";
        } else {
            durationLabel += " Stunden ";
        }
    }
    if (durationMinutes > 0) {
        if (durationLabel.length > 0) {
            durationLabel += " und ";
        }
        durationLabel += "" + durationMinutes;
        if (durationMinutes === 1) {
            durationLabel += " Minute ";
        } else {
            durationLabel += " Minuten ";
        }
    }
    let carParLabel = carPark.value.name;
    if (carParLabel.toLowerCase().indexOf("parkhaus") === -1) {
        carParLabel = " Parkhaus " + carParLabel;
    }

    let textResponse = "Das Parken ab " + startTime.format("HH:mm") + " Uhr im " + carParLabel + " kostet " +
        durationLabel + " " + response.cost + " Euro";

    return textResponse;
}

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

function getCarParkCost(request, res) {
    console.log("Request: ", request);
    console.log("Intent: ", JSON.stringify(request.intent));

    if (request.dialogState === "COMPLETED" || request.dialogState === "IN_PROGRESS") {
        let startTimeValue = moment();
        let durationValue = moment.duration(60, "minutes");
        const slots = request.intent.slots;
        const duration = slots.duration;
        if (duration.value) {
            durationValue = moment.duration(slots.duration.value);
        }
        const startTime = slots.startTime;
        if (startTime.value) {
            startTimeValue = moment("HH:mm", startTime.value);
        }
        console.log("StartTime: ", startTimeValue);
        console.log("Duration: ", durationValue);
        const carPark = slots.carPark;

        const carParkValue = findResolution(carPark.resolutions.resolutionsPerAuthority);
        if (carParkValue) {
            res.send(alexaUtils.createResult(createTextResponse(carParkValue,
                durationValue, startTimeValue, {cost: 2.5}), true));
        }
        else {
            res.send(alexaUtils.createResult("Dieses Parkhaus ist unbekannt", true));
        }
    } else {
        res.send(alexaUtils.createDialog());
    }
}

module.exports = {getCarParkCost};