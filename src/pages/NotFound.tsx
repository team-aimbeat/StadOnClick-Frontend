import { Link } from "react-router-dom"

const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-100">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-400/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-24 w-40 overflow-hidden rounded-2xl border border-blue-200/30 bg-[#005293] shadow-2xl shadow-blue-900/40">
            <div className="absolute inset-y-0 left-1/3 w-8 bg-[#FECB00]" />
            <div className="absolute left-0 top-1/2 h-8 w-full -translate-y-1/2 bg-[#FECB00]" />
          </div>

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-black">
              404 - Sidan saknas
            </p>
            <h1 className="text-4xl font-semibold text-black sm:text-5xl">
              Vi har tappat bort den har sidan.
            </h1>
            <p className="mx-auto max-w-xl text-base text-black sm:text-lg">
              Det ser ut som att vagen tog slut. Ladda om kartan eller hitta
              tillbaka till start.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-[#FECB00] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-yellow-400/20 transition hover:-translate-y-0.5 hover:bg-yellow-300"
          >
            Tillbaka till start
          </Link>
          <Link
            to="/admin/dashboard"
            className="rounded-full border bg-[#005293]  border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-100"
          >
            Ga till dashboard
          </Link>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 text-left text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white">
              Tips
            </p>
            <p className="mt-2">Kontrollera stavningen i URL:en.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white">
              Status
            </p>
            <p className="mt-2">Inga problem pa servern just nu.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white">
              Kontakt
            </p>
            <p className="mt-2">Behov av hjalp? Kontakta support.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
