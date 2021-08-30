const mainConfig = require('./_config.json');
const modes = mainConfig.modes;

let meta = {};
for (let mode in modes) {
    if (modes[mode].enabled) {
        try {
            meta[mode] = require(`./_${mode}.json`);
            console.log(mode)
        }
        catch (e) {
            console.error(e)
            throw new Error(e)
        }
    }
}

export const config = {
    modes: modes,
    meta: meta,
}

console.error(config);