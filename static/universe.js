document.addEventListener("DOMContentLoaded", () => {

    const universe = document.getElementById("universe");
    if (!universe || !tracksData || tracksData.length === 0) return;

    const orbitRadii = [120, 165, 210, 255, 300];

    const maxTracks = 10;
    const tracks = tracksData.slice(0, maxTracks);

    const orbitNodes = [];

    tracks.forEach((track, index) => {
        const radius = orbitRadii[index % orbitRadii.length];

        // Each planet gets its own angle + speed
        const angle = (index / tracks.length) * Math.PI * 2;
        const speed = 0.0006 + (index % orbitRadii.length) * 0.00015;

        /* ================= ORBIT NODE ================= */
        const node = document.createElement("div");
        node.className = "orbit-node";
        node.style.position = "absolute";
        node.style.top = "50%";
        node.style.left = "50%";

        /* ================= PLANET ================= */
        const planet = document.createElement("div");
        planet.className = "planet";

        const size = 30 + (track.popularity / 100) * 28;
        planet.style.width = `${size}px`;
        planet.style.height = `${size}px`;

        if (track.album?.images?.length) {
            planet.style.backgroundImage = `url(${track.album.images[0].url})`;
            planet.style.backgroundSize = "cover";
            planet.style.backgroundPosition = "center";
        }

        /* ================= LABEL ================= */
        const label = document.createElement("div");
        label.className = "planet-label";
        label.innerHTML = `
            <div class="song-name">${track.name}</div>
            <div class="artist-name">${track.artists[0].name}</div>
        `;

        node.appendChild(planet);
        node.appendChild(label);
        universe.appendChild(node);

        orbitNodes.push({
            node,
            radius,
            angle,
            speed
        });
    });

    /* ================= ANIMATION LOOP ================= */
    function animate() {
        orbitNodes.forEach(orb => {
            orb.angle += orb.speed;

            const x = Math.cos(orb.angle) * orb.radius;
            const y = Math.sin(orb.angle) * orb.radius;

            orb.node.style.transform = `
                translate(-50%, -50%)
                translate(${x}px, ${y}px)
            `;
        });

        requestAnimationFrame(animate);
    }

    animate();
});
/* ================= BACKGROUND DETAILS ================= */

const starLayer = document.querySelector(".star-layer");
const asteroidLayer = document.querySelector(".asteroid-layer");

/* Generate stars */
const STAR_COUNT = 120;

for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "star";

    if (Math.random() > 0.7) star.classList.add("bright");
    else if (Math.random() < 0.3) star.classList.add("dim");

    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;

    const duration = 20 + Math.random() * 30;
    star.style.animation = `starFloat ${duration}s linear infinite`;

    starLayer.appendChild(star);
}

/* Generate asteroids */
const ASTEROID_COUNT = 8;

for (let i = 0; i < ASTEROID_COUNT; i++) {
    const asteroid = document.createElement("div");
    asteroid.className = "asteroid";

    asteroid.style.top = `${Math.random() * 100}%`;
    asteroid.style.left = `${Math.random() * 100}%`;

    const duration = 40 + Math.random() * 40;
    asteroid.style.animation = `asteroidDrift ${duration}s linear infinite`;

    asteroidLayer.appendChild(asteroid);
}
