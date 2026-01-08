import { Outlet, useLocation } from "react-router-dom"

export default function SiteLayout() {
  const { pathname } = useLocation()
  const isOnboarding = pathname.startsWith("/signup") || pathname.startsWith("/sign-in")

  const siteSettings: React.CSSProperties = {
    "--site-bg": "#ffffff",
    "--site-max-width": isOnboarding ? "100vw" : "92rem",
  }

  return (
    <div className="site-shell" style={siteSettings}>
      <div className="site-container">
        <Outlet />
      </div>
    </div>
  )
}
