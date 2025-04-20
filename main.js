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

let isDrawing = false;
let currentX = 0;
let currentY = 0;

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
    };
}

function getScaledCoordinates(e, rect) {
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Drawing functions
function startDrawing(e) {
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
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    currentX = coords.x;
    currentY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Tool button events
drawButton.addEventListener('click', () => {
    drawButton.classList.toggle('active');
    canvas.classList.toggle('active');
});

colorPicker.addEventListener('change', (e) => {
    ctx.strokeStyle = e.target.value;
});

brushSize.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Close modal events
closeButton.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});