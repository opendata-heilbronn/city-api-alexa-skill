const admin = require("firebase-admin");

function postCarPark(req, res) {
    admin.database().ref("carpark/heilbronn").set(req.body);
    res.status(200).end();
}

function getCarPark(req, res) {

}

module.exports = {postCarPark, getCarPark};