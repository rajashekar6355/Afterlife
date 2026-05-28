// Ecosystem data configuration
const ecosystemData = {
    center: {
        id: 'afterlife',
        label: 'AFTERLIFE',
        sublabel: 'BUILDING WHAT\'S NEXT',
        color: '#6478ff',
        glowColor: 'rgba(100,120,255,0.5)',
        radius: 88
    },

    nodes: [
        {
            id: 'autonomic',
            label: 'AUTONOMIC',
            sublabel: 'AI SOLUTIONS',
            angle: 0, // Top
            color: '#38bdf8',
            glowColor: 'rgba(56, 189, 248, 0.35)',
            description: ['AI-Powered Solutions', 'Driving Autonomous', 'Innovation'],
            icon: 'brain',
            customNodeRadius: 76,
            customRadius: 300
        },
        {
            id: 'workoaches',
            label: 'WORKOACHES',
            sublabel: 'HR SOLUTIONS',
            angle: 60, // Top-Right (changed from 70)
            color: '#2dd4bf',
            glowColor: 'rgba(45, 212, 191, 0.35)',
            description: ['People. Growth.', 'Performance.', 'Redefined.'],
            icon: 'w_logo',
            customRadius: 375,
            customNodeRadius: 76
        },
        {
            id: 'global',
            label: 'GLOBAL',
            sublabel: 'PARTNERSHIPS',
            angle: 120, // Bottom-Right (changed from 110)
            color: '#60a5fa',
            glowColor: 'rgba(96, 165, 250, 0.35)',
            description: ['Strategic Alliances,', 'Global Impact'],
            icon: 'handshake',
            customRadius: 375,
            customNodeRadius: 76
        },
        {
            id: 'future',
            label: 'FUTURE',
            sublabel: 'VENTURES',
            angle: 180, // Bottom
            color: '#38bdf8',
            glowColor: 'rgba(56, 189, 248, 0.3)',
            description: ['Exploring Tomorrow.', 'Building the Future.'],
            icon: 'rocket',
            customNodeRadius: 80,
            customRadius: 290
        },
        {
            id: 'afterlife-ar',
            label: 'AFTERLIFE AR',
            sublabel: 'AR / XR GAMING',
            angle: 240, // Bottom-Left (changed from 250)
            color: '#a78bfa',
            glowColor: 'rgba(167, 139, 250, 0.3)',
            description: ['Immersive AR Experiences', '& Next-Gen Gaming'],
            icon: 'cube',
            customRadius: 375,
            customNodeRadius: 80
        },
        {
            id: 'scanme',
            label: 'SCANME',
            sublabel: 'RESTAURANT TECH',
            angle: 300, // Top-Left (changed from 290)
            color: '#fb923c',
            glowColor: 'rgba(251, 146, 60, 0.3)',
            description: ['Smart Ordering,', 'Reservations &', 'Restaurant Solutions'],
            icon: 'scan',
            customRadius: 375,
            customNodeRadius: 80
        }
    ],

    // Configuration
    config: {
        orbitRadius: 350,
        nodeRadius: 55,
        centerRadius: 105,
        animationDuration: 2000,
        hoverScale: 1.1
    }
};

// SVG Icons as strings
const icons = {
    scan: `<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
        <!-- Food cloche/dome -->
        <path d="M12 2c5 0 9 3.5 9 7.5v0.5H3v-0.5C3 5.5 7 2 12 2z" fill="currentColor"/>
        <rect x="3" y="10" width="18" height="2" fill="currentColor"/>
        <circle cx="12" cy="2.5" r="0.8" fill="currentColor"/>
        
        <!-- QR Code Grid -->
        <rect x="6" y="14" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="8.5" y="14" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="11" y="14" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="16" y="14" width="1.5" height="1.5" fill="currentColor"/>
        
        <rect x="6" y="16.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="11" y="16.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="13.5" y="16.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="16" y="16.5" width="1.5" height="1.5" fill="currentColor"/>
        
        <rect x="8.5" y="19" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="11" y="19" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="16" y="19" width="1.5" height="1.5" fill="currentColor"/>
        
        <rect x="6" y="21.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="8.5" y="21.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="13.5" y="21.5" width="1.5" height="1.5" fill="currentColor"/>
        <rect x="16" y="21.5" width="1.5" height="1.5" fill="currentColor"/>
    </svg>`,

    brain: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z"/>
    </svg>`,

    w_logo: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 6l4 12 4-9 4 9 4-12" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 8l4 9 4-9" opacity="0.65" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    handshake: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
        <path d="m21 3 1 11h-2"/>
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
        <path d="M3 4h8"/>
    </svg>`,

    rocket: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>`,

    cube: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.29 7 12 12 20.71 7"/>
        <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>`
};