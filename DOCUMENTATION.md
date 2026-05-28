# Afterlife Ecosystem: Interactive Web Visualization
## Developer & AI Integration Documentation

This document provides a highly detailed architectural overview, file-by-file logic breakdown, and implementation guide for the **Afterlife Ecosystem** visualization. It is designed to allow any future developer or AI agent to quickly understand, debug, modify, and extend the codebase.

---

## 📂 File Architecture

The codebase consists of a lightweight, highly optimized static frontend application utilizing HTML5, SVG (Scalable Vector Graphics), Vanilla CSS, and modern asynchronous JavaScript.

```
Afterlife/
├── index.html            # Main viewport entry point, layout wrappers, and navigation
├── test.html             # Staging/development page for testing upgrades
├── style.css             # CSS Design System (dark theme, glow filters, telemetry HUD)
├── ecosystem-data.js     # Nodes, descriptions, and icon asset definitions (JSON/SVG)
├── ecosystem.js          # Core SVG rendering, animation timeline, and hover logic
└── stars.js              # Parallax starfield, twinkling, astronaut, and satellite drift
```

---

## 📊 1. Data Configuration (`ecosystem-data.js`)

All node metadata, custom metrics, and graphic icons reside in [ecosystem-data.js](file:///home/rajashekar/Desktop/Afterlifewebsite/Afterlife/ecosystem-data.js). This separates the data layer from the rendering logic.

### Data Structure Schema
The configuration exports a single global object `ecosystemData` containing:
*   `center`: Configures the central hub (black hole / Gargantua).
*   `nodes`: An array of satellite nodes orbiting the hub.
*   `config`: Global configuration thresholds.

#### Satellite Node Parameters
When adding or modifying a node in the `nodes` array, the following properties are available:
*   `id` *(string)*: Unique identifier (e.g., `'autonomic'`). Must match the data-node selectors.
*   `label` *(string)*: Display name in all caps (e.g., `'AUTONOMIC'`).
*   `sublabel` *(string)*: Explanatory sub-text (e.g., `'AI SOLUTIONS'`).
*   `angle` *(number)*: Radial position in degrees (0 is top-center, moving clockwise: 60, 120, 180, 240, 300).
*   `color` *(string)*: Hex code for primary neon highlights (e.g., `'#38bdf8'`).
*   `glowColor` *(string)*: Translucent rgba equivalent for shadow blur properties.
*   `description` *(string array)*: Multiline description text showing outside the node bounds.
*   `icon` *(string)*: Key of the SVG path defined in the global `icons` dictionary.
*   `customRadius` *(number)*: Radial distance from center in pixels. Stretches nodes into a vertical hexagon.
*   `customNodeRadius` *(number)*: The diameter scale of the node's background circle.

### How to Add a New Node
1. Define the SVG icon in the `icons` registry object at the bottom of the file.
2. Append a new object inside the `nodes` array:
```javascript
{
    id: 'custom-node',
    label: 'INTELLIGENCE',
    sublabel: 'DATA LAKE',
    angle: 90, // Custom angle
    color: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.3)',
    description: ['Next-Gen Analytics', 'Big Data Hubs'],
    icon: 'brain', // references icons.brain
    customRadius: 350,
    customNodeRadius: 76
}
```

---

## 🎨 2. Styling, Glows & HUD (`style.css`)

[style.css](file:///home/rajashekar/Desktop/Afterlifewebsite/Afterlife/style.css) defines the visual style, including typography, colors, animations, and the scifi telemetry cockpit HUD overlay.

### Typography
Imports and uses two fonts from Google Fonts:
*   `Space Grotesk`: Wide, geometric, monospaced-feeling header font for scifi titles, UI elements, and logo text.
*   `Outfit`: Sleek, clean body font for descriptions and interactive labels.

### Layout System (105vh Height Limit)
To prevent clipping and force a fullscreen look:
*   `body` height is locked at `105vh` on desktop screens.
*   `hero-section` and `ecosystem-container` use flexbox vertical constraints (`flex: 1; height: 0`) to dynamically size the SVG viewport based on actual screen size.
*   Media queries override height restrictions on screens `<= 768px` (mobile fallbacks) to scroll naturally.

### SVG Glow Filters
We use a high-intensity dual-glow system. Instead of default element bounding boxes, we use `filterUnits="userSpaceOnUse"` inside [ecosystem.js](file:///home/rajashekar/Desktop/Afterlifewebsite/Afterlife/ecosystem.js) to prevent clipping on zero-width lines:
*   **Narrow Blur**: `stdDeviation * 0.65` for a sharp neon core.
*   **Wide Blur**: `stdDeviation * 1.85` for soft environmental lighting.
*   The blurs are merged and layered twice to increase saturation before overlaying the original element.

---

## ⚙️ 3. Core Rendering & Animation Engine (`ecosystem.js`)

This is the main application file. It compiles coordinates, injects SVG elements, handles scaling, triggers interactive hover states, and manages the staggered loading timeline.

### Initialization Sequence
1.  **`setupDimensions()`**: Computes scale ratios based on parent container height/width, storing the multipliers in `this.scale`.
2.  **`createSVGStructure()`**: Injects the XML gradient defs and glowing filters into the SVG head.
3.  **`renderDiagram()`**: Computes node positions and appends connection lines, black hole groups, logo scramblers, and satellite structures.
4.  **`setupEventListeners()`**: Listens to hovers and updates coordinates on browser resize.
5.  **`startAnimations()`**: Orchestrates the timeline.

### Mathematical Coordinate Conversions
SVG maps coordinates relative to the top-left `(0, 0)`. We translate these coordinates to center `(cx, cy)`:
```javascript
degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}

getNodePosition(angle, radius, centerX, centerY) {
    const rad = this.degToRad(angle - 90); // Subtract 90 to place 0 degrees at top-center
    return {
        x: centerX + radius * Math.cos(rad),
        y: centerY + radius * Math.sin(rad)
    };
}
```

### Gargantua (Black Hole) Design
The center hub uses three nested elements to simulate gravitational lensing:
1.  **Accretion Disk Ellipse**: Warp disk (`rx = centerRadius * 2.3`, `ry = centerRadius * 0.35`) rotated by `-12deg` with a pulsing stroke width animation.
2.  **Einstein Lensing Ring**: Outer circle representing light warp (`radius = centerRadius * 1.16`) rotating continuously.
3.  **Event Horizon**: Deep black center circle (`#010205`) with golden outer border.

### Animation Timeline Lifecycle
The entrance transition uses a strict staggered loading path:

| Time offset | Action | Code Trigger |
| :--- | :--- | :--- |
| **0.0s – 2.0s** | Main logo fades in; `AFTERLIFE` title scramble-decodes. | `scrambleText(mainText, 1800, 200)` |
| **1.5s – 3.3s** | Subtitle `BUILDING WHAT'S NEXT` scramble-decodes. | `scrambleText(subText, 1800, 1500)` |
| **3.5s – 5.1s** | Gargantua event horizon scales up from `0` to `1`. | `centerNodeGroup.style.transform = 'scale(1)'` |
| **5.2s – 8.7s** | Randomized Node Ejections start. Ejection particles shoot from center; connection lines self-draw (`stroke-dashoffset` animates to `0`). | Staggered loop: `5200 + i * 450` |
| **8.7s – 9.0s** | Node lands at coordinates, flashes, and triggers expanding ripple ring. | `.landing-ripple` class animation |
| **9.0s – 9.5s** | Outer ring constellation lines draw in a random order/direction. | `constellationLines` randomized sweep |
| **9.5s+** | Nodes scale-ready; hovers, sonar waves, and trackers activate. | `.ready` class added to node groups |

### Crucial SVG Rendering Bug Fixes (Keep for Reference)
> [!IMPORTANT]
> **Perfect Vertical/Horizontal Line Bounding Box Bug**
> In SVG, a line that is perfectly vertical (`x1 === x2`) or horizontal (`y1 === y2`) has a bounding box dimensions of `0`. Applying a blur filter defaults to calculating bounds relative to this bounding box, making the line invisible.
> To prevent this, two techniques are enforced in the codebase:
> 1.  **`userSpaceOnUse`**: Glow filters explicitly configure `filterUnits="userSpaceOnUse"` so rendering boundaries use the viewport space instead of the element's bounding box.
> 2.  **Coordinate Shift Buffer**: In `createConnectionLine()`, target coordinates are modified by a tiny offset (`0.01px`) if they are aligned vertically/horizontally:
>     ```javascript
>     const targetX = Math.abs(x2 - cx) < 0.01 ? x2 + 0.01 : x2;
>     const targetY = Math.abs(y2 - cy) < 0.01 ? y2 + 0.01 : y2;
>     ```
>     This creates a non-zero bounding box dimension, forcing the browser to render the glowing line.

### Constellation Network Randomization Logic
To prevent linear clockwise drawing, two randomization matrices are used:
1.  **Stagger Order Shuffling**: The array of constellation segments is randomized using a Fisher-Yates shuffle:
    ```javascript
    for (let i = constellationLinesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [constellationLinesArray[i], constellationLinesArray[j]] = [constellationLinesArray[j], constellationLinesArray[i]];
    }
    ```
2.  **Draw Direction Shuffling**: Within `createConstellationLine()` and `createSegment()`, coordinates are randomly swapped before rendering:
    ```javascript
    const swapDirection = Math.random() > 0.5;
    const startX = swapDirection ? x2 : x1;
    const endX = swapDirection ? x1 : x2;
    ```
    This forces some segments to draw clockwise and others anticlockwise, creating an organic visual build.

---

## 🌌 4. Cosmic Background Engine (`stars.js`)

This script handles the canvas-like starfield simulation in deep space.

### Parallax Layering
Stars are divided into three HTML wrapper divs (`.stars-layer-1`, `2`, `3`) containing absolute-positioned span elements. CSS animations drift these containers at varying velocities (`180s`, `120s`, `70s`) relative to each other, rendering a high-quality spatial depth (parallax scroll).

### Dynamic Element Generators
*   **Twinkling**: Random sizes and twilights are assigned using custom classes (`.small`, `.medium`, `.large`, `.bright`).
*   **Shooting Stars**: Appends absolute lines that travel diagonally, fade, and self-destruct via `setTimeout(..., removalDelay)`.
*   **Astronaut & Satellite**: Drift diagonally across the browser window in long, slow orbits (`80s` and `55s` durations) using hardware-accelerated CSS translate transforms.

---

## 🛠️ Developer Checklist for Future Changes

*   **To change line colors or thickness**: Update the `.connection-line` styles in [style.css](file:///home/rajashekar/Desktop/Afterlifewebsite/Afterlife/style.css) or modify the attributes in `createConnectionLine` inside [ecosystem.js](file:///home/rajashekar/Desktop/Afterlifewebsite/Afterlife/ecosystem.js).
*   **To adjust entrance speeds**: Modify timeouts inside `startAnimations()`. Ensure the constellation network delay (currently `9000ms`) is greater than the total staggered ejection duration (`5200 + nodes.length * 450`).
*   **To adjust viewport sizes**: Edit container dimensions inside `setupDimensions()`. The system computes scale modifiers dynamically based on viewport width/height relative to default proportions.
