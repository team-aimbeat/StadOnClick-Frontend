import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Search, MapPin, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type LocationPickerProps = {
  label?: string;
  helperText?: string;
  value?: { lat: number | null; lng: number | null };
  onChange: (coords: { lat: number; lng: number; address?: string }) => void;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.35 });
    }
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  label = "Service location",
  helperText = "Search for an address or drop a pin on the map.",
  value,
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeResult, setActiveResult] = useState(-1);
  const [hasTyped, setHasTyped] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (value?.lat && value?.lng) return [value.lat, value.lng];
    return [28.6139, 77.209]; // Default to New Delhi until user sets location
  }, [value?.lat, value?.lng]);

  const handleSearch = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) {
      setResults([]);
      setActiveResult(-1);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    setError(null);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", trimmed);
      url.searchParams.set("limit", "6");
      url.searchParams.set("addressdetails", "1");
      const response = await fetch(url.toString(), {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "StadOnClick/1.0 (support@stadonclick.local)",
        },
        signal: controller.signal,
      });
      const data = (await response.json()) as SearchResult[];
      setResults(data);
      setActiveResult(data.length ? 0 : -1);
      if (!data.length) {
        setError("No locations found. Try a nearby landmark.");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Unable to search location right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (item: SearchResult) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    onChange({ lat, lng, address: item.display_name });
    setQuery(item.display_name);
    setResults([]);
    setActiveResult(-1);
    setHasTyped(false);
  };

  // Debounced search as user types (matches geofence modal behavior)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query || query.trim().length < 3) {
      setResults([]);
      setActiveResult(-1);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setResults([]);
        setActiveResult(-1);
        setHasTyped(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({ lat, lng, address: "Current location" });
        setQuery("Current location");
        setResults([]);
        setActiveResult(-1);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError(err.message || "Unable to fetch current location.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{helperText}</p>
        </div>
        {value?.lat && value?.lng ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <MapPin className="h-4 w-4 text-blue-600" />
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        ) : null}
      </div>

      <div className="relative mb-12" ref={dropdownRef}>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200/60">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHasTyped(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (activeResult >= 0 && results[activeResult]) {
                  selectResult(results[activeResult]);
                }
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveResult((prev) =>
                  results.length ? Math.min(prev + 1, results.length - 1) : -1
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveResult((prev) => (prev <= 0 ? -1 : prev - 1));
              }
            }}
            placeholder="Search for a location or landmark"
            className="flex-1 border-0 bg-transparent text-sm text-slate-800 shadow-none focus-visible:ring-0 focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            title="Use my current location"
          >
            <Crosshair className="h-4 w-4" />
            {isLocating ? "Locating..." : "My location"}
          </button>
        </div>
        {(hasTyped || isSearching) && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-150">
            {isSearching && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
                <Search className="h-4 w-4 animate-pulse text-slate-400" />
                Searching...
              </div>
            )}
            {!isSearching && results.length > 0 ? (
              <ScrollArea className="max-h-60">
                {results.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lon}`}
                    type="button"
                    onClick={() => selectResult(item)}
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50",
                      idx === activeResult && "bg-slate-100"
                    )}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span className="leading-tight">{item.display_name}</span>
                  </button>
                ))}
              </ScrollArea>
            ) : null}
            {!isSearching && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500">
                {error ? error : "Keep typing to find a location (min 2 letters)."}
              </div>
            )}
          </div>
        )}
        {error && !isSearching && results.length > 0 ? (
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        ) : null}
      </div>

      <div className="relative z-0 h-64 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {value?.lat && value?.lng ? (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng();
                  onChange({ lat, lng });
                },
              }}
            />
          ) : null}
          <RecenterOnChange lat={value?.lat ?? null} lng={value?.lng ?? null} />
          <MapClickHandler
            onSelect={(lat, lng) => {
              onChange({ lat, lng });
            }}
          />
        </MapContainer>
        <button
          type="button"
          onClick={() => {
            if (abortRef.current) abortRef.current.abort();
            onChange({ lat: center[0], lng: center[1] });
          }}
          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow"
        >
          <MapPin className="h-4 w-4 text-blue-600" />
          Drop pin here
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Tip: Search first, then fine-tune by clicking the map. Coordinates are captured automatically.
      </p>
    </div>
  );
}
