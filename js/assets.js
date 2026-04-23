/**
 * Top Cars - Assets Module
 * Preloads images and sounds.
 */

const Assets = {
    images: {},
    sounds: {},

    load(sources, callback) {
        let loaded = 0;
        const total = Object.keys(sources).length;
        if (total === 0) return callback();

        for (let name in sources) {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                if (++loaded === total) callback();
            };
            img.src = sources[name];
        }
    },

    getImage(name) {
        return this.images[name];
    }
};
