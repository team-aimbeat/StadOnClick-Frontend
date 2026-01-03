import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

type City = {
  name: string;
  percent: number;
  lat: number;
  lng: number;
  color: string;
};

const cities: City[] = [
  {
    name: 'Stockholm',
    percent: 81.57,
    lat: 59.3293,
    lng: 18.0686,
    color: '#3B82F6', // blue
  },
  {
    name: 'Gothenburg',
    percent: 63.25,
    lat: 57.7089,
    lng: 11.9746,
    color: '#9333EA', // purple
  },
  {
    name: 'Malmö',
    percent: 52.95,
    lat: 55.605,
    lng: 13.0038,
    color: '#FACC15', // yellow
  },
  {
    name: 'Uppsala',
    percent: 47.29,
    lat: 59.8586,
    lng: 17.6389,
    color: '#10B981', // green
  },
];

const createMarker = (color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 0 6px ${color}33;
      "></div>
    `,
  });

const Mapcity: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Top cities
        </h3>
        <h3 className="text-sm font-semibold text-gray-900">
          Vendor List 
        </h3>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT: City list */}
        <div className="space-y-4">
          {cities.map((city) => (
            <div key={city.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: city.color }}
                  />
                  <span className="text-gray-700">{city.name}</span>
                </div>
                <span className="text-gray-900  font-medium">
                  {city.percent}%
                </span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${city.percent}%`,
                    backgroundColor: city.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Sweden Map */}
        <div className="h-[240px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[62, 15]}
            zoom={5}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {cities.map((city) => (
              <Marker
                key={city.name}
                position={[city.lat, city.lng]}
                icon={createMarker(city.color)}
              >
                <Popup>
                  <div className="text-sm font-medium">
                    {city.name} – {city.percent}%
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Mapcity;
