import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const cities = [
  { name: 'Stockholm', percent: 81.57, lat: 59.3293, lng: 18.0686, color: '#2563EB' },
  { name: 'Gothenburg', percent: 63.25, lat: 57.7089, lng: 11.9746, color: '#EA580C' },
  { name: 'Malmö', percent: 52.95, lat: 55.605, lng: 13.0038, color: '#10B981' },
  { name: 'Uppsala', percent: 47.29, lat: 59.8586, lng: 17.6389, color: '#9333EA' },
  { name: 'Västerås', percent: 40.12, lat: 59.6091, lng: 16.5448, color: '#F472B6' },
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
    <div className="rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Top Regions</h2>
        <select className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          <option>Today</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2">
          <div className="h-90 w-full overflow-hidden rounded-2xl">
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
        </div>

        <div className="space-y-3">
          {cities.map((city) => (
            <div
              key={city.name}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{city.name}</p>
                <p className="text-xs text-slate-500">{city.percent.toFixed(2)}% users</p>
              </div>
              <div className="w-24">
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${city.percent}%`,
                      backgroundImage: `linear-gradient(90deg, ${city.color}, ${city.color}aa)`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mapcity;
