import { HiArrowDownTray } from "react-icons/hi2";

const VendorUserManualPage = () => {
  const pdfPath = "/user-manual.pdf";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Vendor / Help</p>
          <h1 className="text-2xl font-semibold text-slate-900">Help &amp; User Manual</h1>
          <p className="text-sm text-slate-600">
            Browse the StadonClick User Manual below or download a copy for offline reference.
          </p>
        </div>

        <a  
          href={pdfPath}
          download
          className="inline-flex items-center gap-2 rounded-lg bg-[#4F7DFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3c63d1]"
        >
          <HiArrowDownTray className="h-5 w-5" />
          Download PDF
        </a>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="StadonClick User Manual"
          src={`${pdfPath}#toolbar=1&navpanes=0`}
          className="h-[75vh] w-full"
        />
      </section>
    </div>
  );
};

export default VendorUserManualPage;
