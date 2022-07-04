//Sveltekit có tính năng "shadow page", aka "page endpoint"
//Cho phép truyền props từ endpoint tới page có cùng tên, thông qua fetch(), method POST
//https://kit.svelte.dev/docs/routing#endpoints-page-endpoints
import 'dotenv/config'
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { parse, serialize } from "cookie"
import axios from "axios"
import { createEncBic } from "$lib/nodejs/encBIC"

const ajv = new Ajv()
addFormats(ajv)
const oauth2AuthValidate = ajv.compile({
    type: "object",
    properties: {
        code: { type: "string" },
        state: { type: "string", format: "uuid" }
    },
    required: ["code", "state"]
})
const discord = axios.create({ baseURL: "https://discord.com/api/v10" })
export async function get({ request, url }) {
    const searchObj = Object.fromEntries(url.searchParams)
    if (!oauth2AuthValidate(searchObj)) return {
        body: {
            encBIC: null,
            errorStr: "Tham số của url không hợp lệ, vui lòng vào đúng link."
        }
    }

    const state = parse(request.headers.get("cookie") || '').discordOauth2State
    if (state !== searchObj.state) return {
        body: {
            encBIC: null,
            errorStr: "Client và user không có tham số state (giao thức OAuth2) trùng khớp với nhau. Có thể tín đồ bị dính Cross-site request forgery, clickjacking, hoặc phiên hiện tại đã hết hạn (quá 5 phút hoặc đã nhận code rồi F5). Vui lòng thử lại."
        }
    }

    let tokenData
    try {
        ({ data: tokenData } = await discord.post("oauth2/token", new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: searchObj.code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI
        })))
    } catch (e) {
        return {
            body: { encBIC: null, errorStr: "Authorization code không hợp lệ" }
        }
    }

    if (!tokenData.scope.split(' ').includes("identify")) return {
        body: {
            encBIC: null,
            errorStr: "Authorization code không có scope identify. Có vẻ tín đồ đã truy cập nhầm link, vui lòng thử lại."
        }
    }

    const encBIC = createEncBic(
        (await discord.get("users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        })).data
    )

    await discord.post("oauth2/token/revoke", new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        token_type_hint: "access_token",
        token: tokenData.access_token
    }))
    await discord.post("oauth2/token/revoke", new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        token_type_hint: "refresh_token",
        token: tokenData.refresh_token
    }))
    return {
        body: { encBIC, errorStr: '' },
        headers: {
            'Set-Cookie': serialize('discordOauth2State', state, { path: '/discordEncBIC', maxAge: 0 })
            //Xoá cookie
        }
    }
}