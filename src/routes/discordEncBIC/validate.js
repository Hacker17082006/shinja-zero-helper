import { decryptEncBic } from "$lib/nodejs/encBIC";
import returnError from "$lib/nodejs/returnError"
import Ajv from "ajv"
const requestValidate = new Ajv().compile({
    type: "object",
    properties: {
        encBIC: { type: "string" }
    },
    required: ["encBIC"]
})
export async function post({ request }) {
    try {
        const requestBody = await request.json()
        if (!requestValidate(requestBody)) return returnError.json.badRequest(requestValidate)
        const bieliverInfo = decryptEncBic(requestBody.encBIC)
        if (!bieliverInfo) return { status: 200, body: { valid: false, bieliverInfo } }
        return { status: 200, body: { valid: true, bieliverInfo } }
    } catch (e) {
        console.log(e)
        return returnError.json.internalError(e)
    }
}