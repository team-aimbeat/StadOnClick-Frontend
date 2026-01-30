import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

type MapProps = {
  lat: number;
  lng: number;
  name: string;
};

export function LocationMap({ lat, lng, name }: MapProps) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-3xl border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lng]}>
          <Popup>
         {name}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
