'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Car, PawPrint, FileText, Info } from 'lucide-react';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/panoptes_logo.png',
  iconUrl: '/panoptes_logo.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'Persona': return '👤';
    case 'Vehículo': return '🚗';
    case 'Mascota': return '🐕';
    case 'Documento': return '📄';
    case 'Dispositivos': return '📱';
    case 'Ropa': return '👕';
    default: return '📦';
  }
};

const getDynamicIcon = (category: string) => {
  const emoji = getCategoryEmoji(category);
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <img src="/panoptes_logo.png" style="width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5);" />
        <div style="position: absolute; bottom: -5px; right: -5px; background: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid #ff7e33;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
}

interface Report {
  id: string;
  type: string;
  title?: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  eventDate?: string;
  createdAt?: string;
  sightings: Sighting[];
  name?: string;
  petType?: string;
  brandModel?: string;
  color?: string;
  licensePlate?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Persona': return <User size={18} />;
    case 'Vehículo': return <Car size={18} />;
    case 'Mascota': return <PawPrint size={18} />;
    case 'Documento': return <FileText size={18} />;
    default: return <Info size={18} />;
  }
};

export default function PanoptesMap({ reports, centerLat, centerLng }: { reports: Report[], centerLat: number, centerLng: number }) {
  const MapCenterUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (centerLat && centerLng) {
        map.setView([centerLat, centerLng], map.getZoom(), { animate: true });
      }
    }, [centerLat, centerLng, map]);
    return null;
  };

  return (
    <MapContainer center={[centerLat || 4.6097, centerLng || -74.0817]} zoom={13} style={{ width: '100%', height: '100%', background: '#111', zIndex: 0 }}>
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapCenterUpdater />
      
      {reports.map((report) => {
        // Build the route coordinates: report origin -> sighting 1 -> sighting 2 ...
        const routePositions: [number, number][] = [
          [report.latitude, report.longitude],
          ...(report.sightings || []).map(s => [s.latitude, s.longitude] as [number, number])
        ];

        return (
          <div key={report.id}>
            {/* Main Report Marker */}
            <Marker position={[report.latitude, report.longitude]} icon={getDynamicIcon(report.category)}>
              <Popup>
                <div style={{ color: '#111', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <div style={{ background: report.type === 'FOUND' ? '#33cc66' : '#ff5533', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                      {getCategoryIcon(report.category)}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', margin: 0 }}>
                        {report.category === 'Mascota' && report.name ? `${report.petType || 'Mascota'}: ${report.name}`
                          : report.category === 'Persona' && report.name ? report.name
                          : report.name ? `${report.category}: ${report.name}`
                          : report.brandModel ? report.brandModel
                          : report.category}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>
                        {report.type === 'FOUND' ? 'ME ENCONTRÉ ALGO' : 'PERDIDO'}
                      </span>
                    </div>
                  </div>
                  
                  {report.eventDate && (
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>
                      <strong>Fecha:</strong> {new Date(report.eventDate).toLocaleDateString()}
                    </div>
                  )}

                  {(report.color || report.licensePlate) && (
                    <div style={{ fontSize: '0.8rem', color: '#333' }}>
                      {report.color && <span><strong>Color:</strong> {report.color} <br/></span>}
                      {report.licensePlate && <span><strong>Placa:</strong> {report.licensePlate}</span>}
                    </div>
                  )}

                  <p style={{ margin: '4px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {report.description?.length > 80 ? report.description.slice(0, 80) + '...' : report.description}
                  </p>

                  <a 
                    href={`/reporte/${report.id}`} 
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#111',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      marginTop: '8px'
                    }}
                  >
                    Ver detalles del caso
                  </a>
                </div>
              </Popup>
            </Marker>

            {/* Sighting Markers */}
            {(report.sightings || []).map((sighting, idx) => (
              <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]} icon={getDynamicIcon(report.category)}>
                <Popup>
                  <div style={{ color: '#111' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Avistamiento #{idx + 1}</strong>
                    <a href={`/reporte/${report.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
                      Ir al caso para ver más detalles
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Connecting Polyline if sightings exist */}
            {(report.sightings || []).length > 0 && (
              <Polyline 
                positions={routePositions} 
                color="#ff7e33" 
                weight={3} 
                dashArray="5, 10" 
              />
            )}
          </div>
        );
      })}
    </MapContainer>
  );
}
