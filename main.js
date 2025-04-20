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
const closeButton = document.getElementById('closeModal');

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
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    modalOverlay.style.display = 'none';
}

// Close modal when clicking close button
closeButton.addEventListener('click', closeModal);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});