const activeMaps = ['dust2', 'train', 'mirage', 'nuke', 'ancient', 'anubis', 'inferno'];

const maps = [
    { name: 'Ancient', image: 'callout_images/ancient.png', active: true },
    { name: 'Anubis', image: 'callout_images/anubis.png', active: true },
    { name: 'Cache', image: 'callout_images/cache.png', active: false },
    { name: 'Cobblestone', image: 'callout_images/cobblestone.webp', active: false },
    { name: 'Dust 2', image: 'callout_images/dust2.jpg', active: true },
    { name: 'Inferno', image: 'callout_images/inferno.png', active: true },
    { name: 'Mirage', image: 'callout_images/mirage.png', active: true },
    { name: 'Nuke', image: 'callout_images/nuke.jpg', active: true },
    { name: 'Overpass', image: 'callout_images/overpass.jpg', active: false },
    { name: 'Train', image: 'callout_images/train.jpg', active: true },
    { name: 'Vertigo', image: 'callout_images/vertigo.png', active: false }
].sort((a, b) => {
    // Sort active maps first, then alphabetically
    if (a.active !== b.active) {
        return b.active ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
});

// Get DOM elements
const mapGrid = document.getElementById('mapGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const closeButton = document.getElementById('closeModal');
const drawButton = document.getElementById('drawButton');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearButton = document.getElementById('clearButton');

let userColor = '#ff0000';
let isDrawing = false;
let currentX = 0;
let currentY = 0;
let currentMapName = '';
const mapDrawings = new Map();

// Create map cards
maps.forEach(map => {
    const mapCard = document.createElement('div');
    mapCard.className = `map-card ${map.active ? 'active' : ''}`;
    
    mapCard.innerHTML = `
        <img src="${map.image}" alt="${map.name} map">
        <h3>${map.name}</h3>
    `;

    mapCard.addEventListener('click', () => openModal(map));
    mapGrid.appendChild(mapCard);
});

// Modal functions
function openModal(map) {
    //modalTitle.textContent = `${map.name} Callouts`;
    modalImage.src = map.image;
    modalImage.alt = `${map.name} callouts`;
    currentMapName = map.name;
    modalOverlay.style.display = 'flex';
    
    // Reset canvas size when modal opens
    modalImage.onload = () => {
        canvas.width = modalImage.naturalWidth;
        canvas.height = modalImage.naturalHeight;
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        drawButton.classList.add('active');
        canvas.classList.add('active');
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw saved drawings for this map
        const drawings = mapDrawings.get(currentMapName) || [];
        drawings.forEach(drawing => {
            ctx.strokeStyle = drawing.color;
            ctx.beginPath();
            ctx.moveTo(drawing.startX, drawing.startY);
            ctx.lineTo(drawing.endX, drawing.endY);
            ctx.stroke();
        });
        
        // Reset to current user's color
        ctx.strokeStyle = userColor;
    };
}

function getScaledCoordinates(e, rect) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Drawing functions
function startDrawing(e) {
    e.preventDefault(); // Prevent scrolling on touch devices
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const coords = getScaledCoordinates(e, rect);
    currentX = coords.x;
    currentY = coords.y;
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const coords = getScaledCoordinates(e, rect);

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(coords.x, coords.y);  // Update both X and Y coordinates
    ctx.stroke();

    // Store drawing data
    const drawingData = {
        type: 'draw',
        startX: currentX,
        startY: currentY,
        endX: coords.x,
        endY: coords.y,
        color: ctx.strokeStyle,
        mapName: currentMapName
    };

    // Store locally
    const drawings = mapDrawings.get(currentMapName) || [];
    drawings.push(drawingData);
    mapDrawings.set(currentMapName, drawings);

    currentX = coords.x;
    currentY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
}

// Event listeners for both mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Add touch event listeners
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// Prevent default touch behavior to avoid scrolling while drawing
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => e.preventDefault());

// Tool button events
drawButton.addEventListener('click', () => {
    drawButton.classList.toggle('active');
    canvas.classList.toggle('active');
});

// Update color picker to broadcast color changes
colorPicker.addEventListener('change', (e) => {
    ctx.strokeStyle = e.target.value;
    userColor = e.target.value;
});

brushSize.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mapDrawings.delete(currentMapName);
});

// Add share button to controls
const shareButton = document.createElement('button');
shareButton.textContent = 'Share Link';
shareButton.className = 'tool-button';
shareButton.onclick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
};
document.querySelector('.drawing-controls').appendChild(shareButton);

// Close modal events
closeButton.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});