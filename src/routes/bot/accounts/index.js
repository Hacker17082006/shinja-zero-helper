import db from "./_db"
import accessAuth from '$lib/nodejs/accessAuth'

export async function get({ request, url }) {
    const siteName = url.searchParams.get("site")
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    return {
        status: 200,
        body: await db.findMany(
            { where: siteName && siteName.length ? { site: { name: { equals: siteName } } } : undefined }
        )
    }
}