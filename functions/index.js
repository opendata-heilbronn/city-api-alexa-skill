const functions = require('firebase-functions');
const admin = require('firebase-admin');

const carPark = require("./car-park");
const alexa = require("./alexa");

admin.initializeApp(functions.config().firebase);

exports.carPark = functions.https.onRequest((request, response) => {
    switch (request.method) {
        case "POST" : {
            carPark.postCarPark(request, response);
            break;
        }
        case "GET" : {
            carPark.getCarPark(request, response);
            break;
        }
        default : {
            response.send("Unknown method");
        }
    }
});

exports.alexa = functions.https.onRequest(alexa);
