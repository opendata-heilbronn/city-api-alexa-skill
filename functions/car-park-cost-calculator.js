const tarifs = require("./cost-data.json");
const costCalculator = require("./cost-calculator");

function getCarParkCost(carParkId, startTime = Date.now(), duration = 60) {
    const tarif = tarifs[carParkId];
    if (tarif) {
        return costCalculator.calcCost(tarif, {fromTime: startTime, duration: duration})
    } else {
        return null;
    }
}

module.exports = {getCarParkCost};