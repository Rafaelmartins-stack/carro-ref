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
        UI.update();
    },

    render() {
        const ctx = Engine.ctx;
        ctx.clearRect(0, 0, Engine.width, Engine.height);

        Engine.renderBackground(0); // Parallax offset here

        const baseSegment = Track.findSegment(Player.z);
        const percent = Utils.percentRemaining(Player.z, Engine.segmentLength);
        const playerPercent = Utils.percentRemaining(Player.z + Engine.cameraHeight * Engine.cameraDepth, Engine.segmentLength);
        const playerY = Utils.interpolate(baseSegment.p1.world.y, baseSegment.p2.world.y, playerPercent);

        let maxY = Engine.height;
        let x = 0;
        let dx = -(baseSegment.curve * percent);

        // Render road segments from back to front (but actually front to back for painters algorithm simplified)
        // Actually, we usually render from front to back to handle occlusion, but for pseudo-3d we render segments.
        for (let n = 0; n < Engine.drawDistance; n++) {
            const segment = Track.segments[(baseSegment.index + n) % Track.segments.length];
            segment.looped = segment.index < baseSegment.index;
            segment.fog = 1 - Utils.easeIn(0, 1, n / Engine.drawDistance);

            Engine.project(segment.p1, Player.x * Engine.roadWidth - x, playerY + Engine.cameraHeight, Player.z - (segment.looped ? Track.trackLength : 0));
            Engine.project(segment.p2, Player.x * Engine.roadWidth - x - dx, playerY + Engine.cameraHeight, Player.z - (segment.looped ? Track.trackLength : 0));

            x = x + dx;
            dx = dx + segment.curve;

            if ((segment.p1.camera.z <= Engine.cameraDepth) || (segment.p2.screen.y >= maxY))
                continue;

            Engine.renderSegment(segment);

            // Render entities on this segment
            this.renderEntities(segment);

            maxY = segment.p2.screen.y;
        }

        // Render Player Car (Simplified sprite for now)
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
        const destH = destW * 0.6; // Car height
        const destX = width / 2 - (destW / 2);
        const destY = height - destH - 40;

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
