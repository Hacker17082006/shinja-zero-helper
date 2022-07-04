import axios from "axios"
import { Database } from "$lib/nodejs/replit-db-esm"
const db = new Database()
import fs from "fs"
const countryCodes = JSON.parse(process.env.TROYWELL_COUNTRY_CODES)
const endpoint = process.env.TROYWELL_PROXIES_ENDPOINT


class UniqueNameSet extends Set {
    constructor(values, name) {
        super(values);

        const names = [];
        for (let value of this) {
            if (names.includes(value[name])) {
                this.delete(value);
            } else {
                names.push(value[name]);
            }
        }
    }
    toArray() {
        return Array.from(this)   
    }
}
//Đang gặp vấn đề trùng ip thì tìm ra cách này: https://stackoverflow.com/a/49821454
//Nó xứng đáng được vote cao hơn

async function iterCountryCodes(countryCodes) {
    let proxies = []
    const promises = []
    for (const countryCode of countryCodes) {
        const promise = (async () => {
            const { data } = await axios.post(
                endpoint.replace("%country%", countryCode),
                { extId: "ShinjaZeroHelper" },
                { 
                    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36" } 
                }
            )
            if (data.ok) proxies.push(
                ...data.result.ips.map(el => Object.assign(el, { 
                    country: countryCode, 
                    userPass: data.result.token.split('').map(el => String.fromCharCode(el.charCodeAt(0) + 1)).join('')
                }))
            )
        })()
        promises.push(promise)
    }
    await Promise.all(promises)
    return proxies
}
async function main() {
    fs.writeFileSync("troywell.json", JSON.stringify(await db.get("TROYWELL-IPs")), null, 4)
    while (true) {
        let proxies = await db.get("TROYWELL-IPs") || []
        proxies.push(...await iterCountryCodes(countryCodes))
        console.count("Cào Troywell xong lần thứ")
        await db.set("TROYWELL-IPs", new UniqueNameSet(proxies, "ip").toArray()) //Chuyển thành Set để loại các phần tử trùng, rồi lại chuyển về mảng
        await new Promise(re => setTimeout(re, 2500)) //Delay đợi server update
    }
}
main()