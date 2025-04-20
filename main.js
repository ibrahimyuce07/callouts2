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

// Session and routing handling
const baseUrl = window.location.hostname === 'ibrahimyuce07.github.io' ? '/callouts2' : '';
const cleanPath = window.location.pathname.replace(baseUrl, '');
const sessionId = cleanPath.substring(1);

// Redirect to new session if no sessionId, considering the base path
if (!sessionId || sessionId === 'callouts2') {
    const newSession = crypto.randomUUID();
    window.location.href = `${baseUrl}/${newSession}`;
}

// WebSocket setup
const isSecure = window.location.protocol === 'https:';
const wsProtocol = isSecure ? 'wss:' : 'ws:';
const hostname = window.location.hostname;

// Use a dedicated WebSocket server for production
const wsHost = hostname === 'ibrahimyuce07.github.io' ? 
    'wss://your-websocket-server.com' :  // Replace with your WebSocket server URL
    hostname === 'calloutscs2.netlify.app' ? 
    'wss://your-websocket-server.com' :  // Replace with your WebSocket server URL
    `${wsProtocol}//${window.location.host}`;

const ws = new WebSocket(`${wsHost}/${sessionId}`);
let userColor = '#ff0000';

// Add active users container to drawing controls
const activeUsersContainer = document.createElement('div');
activeUsersContainer.className = 'active-users';
document.querySelector('.drawing-controls').appendChild(activeUsersContainer);

// Track active users
const activeUsers = new Map();
let userCount = 0;

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'color':
            userColor = data.color;
            colorPicker.value = userColor;
            ctx.strokeStyle = userColor;
            addActiveUser('You', userColor);
            break;
            
        case 'user_joined':
            userCount++;
            addActiveUser(`User ${userCount}`, data.color);
            break;
            
        case 'user_left':
            removeUserByColor(data.color);
            break;
            
        case 'draw':
            if (data.mapName === currentMapName) {
                const currentStyle = ctx.strokeStyle;
                ctx.strokeStyle = data.color;
                
                ctx.beginPath();
                ctx.moveTo(data.startX, data.startY);
                ctx.lineTo(data.endX, data.endY);
                ctx.stroke();
                
                ctx.strokeStyle = currentStyle;
            }
            
            // Store the drawing
            const drawings = mapDrawings.get(data.mapName) || [];
            drawings.push(data);
            mapDrawings.set(data.mapName, drawings);
            break;
            
        case 'clear':
            if (data.mapName === currentMapName) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            mapDrawings.delete(data.mapName);
            break;
            
        case 'load_drawing':
            // Load existing drawings for a map
            mapDrawings.set(data.mapName, data.drawingData);
            if (data.mapName === currentMapName) {
                data.drawingData.forEach(drawing => {
                    ctx.strokeStyle = drawing.color;
                    ctx.beginPath();
                    ctx.moveTo(drawing.startX, drawing.startY);
                    ctx.lineTo(drawing.endX, drawing.endY);
                    ctx.stroke();
                });
                ctx.strokeStyle = userColor;
            }
            break;
    }
};

function addActiveUser(name, color) {
    const userDiv = document.createElement('div');
    userDiv.className = 'active-user';
    userDiv.innerHTML = `
        <span class="user-color" style="background-color: ${color}"></span>
        <span class="user-name">${name}</span>
    `;
    activeUsers.set(color, userDiv);
    activeUsersContainer.appendChild(userDiv);
}

function removeUserByColor(color) {
    const userDiv = activeUsers.get(color);
    if (userDiv) {
        userDiv.remove();
        activeUsers.delete(color);
    }
}

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
    modalTitle.textContent = `${map.name} Callouts`;
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

    // Broadcast to other users
    ws.send(JSON.stringify(drawingData));

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
    ws.send(JSON.stringify({
        type: 'clear',
        mapName: currentMapName
    }));
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