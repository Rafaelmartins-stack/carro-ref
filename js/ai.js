/**
 * Top Cars - AI Module
 * Handles opponent racers logic and positioning.
 */

const AI = {
    opponents: [],

    init(count) {
        this.opponents = [];
        for (let i = 0; i < count; i++) {
            this.opponents.push({
                index: i,
                x: (Math.random() * 2) - 1,
                z: 500 + (i * 1200),
                speed: 8000 + (Math.random() * 2000),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    },

    update(dt) {
        // Clear previous segment assignments
        Track.segments.forEach(s => s.cars = []);

        this.opponents.forEach(car => {
            car.z += car.speed * dt;
            if (car.z >= Track.trackLength) car.z -= Track.trackLength;

            // Assign to segment
            const segment = Track.findSegment(car.z);
            segment.cars.push(car);

            // Simple lane keeping
            car.x += (Math.random() - 0.5) * 0.01;
            car.x = Utils.limit(car.x, -0.8, 0.8);
        });
    }
};

AI.init(19);
