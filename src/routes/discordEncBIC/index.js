import { randomUUID } from "crypto"
import { serialize } from "cookie" 
import 'dotenv/config'

export async function get() {
    const state = randomUUID()
    return {
        status: 302,
        headers: {
            location: `${process.env.DISCORD_AUTH_URL}&state=${state}`,
            'Set-Cookie': serialize('discordOauth2State', state, {
                path: '/discordEncBIC',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 5 //5 phút
            }), //Không được phép set sameSite=strict (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax)
        }
    }
}