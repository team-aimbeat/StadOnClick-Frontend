import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlineStar,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { BsWhatsapp } from "react-icons/bs";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";

type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
type DateRange = "ALL" | "TODAY" | "LAST_7" | "LAST_30";
type RatingFilter = "ALL" | "5" | "4_PLUS" | "3_PLUS";
type LeadSource = "PROFILE" | "SERVICE" | "MAP" | "SEARCH" | "WHATSAPP" | "CALL";
type FiltersState = {
  starred: boolean;
  notes: boolean;
  notConnected: boolean;
  status: LeadStatus | "ALL";
  rating: RatingFilter;
  dateRange: DateRange;
  source: LeadSource | "ALL";
};

type Lead = {
  id: string;
  name: string;
  area: string;
  city: string;
  service: string;
  query: string;
  source: string;
  createdAt: string;
  status: LeadStatus;
  rating?: number;
  followUp?: boolean;
  read?: boolean;
  starred?: boolean;
  hasNotes?: boolean;
  notConnected?: boolean;
  businessOwner?: string;
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  sourceKey: LeadSource;
};

const daysAgo = (days: number, hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Sohan Singh",
    area: "Mumbai Central",
    city: "Mumbai",
    service: "Search Engine Optimization Services",
    query:
      "Sohan Singh searched for your business on StadonClick. Connect now.",
    source: "Free Enquiry",
    sourceKey: "SEARCH",
    createdAt: daysAgo(1, 12, 15),
    status: "NEW",
    rating: 4.8,
    read: true,
    starred: true,
    hasNotes: true,
    contact: {
      phone: "+91 98765 12345",
      whatsapp: "+91 98765 12345",
      email: "sohan@client.com",
    },
  },
  {
    id: "lead-2",
    name: "Haridev",
    area: "Kandivali West",
    city: "Mumbai",
    service: "Mobile Application Developers",
    query: "Haridev has a requirement in the category you deal with.",
    source: "Enquiry via Call Center",
    sourceKey: "CALL",
    createdAt: daysAgo(12, 19, 51),
    status: "CONTACTED",
    rating: 4.2,
    followUp: true,
    hasNotes: true,
    notConnected: true,
    businessOwner: "View Info",
    contact: {
      phone: "+91 91234 56780",
      whatsapp: "+91 91234 56780",
    },
  },
  {
    id: "lead-3",
    name: "Sumit",
    area: "Andheri West",
    city: "Mumbai",
    service: "Mobile Application Developers",
    query: "Sumit enquired about your mobile application services.",
    source: "Website Lead Form",
    sourceKey: "SERVICE",
    createdAt: daysAgo(12, 19, 3),
    status: "CONTACTED",
    rating: 3.9,
    followUp: true,
    contact: {
      phone: "+91 90210 45678",
      whatsapp: "+91 90210 45678",
    },
  },
  {
    id: "lead-4",
    name: "Siddharth Patel",
    area: "Powai",
    city: "Mumbai",
    service: "UI/UX Design",
    query: "Looking for a redesign of an existing travel booking product.",
    source: "Referral",
    sourceKey: "PROFILE",
    createdAt: daysAgo(14, 11, 30),
    status: "CONVERTED",
    rating: 4.5,
    starred: true,
    hasNotes: true,
    contact: {
      phone: "+91 98111 22002",
      email: "sid@travel.com",
    },
  },
  {
    id: "lead-5",
    name: "Rutuja More",
    area: "Borivali East",
    city: "Mumbai",
    service: "Brand Consulting",
    query:
      "Needs a positioning refresh and launch plan for a new product line.",
    source: "Free Enquiry",
    sourceKey: "MAP",
    createdAt: daysAgo(16, 10, 0),
    status: "NEW",
    rating: 4.0,
    followUp: true,
    notConnected: true,
    contact: {
      phone: "+91 90000 11112",
      whatsapp: "+91 90000 11112",
      email: "rutuja@brand.com",
    },
  },
  {
    id: "lead-6",
    name: "Amit Kumar",
    area: "Lower Parel",
    city: "Mumbai",
    service: "Performance Marketing",
    query: "Wants a paid ads sprint ahead of festive season.",
    source: "Partner Channel",
    sourceKey: "SEARCH",
    createdAt: daysAgo(21, 16, 45),
    status: "CONVERTED",
    rating: 4.9,
    read: true,
    starred: true,
    hasNotes: true,
    contact: {
      phone: "+91 98888 77665",
      whatsapp: "+91 98888 77665",
      email: "amit@growth.com",
    },
  },
];

const defaultFilters: FiltersState = {
  starred: false,
  notes: false,
  notConnected: false,
  status: "ALL",
  rating: "ALL",
  dateRange: "ALL",
  source: "ALL",
};

const ratingThreshold = (filter: RatingFilter) => {
  if (filter === "5") return 5;
  if (filter === "4_PLUS") return 4;
  if (filter === "3_PLUS") return 3;
  return 0;
};

const isValidLeadStatus = (value: string | null): value is LeadStatus =>
  value === "NEW" || value === "CONTACTED" || value === "CONVERTED" || value === "LOST";

const getLeadSectionTitle = (status: LeadStatus | "ALL") => {
  if (status === "NEW") return "New Leads";
  if (status === "CONTACTED") return "Contacted Leads";
  if (status === "CONVERTED") return "Converted Leads";
  if (status === "LOST") return "Lost Leads";
  return "All Leads";
};

const applyFilters = (leads: Lead[], filters: FiltersState) =>
  leads.filter((lead) => {
    if (filters.starred && !lead.starred) return false;
    if (filters.notes && !lead.hasNotes) return false;
    if (filters.notConnected && !lead.notConnected) return false;
    if (filters.status !== "ALL" && lead.status !== filters.status) return false;
    if (filters.rating !== "ALL") {
      const threshold = ratingThreshold(filters.rating);
      if ((lead.rating ?? 0) < threshold) return false;
    }
    if (filters.source !== "ALL" && lead.sourceKey !== filters.source) return false;
    if (!isInRange(lead.createdAt, filters.dateRange)) return false;
    return true;
  });

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInRange = (createdAt: string, range: DateRange) => {
  if (range === "ALL") return true;
  const now = new Date();
  const created = new Date(createdAt);
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  if (range === "TODAY") return isSameDay(created, now);
  if (range === "LAST_7") return diffDays <= 7;
  if (range === "LAST_30") return diffDays <= 30;
  return true;
};

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

type FilterChipProps = {
  label: string;
  icon: IconType;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
};

const FilterChip = ({ label, icon: Icon, active, badge, onClick }: FilterChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition",
      active
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
    {badge ? (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        {badge}
      </span>
    ) : null}
  </button>
);

type FilterSelectProps<T extends string> = {
  label: string;
  icon: IconType;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

const FilterSelect = <T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) => (
  <label className="relative inline-flex h-10 items-center">
    <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      aria-label={label}
      className="h-10 appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold text-slate-700 transition focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <HiOutlineChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-slate-500" />
  </label>
);

type Tone = "info" | "warning" | "danger" | "muted";

type TagPillProps = {
  label: string;
  tone: Tone;
};

const tagToneStyles: Record<Tone, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
  muted: "bg-slate-100 text-slate-700 border-slate-200",
};

const TagPill = ({ label, tone }: TagPillProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
      tagToneStyles[tone]
    )}
  >
    {label}
  </span>
);

type ContactTone = "blue" | "green" | "slate";

type ContactButtonProps = {
  icon: IconType;
  label: string;
  tone?: ContactTone;
};

const contactToneStyles: Record<ContactTone, string> = {
  blue:
    "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-200",
  green:
    "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 focus:ring-emerald-200",
  slate:
    "border-sky-600 bg-sky-600 text-white hover:bg-sky-700 hover:border-sky-700 focus:ring-sky-200",
};

const ContactButton = ({ icon: Icon, label, tone = "blue" }: ContactButtonProps) => (
  <button
    type="button"
    className={cn(
      "grid h-11 w-11 place-items-center rounded-lg border text-base font-semibold transition focus:outline-none focus:ring-2",
      contactToneStyles[tone]
    )}
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
  </button>
);

type LeadCardProps = {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: LeadStatus) => void;
  isSaving?: boolean;
};

const LeadCard = ({ lead, expanded, onToggle, onStatusChange, isSaving }: LeadCardProps) => {
  const tags: TagPillProps[] = [];
  if (lead.read) tags.push({ label: "Read", tone: "muted" });
  if (lead.followUp) tags.push({ label: "Follow Up", tone: "warning" });
  if (lead.notConnected) tags.push({ label: "Not Connected", tone: "info" });

  const statusTone: Record<LeadStatus, Tone> = {
    NEW: "info",
    CONTACTED: "warning",
    CONVERTED: "info",
    LOST: "danger",
  };
  const statusOptions: LeadStatus[] = ["NEW", "CONTACTED", "CONVERTED", "LOST"];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <TagPill key={`${lead.id}-${tag.label}`} {...tag} />
          ))}
          <TagPill label={lead.status.replace("_", " ")} tone={statusTone[lead.status]} />
          {lead.rating ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <HiOutlineStar className="h-4 w-4" />
              {lead.rating.toFixed(1)}
            </span>
          ) : null}
          {lead.starred ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-amber-600">
              <HiOutlineStar className="h-4 w-4 fill-amber-500 text-amber-500" />
              Starred
            </span>
          ) : null}
        </div>
        <div className="text-right text-sm font-semibold text-slate-500">
          {formatTimestamp(lead.createdAt)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">{lead.name}</p>
          <p className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <HiOutlineMapPin className="h-4 w-4" />
            {lead.area}, {lead.city}
          </p>
          <p className="text-sm text-slate-800">{lead.service}</p>
        </div>
        <div className="flex items-center gap-3 self-center">
          {lead.contact.phone ? (
            <ContactButton icon={HiOutlinePhone} label="Call lead" tone="blue" />
          ) : null}
          {lead.contact.whatsapp ? (
            <ContactButton icon={BsWhatsapp} label="WhatsApp" tone="green" />
          ) : null}
          {lead.contact.email ? (
            <ContactButton icon={HiOutlineEnvelope} label="Email" tone="slate" />
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
              Query
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{lead.query}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
              Enquiry Source
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{lead.source}</p>
          </div>
          {lead.businessOwner ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <HiOutlineUserCircle className="h-4 w-4 text-blue-600" />
              <span>Business owner:</span>
              <span className="text-blue-600">{lead.businessOwner}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>Status</span>
            <select
              value={lead.status}
              onChange={(event) => onStatusChange(event.target.value as LeadStatus)}
              className="rounded-full border-none bg-transparent px-1 text-xs font-semibold focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isSaving && (
              <span className="text-[11px] text-emerald-600">Saved</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <HiOutlineEnvelope className="h-4 w-4" />
          Send Quotation
        </button>
      </div>
    </div>
  );
};

const VendorLeads = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    mockLeads.reduce(
      (acc, lead) => ({
        ...acc,
        [lead.id]: true,
      }),
      {} as Record<string, boolean>
    )
  );
  const [statusSaving, setStatusSaving] = useState<Record<string, boolean>>({});
  const statusTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const nextStatus = isValidLeadStatus(statusParam) ? statusParam : "ALL";
    setFilters((prev) =>
      prev.status === nextStatus ? prev : { ...prev, status: nextStatus }
    );
  }, [searchParams]);

  useEffect(() => {
    return () => {
      Object.values(statusTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    dispatch(setPageTitle(getLeadSectionTitle(filters.status)));
  }, [dispatch, filters.status]);

  const filteredLeads = useMemo(
    () => applyFilters(leads, filters),
    [leads, filters]
  );

  const counts = useMemo(() => {
    const total = leads.length;
    const contactedCount = leads.filter((lead) => lead.status === "CONTACTED").length;
    const convertedCount = leads.filter((lead) => lead.status === "CONVERTED").length;
    const lostCount = leads.filter((lead) => lead.status === "LOST").length;
    const respondedCount = contactedCount + convertedCount + lostCount;
    return { total, respondedCount };
  }, [leads]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.starred) count += 1;
    if (filters.notes) count += 1;
    if (filters.notConnected) count += 1;
    if (filters.status !== "ALL") count += 1;
    if (filters.rating !== "ALL") count += 1;
    if (filters.dateRange !== "ALL") count += 1;
    if (filters.source !== "ALL") count += 1;
    return count;
  }, [filters]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusFilterChange = (status: LeadStatus | "ALL") => {
    setFilters((prev) => ({ ...prev, status }));
    if (status === "ALL") {
      navigate("/vendor/leads", { replace: true });
    } else {
      navigate(`/vendor/leads?status=${status}`, { replace: true });
    }
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
    navigate("/vendor/leads", { replace: true });
  };

  const handleLeadStatusChange = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    setStatusSaving((prev) => ({ ...prev, [id]: true }));
    if (statusTimers.current[id]) {
      window.clearTimeout(statusTimers.current[id]);
    }
    statusTimers.current[id] = window.setTimeout(() => {
      setStatusSaving((prev) => ({ ...prev, [id]: false }));
      delete statusTimers.current[id];
    }, 1400);
  };

  const sectionTitle = getLeadSectionTitle(filters.status);

  return (
    <DashboardContainer className=" space-y-4 lg:space-y-5">
      <TitleBreadCrumbs
        title={sectionTitle}
        breadCrumbTitle={`Vendor / ${sectionTitle}`}
        className="w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-slate-900">Aimbeat</p>
          <p className="text-sm text-slate-600">Kurla West, Mumbai</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-800 shadow-sm ring-1 ring-slate-200">
            Leads Received: {counts.total}
          </span>
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-700 shadow-sm ring-1 ring-slate-200">
            Leads Responded: {counts.respondedCount}
          </span>
          <span className="rounded-md bg-white px-3 py-1.5 text-slate-700 shadow-sm ring-1 ring-slate-200">
            Viewing: {filteredLeads.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <FilterChip
            label="Filters"
            icon={HiOutlineAdjustmentsHorizontal}
            active={activeFilterCount > 0}
            badge={activeFilterCount ? `${activeFilterCount}` : undefined}
            onClick={resetFilters}
          />
          <FilterSelect<DateRange>
            label="Date"
            icon={HiOutlineCalendarDays}
            value={filters.dateRange}
            onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
            options={[
              { label: "Any time", value: "ALL" },
              { label: "Today", value: "TODAY" },
              { label: "Last 7 days", value: "LAST_7" },
              { label: "Last 30 days", value: "LAST_30" },
            ]}
          />
          <FilterChip
            label="Starred"
            icon={HiOutlineStar}
            active={filters.starred}
            onClick={() => setFilters((prev) => ({ ...prev, starred: !prev.starred }))}
          />
          <FilterChip
            label="Notes"
            icon={HiOutlinePencilSquare}
            active={filters.notes}
            onClick={() => setFilters((prev) => ({ ...prev, notes: !prev.notes }))}
          />
          <FilterChip
            label="Not Connected"
            icon={HiOutlinePhone}
            active={filters.notConnected}
            onClick={() =>
              setFilters((prev) => ({ ...prev, notConnected: !prev.notConnected }))
            }
          />
          <FilterSelect<LeadStatus | "ALL">
            label="Enquiry Status"
            icon={HiOutlineAdjustmentsHorizontal}
            value={filters.status}
            onChange={(value) => handleStatusFilterChange(value)}
            options={[
              { label: "Any status", value: "ALL" },
              { label: "New", value: "NEW" },
              { label: "Contacted", value: "CONTACTED" },
              { label: "Converted", value: "CONVERTED" },
              { label: "Lost", value: "LOST" },
            ]}
          />
          <FilterSelect<LeadSource | "ALL">
            label="Source"
            icon={HiOutlineMapPin}
            value={filters.source}
            onChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
            options={[
              { label: "Any source", value: "ALL" },
              { label: "Profile", value: "PROFILE" },
              { label: "Service", value: "SERVICE" },
              { label: "Map", value: "MAP" },
              { label: "Search", value: "SEARCH" },
              { label: "WhatsApp", value: "WHATSAPP" },
              { label: "Call", value: "CALL" },
            ]}
          />
          <FilterSelect<RatingFilter>
            label="Rating"
            icon={HiOutlineStar}
            value={filters.rating}
            onChange={(value) => setFilters((prev) => ({ ...prev, rating: value }))}
            options={[
              { label: "Any rating", value: "ALL" },
              { label: "5 star", value: "5" },
              { label: "4 star & above", value: "4_PLUS" },
              { label: "3 star & above", value: "3_PLUS" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            expanded={expanded[lead.id]}
            onToggle={() => toggleExpanded(lead.id)}
            onStatusChange={(status) => handleLeadStatusChange(lead.id, status)}
            isSaving={statusSaving[lead.id]}
          />
        ))}
        {!filteredLeads.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No leads match the selected filters.
            </p>
            <p className="text-sm text-slate-500">
              Reset filters to view all enquiries.
            </p>
          </div>
        ) : null}
      </div>
    </DashboardContainer>
  );
};

export default VendorLeads;


