/**
 * Top Cars - Track Module
 * Defines track segments, curves, and elevation.
 */

const Track = {
    segments: [],
    trackLength: 0,

    reset() {
        this.segments = [];
        this.createTrack();
        this.trackLength = this.segments.length * Engine.segmentLength;
    },

    addSegment(curve, y) {
        const n = this.segments.length;
        this.segments.push({
            index: n,
            p1: { world: { y: this.lastY(), z: n * Engine.segmentLength }, camera: {}, screen: {} },
            p2: { world: { y: y, z: (n + 1) * Engine.segmentLength }, camera: {}, screen: {} },
            curve: curve,
            sprites: [],
            cars: [],
            color: Math.floor(n / 3) % 2 ? Engine.colors.dark : Engine.colors.light
        });
    },

    lastY() {
        return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y;
    },

    addRoad(enter, hold, leave, curve, y) {
        const startY = this.lastY();
        const endY = startY + (y * Engine.segmentLength);
        const total = enter + hold + leave;

        for (let n = 0; n < enter; n++)
            this.addSegment(Utils.easeIn(0, curve, n / enter), Utils.easeInOut(startY, endY, n / total));
        for (let n = 0; n < hold; n++)
            this.addSegment(curve, Utils.easeInOut(startY, endY, (enter + n) / total));
        for (let n = 0; n < leave; n++)
            this.addSegment(Utils.easeInOut(curve, 0, n / leave), Utils.easeInOut(startY, endY, (enter + hold + n) / total));
    },

    createTrack() {
        // Simple procedural track for now
        this.addRoad(50, 50, 50, 0, 0); // Start stretch
        this.addRoad(100, 100, 100, 3, 20); // Curve Right & Hill
        this.addRoad(50, 50, 50, 0, -20); // Downhill
        this.addRoad(100, 100, 100, -3, 0); // Curve Left
        this.addRoad(50, 50, 50, 0, 0); // Stretch

        // Finalize colors for start/finish
        for (let n = 0; n < 3; n++) {
            this.segments[n].color = Engine.colors.start;
            this.segments[this.segments.length - 1 - n].color = Engine.colors.finish;
        }
    },

    findSegment(z) {
        return this.segments[Math.floor(z / Engine.segmentLength) % this.segments.length];
    }
};

const Utils = {
    easeIn: (a, b, percent) => a + (b - a) * Math.pow(percent, 2),
    easeOut: (a, b, percent) => a + (b - a) * (1 - Math.pow(1 - percent, 2)),
    easeInOut: (a, b, percent) => a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5),

    limit: (value, min, max) => Math.max(min, Math.min(value, max)),
    percentRemaining: (n, total) => (n % total) / total,
    interpolate: (a, b, percent) => a + (b - a) * percent
};
