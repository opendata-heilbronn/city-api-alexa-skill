function convertAmazonId(amazonId) {
    return amazonId.replace(/\./g, "-");
}

function createResult(text, shouldEndSession, extra) {
    const response = {
        "version": "1.0",
        "response": {
            "outputSpeech": {
                "type": "PlainText",
                "text": text
            },
            "shouldEndSession": shouldEndSession
        }
    };
    if (extra) {
        Object.assign(response.response, extra)
    }
    return response;
}

function createDialog(dialogDirective, text) {
    dialogDirective = dialogDirective || {
        type: "Dialog.Delegate"
    };
    const result = {
        "version": "1.0",
        "response": {
            "shouldEndSession": false,
            "directives": [
                dialogDirective
            ]
        }
    };

    if (text) {
        result.response.outputSpeech = {"type": "PlainText", "text": text};
    }

    return result;
}

function createSsmlResult(text, shouldEndSession, extra) {
    const response = {
        "version": "1.0",
        "response": {
            "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>" + text + "</speak>"
            },
            "shouldEndSession": shouldEndSession
        }
    };
    if (extra) {
        Object.assign(response.response, extra)
    }
    return response;
}

function createEmptyResult() {
    return {
        "version": "1.0",
        "response": {
            "shouldEndSession": true
        }
    };
}


module.exports = {createResult, createSsmlResult, createEmptyResult, convertAmazonId, createDialog};