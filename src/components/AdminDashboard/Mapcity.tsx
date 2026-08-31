import React, { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {
  HiOutlineBuildingStorefront,
  HiOutlineChartBar,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type RegionItem = {
  name: string;
  percent: number;
  users?: number;
  orders?: number;
  revenue?: number;
  activeVendors?: number;
  topCategory?: string;
};

type MapCityItem = RegionItem & {
  lat: number;
  lng: number;
  color: string;
};

type MapcityProps = {
  regions?: RegionItem[];
  period?: 'today' | 'weekly' | 'monthly';
  onPeriodChange?: (period: 'today' | 'weekly' | 'monthly') => void;
  isLoading?: boolean;
};

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

const periodLabels: Record<'today' | 'weekly' | 'monthly', string> = {
  today: 'Today',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const metricCards = [
  {
    key: 'users',
    label: 'Users',
    icon: HiOutlineUserGroup,
    toneClass: 'text-sky-700',
    bgClass: 'from-sky-500/15 to-blue-500/5',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: HiOutlineShoppingBag,
    toneClass: 'text-violet-700',
    bgClass: 'from-violet-500/15 to-purple-500/5',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: HiOutlineChartBar,
    toneClass: 'text-emerald-700',
    bgClass: 'from-emerald-500/15 to-green-500/5',
  },
  {
    key: 'activeVendors',
    label: 'Active Vendors',
    icon: HiOutlineBuildingStorefront,
    toneClass: 'text-amber-700',
    bgClass: 'from-amber-500/15 to-orange-500/5',
  },
] as const;

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

const formatMetric = (value: number) => value.toLocaleString();

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(value);

const Mapcity: React.FC<MapcityProps> = ({ regions, period = 'today', onPeriodChange, isLoading }) => {
  const [selectedCity, setSelectedCity] = useState<MapCityItem | null>(null);
  const source = regions ?? [];

  const cities: MapCityItem[] = useMemo(
    () =>
      source.map((city, index) => {
        const coords = cityCoordinates[normalizeRegionName(city.name)] ?? { lat: 58.5, lng: 15.5 };
        return {
          ...city,
          lat: coords.lat,
          lng: coords.lng,
          color: markerColors[index % markerColors.length],
        };
      }),
    [source],
  );

  return (
    <>
      <div className="min-h-137.5 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Top Regions</h2>
          <select
            value={period}
            onChange={(event) =>
              onPeriodChange?.(event.target.value as 'today' | 'weekly' | 'monthly')
            }
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
                    eventHandlers={{
                      click: () => setSelectedCity(city),
                    }}
                  />
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-3">
            {!isLoading && !cities.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No city analytics available for the selected period.
              </div>
            ) : null}

            {cities.map((city) => (
              <div
                key={city.name}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-slate-200 hover:shadow-md"
                onClick={() => setSelectedCity(city)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedCity(city);
                  }
                }}
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

      <Dialog open={Boolean(selectedCity)} onOpenChange={(open) => !open && setSelectedCity(null)}>
        <DialogContent className="w-[min(92vw,620px)] max-w-[620px] overflow-hidden border border-slate-200 bg-white p-0">
          {selectedCity ? (
            <div className=" rounded-3xl">
              <div
                className="relative overflow-hidden border-b border-slate-100 px-5 py-5 text-white"
                style={{
                  background: `linear-gradient(135deg, ${selectedCity.color}, ${selectedCity.color}cc)`,
                }}
              >
                <div className="absolute  h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-24 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                <DialogHeader>
                  <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-white/85">
                        City Drilldown
                      </div>
                      <DialogTitle className="mt-3 text-2xl font-black tracking-tight text-white">
                        {selectedCity.name}
                      </DialogTitle>
                      <DialogDescription className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
                        Detailed regional analytics from current marketplace activity across users, orders, vendors, and revenue concentration.
                      </DialogDescription>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                        Share of Activity
                      </p>
                      <p className="mt-2 text-right text-xl font-black text-white">
                        {selectedCity.percent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {metricCards.map((metric) => {
                    const Icon = metric.icon;
                    const rawValue = selectedCity[metric.key];
                    const displayValue =
                      metric.key === 'revenue'
                        ? formatMoney(Number(rawValue ?? 0))
                        : formatMetric(Number(rawValue ?? 0));

                    return (
                      <div
                        key={metric.key}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 "
                      >
                        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${metric.bgClass}`} />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                              {metric.label}
                            </p>
                            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                              {displayValue}
                            </p>
                          </div>
                          <div className={`rounded-2xl bg-gradient-to-br ${metric.bgClass} p-2.5 ${metric.toneClass}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="overflow-hidden rounded-3xl border border-amber-100 bg-[linear-gradient(135deg,#fff8e6_0%,#fffdf7_100%)] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-700">
                      Top Category
                    </p>
                    <p className="mt-2.5 text-xl font-black tracking-tight text-slate-950">
                      {selectedCity.topCategory || 'No dominant category yet'}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Highest concentration of marketplace demand in this city for the selected time window.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4 ">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                      Snapshot
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Period</span>
                        <span className="font-bold text-slate-900">{periodLabels[period]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Market density</span>
                        <span className="font-bold text-slate-900">
                          {(selectedCity.activeVendors ?? 0) > 10
                            ? 'High'
                            : (selectedCity.activeVendors ?? 0) > 3
                              ? 'Moderate'
                              : 'Emerging'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Revenue / order</span>
                        <span className="font-bold text-slate-900">
                          {formatMoney(
                            (selectedCity.orders ?? 0) > 0
                              ? Number(selectedCity.revenue ?? 0) / Number(selectedCity.orders ?? 1)
                              : 0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 ">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                        Regional User Share
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Distribution of current activity relative to the top cities in the selected period.
                      </p>
                    </div>
                    <span className="text-lg font-black text-slate-950">
                      {selectedCity.percent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-5 rounded-full bg-slate-100 p-1.5">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${Math.min(selectedCity.percent, 100)}%`,
                        background: `linear-gradient(90deg, ${selectedCity.color}, ${selectedCity.color}cc)`,
                        boxShadow: `0 10px 24px ${selectedCity.color}55`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Low concentration</span>
                    <span>High concentration</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Mapcity;
