export default {
    json: {
        badRequest: validate => ({
            status: 400,
            body: validate.errors.map(({ instancePath, params, message }) => ({ instancePath, params, message }))
        }),
        forbidden: () => ({
            status: 403,
            body: [{
                params: { invalid: "authToken" },
                message: "Your authToken is invaild, no access."
            }]
        }),
        badEncBic: () => ({
            status: 400,
            body: [{
                params: { invalid: "encBIC" },
                message: "Your encBIC is malformed, please check if you copied it correctly or authenticate again to recieve another one."
            }]
        }),
        internalError: e => ({
            status: 500,
            body: [{
                params: e,
                message: e.toString()
            }]
        })
    },
    text: {
        badRequest: validate => ({
            status: 400,
            body: `Your input is invalid. Detail(s):${['', ...validate.errors.map(({ keyword, message }) => `${keyword} ${message}`)].join('\n\t')}`
        }),
        forbidden: () => ({
            status: 403,
            body: "Your authToken is invaild, no access."
        }),
        badEncBic: () => ({
            status: 400,
            body: "Your encBIC is malformed, please check if you copied it correctly or authenticate again to recieve another one."
        }),
        internalError: e => ({
            status: 500,
            body: `There is error which can only be handled if the server throws to you. Details: ${e.toString()}`
        })
    }
}