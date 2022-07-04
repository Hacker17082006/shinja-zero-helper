import dayjs from 'dayjs'
//https://github.com/iamkun/dayjs/issues/593#issuecomment-881378461
import utc from "dayjs/plugin/utc.js"
import tz from "dayjs/plugin/timezone.js"
dayjs.extend(utc)
dayjs.extend(tz)
import accountDb from "../accounts/_db"

const getLabel = (labelTemplate, dayObj) => labelTemplate.replace("INSERT_DATE_HERE", dayObj.format("DD-MM-YYYY"))

export default async function (site, labelTemplate, utcOffset = 7) {
    const botAccounts = await accountDb.findMany(
        {
            where: { site: { name: { equals: site } } },
            select: {
                username: true, password: true, birthday: true, createdAt: true, creator: true,
                site: { select: { name: true } }, email: { select: { address: true } }
            },
            orderBy: { createdAt: "desc" }
        }
    )

    let labeledAccountObj = {}
    for (const botAccount of botAccounts) {
        const label = getLabel(labelTemplate, dayjs(botAccount.createdAt).utcOffset(utcOffset))
        if (!Array.isArray(labeledAccountObj[label])) labeledAccountObj[label] = []

        botAccount.createdAt = dayjs(botAccount.createdAt).utcOffset(utcOffset).format("HH:mm:ss")
        botAccount.email = botAccount.email.address
        botAccount.site = botAccount.site.name

        labeledAccountObj[label].push(botAccount)
    }

    let re = []
    for (const label of Object.keys(labeledAccountObj)) {
        re.push({
            label,
            botAccounts: labeledAccountObj[label]
        })
    }
    return re
}