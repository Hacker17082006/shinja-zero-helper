//Port https://www.npmjs.com/package/@replit/database từ CJS sang ESM, chạy được trên vite và của Fannovel16
//Ngoài ra cũng thay node-fetch thành axios
//Sốt: https://github.com/replit/database-node/blob/master/index.js

import axios from "axios"
import process from "process"
import 'dotenv/config'

export class Database {
    /**
     * Initiates Class.
     * @param {String} key Custom database URL
     */
    constructor(key) {
        if (key) this.key = key;
        else this.key = process.env.REPLIT_DB_URL;
    }

    // Native Functions
    /**
     * Gets a key
     * @param {String} key Key
     * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
     */
    async get(key, options) {
        //Axios cứ trả về JSON và t giải quyết nó
        const { data } = await axios(this.key + "/" + key)
        if (data === null || data === undefined) return null;
        return data
    }

    /**
     * Sets a key
     * @param {String} key Key
     * @param {any} value Value
     */
    async set(key, value) {
        const strValue = JSON.stringify(value)

        await axios.post(
            this.key,
            encodeURIComponent(key) + "=" + encodeURIComponent(strValue),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        return this;
    }

    /**
     * Deletes a key
     * @param {String} key Key
     */
    async delete(key) {
        await axios.delete(this.key + "/" + key)
        return this;
    }

    /**
     * List key starting with a prefix or list all.
     * @param {String} prefix Filter keys starting with prefix.
     */
    async list(prefix = "") {
        const { data: t } = await axios.get(
            this.key + `?encode=true&prefix=${encodeURIComponent(prefix)}`,
            { responseType: "text" }
        )
        if (t.length === 0) return []
        return t.split("\n").map(decodeURIComponent)
    }

    // Dynamic Functions
    /**
     * Clears the database.
     */
    async empty() {
        const promises = [];
        for (const key of await this.list()) {
            promises.push(this.delete(key));
        }

        await Promise.all(promises);

        return this;
    }

    /**
     * Get all key/value pairs and return as an object
     */
    async getAll() {
        let output = {};
        for (const key of await this.list()) {
            let value = await this.get(key);
            output[key] = value;
        }
        return output;
    }

    /**
     * Sets the entire database through an object.
     * @param {Object} obj The object.
     */
    async setAll(obj) {
        for (const key in obj) {
            let val = obj[key];
            await this.set(key, val);
        }
        return this;
    }

    /**
     * Delete multiple entries by keys
     * @param {Array<string>} args Keys
     */
    async deleteMultiple(...args) {
        const promises = [];

        for (const arg of args) {
            promises.push(this.delete(arg));
        }

        await Promise.all(promises);

        return this;
    }
}