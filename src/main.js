const maps = [
    { name: 'Ancient', image: '../callout_images/ancient.webp' },
    { name: 'Cache', image: '../callout_images/cache.webp' },
    { name: 'Cobblestone', image: '../callout_images/cobblestone.webp' },
    { name: 'Dust 2', image: '../callout_images/dust2.webp' },
    { name: 'Inferno', image: '../callout_images/inferno.webp' },
    { name: 'Mirage', image: '../callout_images/mirage.webp' },
    { name: 'Nuke', image: '../callout_images/nuke.webp' },
    { name: 'Overpass', image: '../callout_images/overpass.webp' },
    { name: 'Train', image: '../callout_images/train.webp' },
    { name: 'Vertigo', image: '../callout_images/vertigo.webp' }
];

// Get DOM elements
const mapGrid = document.getElementById('mapGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');

// Create map cards
maps.forEach(map => {
    const mapCard = document.createElement('div');
    mapCard.className = 'map-card';
    
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

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});