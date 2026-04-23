/**
 * Top Cars - Player Module
 * Handles car physics, input, and player-specific stats (nitro, fuel).
 */

const Player = {
    x: 0,           // position on road (-1 to 1)
    z: 0,           // distance along track
    speed: 0,       // current speed
    maxSpeed: 12000,
    accel: 80,
    breaking: -150,
    decel: -40,
    offRoadDecel: -100,
    offRoadLimit: 3000,

    // Gears
    gear: 1,
    maxGears: 5,
    isManual: false,
    rpm: 0,

    // Resources
    nitro: 3,
    nitroActive: false,
    nitroDuration: 0,
    fuel: 100,

    // Stats for rendering
    playerX: 0,
    rotation: 0,

    init() {
        this.reset();
        this.bindKeys();
    },

    reset() {
        this.x = 0;
        this.z = 0;
        this.speed = 0;
        this.nitro = 3;
        this.fuel = 100;
        this.gear = 1;
    },

    bindKeys() {
        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    },

    update(dt) {
        // Max speed depends on gear
        const gearMaxSpeed = this.gear * 3000;
        const currentMaxSpeed = this.nitroActive ? this.maxSpeed + 3000 : gearMaxSpeed;

        // Accelerate / Brake
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            // Acceleration is better in lower gears
            const gearAccel = this.accel * (1.2 - (this.gear / 10));
            this.speed += gearAccel;
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.speed += this.breaking;
        } else {
            this.speed += this.decel;
        }

        // Apply Nitro boost directly
        if (this.nitroActive) {
            this.speed += 200;
        }

        // Limit speed to gear max (unless nitro is active)
        if (this.speed > currentMaxSpeed) {
            this.speed = currentMaxSpeed;
        }

        // Natural decel if speed > gear limit (and no nitro)
        if (!this.nitroActive && this.speed > gearMaxSpeed) {
            this.speed += this.decel * 2;
        }

        // Off-road penalty
        if ((this.x < -1 || this.x > 1) && this.speed > this.offRoadLimit) {
            this.speed += this.offRoadDecel;
        }

        // Steering
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.x -= 0.02 * (this.speed / this.maxSpeed);
            this.rotation = -0.1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.x += 0.02 * (this.speed / this.maxSpeed);
            this.rotation = 0.1;
        } else {
            this.rotation = 0;
        }

        // Nitro
        if (this.keys['Space'] && this.nitro > 0 && !this.nitroActive) {
            this.nitro--;
            this.nitroActive = true;
            this.nitroDuration = 2; // 2 seconds
        }

        if (this.nitroActive) {
            this.speed += 200;
            this.nitroDuration -= dt;
            if (this.nitroDuration <= 0) this.nitroActive = false;
        }

        // Gears
        if (this.isManual) {
            // Manual Gear Switching (Shift up, Ctrl down)
            if (this.keys['ShiftLeft'] && !this.gearShiftPressed) {
                if (this.gear < this.maxGears) this.gear++;
                this.gearShiftPressed = true;
            } else if (this.keys['ControlLeft'] && !this.gearShiftPressed) {
                if (this.gear > 1) this.gear--;
                this.gearShiftPressed = true;
            }

            if (!this.keys['ShiftLeft'] && !this.keys['ControlLeft']) {
                this.gearShiftPressed = false;
            }
        } else {
            // Simple Auto-gear logic
            this.gear = Math.floor(this.speed / 3000) + 1;
            this.gear = Utils.limit(this.gear, 1, this.maxGears);
        }

        // RPM calculation for HUD
        this.rpm = (this.speed % 3000) / 3000;

        // Fuel consumption
        if (this.speed > 0) {
            this.fuel -= 0.01 * (this.speed / this.maxSpeed);
        }

        this.speed = Utils.limit(this.speed, 0, this.maxSpeed);
        this.z += this.speed * dt;

        // Loop track
        if (this.z >= Track.trackLength) this.z -= Track.trackLength;
    }
};
