import { Routes, Route } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import AdminDashboard from "@/pages/AdminDashboard"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Signup />} />

      {/* App layout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<AdminDashboard/>} />
      </Route>
    </Routes>
  )
}
