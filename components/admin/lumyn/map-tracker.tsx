import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { prisma } from '@/lib/db';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DeliveryMapProps {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

export function DeliveryMap({ pickup, dropoff, driverLocation }: DeliveryMapProps) {
  const center = [pickup.lat, pickup.lng] as [number, number];

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={center}>
          <Popup>Pickup Location</Popup>
        </Marker>
        <Marker position={[dropoff.lat, dropoff.lng] as [number, number]}>
          <Popup>Dropoff Location</Popup>
        </Marker>
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng] as [number, number]}>
            <Popup>Driver Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
