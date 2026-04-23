/**
 * Top Cars - UI Module
 * Updates HUD elements like speedometer, RPM, and fuel.
 */

const UI = {
    elements: {},

    init() {
        this.elements.speed = document.getElementById('speed-val');
        this.elements.gear = document.getElementById('gear-val');
        this.elements.fuel = document.getElementById('fuel-level');
        this.elements.rpm = document.getElementById('rpm-level');
        this.elements.pos = document.getElementById('pos');
        this.elements.lap = document.getElementById('lap');
        this.elements.nitros = [
            document.getElementById('nitro-1'),
            document.getElementById('nitro-2'),
            document.getElementById('nitro-3')
        ];
    },

    update() {
        // Speed (converting arbitrary units to KM/H)
        const kmh = Math.floor(Player.speed / 40);
        this.elements.speed.innerText = kmh;

        // Gear
        this.elements.gear.innerText = Player.gear;

        // Fuel
        this.elements.fuel.style.width = `${Player.fuel}%`;
        if (Player.fuel < 20) {
            this.elements.fuel.style.background = '#ff0000';
        }

        // RPM dial (visual representation)
        const rpmPercent = Player.rpm * 100;
        this.elements.rpm.style.height = `${rpmPercent}%`;
        this.elements.rpm.style.background = rpmPercent > 80 ? 'var(--primary)' : 'var(--secondary)';

        // Nitros
        for (let i = 0; i < 3; i++) {
            if (i >= Player.nitro) {
                this.elements.nitros[i].classList.add('used');
            } else {
                this.elements.nitros[i].classList.remove('used');
            }
        }
    }
};
