//EncBIC: Encrypted Bieliver Information (Integrated) Code
import 'dotenv/config'
import Ajv from "ajv"
import crypto from "crypto"
const ivAlgo = "aes-256-cbc"
const ivBitLength = 16 //https://stackoverflow.com/a/31147653

const ajv = new Ajv()
//Aka một phần Discord User schema (scope=identify)
export const discordBiValidate = ajv.compile({
    type: "object",
    properties: {
        id: { type: "string", maxLength: 20 },
        //Snowflake là uint64 nên sẽ có tối đa 20 chữ số https://discord.com/developers/docs/reference#snowflakes 
        username: { type: "string" },
        discriminator: { type: "string", minLength: 4, maxLength: 4 }
    },
    required: ["id", "username", "discriminator"],
    additionalProperties: true
})

export function createEncBic(biObj, hexKey = process.env.ENCBIC_KEY) {
    const iv = crypto.randomBytes(ivBitLength)
    const plaintext = JSON.stringify(biObj)
    const cipher = crypto.createCipheriv(ivAlgo, Buffer.from(hexKey, "hex"), iv)
    let encBic = iv.toString("base64") + '|'
    encBic += cipher.update(plaintext, "utf8", "base64") + cipher.final("base64")
    return encBic
}

export function decryptEncBic(encBic, hexKey = process.env.ENCBIC_KEY) {
    const [b64Iv, b64Ciphertext] = encBic.split('|')
    try {
        let iv = Buffer.from(b64Iv, "base64")
        const decipher = crypto.createDecipheriv(ivAlgo, Buffer.from(hexKey, "hex"), iv)
        const plaintext = decipher.update(b64Ciphertext, "base64", "utf8") + decipher.final("utf8")
        return JSON.parse(plaintext)
    } catch (e) {
        return null
    }
}

//Khi truyền một Object làm tham số thì bản chất là truyền tham chiếu 
export function assignCreator(info, hexKey = process.env.ENCBIC_KEY) {
    const creatorInfo = decryptEncBic(info.creatorEncBIC, hexKey)
    if (!creatorInfo) return null
    info.creator = creatorInfo
    delete info.creatorEncBIC
    return info
}

