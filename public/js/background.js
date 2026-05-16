// Ensure canvas context hooks successfully
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

let width, height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
resizeCanvas();

const numNodes = 65;
const nodes = [];
const links = [];

const mouse = { x: null, y: null, radius: 160 };

// 1. Initialize Global System Nodes
for (let i = 0; i < numNodes; i++) {
    nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 2.5,
        color: i % 4 === 0 ? '#6366f1' : '#d0d380' // Dark-mode Indigo & Sky Blue nodes
    });
}

// 2. Build Structural Architecture Links
for (let i = 0; i < nodes.length; i++) {
    let connections = Math.floor(Math.random() * 2) + 1; 
    for (let j = 0; j < connections; j++) {
        let targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i) {
            links.push({ source: nodes[i], target: nodes[targetIndex] });
        }
    }
}

// Global window event triggers
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

window.addEventListener('resize', () => {
    resizeCanvas();
});

// 3. Central Animation Render Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Calculate Node Interactions
    nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Boundary reflection
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Soft Mouse Repulsion
        if (mouse.x !== null) {
            let dx = node.x - mouse.x;
            let dy = node.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                let force = (mouse.radius - dist) / mouse.radius;
                node.x += (dx / dist) * force * 1.5;
                node.y += (dy / dist) * force * 1.5;
            }
        }
    });

    // Draw Framework Links
    ctx.lineWidth = 0.5;
    links.forEach(link => {
        let dx = link.source.x - link.target.x;
        let dy = link.source.y - link.target.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = Math.max(0, 1 - dist / 180);
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    });

    // Draw System Nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Performance optimization reset
    });

    requestAnimationFrame(animate);
}

animate();