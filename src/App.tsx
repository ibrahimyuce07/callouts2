import { useState } from 'react'
import './App.css'
import Modal from './components/Modal'

// Import all map images
import ancient from '../callout_images/ancient.webp'
import cache from '../callout_images/cache.webp'
import cobblestone from '../callout_images/cobblestone.webp'
import dust2 from '../callout_images/dust2.webp'
import inferno from '../callout_images/inferno.webp'
import mirage from '../callout_images/mirage.webp'
import nuke from '../callout_images/nuke.webp'
import overpass from '../callout_images/overpass.webp'
import train from '../callout_images/train.webp'
import vertigo from '../callout_images/vertigo.webp'

type MapInfo = {
  name: string;
  image: string;
}

const maps: MapInfo[] = [
  { name: 'Ancient', image: ancient },
  { name: 'Cache', image: cache },
  { name: 'Cobblestone', image: cobblestone },
  { name: 'Dust 2', image: dust2 },
  { name: 'Inferno', image: inferno },
  { name: 'Mirage', image: mirage },
  { name: 'Nuke', image: nuke },
  { name: 'Overpass', image: overpass },
  { name: 'Train', image: train },
  { name: 'Vertigo', image: vertigo }
];

function App() {
  const [selectedMap, setSelectedMap] = useState<MapInfo | null>(null);

  return (
    <div className="container">
      <h1>CS2 Map Callouts</h1>
      <div className="map-grid">
        {maps.map((map) => (
          <div 
            key={map.name}
            className="map-card"
            onClick={() => setSelectedMap(map)}
          >
            <img src={map.image} alt={`${map.name} map`} />
            <h3>{map.name}</h3>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={selectedMap !== null}
        onClose={() => setSelectedMap(null)}
      >
        {selectedMap && (
          <>
            <h2>{selectedMap.name} Callouts</h2>
            <img 
              src={selectedMap.image} 
              alt={`${selectedMap.name} callouts`} 
              className="large-map"
            />
          </>
        )}
      </Modal>
    </div>
  )
}

export default App
