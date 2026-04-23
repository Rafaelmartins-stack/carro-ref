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

        // Background removal (Chroma Key)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Remove Magenta (#FF00FF)
            if (r > 200 && g < 100 && b > 200) {
                data[i + 3] = 0;
            }
            // Remove White/Light Gray (aggressive)
            else if (r > 200 && g > 200 && b > 200) {
                data[i + 3] = 0;
            }
            // Remove Checkerboard Gray (common in AI transparency)
            else if (Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && r > 180) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    },

    getImage(name) {
        return this.images[name];
    }
};
