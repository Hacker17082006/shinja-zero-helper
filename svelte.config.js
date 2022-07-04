import adapter from '@sveltejs/adapter-node'
import dotenv from 'dotenv'
dotenv.config()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ precompress: true }),
		vite: {
			ssr: {
				noExternal: ['@popperjs/core'] //https://github.com/sveltejs/kit/issues/4504#issuecomment-1135338008
			}
		}
	}
};

export default config;
