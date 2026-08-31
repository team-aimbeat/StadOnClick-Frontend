import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type Faq = {
  question: string;
  answer: string;
};

const faqs: Faq[] = [
  { question: "How can I improve my response time?", answer: "Enable instant notifications and assign a team member to replies." },
  { question: "What happens if I cancel a booking?", answer: "A cancellation triggers a refund request. Communicate with the customer before refunding." },
  { question: "How do I raise a refund claim?", answer: "Open a ticket with the booking ID and include proof of service completion." },
];

const VendorHelp = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    dispatch(setPageTitle("Help Center"));
  }, [dispatch]);

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Help Center" breadCrumbTitle="Vendor / Help" />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System status</p>
            <p className="text-sm font-semibold text-slate-900">All systems normal</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            Connected / 24x7
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Search help</p>
          <input
            placeholder="Type your question"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Contact support</p>
            <p>Chat now · +91 99887 77665 · support@stadonclick.com</p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FAQs</p>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <button
                key={faq.question}
                type="button"
                onClick={() => setExpandedIndex((prev) => (prev === index ? -1 : index))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    {expandedIndex === index ? "Hide" : "Show"}
                  </span>
                </div>
                {expandedIndex === index && (
                  <p className="mt-2 text-xs font-normal text-slate-600">{faq.answer}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">User Manual</p>
            <p className="text-sm font-semibold text-slate-900">StadonClick Vendor Guide (PDF)</p>
            <p className="text-xs text-slate-600">
              Open the full manual or download a copy for quick reference.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink
              to="/vendor/help/user-manual"
              className="inline-flex items-center rounded-lg bg-[#4F7DFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3c63d1]"
            >
              View in portal
            </NavLink>
            <a
              href="/user-manual.pdf"
              download
              className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorHelp;
