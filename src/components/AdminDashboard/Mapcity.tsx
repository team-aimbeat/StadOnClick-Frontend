import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { HiMapPin } from 'react-icons/hi2';

const cities = [
  { name: 'Stockholm', percent: 81.57, lat: 59.3293, lng: 18.0686, color: '#3B82F6' },
  { name: 'Gothenburg', percent: 63.25, lat: 57.7089, lng: 11.9746, color: '#9333EA' },
  { name: 'Malmo', percent: 52.95, lat: 55.605, lng: 13.0038, color: '#FACC15' },
  { name: 'Uppsala', percent: 47.29, lat: 59.8586, lng: 17.6389, color: '#10B981' },
];

const createMarker = (color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 0 6px ${color}33;
      "></div>
    `,
  });

const Mapcity: React.FC = () => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white p-4 shadow-sm min-w-[280px] max-w-sm">
      <div className="h-40 overflow-hidden rounded-2xl border border-slate-100">
        <MapContainer
          center={[58.0, 15]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {cities.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lng]}
              icon={createMarker(city.color)}
            />
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 space-y-3 px-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <HiMapPin className="h-5 w-5 text-sky-500" />
          <span>Top cities</span>
        </div>

        <div className="space-y-3">
          {cities.map((city) => (
            <div key={city.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-3 w-3 rounded-full"
                    style={{ backgroundColor: city.color }}
                  />
                  <span className="text-slate-900">{city.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{city.percent.toFixed(2)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${city.percent}%`,
                    backgroundImage: `linear-gradient(90deg, ${city.color}, ${city.color}aa)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mapcity;
