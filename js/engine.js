/**
 * Top Cars - Pseudo-3D Engine
 * Handles road projection, rendering, and basic segment logic.
 */

const Engine = {
    canvas: null,
    ctx: null,
    width: 1280,
    height: 720,

    // Rendering constants
    fieldOfView: 100,
    cameraHeight: 1000,
    cameraDepth: null,
    drawDistance: 300,
    fogDensity: 5,

    // Road constants
    segmentLength: 200,
    roadWidth: 2000,
    lanes: 3,

    // Colors
    colors: {
        sky: '#72D7EE',
        tree: '#005108',
        fog: '#003366',
        light: { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
        dark: { road: '#696969', grass: '#009A00', rumble: '#BBBBBB' },
        start: { road: 'white', grass: 'white', rumble: 'white' },
        finish: { road: 'black', grass: 'black', rumble: 'black' }
    },

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Internal resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
    },

    // Projection math
    project(p, cameraX, cameraY, cameraZ) {
        p.camera.x = (p.world.x || 0) - cameraX;
        p.camera.y = (p.world.y || 0) - cameraY;
        p.camera.z = (p.world.z || 0) - cameraZ;
        p.screen.scale = this.cameraDepth / p.camera.z;
        p.screen.x = Math.round((this.width / 2) + (p.screen.scale * p.camera.x * this.width / 2));
        p.screen.y = Math.round((this.height / 2) - (p.screen.scale * p.camera.y * this.height / 2));
        p.screen.w = Math.round((p.screen.scale * this.roadWidth * this.width / 2));
    },

    // Drawing primitives
    renderPolygon(x1, y1, w1, x2, y2, w2, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x1 - w1, y1);
        this.ctx.lineTo(x2 - w2, y2);
        this.ctx.lineTo(x2 + w2, y2);
        this.ctx.lineTo(x1 + w1, y1);
        this.ctx.closePath();
        this.ctx.fill();
    },

    renderSegment(segment) {
        const p1 = segment.p1;
        const p2 = segment.p2;

        // Render grass
        this.ctx.fillStyle = segment.color.grass;
        this.ctx.fillRect(0, p2.screen.y, this.width, p1.screen.y - p2.screen.y);

        // Render rumble
        const r1 = p1.screen.w / Math.max(6, 2 * this.lanes);
        const r2 = p2.screen.w / Math.max(6, 2 * this.lanes);
        this.renderPolygon(p1.screen.x, p1.screen.y, p1.screen.w + r1, p2.screen.x, p2.screen.y, p2.screen.w + r2, segment.color.rumble);

        // Render road
        this.renderPolygon(p1.screen.x, p1.screen.y, p1.screen.w, p2.screen.x, p2.screen.y, p2.screen.w, segment.color.road);

        // Render lanes
        if (segment.color.lane) {
            const l1 = p1.screen.w / 20;
            const l2 = p2.screen.w / 20;
            let lanew1, lanew2, lanex1, lanex2;
            lanew1 = p1.screen.w * 2 / this.lanes;
            lanew2 = p2.screen.w * 2 / this.lanes;
            lanex1 = p1.screen.x - p1.screen.w + lanew1;
            lanex2 = p2.screen.x - p2.screen.w + lanew2;
            for (let n = 1; n < this.lanes; lanex1 += lanew1, lanex2 += lanew2, n++) {
                this.renderPolygon(lanex1, p1.screen.y, l1, lanex2, p2.screen.y, l2, segment.color.lane);
            }
        }

        // Fog
        this.renderFog(p1.screen.y, p2.screen.y, segment.fog);
    },

    renderFog(y1, y2, fog) {
        if (fog < 1) {
            this.ctx.globalAlpha = (1 - fog);
            this.ctx.fillStyle = this.colors.fog;
            this.ctx.fillRect(0, y2, this.width, y1 - y2);
            this.ctx.globalAlpha = 1;
        }
    },

    renderBackground(offset) {
        // Sky Gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height / 2);
        grad.addColorStop(0, '#001a33'); // Dark night sky
        grad.addColorStop(1, '#660066'); // Purple sunset
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height / 2);

        // Stars
        this.ctx.fillStyle = "#fff";
        for (let i = 0; i < 30; i++) {
            const x = (Math.abs(Math.sin(i * 123)) * this.width);
            const y = (Math.abs(Math.cos(i * 456)) * this.height / 3);
            this.ctx.fillRect(x, y, 1.5, 1.5);
        }

        // Procedural City Skyline (Parallax)
        const cityOffset = (offset || 0);
        for (let i = -5; i < 15; i++) {
            const buildingW = 200;
            const buildingH = 150 + (Math.sin(i * 1.5) * 100);
            const x = (i * buildingW) - (cityOffset % (buildingW * 20));
            const y = this.height / 2 - buildingH;

            // Building Shadow
            this.ctx.fillStyle = '#0a0a14';
            this.ctx.fillRect(x, y, buildingW - 10, buildingH);

            // Windows
            this.ctx.fillStyle = '#ffae00';
            for (let wx = x + 20; wx < x + buildingW - 30; wx += 30) {
                for (let wy = y + 20; wy < y + buildingH - 20; wy += 40) {
                    if (Math.sin(wx * wy) > 0) this.ctx.fillRect(wx, wy, 8, 8);
                }
            }
        }
    }
};
