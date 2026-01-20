import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type Ticket = {
  id: string;
  subject: string;
  status: "open" | "waiting" | "resolved";
  updatedAt: string;
};

const initialTickets: Ticket[] = [
  { id: "TK-3301", subject: "Booking failed to confirm", status: "open", updatedAt: "2025-01-19" },
  { id: "TK-3295", subject: "Need latest payout report", status: "waiting", updatedAt: "2025-01-14" },
  { id: "TK-3289", subject: "KYC documents rejected", status: "resolved", updatedAt: "2024-12-28" },
];

const VendorSupport = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [tickets, setTickets] = useState(initialTickets);
  const [ticketForm, setTicketForm] = useState({ topic: "", details: "" });
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    dispatch(setPageTitle("Support Chat"));
  }, [dispatch]);

  const handleTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTickets((prev) => [
      { id: `TK-${3300 + prev.length + 1}`, subject: ticketForm.topic, status: "open", updatedAt: "2025-01-20" },
      ...prev,
    ]);
    setTicketForm({ topic: "", details: "" });
    setConfirmation("Ticket created. Our team will reply within 2 hours.");
  };

  const systemStatus = useMemo(() => "All services operational", []);

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Support" breadCrumbTitle="Vendor / Support" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System status</p>
            <p className="text-sm font-semibold text-slate-900">{systemStatus}</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            All services up
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact support</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">support@stadonclick.com</p>
          <p className="text-xs text-slate-500">Mon-Fri · 08:00 - 22:00 IST</p>
          <div className="mt-3 space-y-2 text-xs text-slate-500">
            <p>Phone: +91 99887 77665</p>
            <p>Live chat average queue: 2m</p>
          </div>
          <button
            type="button"
            className="mt-3 rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600"
          >
            Start chat
          </button>
        </div>

        <div className="lg:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Open tickets</p>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <span className="text-[11px] font-semibold">
                    {ticket.status === "open" ? "Open" : ticket.status === "waiting" ? "Waiting" : "Resolved"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Updated: {ticket.updatedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create ticket</p>
        <form className="mt-3 space-y-3" onSubmit={handleTicket}>
          <input
            placeholder="Topic"
            value={ticketForm.topic}
            onChange={(event) => setTicketForm((prev) => ({ ...prev, topic: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <textarea
            placeholder="Describe your issue"
            rows={3}
            value={ticketForm.details}
            onChange={(event) => setTicketForm((prev) => ({ ...prev, details: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Submit ticket
          </button>
        </form>
        {confirmation && (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <HiOutlineCheckCircle className="inline h-4 w-4" /> {confirmation}
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default VendorSupport;
