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

import { useAppDispatch, useAppSelector } from "@/app/hooks";
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
  useConfirmSponsorshipCheckoutMutation,
  useCreateSponsorshipCheckoutMutation,
  useListPlansQuery,
  useListVendorServicesQuery,
  useListVendorServicesByMasterQuery,
  useListVendorSponsorshipsQuery,
} from "@/features/vendorSponsorships/api/vendorSponsorships.api";
import type { SponsorshipPlan, VendorServiceLite } from "@/features/vendorSponsorships/types";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { useGetMasterCategoriesQuery } from "@/services/serviceCategoriesApi";

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

const FlowStep = ({
  step,
  title,
  active,
  completed,
}: {
  step: number;
  title: string;
  active?: boolean;
  completed?: boolean;
}) => (
  <div className="flex min-w-0 flex-1 flex-col items-center">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all ${
        completed
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : active
            ? "border-2 border-blue-600 bg-white text-blue-600"
            : "bg-slate-100 text-slate-400"
      }`}
    >
      {completed ? <HiOutlineCheck className="h-4 w-4" /> : step}
    </div>
    <p
      className={`mt-2 text-[10px] font-bold uppercase tracking-[0.22em] ${
        active || completed ? "text-blue-600" : "text-slate-400"
      }`}
    >
      {title}
    </p>
  </div>
);

const InfoPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
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
  const authUser = useAppSelector((state) => state.auth.user);
  const vendorId = authUser?.vendorAccess?.vendorId ?? undefined;
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
  } = useListVendorServicesQuery({ userId: authUser?.id, vendorId });
  const {
    data: sponsorships = [],
    isLoading: isSponsorshipsLoading,
    isFetching: isSponsorshipsFetching,
    error: sponsorshipsError,
  } = useListVendorSponsorshipsQuery();
  const [createCheckout, { isLoading: isCreating }] = useCreateSponsorshipCheckoutMutation();
  const [confirmCheckout, { isLoading: isConfirming }] = useConfirmSponsorshipCheckoutMutation();
  const {
    data: masterCategories = [],
    isLoading: isMastersLoading,
    isFetching: isMastersFetching,
    error: masterError,
  } = useGetMasterCategoriesQuery();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [wizardStep, setWizardStep] = useState(1);

  const {
    data: servicesByMaster = [],
    isLoading: isServicesByMasterLoading,
    isFetching: isServicesByMasterFetching,
  } = useListVendorServicesByMasterQuery(
    { masterId: selectedMasterId ?? "", search: serviceSearch, userId: authUser?.id, vendorId },
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

  const baseServices = selectedMasterId ? servicesByMaster : services;

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
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );
  const currentStep = wizardStep;
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

      if (response?.sponsorshipId) {
        try {
          await confirmCheckout({
            sponsorshipId: response.sponsorshipId,
            paymentIntentId: response.paymentIntentId,
          }).unwrap();
          setClientSecret(null);
          toast.success("Payment confirmed. Sponsorship is now active.");
          return;
        } catch (error) {
          if (response?.clientSecret) {
            setClientSecret(response.clientSecret);
          }
          toast.error(parseError(error));
          return;
        }
      }

      toast.success("Checkout created. Complete the payment to activate the boost.");
    } catch (error) {
      toast.error(parseError(error));
    }
  };

  return (
    <DashboardContainer className="space-y-8 pb-12">
      {(plansError || servicesError || sponsorshipsError || masterError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {parseError(plansError || servicesError || sponsorshipsError || masterError)}
        </div>
      )}

      <div className="space-y-3">
        <TitleBreadCrumbs
          title="Promote Services"
          breadCrumbTitle="Vendor / Promote"
          subtitle="Overview and key insights"
          className="w-full"
        />
      </div>

      <div className="space-y-5">
        <div className="mx-auto flex w-full max-w-4xl items-start gap-4 px-1">
          <FlowStep step={1} title="Select Service" active={currentStep === 1} completed={currentStep > 1} />
          <div className="mt-4 h-[2px] flex-1 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: currentStep >= 2 ? "100%" : "0%" }}
            />
          </div>
          <FlowStep step={2} title="Choose Plan" active={currentStep === 2} completed={currentStep > 2} />
          <div className="mt-4 h-[2px] flex-1 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: currentStep >= 3 ? "100%" : "0%" }}
            />
          </div>
          <FlowStep step={3} title="Payment" active={currentStep === 3} completed={false} />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Promote Your Service
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Boost visibility and attract more customers by highlighting your top-performing services.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {wizardStep === 1 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <StepHeader
              step={1}
              title="Select Service"
              subtitle="Choose which service you want to promote"
              icon={<HiOutlineLightningBolt className="h-6 w-6 text-amber-500" />}
            />

            <div className="mt-6 space-y-5">
              {isMastersLoading || isMastersFetching ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : masterCategories.length ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Master service category
                  </label>
                  <Select
                    value={selectedMasterId ?? undefined}
                    onValueChange={(value) => {
                      setSelectedMasterId(value);
                      setSelectedServiceId(null);
                      setSelectedPlanId(null);
                      setServiceSearch("");
                      setWizardStep(1);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-700">
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
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  No master services configured. Showing all your services instead.
                </div>
              )}

              {requireMaster && !selectedMasterId && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Pick a master service first, then choose a child service to boost.
                </div>
              )}

              <ServiceSelect
                services={filteredServices}
                selectedServiceId={selectedServiceId}
                onChange={(id) => {
                  setSelectedServiceId(id);
                  setSelectedPlanId(null);
                  setWizardStep(1);
                }}
                loading={servicesLoading}
                search={serviceSearch}
                onSearchChange={setServiceSearch}
              />

              {selectedService && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-black text-slate-950">{selectedService.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Category: {selectedService.category?.name ?? "Food & Leisure"} - Status:{" "}
                    {selectedService.status ?? "LIVE"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                onClick={() => setWizardStep(1)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedServiceId) setWizardStep(2);
                }}
                disabled={!selectedServiceId}
                className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Proceed to Plans
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <StepHeader
              step={2}
              title="Choose Sponsorship Plan"
              subtitle="Higher priority gives better visibility and more impressions"
              icon={<HiOutlineSparkles className="h-6 w-6 text-blue-500" />}
            />

            <div className="mt-6">
              {isPlansLoading || isPlansFetching ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))}
                </div>
              ) : plans.length === 0 ? (
                <EmptyState
                  title="No sponsorship plans yet"
                  subtitle="Ask an admin to create a plan or check back later."
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-3">
                  {plans.map((plan, index) => {
                    const selected = plan.id === selectedPlanId;
                    const isFeatured = plan.priorityScore >= 5 || index === 1;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-[2rem] border p-5 shadow-sm transition-all ${
                          selected
                            ? "border-blue-500 bg-white ring-2 ring-blue-200"
                            : "border-slate-200 bg-slate-50/60"
                        } ${isFeatured ? "xl:-mt-4 xl:mb-4" : ""}`}
                      >
                        {isFeatured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                            Priority
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setWizardStep(3);
                          }}
                          className="flex h-full w-full flex-col text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-600">Plan</p>
                              <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                {plan.name}
                              </h3>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {plan.priorityScore}
                            </span>
                          </div>

                          <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-sm font-semibold text-slate-500">
                              {(plan.currency || "SEK").toUpperCase()}
                            </span>
                            <span className="text-4xl font-black tracking-tight text-blue-600">
                              {Number(plan.price ?? 0).toLocaleString()}
                            </span>
                            <span className="text-sm font-semibold text-slate-500">/ boost</span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <InfoPill label="Duration" value={`${plan.durationDays} days`} />
                            <InfoPill
                              label="Impressions"
                              value={plan.impressionCap ? plan.impressionCap.toLocaleString() : "Unlimited"}
                            />
                          </div>

                          <ul className="mt-5 space-y-2 text-sm text-slate-700">
                            <li className="flex items-center gap-2">
                              <HiOutlineCheck className="h-4 w-4 text-blue-600" />
                              Higher search ranking
                            </li>
                            <li className="flex items-center gap-2">
                              <HiOutlineCheck className="h-4 w-4 text-blue-600" />
                              Sponsored badge visibility
                            </li>
                            <li className="flex items-center gap-2">
                              <HiOutlineCheck className="h-4 w-4 text-blue-600" />
                              {plan.impressionCap ? `${plan.impressionCap.toLocaleString()} impression cap` : "Unlimited impressions"}
                            </li>
                          </ul>

                          <div
                            className={`mt-6 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                              selected
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {selected ? "Selected" : "Select Plan"}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                onClick={() => setWizardStep(1)}
              >
                Back to Service
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPlanId) setWizardStep(3);
                }}
                disabled={!selectedPlanId}
                className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <StepHeader
              step={3}
              title="Finalize Promotion"
              subtitle="Review your selection and proceed to secure payment"
              icon={<HiOutlineCheckCircle className="h-6 w-6 text-blue-500" />}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black tracking-tight text-slate-950">Order Summary</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(null);
                        setWizardStep(2);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Change Plan
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                          <HiOutlineLightningBolt className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedPlan?.name ?? "Select a plan"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {selectedPlan ? "Standard visibility boost for local listings" : "Choose a plan to continue"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-950">
                          {selectedPlan ? `${selectedPlan.currency || "SEK"} ${Number(selectedPlan.price ?? 0).toLocaleString()}` : "SEK 0"}
                        </p>
                        <p className="text-xs text-slate-500">One-time payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {selectedPlan ? `${selectedPlan.currency || "SEK"} ${Math.round(Number(selectedPlan.price ?? 0) * 0.8).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "SEK 0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">VAT (25%)</span>
                      <span className="font-semibold text-slate-900">
                        {selectedPlan ? `${selectedPlan.currency || "SEK"} ${Math.round(Number(selectedPlan.price ?? 0) * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "SEK 0.00"}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Total Amount</span>
                        <span className="text-2xl font-black tracking-tight text-blue-600">
                          {selectedPlan ? `${selectedPlan.currency || "SEK"} ${Number(selectedPlan.price ?? 0).toLocaleString()}` : "SEK 0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-lg font-black tracking-tight text-slate-950">Payment Security</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Secure checkout via Stripe. Activation happens after payment confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCreating || isConfirming || !selectedPlanId || !selectedServiceId}
                    className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all ${
                      isCreating || isConfirming || !selectedPlanId || !selectedServiceId
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                    }`}
                  >
                    {(isCreating || isConfirming) && <HiOutlineArrowPath className="h-4 w-4 animate-spin" />}
                    Start checkout
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    Performance Tracking
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Track impressions, clicks and conversions in real-time once your campaign starts.
                  </p>
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    {sponsorships.length ? `${sponsorships.length} active boosts` : "No active boosts"}
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-lg">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-200">
                    Premium Analytics
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Included in all active promotion plans.
                  </p>
                  <div className="mt-5 rounded-2xl bg-white/5 px-4 py-5 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Safe Preview</p>
                    <p className="mt-2 text-lg font-black">No active boosts</p>
                    <p className="mt-1 text-xs text-slate-400">Status will update after checkout</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-blue-600 p-5 text-white shadow-lg shadow-blue-200">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">
                    Expert Tip
                  </p>
                  <p className="mt-2 text-sm leading-6 text-blue-50">
                    Vendors using the top plan often see a faster click-through rate lift within the first 48 hours.
                  </p>
                </div>
              </div>
            </div>

            {clientSecret && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Client secret generated. Pass it to Stripe Elements to present the payment sheet:
                <pre className="mt-2 overflow-x-auto rounded-md bg-white px-3 py-2 text-xs text-slate-800">
                  {clientSecret}
                </pre>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                onClick={() => setWizardStep(2)}
              >
                ← Back to Plans
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMasterId(null);
                  setSelectedServiceId(null);
                  setSelectedPlanId(null);
                  setServiceSearch("");
                  setClientSecret(null);
                  setWizardStep(1);
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default VendorPromote;
