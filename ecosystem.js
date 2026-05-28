class EcosystemDiagram {
    constructor() {
        this.svg = document.getElementById('ecosystem-svg');
        this.hoveredNode = null;
        this.dimensions = { width: 1200, height: 790 };
        this.scale = 1;
        this.mounted = false;

        this.init();
    }

    init() {
        this.setupDimensions();
        this.createSVGStructure();
        this.renderDiagram();
        this.setupEventListeners();
        this.startAnimations();

        // Fade in SVG container
        setTimeout(() => {
            this.mounted = true;
            this.svg.style.opacity = '1';
        }, 100);
    }

    setupDimensions() {
        const container = this.svg.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.scale = Math.min(1, containerWidth / 1300, containerHeight / 850);
        this.dimensions.width = Math.min(1200, containerWidth * 0.95);
        this.dimensions.height = Math.min(790, containerHeight * 0.92);

        this.svg.setAttribute('width', this.dimensions.width);
        this.svg.setAttribute('height', this.dimensions.height);
        this.svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    }

    createSVGStructure() {
        // Create defs for gradients and filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Center black hole event horizon background gradient
        const centerCircle = this.createRadialGradient('centerCircle', [
            { offset: '0%', color: '#010205' },      // Absolute black center
            { offset: '75%', color: '#03050a' },     // Dark blue space
            { offset: '100%', color: '#0b0c16' }     // Edge warp
        ]);

        // Center logo gradient (amber to white to violet scifi warp)
        const centerLogoGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        centerLogoGrad.setAttribute('id', 'centerLogoGrad');
        centerLogoGrad.setAttribute('x1', '0%');
        centerLogoGrad.setAttribute('y1', '0%');
        centerLogoGrad.setAttribute('x2', '100%');
        centerLogoGrad.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#fbbf24'); // Amber/Orange

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#38bdf8'); // Sky Blue

        centerLogoGrad.appendChild(stop1);
        centerLogoGrad.appendChild(stop2);

        // Gargantua Accretion Disk Plasma Gradient
        const accretionGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        accretionGrad.setAttribute('id', 'accretionGrad');
        accretionGrad.setAttribute('x1', '0%');
        accretionGrad.setAttribute('y1', '0%');
        accretionGrad.setAttribute('x2', '100%');
        accretionGrad.setAttribute('y2', '0%');

        const stops = [
            { offset: '0%', color: 'rgba(249, 115, 22, 0.03)' },   // Orange fade
            { offset: '20%', color: 'rgba(245, 158, 11, 0.55)' },   // Hot amber
            { offset: '50%', color: 'rgba(255, 255, 255, 0.95)' },  // White-hot center
            { offset: '80%', color: 'rgba(245, 158, 11, 0.55)' },   // Hot amber
            { offset: '100%', color: 'rgba(249, 115, 22, 0.03)' }   // Orange fade
        ];
        stops.forEach(s => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop.setAttribute('offset', s.offset);
            stop.setAttribute('stop-color', s.color);
            accretionGrad.appendChild(stop);
        });
        defs.appendChild(accretionGrad);

        // Glow filters
        const glowFilter = this.createGlowFilter('glow', 4);
        const strongGlowFilter = this.createGlowFilter('strongGlow', 9);

        // Node gradients
        ecosystemData.nodes.forEach(node => {
            const nodeGrad = this.createRadialGradient(`nodeGrad-${node.id}`, [
                { offset: '0%', color: '#080d22' },
                { offset: '100%', color: '#020408' }
            ]);
            defs.appendChild(nodeGrad);
        });

        defs.appendChild(centerCircle);
        defs.appendChild(centerLogoGrad);
        defs.appendChild(glowFilter);
        defs.appendChild(strongGlowFilter);

        this.svg.appendChild(defs);
    }

    createRadialGradient(id, stops) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');

        stops.forEach(stop => {
            const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopElement.setAttribute('offset', stop.offset);
            stopElement.setAttribute('stop-color', stop.color);
            gradient.appendChild(stopElement);
        });

        return gradient;
    }

    createGlowFilter(id, stdDeviation) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('filterUnits', 'userSpaceOnUse');
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');

        // Narrow blur for sharp core glow
        const blur1 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur1.setAttribute('stdDeviation', stdDeviation * 0.65);
        blur1.setAttribute('result', 'blur1');

        // Wide blur for soft atmospheric glow
        const blur2 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur2.setAttribute('stdDeviation', stdDeviation * 1.85);
        blur2.setAttribute('result', 'blur2');

        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');

        // Add wide soft blur for ambient atmosphere
        const mergeNodeAtmosphere = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeAtmosphere.setAttribute('in', 'blur2');
        merge.appendChild(mergeNodeAtmosphere);

        // Stack the sharp core blur twice to boost neon intensity
        const mergeNodeCore1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeCore1.setAttribute('in', 'blur1');
        merge.appendChild(mergeNodeCore1);

        const mergeNodeCore2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeCore2.setAttribute('in', 'blur1');
        merge.appendChild(mergeNodeCore2);

        // Overlay the source graphic to keep core outlines crisp
        const mergeNodeSource = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeSource.setAttribute('in', 'SourceGraphic');
        merge.appendChild(mergeNodeSource);

        filter.appendChild(blur1);
        filter.appendChild(blur2);
        filter.appendChild(merge);

        return filter;
    }

    degToRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    getNodePosition(angle, radius, centerX, centerY) {
        const rad = this.degToRad(angle - 90);
        return {
            x: centerX + radius * Math.cos(rad),
            y: centerY + radius * Math.sin(rad)
        };
    }

    renderDiagram() {
        const cx = this.dimensions.width / 2;
        const cy = this.dimensions.height / 2;
        const orbitRadius = ecosystemData.config.orbitRadius * this.scale;
        const centerRadius = ecosystemData.config.centerRadius * this.scale;
        const nodeRadius = ecosystemData.config.nodeRadius * this.scale;

        // Calculate final node positions
        const nodePositions = ecosystemData.nodes.map(node => ({
            ...node,
            ...this.getNodePosition(node.angle, node.customRadius * this.scale || orbitRadius, cx, cy)
        }));

        // Clear existing content (except defs)
        const defs = this.svg.querySelector('defs');
        this.svg.innerHTML = '';
        this.svg.appendChild(defs);


        // 2. Connection lines from center to nodes
        nodePositions.forEach(node => {
            this.createConnectionLine(cx, cy, node.x, node.y, node);
            this.createConnectionDot((cx + node.x) / 2, (cy + node.y) / 2, node);
        });

        // 3. Constellation Network: Outer Ring (4 straight lines + 2 diamond rhombuses)
        const scanme = nodePositions.find(n => n.id === 'scanme');
        const autonomic = nodePositions.find(n => n.id === 'autonomic');
        const workoaches = nodePositions.find(n => n.id === 'workoaches');
        const globalNode = nodePositions.find(n => n.id === 'global');
        const future = nodePositions.find(n => n.id === 'future');
        const afterlifeAr = nodePositions.find(n => n.id === 'afterlife-ar');

        // Draw straight adjacent connection lines
        if (scanme && autonomic) this.createConstellationLine(scanme, autonomic, 'rgba(56, 189, 248, 0.45)');
        if (autonomic && workoaches) this.createConstellationLine(autonomic, workoaches, 'rgba(56, 189, 248, 0.45)');
        if (globalNode && future) this.createConstellationLine(globalNode, future, 'rgba(96, 165, 250, 0.45)');
        if (future && afterlifeAr) this.createConstellationLine(future, afterlifeAr, 'rgba(167, 139, 250, 0.45)');

        // Draw diamond shape (rhombus) connector lines
        if (workoaches && globalNode) {
            this.createRhombusConnector(workoaches, globalNode, 'rgba(45, 212, 191, 0.6)'); // Teal diamond (right)
        }
        if (afterlifeAr && scanme) {
            this.createRhombusConnector(afterlifeAr, scanme, 'rgba(251, 146, 60, 0.55)'); // Orange diamond (left)
        }

        // 5. Center Node wrapping group (for entrance animation staging)
        const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        centerGroup.setAttribute('id', 'center-node-group');
        centerGroup.style.transform = `scale(0)`;
        centerGroup.style.opacity = '0';
        centerGroup.style.transformOrigin = `${cx}px ${cy}px`;
        centerGroup.style.transition = 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease-out';
        this.svg.appendChild(centerGroup);

        // ==========================================
        // INTERSTELLAR BLACK HOLE (GARGANTUA) DESIGN
        // ==========================================

        // Accretion Disk Glow (Back side of the lensing ring)
        const backLensingRing = this.createCircle(cx, cy, centerRadius * 1.35, {
            fill: 'none',
            stroke: 'url(#accretionGrad)',
            'stroke-width': '20',
            'stroke-opacity': '0.12',
            filter: 'url(#strongGlow)'
        }, centerGroup);

        // Flat, tilted Accretion Disk (horizontal warped ring of gas)
        const flatDisk = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        flatDisk.setAttribute('cx', cx);
        flatDisk.setAttribute('cy', cy);
        flatDisk.setAttribute('rx', centerRadius * 2.3);
        flatDisk.setAttribute('ry', centerRadius * 0.35);
        flatDisk.setAttribute('fill', 'none');
        flatDisk.setAttribute('stroke', 'url(#accretionGrad)');
        flatDisk.setAttribute('stroke-width', '10');
        flatDisk.setAttribute('stroke-opacity', '0.6');
        flatDisk.setAttribute('filter', 'url(#strongGlow)');
        flatDisk.setAttribute('transform', `rotate(-12, ${cx}, ${cy})`);

        // Accretion disk pulsing heat animation
        const pulseDisk = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        pulseDisk.setAttribute('attributeName', 'stroke-width');
        pulseDisk.setAttribute('values', '6;12;6');
        pulseDisk.setAttribute('dur', '5s');
        pulseDisk.setAttribute('repeatCount', 'indefinite');
        flatDisk.appendChild(pulseDisk);
        centerGroup.appendChild(flatDisk);

        // Core Gravitational Lensing Halo (Einstein Ring bent over top and bottom)
        const lensingRing = this.createCircle(cx, cy, centerRadius * 1.16, {
            fill: 'none',
            stroke: 'url(#accretionGrad)',
            'stroke-width': '7',
            'stroke-opacity': '0.85',
            filter: 'url(#strongGlow)',
            'stroke-dasharray': `${450 * this.scale}, ${150 * this.scale}`
        }, centerGroup);

        // Slow orbit spin for lensing ring
        const rotateLensing = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        rotateLensing.setAttribute('attributeName', 'transform');
        rotateLensing.setAttribute('type', 'rotate');
        rotateLensing.setAttribute('from', `0 ${cx} ${cy}`);
        rotateLensing.setAttribute('to', `360 ${cx} ${cy}`);
        rotateLensing.setAttribute('dur', '30s');
        rotateLensing.setAttribute('repeatCount', 'indefinite');
        lensingRing.appendChild(rotateLensing);

        // Center black hole event horizon background circle
        this.createCircle(cx, cy, centerRadius, {
            fill: 'url(#centerCircle)',
            stroke: '#fbbf24',
            'stroke-width': '1.2',
            'stroke-opacity': '0.35',
            filter: 'url(#glow)'
        }, centerGroup);

        // Center thin decorative accent ring
        this.createCircle(cx, cy, centerRadius - 6 * this.scale, {
            fill: 'none',
            stroke: 'rgba(255,190,40,0.15)',
            'stroke-width': '0.8'
        }, centerGroup);

        // Center text and logo wrapping group (for scramble typing transition)
        const centerTextGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        centerTextGroup.setAttribute('id', 'center-text-group');
        this.svg.appendChild(centerTextGroup);

        // Center logo and text content
        this.createCenterContent(cx, cy, centerRadius, centerTextGroup);

        // 6. Satellite nodes
        nodePositions.forEach(node => {
            this.createSatelliteNode(node, cx, cy, nodeRadius);
        });



        // 8. Floating background star dots
        this.createAnimatedDots(cx, cy, orbitRadius);
    }

    createCircle(cx, cy, r, attributes = {}, parent = this.svg) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);

        Object.entries(attributes).forEach(([key, value]) => {
            circle.setAttribute(key, value);
        });

        parent.appendChild(circle);
        return circle;
    }

    createConnectionLine(cx, cy, x2, y2, node) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // Prevent perfectly vertical/horizontal lines from having 0 bounding box dimensions,
        // which clips SVG filter effects in some browser engines.
        const targetX = Math.abs(x2 - cx) < 0.01 ? x2 + 0.01 : x2;
        const targetY = Math.abs(y2 - cy) < 0.01 ? y2 + 0.01 : y2;

        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', targetX);
        line.setAttribute('y2', targetY);
        line.setAttribute('stroke', node.color);
        line.setAttribute('stroke-width', '1.6');
        line.setAttribute('stroke-opacity', '0.85');
        line.setAttribute('filter', 'url(#glow)'); // Bright neon glow
        line.classList.add('connection-line');
        line.classList.add(`connection-${node.id}`);

        const length = Math.sqrt((targetX - cx) ** 2 + (targetY - cy) ** 2);
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;

        this.svg.appendChild(line);
    }

    createConnectionDot(cx, cy, node) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', '2');
        dot.setAttribute('fill', node.color);
        dot.setAttribute('opacity', '0');
        dot.setAttribute('filter', 'url(#glow)');
        dot.classList.add(`dot-${node.id}`);
        dot.style.transition = 'opacity 1.5s ease-in-out';

        this.svg.appendChild(dot);
    }

    createConstellationLine(n1, n2, strokeColor) {
        // Randomly swap nodes so lines draw in either clockwise or anticlockwise directions
        const swapDirection = Math.random() > 0.5;
        const node1 = swapDirection ? n2 : n1;
        const node2 = swapDirection ? n1 : n2;

        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const node1Radius = (node1.customNodeRadius || 65) * this.scale;
        const node2Radius = (node2.customNodeRadius || 65) * this.scale;

        const x1 = node1.x + (dx / distance) * node1Radius;
        const y1 = node1.y + (dy / distance) * node1Radius;
        const x2 = node2.x - (dx / distance) * node2Radius;
        const y2 = node2.y - (dy / distance) * node2Radius;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-opacity', '0.8');
        line.setAttribute('filter', 'url(#glow)'); // Bright neon glow
        line.classList.add('connection-line');
        line.classList.add('constellation-line');

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;

        this.svg.appendChild(line);
    }

    createRhombusConnector(node1, node2, color) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const perpX = -dy / distance;
        const perpY = dx / distance;
        const rhombusWidth = 48 * this.scale; // Width of the diamond bulge

        const node1Radius = (node1.customNodeRadius || 65) * this.scale;
        const node2Radius = (node2.customNodeRadius || 65) * this.scale;

        const point1X = node1.x + (dx / distance) * node1Radius;
        const point1Y = node1.y + (dy / distance) * node1Radius;

        const point3X = node2.x - (dx / distance) * node2Radius;
        const point3Y = node2.y - (dy / distance) * node2Radius;

        const midX = (point1X + point3X) / 2;
        const midY = (point1Y + point3Y) / 2;
        const point2X = midX + perpX * rhombusWidth;
        const point2Y = midY + perpY * rhombusWidth;
        const point4X = midX - perpX * rhombusWidth;
        const point4Y = midY - perpY * rhombusWidth;

        // Helper to create a single transparent connection segment - styled dull as requested
        const createSegment = (x1, y1, x2, y2) => {
            // Randomly swap start and end coordinates so lines draw in either direction
            const swapDirection = Math.random() > 0.5;
            const startX = swapDirection ? x2 : x1;
            const startY = swapDirection ? y2 : y1;
            const endX = swapDirection ? x1 : x2;
            const endY = swapDirection ? y1 : y2;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '0.9'); // Thinner
            line.setAttribute('stroke-opacity', '0.22'); // Dull opacity
            // Removed filter: url(#glow) to keep it dull and non-glowing
            line.classList.add('connection-line');
            line.classList.add('constellation-line');
            line.classList.add('rhombus-connector');

            const segmentLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            line.style.strokeDasharray = segmentLen;
            line.style.strokeDashoffset = segmentLen;

            this.svg.appendChild(line);
        };

        // Create four separate segments that form the diamond boundary transparently
        createSegment(point1X, point1Y, point2X, point2Y); // Node 1 (Workoaches/AfterlifeAR) -> Outer Midpoint
        createSegment(point1X, point1Y, point4X, point4Y); // Node 1 (Workoaches/AfterlifeAR) -> Inner Midpoint
        createSegment(point3X, point3Y, point2X, point2Y); // Node 2 (Global/Scanme) -> Outer Midpoint
        createSegment(point3X, point3Y, point4X, point4Y); // Node 2 (Global/Scanme) -> Inner Midpoint
    }



    createCenterContent(cx, cy, radius, parent) {
        // Outer group handles coordinates using robust SVG attribute translation
        const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        logoGroup.setAttribute('transform', `translate(${cx - 18 * this.scale}, ${cy - 45 * this.scale})`);

        // Inner group handles local scale/fade transition without displacing coordinates
        const logoInner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        logoInner.style.opacity = '0';
        logoInner.style.transform = 'scale(0)';
        logoInner.style.transformOrigin = '12px 12px';
        logoInner.style.transition = 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.2s ease-out';

        const leftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftPath.setAttribute('d', 'M11.5 2L2 22h4.5l2-4.5h3v-3h-4.3L11.5 2z');
        leftPath.setAttribute('fill', 'url(#centerLogoGrad)');

        const rightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightPath.setAttribute('d', 'M12.5 2l8.5 20h-4.5l-2-4.5h-3v-3h4.3L12.5 2z');
        rightPath.setAttribute('fill', 'url(#centerLogoGrad)');

        logoInner.appendChild(leftPath);
        logoInner.appendChild(rightPath);
        logoGroup.appendChild(logoInner);
        parent.appendChild(logoGroup);

        // Slow logo fade and scale-up transition
        setTimeout(() => {
            logoInner.style.transform = `scale(${this.scale * 1.5})`;
            logoInner.style.opacity = '0.95';
        }, 200);

        // Center main label
        const mainText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mainText.setAttribute('x', cx);
        mainText.setAttribute('y', cy + 22 * this.scale);
        mainText.setAttribute('text-anchor', 'middle');
        mainText.setAttribute('fill', 'white');
        mainText.setAttribute('font-size', 23 * this.scale);
        mainText.setAttribute('font-weight', '500');
        mainText.setAttribute('letter-spacing', '5');
        mainText.textContent = ""; // Start blank for scramble writing effect
        mainText.classList.add('center-text');

        // Center sublabel
        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', cx);
        subText.setAttribute('y', cy + 40 * this.scale);
        subText.setAttribute('text-anchor', 'middle');
        subText.setAttribute('fill', 'rgba(255,200,100,0.5)'); // Golden/Amber accent
        subText.setAttribute('font-size', 11 * this.scale);
        subText.setAttribute('letter-spacing', '2.5');
        subText.textContent = ""; // Start blank for scramble writing effect
        subText.classList.add('center-text');

        parent.appendChild(mainText);
        parent.appendChild(subText);

        // Trigger scifi scramble writing decoders - extended to 3.5s total duration
        this.scrambleText(mainText, ecosystemData.center.label, 1800, 200);      // Decodes from 0.2s to 2.0s
        this.scrambleText(subText, ecosystemData.center.sublabel, 1800, 1500);   // Decodes from 1.5s to 3.3s
    }

    scrambleText(element, finalText, duration, delay) {
        setTimeout(() => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_#@$+*=[]<>/\\";
            let currentIteration = 0;
            const steps = 25; // More steps for a smoother, denser typewriter scramble
            const intervalTime = duration / steps;
            
            const interval = setInterval(() => {
                element.textContent = finalText.split("").map((char, index) => {
                    if (char === " " || char === "'" || char === "-") return char;
                    if (index < (currentIteration / steps) * finalText.length) {
                        return finalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join("");
                
                currentIteration++;
                if (currentIteration > steps) {
                    clearInterval(interval);
                    element.textContent = finalText;
                }
            }, intervalTime);
        }, delay);
    }

    createSatelliteNode(node, cx, cy, nodeRadius) {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.classList.add('node-group');
        nodeGroup.setAttribute('data-node-id', node.id);

        const currentNodeRadius = node.customNodeRadius ? node.customNodeRadius * this.scale : nodeRadius;

        // Position nodes initially at center (cx, cy) and scale down to 0
        nodeGroup.style.transform = `translate(${cx}px, ${cy}px) scale(0)`;
        nodeGroup.style.opacity = '0';
        nodeGroup.style.setProperty('--tx', `${node.x}px`);
        nodeGroup.style.setProperty('--ty', `${node.y}px`);

        // Outer glow circle
        const outerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerGlow.setAttribute('cx', 0);
        outerGlow.setAttribute('cy', 0);
        outerGlow.setAttribute('r', currentNodeRadius + 4 * this.scale);
        outerGlow.setAttribute('fill', 'none');
        outerGlow.setAttribute('stroke', node.color);
        outerGlow.setAttribute('stroke-width', '0.8');
        outerGlow.setAttribute('stroke-opacity', '0.25');
        outerGlow.classList.add('outer-glow');

        // Node background circle
        const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        nodeCircle.setAttribute('cx', 0);
        nodeCircle.setAttribute('cy', 0);
        nodeCircle.setAttribute('r', currentNodeRadius);
        nodeCircle.setAttribute('fill', `url(#nodeGrad-${node.id})`);
        nodeCircle.setAttribute('stroke', node.color);
        nodeCircle.setAttribute('stroke-width', '1.2');
        nodeCircle.setAttribute('stroke-opacity', '0.45');
        nodeCircle.classList.add('node-circle');

        // Dynamic icon placement
        const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `translate(${-23.4 * this.scale}, ${-52 * this.scale}) scale(${this.scale * 1.3})`);
        iconGroup.innerHTML = icons[node.icon] || '';
        iconGroup.setAttribute('fill', node.color);
        iconGroup.setAttribute('stroke', 'none');
        iconGroup.classList.add('node-icon');

        // Ensure icon elements render in node custom color
        iconGroup.querySelectorAll('*').forEach(el => {
            el.setAttribute('fill', node.color);
            el.setAttribute('stroke', node.color);
        });

        // Node label
        const mainLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mainLabel.setAttribute('x', 0);
        mainLabel.setAttribute('y', 18 * this.scale);
        mainLabel.setAttribute('text-anchor', 'middle');
        mainLabel.setAttribute('fill', '#ffffff');
        mainLabel.setAttribute('font-size', 16 * this.scale);
        mainLabel.setAttribute('font-weight', '500');
        mainLabel.setAttribute('letter-spacing', '2');
        mainLabel.textContent = node.label;
        mainLabel.classList.add('node-text');

        // Node sublabel
        const subLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subLabel.setAttribute('x', 0);
        subLabel.setAttribute('y', 33 * this.scale);
        subLabel.setAttribute('text-anchor', 'middle');
        subLabel.setAttribute('fill', node.color);
        subLabel.setAttribute('font-size', 11 * this.scale);
        subLabel.setAttribute('font-weight', '400');
        subLabel.setAttribute('letter-spacing', '1.5');
        subLabel.textContent = node.sublabel;
        subLabel.classList.add('node-text');

        // Description text
        const descGroup = this.createDescriptionText(node, currentNodeRadius);

        // Connector dot relative to node center
        const dx = node.x - cx;
        const dy = node.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const connectorX = - (dx / dist) * currentNodeRadius;
        const connectorY = - (dy / dist) * currentNodeRadius;

        const connectorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        connectorDot.setAttribute('cx', connectorX);
        connectorDot.setAttribute('cy', connectorY);
        connectorDot.setAttribute('r', 3 * this.scale);
        connectorDot.setAttribute('fill', node.color);
        connectorDot.setAttribute('opacity', '0.8');
        connectorDot.setAttribute('filter', 'url(#glow)');
        connectorDot.classList.add('connector-dot');

        nodeGroup.appendChild(outerGlow);
        nodeGroup.appendChild(nodeCircle);
        nodeGroup.appendChild(iconGroup);
        nodeGroup.appendChild(mainLabel);
        nodeGroup.appendChild(subLabel);
        nodeGroup.appendChild(descGroup);
        nodeGroup.appendChild(connectorDot);

        this.svg.appendChild(nodeGroup);
    }

    createDescriptionText(node, nodeRadius) {
        const descGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        descGroup.classList.add('description-group');

        // Calculate positions relative to node center (0, 0)
        let descX = 0;
        let descAnchor = 'middle';
        let descY = 0;

        const angle = node.angle;
        if (angle === 0) {
            descX = nodeRadius + 18 * this.scale;
            descAnchor = 'start';
            descY = -10 * this.scale;
        } else if (angle === 180) {
            descX = 0;
            descAnchor = 'middle';
            descY = nodeRadius + 22 * this.scale;
        } else if (angle > 0 && angle < 180) {
            descX = nodeRadius + 18 * this.scale;
            descAnchor = 'start';
            descY = -8 * this.scale;
        } else {
            descX = -(nodeRadius + 18 * this.scale);
            descAnchor = 'end';
            descY = -8 * this.scale;
        }

        node.description.forEach((line, i) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', descX);
            text.setAttribute('y', angle === 180
                ? descY + i * 14 * this.scale
                : descY + (i - (node.description.length - 1) / 2) * 14 * this.scale
            );
            text.setAttribute('text-anchor', descAnchor);
            text.setAttribute('fill', 'rgba(255, 255, 255, 0.45)');
            text.setAttribute('font-size', 12 * this.scale);
            text.setAttribute('letter-spacing', '0.5');
            text.textContent = line;
            text.classList.add('description-text');

            descGroup.appendChild(text);
        });

        return descGroup;
    }

    createAnimatedDots(cx, cy, orbitRadius) {
        const dots = [
            { angle: 36, dist: orbitRadius * 0.6 },
            { angle: 108, dist: orbitRadius * 0.75 },
            { angle: 180, dist: orbitRadius * 0.55 },
            { angle: 252, dist: orbitRadius * 0.8 },
            { angle: 320, dist: orbitRadius * 0.65 },
            { angle: 15, dist: orbitRadius * 1.15 },
            { angle: 200, dist: orbitRadius * 1.1 },
            { angle: 85, dist: orbitRadius * 0.9 },
            { angle: 275, dist: orbitRadius * 0.85 },
            { angle: 45, dist: orbitRadius * 1.25 }
        ];

        dots.forEach((dot, i) => {
            const rad = this.degToRad(dot.angle - 90);
            const x = cx + dot.dist * Math.cos(rad);
            const y = cy + dot.dist * Math.sin(rad);

            const dotElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dotElement.setAttribute('cx', x);
            dotElement.setAttribute('cy', y);
            dotElement.setAttribute('r', '1.5');
            dotElement.setAttribute('fill', 'rgba(150,180,255,0.4)');
            dotElement.setAttribute('filter', 'url(#glow)');

            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.2;0.8;0.2');
            animate.setAttribute('dur', `${2.5 + i * 0.5}s`);
            animate.setAttribute('repeatCount', 'indefinite');

            dotElement.appendChild(animate);
            this.svg.appendChild(dotElement);
        });
    }

    setupEventListeners() {
        this.svg.addEventListener('mouseover', (e) => {
            const nodeGroup = e.target.closest('.node-group');
            if (nodeGroup && nodeGroup.classList.contains('ready')) {
                const nodeId = nodeGroup.getAttribute('data-node-id');
                this.handleNodeHover(nodeId, true);
            }
        });

        this.svg.addEventListener('mouseout', (e) => {
            const nodeGroup = e.target.closest('.node-group');
            if (nodeGroup && nodeGroup.classList.contains('ready')) {
                const nodeId = nodeGroup.getAttribute('data-node-id');
                this.handleNodeHover(nodeId, false);
            }
        });

        window.addEventListener('resize', () => {
            this.setupDimensions();
            this.renderDiagram();

            // Settle center node
            const centerNodeGroup = this.svg.getElementById('center-node-group');
            if (centerNodeGroup) {
                centerNodeGroup.style.transform = `scale(1)`;
                centerNodeGroup.style.opacity = '1';
            }

            // Settle satellite nodes
            this.svg.querySelectorAll('.node-group').forEach(group => {
                const nodeId = group.getAttribute('data-node-id');
                const node = ecosystemData.nodes.find(n => n.id === nodeId);
                const cx = this.dimensions.width / 2;
                const cy = this.dimensions.height / 2;
                const finalPos = this.getNodePosition(node.angle, node.customRadius * this.scale || ecosystemData.config.orbitRadius * this.scale, cx, cy);

                group.classList.add('ready');
                group.style.transform = `translate(${finalPos.x}px, ${finalPos.y}px) scale(1)`;
                group.style.opacity = '1';

                const line = this.svg.querySelector(`.connection-${nodeId}`);
                if (line) {
                    line.style.strokeDashoffset = '0';
                }
            });

            this.svg.querySelectorAll('.constellation-line').forEach(line => {
                line.style.strokeDashoffset = '0';
            });
            this.svg.querySelectorAll('[class^="dot-"]').forEach(dot => {
                dot.style.opacity = '0.5';
            });
        });
    }

    handleNodeHover(nodeId, isHovered) {
        if (isHovered) {
            this.hoveredNode = nodeId;
        } else {
            this.hoveredNode = null;
        }

        const node = ecosystemData.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const cx = this.dimensions.width / 2;
        const cy = this.dimensions.height / 2;
        const finalPos = this.getNodePosition(node.angle, node.customRadius * this.scale || ecosystemData.config.orbitRadius * this.scale, cx, cy);

        const connectionLine = this.svg.querySelector(`.connection-${nodeId}`);
        if (connectionLine) {
            connectionLine.setAttribute('stroke-width', isHovered ? '2' : '1.2');
            connectionLine.setAttribute('stroke-opacity', isHovered ? '0.85' : '0.5');
        }

        const connectionDot = this.svg.querySelector(`.dot-${nodeId}`);
        if (connectionDot) {
            connectionDot.setAttribute('r', isHovered ? '3.5' : '2');
            connectionDot.style.opacity = isHovered ? '0.9' : '0.5';
        }

        const nodeGroup = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            const outerGlow = nodeGroup.querySelector('.outer-glow');
            const nodeCircle = nodeGroup.querySelector('.node-circle');
            const connectorDot = nodeGroup.querySelector('.connector-dot');
            const currentNodeRadius = node.customNodeRadius ? node.customNodeRadius * this.scale : ecosystemData.config.nodeRadius * this.scale;

            if (isHovered) {
                nodeGroup.style.transform = `translate(${finalPos.x}px, ${finalPos.y}px) scale(1.06)`;
            } else {
                nodeGroup.style.transform = `translate(${finalPos.x}px, ${finalPos.y}px) scale(1)`;
            }

            if (outerGlow) {
                outerGlow.setAttribute('stroke-width', isHovered ? '1.5' : '0.8');
                outerGlow.setAttribute('stroke-opacity', isHovered ? '0.85' : '0.25');
            }

            if (nodeCircle) {
                nodeCircle.setAttribute('stroke-width', isHovered ? '1.8' : '1.2');
                nodeCircle.setAttribute('stroke-opacity', isHovered ? '0.9' : '0.45');
            }

            if (connectorDot) {
                connectorDot.setAttribute('r', isHovered ? '4.5' : '3');
            }

            // Create/Remove sonar pulse halo animation
            if (isHovered) {
                const sonar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                sonar.setAttribute('cx', 0);
                sonar.setAttribute('cy', 0);
                sonar.setAttribute('r', currentNodeRadius);
                sonar.setAttribute('fill', 'none');
                sonar.setAttribute('stroke', node.color);
                sonar.setAttribute('stroke-width', '1.5');
                sonar.classList.add('hover-sonar');
                nodeGroup.appendChild(sonar);
            } else {
                const sonar = nodeGroup.querySelector('.hover-sonar');
                if (sonar) sonar.remove();
            }
        }
    }

    startAnimations() {
        const cx = this.dimensions.width / 2;
        const cy = this.dimensions.height / 2;

        const centerNodeGroup = this.svg.getElementById('center-node-group');
        const nodeGroups = this.svg.querySelectorAll('.node-group');

        // 1. Center black hole event horizon boots up after typewriter scramble completes (at 3500ms)
        if (centerNodeGroup) {
            setTimeout(() => {
                centerNodeGroup.style.transform = `scale(1)`;
                centerNodeGroup.style.opacity = '1';
            }, 3500);
        }

        // 2. Slower, randomized ejection sequence for satellite nodes (starts after center node loading, at 5200ms)
        const nodeGroupsArray = Array.from(nodeGroups);
        
        // Shuffle to randomize birth sequence order
        for (let i = nodeGroupsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nodeGroupsArray[i], nodeGroupsArray[j]] = [nodeGroupsArray[j], nodeGroupsArray[i]];
        }

        nodeGroupsArray.forEach((group, i) => {
            const nodeId = group.getAttribute('data-node-id');
            const node = ecosystemData.nodes.find(n => n.id === nodeId);
            const finalPos = this.getNodePosition(node.angle, node.customRadius * this.scale || ecosystemData.config.orbitRadius * this.scale, cx, cy);

            setTimeout(() => {
                // A. Create temporary scifi ejection particle
                const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                particle.setAttribute('cx', 0);
                particle.setAttribute('cy', 0);
                particle.setAttribute('r', '4.5');
                particle.setAttribute('fill', '#ffffff');
                particle.setAttribute('stroke', node.color);
                particle.setAttribute('stroke-width', '1.5');
                particle.setAttribute('filter', 'url(#glow)');
                particle.style.transform = `translate(${cx}px, ${cy}px) scale(0.2)`;
                particle.style.opacity = '0';
                particle.style.transition = 'transform 1.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.3s ease';
                particle.classList.add('ejection-particle');
                this.svg.appendChild(particle);

                // Trigger reflow to start transition
                window.getComputedStyle(particle).opacity;

                // B. Shoot particle to node position slowly
                particle.style.transform = `translate(${finalPos.x}px, ${finalPos.y}px) scale(1.15)`;
                particle.style.opacity = '1';

                // C. Self-draw connection line slowly to match particle speed
                const line = this.svg.querySelector(`.connection-${nodeId}`);
                if (line) {
                    line.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    line.style.strokeDashoffset = '0';
                }

                // D. Once the particle lands (after 1300ms)
                setTimeout(() => {
                    // Fade out particle
                    particle.style.opacity = '0';
                    setTimeout(() => particle.remove(), 250);

                    // Wake up the satellite node with scifi slow elastic bounce
                    group.classList.add('spawn-active');

                    // Create slow expanding landing ripple circle
                    const currentNodeRadius = node.customNodeRadius ? node.customNodeRadius * this.scale : ecosystemData.config.nodeRadius * this.scale;
                    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    ripple.setAttribute('cx', 0);
                    ripple.setAttribute('cy', 0);
                    ripple.setAttribute('fill', 'none');
                    ripple.setAttribute('stroke', node.color);
                    ripple.style.setProperty('--ripple-max-r', `${currentNodeRadius * 2.2}px`);
                    ripple.classList.add('landing-ripple');
                    group.appendChild(ripple);

                    // Clean up ripple after animation ends
                    setTimeout(() => ripple.remove(), 1800);

                    // Show connection dot midway
                    const dot = this.svg.querySelector(`.dot-${nodeId}`);
                    if (dot) {
                        dot.style.opacity = '0.5';
                    }
                }, 1300);

            }, 5200 + i * 450); // Staggered random births starting at 5.2s
        });

        // 3. Draw constellation connection network after nodes land (starts at 9.0s)
        setTimeout(() => {
            const constellationLines = this.svg.querySelectorAll('.constellation-line');
            const constellationLinesArray = Array.from(constellationLines);

            // Shuffle to randomize drawing sequence order so outer ring doesn't draw in a clockwise circle
            for (let i = constellationLinesArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [constellationLinesArray[i], constellationLinesArray[j]] = [constellationLinesArray[j], constellationLinesArray[i]];
            }

            // Stagger drawing individual constellation lines randomly
            constellationLinesArray.forEach((line, index) => {
                setTimeout(() => {
                    line.style.strokeDashoffset = '0';
                }, index * 150);
            });
        }, 9000);

        // 4. Mark nodes as ready for interactive hover states (9.5s delay)
        setTimeout(() => {
            nodeGroups.forEach(group => {
                group.classList.add('ready');
            });
        }, 9500);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new EcosystemDiagram();
});