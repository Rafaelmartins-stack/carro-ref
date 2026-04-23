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
                this.images[name] = this.processImage(img);
                if (++loaded === total) callback();
            };
            img.src = sources[name];
        }
    },

    processImage(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Remove white background (pure white or very close)
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                data[i + 3] = 0; // Set alpha to 0
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    },

    getImage(name) {
        return this.images[name];
    }
};
