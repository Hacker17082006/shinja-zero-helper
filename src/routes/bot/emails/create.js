import Ajv from 'ajv'
import addFormats from "ajv-formats"
import returnError from "$lib/nodejs/returnError"
import { assignCreator } from "$lib/nodejs/encBIC"
import accessAuth from '$lib/nodejs/accessAuth'
import db from './_db'

const ajv = new Ajv()
addFormats(ajv)
const botEmailValidate = ajv.compile({
    type: "object",
    properties: {
        address: { type: "string", format: "email" },
        password: { type: "string" },
        creatorEncBIC: { type: "string" },
        creator: false,
        createdAt: false
    },
    required: ["address", "password", "creatorEncBIC"]
})


export async function post({ request, url }) {

    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    try {
        const botEmailInfo = await request.json()
        if (!botEmailValidate(botEmailInfo)) return returnError.json.badRequest(botEmailValidate)

        const assignResult = assignCreator(botEmailInfo)
        if (!assignResult) return returnError.json.badEncBic()
        botEmailInfo.createdAt = new Date().toISOString()

        return { status: 200, body: await db.create({ data: botEmailInfo }) }
    } catch (e) {
        return returnError.json.internalError(e)
    }
}