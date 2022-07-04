import accessAuth from '$lib/nodejs/accessAuth'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function get({ request, url }) {
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    return {
        status: 200,
        body: await prisma.site.findMany()
    }
}