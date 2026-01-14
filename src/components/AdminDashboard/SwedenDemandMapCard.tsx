import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import AdminCardShell from "./AdminCardShell";

type City = {
  name: string;
  percent: number;
  lat: number;
  lng: number;
  color: string;
};

const cities: City[] = [
  { name: "Stockholm", percent: 81.57, lat: 59.3293, lng: 18.0686, color: "#2563EB" },
  { name: "Gothenburg", percent: 63.25, lat: 57.7089, lng: 11.9746, color: "#EA580C" },
  { name: "Malmo", percent: 52.95, lat: 55.605, lng: 13.0038, color: "#10B981" },
  { name: "Uppsala", percent: 47.29, lat: 59.8586, lng: 17.6389, color: "#9333EA" },
  { name: "Vasteras", percent: 40.12, lat: 59.6091, lng: 16.5448, color: "#F472B6" },
];

const swedenBounds: [[number, number], [number, number]] = [
  [55, 10],
  [69.5, 25.5],
];

const createMarker = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background: ${color};
        border-radius: 50%;
        border: 5px solid ${color}1a;
      "></div>
    `,
  });

const SwedenDemandMapCard = () => {
  return (
    <AdminCardShell title="Demand by City (SE)" subtitle="Bookings distribution">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
            Top Regions
          </h2>
          <select className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            <option>Today</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="h-full min-h-[260px] w-full overflow-hidden rounded-lg">
              <MapContainer
                center={[58.0, 15]}
                zoom={5}
                minZoom={4.5}
                maxZoom={7}
                maxBounds={swedenBounds}
                maxBoundsViscosity={1}
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

          <div className="flex h-full flex-col gap-3">
            {cities.map((city) => (
              <div
                key={city.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
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
    </AdminCardShell>
  );
};

export default SwedenDemandMapCard;
