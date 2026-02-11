import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

type RegionItem = {
  name: string;
  percent: number;
};

type MapCityItem = RegionItem & {
  lat: number;
  lng: number;
  color: string;
};

type MapcityProps = {
  regions?: RegionItem[];
};

const defaultCities: RegionItem[] = [
  { name: 'Stockholm', percent: 81.57 },
  { name: 'Gothenburg', percent: 63.25 },
  { name: 'Malmo', percent: 52.95 },
  { name: 'Uppsala', percent: 47.29 },
  { name: 'Vasteras', percent: 40.12 },
];

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  stockholm: { lat: 59.3293, lng: 18.0686 },
  gothenburg: { lat: 57.7089, lng: 11.9746 },
  goteborg: { lat: 57.7089, lng: 11.9746 },
  malmo: { lat: 55.605, lng: 13.0038 },
  uppsala: { lat: 59.8586, lng: 17.6389 },
  vasteras: { lat: 59.6091, lng: 16.5448 },
  orebro: { lat: 59.2753, lng: 15.2134 },
  linkoping: { lat: 58.4108, lng: 15.6214 },
  helsingborg: { lat: 56.0465, lng: 12.6945 },
  jonkoping: { lat: 57.7826, lng: 14.1618 },
};

const markerColors = ['#2563EB', '#EA580C', '#10B981', '#9333EA', '#F472B6', '#14B8A6'];

const normalizeRegionName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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

const Mapcity: React.FC<MapcityProps> = ({ regions }) => {
  const source = regions?.length ? regions : defaultCities;
  const cities: MapCityItem[] = source.map((city, index) => {
    const coords = cityCoordinates[normalizeRegionName(city.name)] ?? { lat: 58.5, lng: 15.5 };
    return {
      ...city,
      lat: coords.lat,
      lng: coords.lng,
      color: markerColors[index % markerColors.length],
    };
  });

  return (
    <div className="rounded-lg  border min-h-137.5 border-slate-200 bg-white p-5 ">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Top Regions</h2>
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
                  key={`${city.name}-${city.lat}-${city.lng}`}
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
