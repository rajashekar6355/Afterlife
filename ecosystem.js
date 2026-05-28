
class EcosystemDiagram {
    constructor() {
        this.svg = document.getElementById('ecosystem-svg');
        this.hoveredNode = null;
        this.dimensions = { width: 1200, height: 650 }; // Increased width for 90% desktop coverage
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

        // Fade in effect
        setTimeout(() => {
            this.mounted = true;
            this.svg.style.opacity = '1';
        }, 100);
    }

    setupDimensions() {
        const container = this.svg.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.scale = Math.min(1, containerWidth / 1400, containerHeight / 700); // Increased width constraint
        this.dimensions.width = Math.min(1200, containerWidth * 0.9); // Increased width, use 90% of viewport
        this.dimensions.height = Math.min(650, containerHeight * 0.8); // Keep height manageable

        this.svg.setAttribute('width', this.dimensions.width);
        this.svg.setAttribute('height', this.dimensions.height);
        this.svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    }

    createSVGStructure() {
        // Create defs for gradients and filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Center glow gradient
        const centerGlow = this.createRadialGradient('centerGlow', [
            { offset: '0%', color: 'rgba(100,120,255,0.5)' },
            { offset: '60%', color: 'rgba(30,50,150,0.15)' },
            { offset: '100%', color: 'transparent' }
        ]);

        // Center circle gradient
        const centerCircle = this.createRadialGradient('centerCircle', [
            { offset: '0%', color: '#0d1230' },
            { offset: '100%', color: '#050810' }
        ]);

        // Glow filters
        const glowFilter = this.createGlowFilter('glow', 3);
        const strongGlowFilter = this.createGlowFilter('strongGlow', 6);

        // Node gradients
        ecosystemData.nodes.forEach(node => {
            const nodeGrad = this.createRadialGradient(`nodeGrad-${node.id}`, [
                { offset: '0%', color: '#0d1530' },
                { offset: '100%', color: '#050810' }
            ]);
            defs.appendChild(nodeGrad);

            const nodeGlowFilter = this.createGlowFilter(`nodeGlow-${node.id}`, 8);
            defs.appendChild(nodeGlowFilter);
        });

        defs.appendChild(centerGlow);
        defs.appendChild(centerCircle);
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

        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('stdDeviation', stdDeviation);
        blur.setAttribute('result', 'blur');

        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode1.setAttribute('in', 'blur');
        const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode2.setAttribute('in', 'SourceGraphic');

        merge.appendChild(mergeNode1);
        merge.appendChild(mergeNode2);
        filter.appendChild(blur);
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

        // Calculate node positions
        const nodePositions = ecosystemData.nodes.map(node => ({
            ...node,
            ...this.getNodePosition(node.angle, node.customRadius || orbitRadius, cx, cy)
        }));

        // Clear existing content (except defs)
        const defs = this.svg.querySelector('defs');
        this.svg.innerHTML = '';
        this.svg.appendChild(defs);

        // Connection lines from center to nodes (all nodes connected)
        nodePositions.forEach(node => {
            this.createConnectionLine(cx, cy, node.x, node.y, node);
            this.createConnectionDot((cx + node.x) / 2, (cy + node.y) / 2, node);
        });

        // Hexagon orbit ring (exclude nodes with rhombus connectors)
        const hexagonNodes = nodePositions.filter(n =>
            n.id !== 'ar-gaming' && n.id !== 'future-ventures' &&
            n.id !== 'autonomiq' && n.id !== 'workajos'
        );
        this.createPolygon(hexagonNodes.map(p => `${p.x},${p.y}`).join(' '), {
            fill: 'none',
            stroke: 'rgba(100,140,255,0.12)',
            'stroke-width': '1'
        });

        // Center background glows
        this.createCircle(cx, cy, centerRadius * 1.4, {
            fill: 'rgba(60,80,200,0.06)'
        });
        this.createCircle(cx, cy, centerRadius * 1.2, {
            fill: 'rgba(60,80,200,0.08)'
        });

        // Center main circle
        this.createCircle(cx, cy, centerRadius, {
            fill: 'url(#centerCircle)',
            stroke: 'rgba(100,140,255,0.4)',
            'stroke-width': '1.5'
        });
        this.createCircle(cx, cy, centerRadius - 6 * this.scale, {
            fill: 'none',
            stroke: 'rgba(100,140,255,0.15)',
            'stroke-width': '0.8'
        });

        // Center logo and text
        this.createCenterContent(cx, cy, centerRadius);

        // Satellite nodes
        nodePositions.forEach(node => {
            this.createSatelliteNode(node, cx, cy, nodeRadius, orbitRadius);
        });

        // Create rhombus connector between AR Gaming and Future Ventures
        this.createRhombusConnector(nodePositions, cx, cy);

        // Create rhombus connector between Autonomiq and WorkAjos
        this.createRhombusConnector2(nodePositions, cx, cy);

        // Create direct connection between ScanMe and Autonomiq
        this.createDirectConnection(nodePositions, 'scanme', 'autonomiq');

        // Create direct connection between ScanMe and AR Gaming
        this.createDirectConnection(nodePositions, 'scanme', 'ar-gaming');

        // Create direct connection between Future Ventures and Global Partnerships
        this.createDirectConnection(nodePositions, 'future-ventures', 'global-partnership');

        // Create direct connection between Global Partnerships and WorkAjos
        this.createDirectConnection(nodePositions, 'global-partnership', 'workajos');

        // Animated dots
        this.createAnimatedDots(cx, cy, orbitRadius);
    }

    createCircle(cx, cy, r, attributes = {}) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);

        Object.entries(attributes).forEach(([key, value]) => {
            circle.setAttribute(key, value);
        });

        this.svg.appendChild(circle);
        return circle;
    }

    createPolygon(points, attributes = {}) {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);

        Object.entries(attributes).forEach(([key, value]) => {
            polygon.setAttribute(key, value);
        });

        this.svg.appendChild(polygon);
        return polygon;
    }

    createConnectionLine(x1, y1, x2, y2, node) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', node.color);
        line.setAttribute('stroke-width', '1.2');
        line.setAttribute('stroke-opacity', '0.6');
        line.classList.add(`connection-${node.id}`);

        this.svg.appendChild(line);
    }

    createConnectionDot(cx, cy, node) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', '2');
        dot.setAttribute('fill', node.color);
        dot.setAttribute('opacity', '0.5');
        dot.setAttribute('filter', 'url(#glow)');
        dot.classList.add(`dot-${node.id}`);

        this.svg.appendChild(dot);
    }

    createCenterContent(cx, cy, radius) {
        // Center logo (triangle)
        const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        logoGroup.setAttribute('transform', `translate(${cx - 18 * this.scale}, ${cy - 42 * this.scale}) scale(${this.scale})`);

        // Outer triangle
        const outerTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outerTriangle.setAttribute('d', 'M20 2L38 40H2L20 2Z');
        outerTriangle.setAttribute('stroke', 'rgba(150,180,255,0.6)');
        outerTriangle.setAttribute('stroke-width', '1.2');
        outerTriangle.setAttribute('fill', 'none');

        // Inner filled triangle
        const innerTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        innerTriangle.setAttribute('d', 'M20 10L32 36H8L20 10Z');
        innerTriangle.setAttribute('fill', 'rgba(180,200,255,0.9)');

        // Crossbar
        const crossbar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        crossbar.setAttribute('x', '12');
        crossbar.setAttribute('y', '29');
        crossbar.setAttribute('width', '16');
        crossbar.setAttribute('height', '3.5');
        crossbar.setAttribute('fill', '#050810');

        logoGroup.appendChild(outerTriangle);
        logoGroup.appendChild(innerTriangle);
        logoGroup.appendChild(crossbar);
        this.svg.appendChild(logoGroup);

        // Center text
        const mainText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mainText.setAttribute('x', cx);
        mainText.setAttribute('y', cy + 20 * this.scale);
        mainText.setAttribute('text-anchor', 'middle');
        mainText.setAttribute('fill', 'white');
        mainText.setAttribute('font-size', 26 * this.scale);
        mainText.setAttribute('font-weight', '300');
        mainText.setAttribute('letter-spacing', '3');
        mainText.setAttribute('font-family', "'Helvetica Neue', sans-serif");
        mainText.textContent = ecosystemData.center.label;
        mainText.classList.add('center-text');

        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', cx);
        subText.setAttribute('y', cy + 40 * this.scale);
        subText.setAttribute('text-anchor', 'middle');
        subText.setAttribute('fill', 'rgba(150,170,220,0.7)');
        subText.setAttribute('font-size', 13 * this.scale);
        subText.setAttribute('letter-spacing', '2');
        subText.setAttribute('font-family', "'Helvetica Neue', sans-serif");
        subText.textContent = ecosystemData.center.sublabel;
        subText.classList.add('center-text');

        this.svg.appendChild(mainText);
        this.svg.appendChild(subText);
    }

    createSatelliteNode(node, cx, cy, nodeRadius, orbitRadius) {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.classList.add('node-group');
        nodeGroup.setAttribute('data-node-id', node.id);

        // Use custom node radius if available, otherwise use default
        const currentNodeRadius = node.customNodeRadius ? node.customNodeRadius * this.scale : nodeRadius;

        // Node outer glow circle
        const outerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerGlow.setAttribute('cx', node.x);
        outerGlow.setAttribute('cy', node.y);
        outerGlow.setAttribute('r', currentNodeRadius + 2 * this.scale);
        outerGlow.setAttribute('fill', 'none');
        outerGlow.setAttribute('stroke', node.color);
        outerGlow.setAttribute('stroke-width', '0.8');
        outerGlow.setAttribute('stroke-opacity', '0.3');
        outerGlow.classList.add('outer-glow');

        // Node background
        const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        nodeCircle.setAttribute('cx', node.x);
        nodeCircle.setAttribute('cy', node.y);
        nodeCircle.setAttribute('r', currentNodeRadius);
        nodeCircle.setAttribute('fill', `url(#nodeGrad-${node.id})`);
        nodeCircle.setAttribute('stroke', node.color);
        nodeCircle.setAttribute('stroke-width', '1');
        nodeCircle.setAttribute('stroke-opacity', '0.5');
        nodeCircle.classList.add('node-circle');

        // Icon
        const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `translate(${node.x - 28 * this.scale}, ${node.y - 60 * this.scale}) scale(${this.scale * 1.6})`);
        iconGroup.innerHTML = icons[node.icon] || '';
        iconGroup.setAttribute('fill', node.color);
        iconGroup.setAttribute('stroke', 'none');
        iconGroup.style.fill = node.color;
        iconGroup.classList.add('node-icon');

        // Force color on all child elements
        const svgElements = iconGroup.querySelectorAll('*');
        svgElements.forEach(el => {
            el.setAttribute('fill', node.color);
            el.setAttribute('stroke', node.color);
            el.style.fill = node.color;
        });

        // Node label
        const mainLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mainLabel.setAttribute('x', node.x);
        mainLabel.setAttribute('y', node.y + 18 * this.scale);
        mainLabel.setAttribute('text-anchor', 'middle');
        mainLabel.setAttribute('fill', node.color);
        mainLabel.setAttribute('font-size', 20 * this.scale);
        mainLabel.setAttribute('font-weight', '700');
        mainLabel.setAttribute('letter-spacing', '1');
        mainLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
        mainLabel.textContent = node.label;
        mainLabel.classList.add('node-text');

        const subLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subLabel.setAttribute('x', node.x);
        subLabel.setAttribute('y', node.y + 36 * this.scale);
        subLabel.setAttribute('text-anchor', 'middle');
        subLabel.setAttribute('fill', node.color);
        subLabel.setAttribute('font-size', 14 * this.scale);
        subLabel.setAttribute('font-weight', '500');
        subLabel.setAttribute('letter-spacing', '0.5');
        subLabel.setAttribute('font-family', "'Helvetica Neue', sans-serif");
        subLabel.textContent = node.sublabel;
        subLabel.classList.add('node-text');

        // Description text
        const descGroup = this.createDescriptionText(node, cx, cy, currentNodeRadius);

        // Connector dot at node edge
        const connectorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const connectorX = cx + (node.x - cx) * ((orbitRadius - currentNodeRadius - 4 * this.scale) / orbitRadius);
        const connectorY = cy + (node.y - cy) * ((orbitRadius - currentNodeRadius - 4 * this.scale) / orbitRadius);
        connectorDot.setAttribute('cx', connectorX);
        connectorDot.setAttribute('cy', connectorY);
        connectorDot.setAttribute('r', 3 * this.scale);
        connectorDot.setAttribute('fill', node.color);
        connectorDot.setAttribute('opacity', '0.6');
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

    createDescriptionText(node, cx, cy, nodeRadius) {
        const descGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        descGroup.classList.add('description-group');

        // Calculate description position
        const dx = node.x - cx;
        const dy = node.y - cy;
        let descX = node.x + (dx > 0 ? nodeRadius + 12 * this.scale : -(nodeRadius + 12 * this.scale));
        let descAnchor = dx > 0 ? 'start' : 'end';
        let descY = node.y;

        // Adjust for top/bottom nodes
        const isTop = Math.abs(dy) > Math.abs(dx) && dy < 0;
        const isBottom = Math.abs(dy) > Math.abs(dx) && dy > 0;

        if (isTop) {
            descX = node.x + nodeRadius * 0.9 + 10 * this.scale;
            descAnchor = 'start';
            descY = node.y - 10 * this.scale;
        } else if (isBottom) {
            descX = node.x;
            descAnchor = 'middle';
            descY = node.y + nodeRadius + 20 * this.scale;
        }

        node.description.forEach((line, i) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', descX);
            text.setAttribute('y', isBottom
                ? descY + i * 13 * this.scale
                : descY + (i - (node.description.length - 1) / 2) * 13 * this.scale
            );
            text.setAttribute('text-anchor', isBottom ? 'middle' : descAnchor);
            text.setAttribute('fill', 'rgba(160,180,220,0.65)');
            text.setAttribute('font-size', 14 * this.scale);
            text.setAttribute('font-family', "'Helvetica Neue', sans-serif");
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
            { angle: 15, dist: orbitRadius * 1.15 }, // Increased from 1.1
            { angle: 200, dist: orbitRadius * 1.1 }, // Increased from 1.05
            { angle: 85, dist: orbitRadius * 0.9 }, // Additional dots for larger space
            { angle: 275, dist: orbitRadius * 0.85 },
            { angle: 45, dist: orbitRadius * 1.2 }
        ];

        dots.forEach((dot, i) => {
            const rad = this.degToRad(dot.angle - 90);
            const x = cx + dot.dist * Math.cos(rad);
            const y = cy + dot.dist * Math.sin(rad);

            const dotElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dotElement.setAttribute('cx', x);
            dotElement.setAttribute('cy', y);
            dotElement.setAttribute('r', '2');
            dotElement.setAttribute('fill', 'rgba(150,180,255,0.5)');
            dotElement.setAttribute('filter', 'url(#glow)');

            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.3;0.9;0.3');
            animate.setAttribute('dur', `${2 + i * 0.4}s`);
            animate.setAttribute('repeatCount', 'indefinite');

            dotElement.appendChild(animate);
            this.svg.appendChild(dotElement);
        });
    }

    setupEventListeners() {
        // Node hover events
        this.svg.addEventListener('mouseover', (e) => {
            const nodeGroup = e.target.closest('.node-group');
            if (nodeGroup) {
                const nodeId = nodeGroup.getAttribute('data-node-id');
                this.handleNodeHover(nodeId, true);
            }
        });

        this.svg.addEventListener('mouseout', (e) => {
            const nodeGroup = e.target.closest('.node-group');
            if (nodeGroup) {
                const nodeId = nodeGroup.getAttribute('data-node-id');
                this.handleNodeHover(nodeId, false);
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.setupDimensions();
            this.renderDiagram();
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

        // Update connection line
        const connectionLine = this.svg.querySelector(`.connection-${nodeId}`);
        if (connectionLine) {
            connectionLine.setAttribute('stroke-width', isHovered ? '2' : '1.2');
            connectionLine.setAttribute('stroke-opacity', isHovered ? '0.9' : '0.6');
        }

        // Update connection dot
        const connectionDot = this.svg.querySelector(`.dot-${nodeId}`);
        if (connectionDot) {
            connectionDot.setAttribute('r', isHovered ? '3' : '2');
            connectionDot.setAttribute('opacity', isHovered ? '1' : '0.5');
        }

        // Update node group
        const nodeGroup = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            const outerGlow = nodeGroup.querySelector('.outer-glow');
            const nodeCircle = nodeGroup.querySelector('.node-circle');
            const nodeIcon = nodeGroup.querySelector('.node-icon');
            const connectorDot = nodeGroup.querySelector('.connector-dot');

            if (outerGlow) {
                outerGlow.setAttribute('stroke-width', isHovered ? '1.5' : '0.8');
                outerGlow.setAttribute('stroke-opacity', isHovered ? '0.8' : '0.3');
            }

            if (nodeCircle) {
                nodeCircle.setAttribute('stroke-width', isHovered ? '1.5' : '1');
                nodeCircle.setAttribute('stroke-opacity', isHovered ? '0.9' : '0.5');
            }

            if (nodeIcon) {
                nodeIcon.setAttribute('fill', node.color);
                nodeIcon.style.fill = node.color;
                const svgElements = nodeIcon.querySelectorAll('*');
                svgElements.forEach(el => {
                    el.setAttribute('fill', node.color);
                    el.setAttribute('stroke', node.color);
                    el.style.fill = node.color;
                });
            }

            if (connectorDot) {
                connectorDot.setAttribute('opacity', isHovered ? '1' : '0.6');
            }

            // Add glow ring for hovered node
            if (isHovered) {
                const glowRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                glowRing.setAttribute('cx', nodeGroup.querySelector('.node-circle').getAttribute('cx'));
                glowRing.setAttribute('cy', nodeGroup.querySelector('.node-circle').getAttribute('cy'));
                glowRing.setAttribute('r', ecosystemData.config.nodeRadius * this.scale + 8 * this.scale);
                glowRing.setAttribute('fill', node.glowColor);
                glowRing.setAttribute('opacity', '0.5');
                glowRing.classList.add('hover-glow');
                nodeGroup.insertBefore(glowRing, nodeGroup.firstChild);
            } else {
                const glowRing = nodeGroup.querySelector('.hover-glow');
                if (glowRing) {
                    glowRing.remove();
                }
            }
        }
    }

    startAnimations() {
        // Add entrance animations
        setTimeout(() => {
            this.svg.classList.add('fade-in');
        }, 200);

        // Stagger node animations
        const nodeGroups = this.svg.querySelectorAll('.node-group');
        nodeGroups.forEach((group, i) => {
            setTimeout(() => {
                group.classList.add('scale-in');
            }, 300 + i * 100);
        });
    }

    createRhombusConnector(nodePositions, cx, cy) {
        // Find AR Gaming and Future Ventures nodes
        const arGaming = nodePositions.find(n => n.id === 'ar-gaming');
        const futureVentures = nodePositions.find(n => n.id === 'future-ventures');

        if (!arGaming || !futureVentures) return;

        // Calculate the vector between the two nodes
        const dx = futureVentures.x - arGaming.x;
        const dy = futureVentures.y - arGaming.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate perpendicular vector for rhombus width
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const rhombusWidth = 60 * this.scale; // Increased width from 40 to 60

        // Calculate rhombus points
        // Point 1: AR Gaming node edge
        const point1X = arGaming.x + (dx / distance) * (arGaming.customNodeRadius || 65) * this.scale;
        const point1Y = arGaming.y + (dy / distance) * (arGaming.customNodeRadius || 65) * this.scale;

        // Point 3: Future Ventures node edge  
        const point3X = futureVentures.x - (dx / distance) * (futureVentures.customNodeRadius || 65) * this.scale;
        const point3Y = futureVentures.y - (dy / distance) * (futureVentures.customNodeRadius || 65) * this.scale;

        // Point 2: Top of rhombus (perpendicular from midpoint)
        const midX = (point1X + point3X) / 2;
        const midY = (point1Y + point3Y) / 2;
        const point2X = midX + perpX * rhombusWidth;
        const point2Y = midY + perpY * rhombusWidth;

        // Point 4: Bottom of rhombus (perpendicular from midpoint)
        const point4X = midX - perpX * rhombusWidth;
        const point4Y = midY - perpY * rhombusWidth;

        // Create rhombus shape
        const rhombus = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = [
            `${point1X},${point1Y}`, // AR Gaming end
            `${point2X},${point2Y}`, // Top
            `${point3X},${point3Y}`, // Future Ventures end
            `${point4X},${point4Y}`  // Bottom
        ].join(' ');

        rhombus.setAttribute('points', points);
        rhombus.setAttribute('fill', 'rgba(200,150,255,0.15)'); // Blend of both node colors
        rhombus.setAttribute('stroke', 'rgba(200,150,255,0.6)');
        rhombus.setAttribute('stroke-width', '1.5');
        rhombus.setAttribute('filter', 'url(#glow)');

        // Add subtle animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.3;0.7;0.3');
        animate.setAttribute('dur', '4s');
        animate.setAttribute('repeatCount', 'indefinite');

        rhombus.appendChild(animate);
        this.svg.appendChild(rhombus);
    }

    createRhombusConnector2(nodePositions, cx, cy) {
        // Find Autonomiq and WorkAjos nodes
        const autonomiq = nodePositions.find(n => n.id === 'autonomiq');
        const workajos = nodePositions.find(n => n.id === 'workajos');

        if (!autonomiq || !workajos) return;

        // Calculate the vector between the two nodes
        const dx = workajos.x - autonomiq.x;
        const dy = workajos.y - autonomiq.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate perpendicular vector for rhombus width
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const rhombusWidth = 60 * this.scale; // Same width as the first rhombus

        // Calculate rhombus points
        // Point 1: Autonomiq node edge
        const point1X = autonomiq.x + (dx / distance) * (autonomiq.customNodeRadius || 65) * this.scale;
        const point1Y = autonomiq.y + (dy / distance) * (autonomiq.customNodeRadius || 65) * this.scale;

        // Point 3: WorkAjos node edge  
        const point3X = workajos.x - (dx / distance) * (workajos.customNodeRadius || 65) * this.scale;
        const point3Y = workajos.y - (dy / distance) * (workajos.customNodeRadius || 65) * this.scale;

        // Point 2: Top of rhombus (perpendicular from midpoint)
        const midX = (point1X + point3X) / 2;
        const midY = (point1Y + point3Y) / 2;
        const point2X = midX + perpX * rhombusWidth;
        const point2Y = midY + perpY * rhombusWidth;

        // Point 4: Bottom of rhombus (perpendicular from midpoint)
        const point4X = midX - perpX * rhombusWidth;
        const point4Y = midY - perpY * rhombusWidth;

        // Create rhombus shape
        const rhombus = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = [
            `${point1X},${point1Y}`, // Autonomiq end
            `${point2X},${point2Y}`, // Top
            `${point3X},${point3Y}`, // WorkAjos end
            `${point4X},${point4Y}`  // Bottom
        ].join(' ');

        rhombus.setAttribute('points', points);
        rhombus.setAttribute('fill', 'rgba(45,212,191,0.15)'); // Teal color matching WorkAjos
        rhombus.setAttribute('stroke', 'rgba(45,212,191,0.6)');
        rhombus.setAttribute('stroke-width', '1.5');
        rhombus.setAttribute('filter', 'url(#glow)');

        // Add subtle animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.3;0.7;0.3');
        animate.setAttribute('dur', '4s');
        animate.setAttribute('repeatCount', 'indefinite');

        rhombus.appendChild(animate);
        this.svg.appendChild(rhombus);
    }

    createDirectConnection(nodePositions, nodeId1, nodeId2) {
        // Find the two nodes
        const node1 = nodePositions.find(n => n.id === nodeId1);
        const node2 = nodePositions.find(n => n.id === nodeId2);

        if (!node1 || !node2) return;

        // Calculate the vector between the two nodes
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Get node radii (use custom radius if available)
        const node1Radius = (node1.customNodeRadius || 65) * this.scale;
        const node2Radius = (node2.customNodeRadius || 65) * this.scale;

        // Calculate connection points at node edges
        const startX = node1.x + (dx / distance) * node1Radius;
        const startY = node1.y + (dy / distance) * node1Radius;
        const endX = node2.x - (dx / distance) * node2Radius;
        const endY = node2.y - (dy / distance) * node2Radius;

        // Create direct connection line
        const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connectionLine.setAttribute('x1', startX);
        connectionLine.setAttribute('y1', startY);
        connectionLine.setAttribute('x2', endX);
        connectionLine.setAttribute('y2', endY);
        connectionLine.setAttribute('stroke', 'rgba(56,189,248,0.6)'); // Blue color matching Autonomiq
        connectionLine.setAttribute('stroke-width', '2');
        connectionLine.setAttribute('opacity', '0.8');
        connectionLine.classList.add(`direct-connection-${nodeId1}-${nodeId2}`);

        // Add subtle animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('values', '0;10');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');

        connectionLine.appendChild(animate);
        this.svg.appendChild(connectionLine);

        // Add connection dot at midpoint (between edge points)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const connectionDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        connectionDot.setAttribute('cx', midX);
        connectionDot.setAttribute('cy', midY);
        connectionDot.setAttribute('r', '3');
        connectionDot.setAttribute('fill', 'rgba(56,189,248,0.7)');
        connectionDot.setAttribute('filter', 'url(#glow)');
        connectionDot.classList.add(`direct-dot-${nodeId1}-${nodeId2}`);

        // Add pulsing animation to dot
        const dotAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        dotAnimate.setAttribute('attributeName', 'opacity');
        dotAnimate.setAttribute('values', '0.4;1;0.4');
        dotAnimate.setAttribute('dur', '2.5s');
        dotAnimate.setAttribute('repeatCount', 'indefinite');

        connectionDot.appendChild(dotAnimate);
        this.svg.appendChild(connectionDot);
    }

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EcosystemDiagram();
});