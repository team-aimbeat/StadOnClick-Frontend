import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";

import { useLogoutMutation } from "@/features/auth/api/authApi";
import { clearAuth } from "@/features/auth/authSlice";
import { useAppSelector } from "@/app/hooks";
import Dropdown from "@/components/shared/dropdown";
import { toast } from "react-hot-toast";
import ModeratorNotificationsBell from "@/components/notifications/ModeratorNotificationsBell";

export default function ModeratorHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(clearAuth());
      toast.success("Logged out");
      navigate("/admin/sign-in", { replace: true });
    } catch (error) {
      dispatch(clearAuth());
      navigate("/admin/sign-in", { replace: true });
      toast.error("Logout failed, cleared local session.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Moderator</p>
          <h1 className="text-lg font-semibold text-slate-900">Escalation Console</h1>
        </div>

        <div className="flex items-center gap-3">
          <ModeratorNotificationsBell />

          <Dropdown
            offset={[0, 8]}
            placement="bottom-end"
            btnClassName="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            button={
              <span className="inline-flex items-center gap-2">
                {user?.firstName ?? "Moderator"}
              </span>
            }
          >
            <ul className="w-55 text-sm font-semibold text-slate-700">
              <li className="px-4 py-3 text-xs text-slate-500">
                {user?.email ?? "Signed in"}
              </li>
              <li className="border-t border-slate-100">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-3 text-danger hover:text-danger"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
