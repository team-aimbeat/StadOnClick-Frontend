import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {HiOutlineLightningBolt, HiOutlineSparkles } from "react-icons/hi";
import {
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineCheck,
} from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useCreateSponsorshipCheckoutMutation,
  useListPlansQuery,
  useListVendorServicesQuery,
  useListVendorServicesByMasterQuery,
  useListVendorSponsorshipsQuery,
} from "@/features/vendorSponsorships/api/vendorSponsorships.api";
import type { SponsorshipPlan, VendorServiceLite } from "@/features/vendorSponsorships/types";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { useListServiceMasterCategoriesQuery } from "@/features/serviceCategories/api/serviceCategoriesApi";

const EmptyState = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const StepHeader = ({
  step,
  title,
  subtitle,
  icon,
}: {
  step: number;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
    {icon && <div className="text-blue-500">{icon}</div>}
  </div>
);

type PremiumPlanCardProps = {
  plan: SponsorshipPlan;
  selected: boolean;
  highlight?: string;
  onSelect: (plan: SponsorshipPlan) => void;
};

const PremiumPlanCard = ({ plan, selected, highlight, onSelect }: PremiumPlanCardProps) => (
  <div
    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${
      selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
    }`}
  >
    {highlight && (
      <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
        {highlight}
      </span>
    )}

    <button type="button" onClick={() => onSelect(plan)} className="flex flex-col h-full text-left">
      <div className="flex items-start gap-3 px-5 pt-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <HiOutlineLightningBolt className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">Plan</p>
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            Priority {plan.priorityScore}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-500">
            {(plan.currency || "SEK").toUpperCase()}
          </span>
          <span className="text-4xl font-black tracking-tight text-slate-900">
            {Number(plan.price ?? 0).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">per boost</p>
      </div>

      <div className="mx-5 mb-2 mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-inner">
          <HiOutlineClock className="h-5 w-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Duration</p>
            <p className="font-semibold text-slate-900">{plan.durationDays} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-inner">
          <HiOutlineEye className="h-5 w-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Impressions</p>
            <p className="font-semibold text-slate-900">
              {plan.impressionCap ? plan.impressionCap.toLocaleString() : "Unlimited"}
            </p>
          </div>
        </div>
      </div>

      <ul className="mx-5 mb-4 space-y-2 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
          Higher search ranking
        </li>
        <li className="flex items-center gap-2">
          <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
          Sponsored badge visibility
        </li>
        <li className="flex items-center gap-2">
          <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
          {plan.impressionCap ? `${plan.impressionCap.toLocaleString()} impression cap` : "Unlimited impressions"}
        </li>
      </ul>

      <div className="mt-auto px-5 pb-5">
        <div
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition ${
            selected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          <HiOutlineCheckCircle className="h-4 w-4" />
          {selected ? "Selected" : "Choose Plan"}
        </div>
      </div>
    </button>
  </div>
);

const ServiceSelect = ({
  services,
  selectedServiceId,
  onChange,
  loading,
  search,
  onSearchChange,
}: {
  services: VendorServiceLite[];
  selectedServiceId: string | null;
  onChange: (id: string) => void;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}) => {
  if (loading) {
    return <Skeleton className="h-10 w-full rounded-lg" />;
  }

  if (!services.length) {
    return (
      <EmptyState
        title="No services found"
        subtitle="Publish a live service before promoting it."
        actionLabel="Go to Services"
        onAction={() => (window.location.href = "/vendor/services")}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">Search your services</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to filter by name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <label className="text-sm font-medium text-slate-800">Select a service to boost</label>
      <select
        value={selectedServiceId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
      >
        <option value="" disabled>
          Choose a live service
        </option>
        {services.map((svc) => (
          <option key={svc.id} value={svc.id} disabled={svc.status === "DRAFT"}>
            {svc.title} {svc.category?.name ? `- ${svc.category.name}` : ""}{" "}
            {svc.status ? `(${svc.status})` : ""}
          </option>
        ))}
      </select>
      {selectedServiceId && (
        <p className="text-xs text-slate-500">
          Category is auto-derived from the service and cannot be overridden.
        </p>
      )}
    </div>
  );
};

const ActiveSponsorships = ({
  items,
  loading,
}: {
  items: ReturnType<typeof useListVendorSponsorshipsQuery>["data"];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items || !items.length) {
    return <EmptyState title="No active boosts" subtitle="Purchase a plan to appear higher in search." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item: { endsAt: string | number | Date; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; id: Key | null | undefined; service: { title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; }; plan: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; durationDays: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; }; prioritySnapshot: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; currency: any; amountPaid: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Iterable<ReactNode> | null | undefined; }; analytics: { impressions: any; clicks: any; conversions: any; }; }) => {
        const daysLeft =
          item.endsAt && item.status === "ACTIVE"
            ? Math.max(
                0,
                Math.ceil((new Date(item.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              )
            : null;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.service.title}</p>
                <p className="text-xs text-slate-500">
                  {item.plan.name} · Priority {item.prioritySnapshot} · {item.plan.durationDays} days
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : item.status === "PENDING"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                {(item.currency || "SEK").toUpperCase()} {item.amountPaid.toLocaleString()}
              </span>
              {daysLeft !== null && <span className="text-emerald-700 font-semibold">{daysLeft} days left</span>}
            </div>
            {item.analytics && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                <div className="rounded-lg bg-white/80 px-2 py-2 shadow-inner">
                  <p className="text-sm font-semibold text-slate-900">{item.analytics.impressions ?? 0}</p>
                  <p>Impressions</p>
                </div>
                <div className="rounded-lg bg-white/80 px-2 py-2 shadow-inner">
                  <p className="text-sm font-semibold text-slate-900">{item.analytics.clicks ?? 0}</p>
                  <p>Clicks</p>
                </div>
                <div className="rounded-lg bg-white/80 px-2 py-2 shadow-inner">
                  <p className="text-sm font-semibold text-slate-900">{item.analytics.conversions ?? 0}</p>
                  <p>Conversions</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const VendorPromote = () => {
  const dispatch = useAppDispatch();
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
    error: plansError,
  } = useListPlansQuery();
  const {
    data: services = [],
    isLoading: isServicesLoading,
    isFetching: isServicesFetching,
    error: servicesError,
  } = useListVendorServicesQuery();
  const {
    data: sponsorships = [],
    isLoading: isSponsorshipsLoading,
    isFetching: isSponsorshipsFetching,
    error: sponsorshipsError,
  } = useListVendorSponsorshipsQuery();
  const [createCheckout, { isLoading: isCreating }] = useCreateSponsorshipCheckoutMutation();
  const {
    data: masterCategories = [],
    isLoading: isMastersLoading,
    isFetching: isMastersFetching,
    error: masterError,
  } = useListServiceMasterCategoriesQuery();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");

  const {
    data: servicesByMaster = [],
    isLoading: isServicesByMasterLoading,
    isFetching: isServicesByMasterFetching,
  } = useListVendorServicesByMasterQuery(
    { masterId: selectedMasterId ?? "", search: serviceSearch },
    { skip: !selectedMasterId }
  );

  useEffect(() => {
    dispatch(setPageTitle("Promote Services"));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedMasterId && masterCategories.length === 1) {
      setSelectedMasterId(masterCategories[0].id);
    }
  }, [masterCategories, selectedMasterId]);

  // If master categories exist, force the vendor to pick one before listing child services.
  const requireMaster = masterCategories.length > 0;

  const baseServices = requireMaster
    ? servicesByMaster
    : selectedMasterId
      ? servicesByMaster
      : services;

  const servicesLoading = selectedMasterId
    ? isServicesByMasterLoading || isServicesByMasterFetching
    : isServicesLoading || isServicesFetching;

  const filteredServices = useMemo(() => {
    const term = serviceSearch.trim().toLowerCase();
    if (!term) return baseServices;
    return baseServices.filter((svc) => svc.title.toLowerCase().includes(term));
  }, [baseServices, serviceSearch]);

  const selectedService = useMemo(
    () => filteredServices.find((svc) => svc.id === selectedServiceId) ?? null,
    [filteredServices, selectedServiceId]
  );
  const parseError = (error: unknown) =>
    normalizeApiError(error, "Unable to complete the request.").toastMessage;

  const handleCheckout = async () => {
    if (!selectedServiceId || !selectedPlanId) {
      toast.error("Select a service and a plan to continue.");
      return;
    }

    setClientSecret(null);
    try {
      const response = await createCheckout({
        planId: selectedPlanId,
        serviceId: selectedServiceId,
      }).unwrap();

      if (response?.clientSecret) {
        setClientSecret(response.clientSecret);
        toast.success("Payment intent created. Continue in the Stripe modal.");
      } else {
        toast.success("Checkout created. Complete the payment to activate the boost.");
      }
    } catch (error) {
      toast.error(parseError(error));
    }
  };

  return (
    <DashboardContainer className="space-y-6 pb-12">
      <TitleBreadCrumbs title="Promote services" breadCrumbTitle="Vendor / Promote" />

      {(plansError || servicesError || sponsorshipsError || masterError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {parseError(plansError || servicesError || sponsorshipsError || masterError)}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5">
          <StepHeader
            step={1}
            title="Select Service"
            subtitle="Choose which service you want to promote"
            icon={<HiOutlineLightningBolt className="h-6 w-6 text-amber-500" />}
          />
          {isMastersLoading || isMastersFetching ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : masterCategories.length ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800">Select master service</label>
              <Select
                value={selectedMasterId ?? undefined}
                onValueChange={(value) => {
                  setSelectedMasterId(value);
                  setSelectedServiceId(null);
                  setSelectedPlanId(null);
                  setServiceSearch("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a master service" />
                </SelectTrigger>
                <SelectContent>
                  {masterCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-600">
                Pick a master service first, then choose a child service to boost.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              No master services configured. Showing all your services instead.
            </div>
          )}

          {isMastersLoading || isMastersFetching ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : requireMaster && !selectedMasterId ? (
            <EmptyState
              title="Choose a master service first"
              subtitle="Select a master service to load its child services that can be boosted."
            />
          ) : (
            <ServiceSelect
              services={filteredServices}
              selectedServiceId={selectedServiceId}
              onChange={(id) => {
                setSelectedServiceId(id);
                setSelectedPlanId(null);
              }}
              loading={servicesLoading}
              search={serviceSearch}
              onSearchChange={setServiceSearch}
            />
          )}

          {selectedService && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{selectedService.title}</p>
                <p className="text-sm text-slate-600">
                  Category: {selectedService.category?.name ?? "Unknown"} - Status:{" "}
                  {selectedService.status ?? "LIVE"}
                </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <StepHeader
              step={2}
              title="Choose Sponsorship Plan"
              subtitle="Higher priority gives better visibility and more impressions"
            />

            {isPlansLoading || isPlansFetching ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <EmptyState
                title="No sponsorship plans yet"
                subtitle="Ask an admin to create a plan or check back later."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                  <PremiumPlanCard
                    key={plan.id}
                    plan={plan}
                    selected={plan.id === selectedPlanId}
                    onSelect={(p) => setSelectedPlanId(p.id)}
                    highlight={plan.priorityScore >= 5 ? "Most Popular" : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50 px-5 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-900">Ready to purchase?</p>
              <p className="text-sm text-slate-600">
                Secure checkout via Stripe. Activation happens after payment confirmation (webhook).
              </p>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCreating || !selectedPlanId || !selectedServiceId}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition ${
                  isCreating || !selectedPlanId || !selectedServiceId
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                }`}
              >
                {isCreating && <HiOutlineArrowPath className="h-4 w-4 animate-spin" />}
                Start checkout
              </button>
            </div>
          </div>

          {clientSecret && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Client secret generated. Pass it to Stripe Elements to present the payment sheet:
              <pre className="mt-2 overflow-x-auto rounded-md bg-white px-3 py-2 text-xs text-slate-800">
                {clientSecret}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <StepHeader
              step={3}
              title="Monitor Performance"
              subtitle="Track impressions, clicks and conversions"
              icon={<HiOutlineSparkles className="h-6 w-6 text-blue-500" />}
            />
            <div className="mt-4">
              <ActiveSponsorships
                items={sponsorships}
                loading={isSponsorshipsLoading || isSponsorshipsFetching}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorPromote;
