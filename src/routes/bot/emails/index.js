import accessAuth from '$lib/nodejs/accessAuth'
import db from './_db'

export default async function main(select) {
    return await db.findMany({
        include: { botAccounts: { select: { id: true } } }
    })
}
export async function get({ request, url }) {
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    return {
        status: 200,
        body: await main()
    }
}