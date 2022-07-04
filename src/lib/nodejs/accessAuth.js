import Ajv from "ajv"
import addFormats from "ajv-formats"
import returnError from "$lib/nodejs/returnError"
import 'dotenv/config'

const ajv = new Ajv()
addFormats(ajv)

const validate = ajv.compile({
    type: "object",
    properties: {
        authToken: { type: "string", pattern: "^[0-9A-Fa-f]+$" }
    },
    required: ["authToken"]
})
export default function ({ request, url }, returnFormat) {
    const authToken = url.searchParams.get("authToken")?.length
        ? url.searchParams.get("authToken")
        : request.headers.get("authorization")?.match(/Bearer (.+)/)?.[1]
    console.log(request.headers, authToken)
    const valid = validate({ authToken })
    if (!valid) return {
        result: false,
        error: returnError[returnFormat].badRequest(validate)
    }
    if (authToken != process.env.SECRET_PROVIDERS_TOKEN) return {
        result: false,
        error: returnError[returnFormat].forbidden()
    }
    return {
        result: true,
        error: null
    }
}


