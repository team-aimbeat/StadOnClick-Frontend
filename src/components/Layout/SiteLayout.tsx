import { Outlet } from "react-router-dom"

const siteSettings: React.CSSProperties = {
  "--site-bg": "#ffffff",
  "--site-max-width": "92rem",
}

export default function SiteLayout() {
  return (
    <div className="site-shell" style={siteSettings}>
      <div className="site-container">
        <Outlet />
      </div>
    </div>
  )
}
