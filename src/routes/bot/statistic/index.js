import returnError from "$lib/nodejs/returnError"
import accessAuth from '$lib/nodejs/accessAuth'
import siteDb from "../sites/_db"

export async function get({ url, request }) {
    try {
        const authResult = accessAuth({ url, request }, "text")
        if (!authResult.result) return {
            body: { errorStr: authResult.error.body }
        }
        return {
            body: {
                authToken: url.searchParams.get("authToken"),
                sites: (await siteDb.findMany({ select: { name: true } })).map(el => el.name),
                errorStr: ''
            }
        }
    } catch (e) {
        const normalReturnErr = returnError.text.internalError(e)
        return {
            body: { errorStr: normalReturnErr.body }
        }
    }
}