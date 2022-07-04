import Ajv from "ajv"
import addFormats from "ajv-formats"
import returnError from "$lib/nodejs/returnError"
import accessAuth from '$lib/nodejs/accessAuth'
import { assignCreator } from "$lib/nodejs/encBIC"
import db from "./_db"

const ajv = new Ajv()
addFormats(ajv)

const botAccountValidate = ajv.compile({
    type: "object",
    properties: {
        site: { type: "string", minLength: 2, maxLength: 20 },
        name: { type: "string", minLength: 5 },
        username: { type: "string", minLength: 5 },
        email: { type: "object" },
        password: { type: "string", minLength: 6 },
        birthday: { type: "string", minLength: 5 },
        createdAt: false,
        creatorEncBIC: { type: "string", minLength: 250 },
        creator: false
    },
    required: ["site", "username", "email", "password", "birthday", "creatorEncBIC"]
})

export async function post({ url, request }) {
    const siteName = url.searchParams.get("site")
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    try {
        const botAccountInfo = await request.json()
        botAccountInfo.site = siteName
        if (!botAccountValidate(botAccountInfo)) return returnError.json.badRequest(botAccountValidate)
        const assignResult = assignCreator(botAccountInfo)
        if (!assignResult) return returnError.json.badEncBic()

        const createdAt = new Date()
        return {
            body: await db.create({
                data: Object.assign(botAccountInfo, {
                    name: botAccountInfo.name || botAccountInfo.username,
                    email: { connect: botAccountInfo.email },
                    site: { connectOrCreate: { where: { name: siteName }, create: { name: siteName } } },
                    createdAt,
                    usageDates: [createdAt]
                }),
            })
        }
    } catch (e) {
        return returnError.json.internalError(e)
    }
}