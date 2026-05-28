class StarField {
    constructor() {
        this.container = document.getElementById('stars-container');
        this.stars = [];
        this.init();
    }

    init() {
        this.createParallaxLayers();
        this.createShootingStars();
        this.createSpaceObjects();
        this.startAnimations();
    }

    createParallaxLayers() {
        // Create 3 layers for realistic deep-space parallax drift
        this.layer1 = document.createElement('div');
        this.layer1.className = 'stars-layer stars-layer-1';
        
        this.layer2 = document.createElement('div');
        this.layer2.className = 'stars-layer stars-layer-2';
        
        this.layer3 = document.createElement('div');
        this.layer3.className = 'stars-layer stars-layer-3';

        this.container.appendChild(this.layer1);
        this.container.appendChild(this.layer2);
        this.container.appendChild(this.layer3);

        const totalStars = 280;

        for (let i = 0; i < totalStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // Random positions
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';

            // Random animation delay and duration
            star.style.animationDelay = Math.random() * 4 + 's';
            star.style.animationDuration = (2.5 + Math.random() * 4) + 's';

            // Distribute stars to layers based on depth/size
            const rand = Math.random();
            if (rand < 0.6) {
                // Background Layer: Tiny, faint stars
                star.classList.add('small');
                this.layer1.appendChild(star);
            } else if (rand < 0.88) {
                // Midground Layer: Medium stars
                star.classList.add('medium');
                // Some stars float individually as well
                if (Math.random() < 0.25) {
                    star.style.animation += `, float ${8 + Math.random() * 12}s ease-in-out infinite`;
                }
                this.layer2.appendChild(star);
            } else {
                // Foreground Layer: Large, bright stars
                if (Math.random() < 0.4) {
                    star.classList.add('bright');
                } else {
                    star.classList.add('large');
                }
                star.style.animation += `, float ${6 + Math.random() * 8}s ease-in-out infinite`;
                this.layer3.appendChild(star);
            }
        }

        this.createAmbientNebulaClouds();
    }

    createAmbientNebulaClouds() {
        // Create subtle floating cosmic dust particles
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = 1.5 + Math.random() * 2.5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '100%'; // Drift up from bottom

            particle.style.animationDelay = Math.random() * 25 + 's';
            particle.style.animationDuration = (20 + Math.random() * 15) + 's';

            this.layer2.appendChild(particle); // Drift with midground layer
        }
    }

    createShootingStars() {
        // Create shooting stars periodically
        setInterval(() => {
            if (Math.random() < 0.25) {
                this.createShootingStar();
            }
        }, 4000);

        // Initial shooting star
        setTimeout(() => {
            this.createShootingStar();
        }, 3000);
    }

    createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';

        shootingStar.style.left = Math.random() * 40 + '%';
        shootingStar.style.top = Math.random() * 35 + '%';

        const angle = 25 + Math.random() * 25; // 25-50 degrees
        shootingStar.style.transform = `rotate(${angle}deg)`;
        shootingStar.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';

        this.container.appendChild(shootingStar);

        // Clean up
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStar.parentNode.removeChild(shootingStar);
            }
        }, 5000);
    }

    startAnimations() {
        // Constellation lines (canvas rendering subtle stardust links)
        this.createConstellationLines();
    }

    createConstellationLines() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2';
        canvas.style.opacity = '0.08'; // Very subtle

        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.drawConstellationLines(ctx);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawConstellationLines(ctx);
        }, 12000);
    }

    drawConstellationLines(ctx) {
        // Find bright/large stars in the DOM and draw faint connecting lines
        const brightStars = Array.from(this.container.querySelectorAll('.star.bright, .star.large'));

        ctx.strokeStyle = 'rgba(100, 150, 255, 0.12)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < brightStars.length; i++) {
            for (let j = i + 1; j < brightStars.length; j++) {
                const star1 = brightStars[i];
                const star2 = brightStars[j];

                const rect1 = star1.getBoundingClientRect();
                const rect2 = star2.getBoundingClientRect();

                const x1 = rect1.left + rect1.width / 2;
                const y1 = rect1.top + rect1.height / 2;
                const x2 = rect2.left + rect2.width / 2;
                const y2 = rect2.top + rect2.height / 2;

                const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

                if (distance < 130 && Math.random() < 0.08) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }
    }

    createSpaceObjects() {
        // Create floating astronaut
        const astronaut = document.createElement('div');
        astronaut.className = 'floating-astronaut';
        astronaut.innerHTML = `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2">
            <circle cx="12" cy="7" r="3.5" />
            <path d="M10 7h4" />
            <rect x="7.5" y="11" width="9" height="7.5" rx="1.5" />
            <path d="M6 12c-0.8 1.5-0.8 3 0 4M18 12c0.8 1.5 0.8 3 0 4" />
            <path d="M9.5 18.5v2.5M14.5 18.5v2.5" />
            <rect x="5.5" y="12.5" width="2" height="3.5" rx="0.5" />
        </svg>`;
        this.container.appendChild(astronaut);

        // Create passing satellite
        const satellite = document.createElement('div');
        satellite.className = 'passing-satellite';
        satellite.innerHTML = `<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.2">
            <rect x="10.5" y="8" width="3" height="8" rx="0.8" />
            <path d="M2 12h8.5M13.5 12h8.5" />
            <rect x="3" y="10" width="5" height="4" rx="0.5" />
            <rect x="16" y="10" width="5" height="4" rx="0.5" />
            <circle cx="12" cy="4" r="1" />
            <line x1="12" y1="8" x2="12" y2="5" />
            <path d="M10 3a3 3 0 0 1 4 0" />
        </svg>`;
        this.container.appendChild(satellite);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new StarField();
});