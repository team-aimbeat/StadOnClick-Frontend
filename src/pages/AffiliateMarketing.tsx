import { Link } from "react-router-dom";

export default function AffiliateMarketing() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          StadOnClick
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Affiliate Marketing</h1>
        <p className="mt-4 text-slate-600">
          Join the affiliate program to earn by referring customers and promoting local services.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Apply as Affiliate
          </button>
          <Link
            to="/support"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
