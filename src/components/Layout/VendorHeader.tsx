import { Link, NavLink } from "react-router-dom"
import logo from "@/assets/logo/logo.png"

const navLinkClass =
  "text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-3 py-2 rounded-lg"

export default function VendorHeader() {
  return (
    <header className="z-30 bg-white/90 backdrop-blur border-b border-slate-200/70">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/vendor/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Vendor" className="h-9 w-9 object-contain" />
            <span className="text-lg font-semibold text-slate-800">
              Vendor Console
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/vendor/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/vendor/chat" className={navLinkClass}>
            Chat
          </NavLink>
          <NavLink to="/vendor/kyc" className={navLinkClass}>
            KYC
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/vendor/profile"
            className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-3 py-2 rounded-lg"
          >
            Profile
          </Link>
          <Link
            to="/vendor/chat"
            className="text-sm font-semibold rounded-lg bg-primary text-white px-3.5 py-2 shadow-sm hover:bg-primary/90 transition-colors"
          >
            Messages
          </Link>
        </div>
      </div>
    </header>
  )
}
