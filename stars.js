class StarField {
    constructor() {
        this.container = document.getElementById('stars-container');
        this.stars = [];
        this.shootingStars = [];
        this.init();
    }

    init() {
        this.createStars();
        this.createShootingStars();
        this.startAnimations();
    }

    createStars() {
        const starCount = 300; // Increased star count

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // Random star sizes and brightness
            const types = ['small', 'medium', 'large', 'bright'];
            const weights = [0.5, 0.3, 0.15, 0.05]; // More medium and large stars
            const type = this.weightedRandom(types, weights);
            star.classList.add(type);

            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';

            // Random animation delay and duration
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (2 + Math.random() * 4) + 's';

            // Add subtle movement for some stars
            if (Math.random() < 0.4) { // Increased chance of movement
                star.style.animation += `, float ${5 + Math.random() * 10}s ease-in-out infinite`;
            }

            this.container.appendChild(star);
            this.stars.push(star);
        }

        // Create additional floating particles
        this.createFloatingParticles();
    }

    createFloatingParticles() {
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random size
            const size = 1 + Math.random() * 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '100%'; // Start from bottom

            // Random animation delay and duration
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';

            this.container.appendChild(particle);
        }
    }

    createShootingStars() {
        // Create shooting stars periodically
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every interval
                this.createShootingStar();
            }
        }, 3000);

        // Create initial shooting star
        setTimeout(() => {
            this.createShootingStar();
        }, 2000);
    }

    createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';

        // Random starting position (top area)
        shootingStar.style.left = Math.random() * 30 + '%';
        shootingStar.style.top = Math.random() * 30 + '%';

        // Random angle and speed
        const angle = 30 + Math.random() * 30; // 30-60 degrees
        shootingStar.style.transform = `rotate(${angle}deg)`;

        // Random animation duration
        shootingStar.style.animationDuration = (3 + Math.random() * 2) + 's';

        this.container.appendChild(shootingStar);

        // Remove after animation
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStar.parentNode.removeChild(shootingStar);
            }
        }, 6000);
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    startAnimations() {
        // Add floating animation keyframes dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                25% { transform: translateY(-10px) translateX(5px); }
                50% { transform: translateY(-5px) translateX(-5px); }
                75% { transform: translateY(-15px) translateX(3px); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
            
            @keyframes sparkle {
                0%, 100% { 
                    opacity: 0.3; 
                    transform: scale(1) rotate(0deg);
                    box-shadow: 0 0 0px rgba(255, 255, 255, 0.3);
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.5) rotate(180deg);
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                }
            }
        `;
        document.head.appendChild(style);

        // Add special sparkle effect to some stars
        setTimeout(() => {
            const brightStars = this.container.querySelectorAll('.star.bright');
            brightStars.forEach((star, index) => {
                if (Math.random() < 0.5) {
                    star.style.animation = `sparkle ${3 + Math.random() * 2}s ease-in-out infinite`;
                    star.style.animationDelay = (index * 0.5) + 's';
                }
            });
        }, 1000);

        // Add constellation-like connections (subtle lines between nearby stars)
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
        canvas.style.opacity = '0.1';

        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.drawConstellationLines(ctx);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Redraw lines periodically with slight variations
        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawConstellationLines(ctx);
        }, 10000);
    }

    drawConstellationLines(ctx) {
        const brightStars = Array.from(this.container.querySelectorAll('.star.bright, .star.large'));

        ctx.strokeStyle = 'rgba(100, 140, 255, 0.15)';
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

                // Only draw lines between nearby stars
                if (distance < 150 && Math.random() < 0.1) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }
    }
}

// Initialize star field when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarField();
});