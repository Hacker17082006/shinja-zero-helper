import accessAuth from "$lib/nodejs/accessAuth"

import getStatistics from "./_getStatistics"

export async function get({ params, url, request }) {
    const { site } = params
    const authResult = accessAuth({ request, url }, "json")
    if (!authResult.result) return authResult.error
    const statistics = await getStatistics(site, "Ngày INSERT_DATE_HERE")
    for (const statistic of statistics) {
        statistic.botAccounts = statistic.botAccounts.map(botAccount => ({ 
            ...botAccount, 
            creator: `${botAccount.creator.username}#${botAccount.creator.discriminator} (${botAccount.creator.id})` 
        }))
    }
    return {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${site} bot accounts (${new Date().toLocaleString()}).sj0.json"` //https://stackoverflow.com/a/13308094
        },
        body: statistics
    }
}