import { Database } from "$lib/nodejs/replit-db-esm"
import crypto from "crypto"
import accessAuth from '$lib/nodejs/accessAuth'

const db = new Database()

export async function get({ request, url }) {
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error

    const troywellIps = await db.get("TROYWELL-IPs")
    const usage = url.searchParams.get("usage") || "normal"
    let randomI = crypto.randomInt(troywellIps.length)

    if (typeof troywellIps[randomI].usedFor != "array") troywellIps[randomI].usedFor = []
    while (troywellIps[randomI].usedFor.indexOf(usage) > -1) randomI = crypto.randomInt(troywellIps.length)

    troywellIps[randomI].usedFor.push(usage)
    await db.set("TROYWELL-IPs", troywellIps)

    return {
        status: 200,
        body: troywellIps[randomI]
    }
}