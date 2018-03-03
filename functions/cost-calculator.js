const moment = require("moment");

function calcWeekDayCost(tarif, weekDayTarif, request) {
    const parkStart = moment(request.fromTime);
    const parkEnd = moment(request.fromTime).add(request.duration, "minutes");
    
    const context = {
        cost: 0,
        parkDuration: 0
    };

    while (parkStart.isBefore(parkEnd)) {
        //console.log("parkStart: ", parkStart);
        //console.log("parkEnd: ", parkEnd);

        const hourOfDay = parkStart.hour();
        const feeForGivenHour = weekDayTarif.find((element) => {
            return hourOfDay >= element.from && hourOfDay < element.to;
        });

        const fee = feeForGivenHour.fees.find((element) => {
            return context.parkDuration >= element.parkTime.from && context.parkDuration < element.parkTime.to;
        });

        context.cost += fee.fee;
        context.parkDuration += fee.unit;

        parkStart.add(fee.unit, "minutes");
    }
    
    return {cost: context.cost, endTime: parkStart};
}


function calcCost(tarif, request) {
    const fromTime = moment(request.fromTime);
    const dow = fromTime.format("ddd");

    const data = tarif.costs.find(function(element) { 
        return  element.dayOfWeek.indexOf(dow) != -1
    });

    return calcWeekDayCost(tarif, data.cost, request);
}

module.exports = {calcCost};