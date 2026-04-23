/**
 * Top Cars - Main Entry Point
 * Orchestrates the game loop and state management.
 */

const Game = {
    isRunning: false,
    lastTime: 0,
    fps: 60,
    step: 1 / 60,

    init() {
        console.log("Initializing Top Cars...");
        Engine.init('gameCanvas');
        Track.reset();
        Player.init();
        UI.init();

        Assets.load({
            'car': 'assets/car.png'
        }, () => {
            console.log("Assets Loaded");
        });

        document.getElementById('start-btn').addEventListener('click', () => this.start());
    },

    start() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.isRunning = true;
        this.lastTime = performance.now();

        // Settings check
        Player.isManual = document.querySelector('input[name="gear"]:checked').value === 'manual';

        requestAnimationFrame(t => this.loop(t));
    },

    loop(now) {
        if (!this.isRunning) return;

        const dt = Math.min(1, (now - this.lastTime) / 1000);
        this.lastTime = now;

        this.update(dt);
        this.render();

        requestAnimationFrame(t => this.loop(t));
    },

    update(dt) {
        Player.update(dt);
        AI.update(dt);
        this.checkCollisions();
        UI.update();
    },

    checkCollisions() {
        // Check 400 units ahead (visual position of the car in pseudo-3D)
        const collisionZ = Player.z + 400;
        const seg = Track.findSegment(collisionZ);

        if (seg.cars.length > 0) {
            seg.cars.forEach(car => {
                // Check if car is actually at the same Z-range and same X-lane
                const carZ = car.z;
                // AI cars z can be a bit off due to segment size, but checking segment assignments is safer
                if (Math.abs(Player.x - car.x) < 0.5) {
                    // HIT!
                    Player.speed = 0;
                    Player.z -= 200; // Bounce back
                }
            });
        }
    },

    render() {
        const ctx = Engine.ctx;
        ctx.clearRect(0, 0, Engine.width, Engine.height);

        Engine.renderBackground(Player.z / 10);

        const baseSegment = Track.findSegment(Player.z);
        const percent = Utils.percentRemaining(Player.z, Engine.segmentLength);
        const playerPercent = Utils.percentRemaining(Player.z + Engine.cameraHeight * Engine.cameraDepth, Engine.segmentLength);
        const playerY = Utils.interpolate(baseSegment.p1.world.y, baseSegment.p2.world.y, playerPercent);

        let x = 0;
        let dx = -(baseSegment.curve * percent);

        // --- PHASE 1: Project all segments ---
        for (let n = 0; n < Engine.drawDistance; n++) {
            const segment = Track.segments[(baseSegment.index + n) % Track.segments.length];
            segment.looped = segment.index < baseSegment.index;
            segment.fog = 1 - Utils.easeIn(0, 1, n / Engine.drawDistance);

            Engine.project(segment.p1, Player.x * Engine.roadWidth - x, playerY + Engine.cameraHeight, Player.z - (segment.looped ? Track.trackLength : 0));
            Engine.project(segment.p2, Player.x * Engine.roadWidth - x - dx, playerY + Engine.cameraHeight, Player.z - (segment.looped ? Track.trackLength : 0));

            x = x + dx;
            dx = dx + segment.curve;
        }

        // --- PHASE 2: Render from BACK to FRONT ---
        for (let n = Engine.drawDistance - 1; n >= 0; n--) {
            const segment = Track.segments[(baseSegment.index + n) % Track.segments.length];

            // Only render if within Z vision
            if (segment.p1.camera.z <= Engine.cameraDepth) continue;

            Engine.renderSegment(segment);
            this.renderEntities(segment);
        }

        this.renderPlayer();
    },

    renderEntities(segment) {
        const carImg = Assets.getImage('car');
        if (!carImg) return;

        const sheetW = carImg.width / 3;

        segment.cars.forEach(car => {
            const scale = segment.p1.screen.scale;
            const destW = (scale * 2000 * (Engine.width / 2)) * 0.3;
            const destH = destW * 0.6;
            const destX = segment.p1.screen.x + (scale * car.x * Engine.roadWidth * Engine.width / 2) - (destW / 2);
            const destY = segment.p1.screen.y - destH;

            // Use straight sprite for AI
            Engine.ctx.drawImage(
                carImg,
                0, 0, sheetW, carImg.height,
                destX, destY, destW, destH
            );
        });
    },

    renderPlayer() {
        const ctx = Engine.ctx;
        const width = Engine.width;
        const height = Engine.height;

        const scale = Engine.cameraDepth / Engine.cameraHeight;
        const destW = (scale * 2000 * (width / 2)) * 0.3; // Car width
        const destH = destW * 1.4; // Corrected height to avoid squashing
        const destX = width / 2 - (destW / 2);
        const destY = height - destH - 10;

        const carImg = Assets.getImage('car');
        if (carImg) {
            // Sheet coordinates (1x3 sheet)
            const sheetW = carImg.width / 3;
            let offset = 0; // Straight
            if (Player.rotation < -0.05) offset = 1; // Left
            if (Player.rotation > 0.05) offset = 2; // Right

            ctx.drawImage(
                carImg,
                offset * sheetW, 0, sheetW, carImg.height, // Source
                destX, destY, destW, destH // Destination
            );
        } else {
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(destX, destY, destW, destH);
        }
    }
};

window.onload = () => Game.init();
