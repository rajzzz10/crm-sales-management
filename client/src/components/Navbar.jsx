import { Bell, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetMeQuery, useLogoutMutation } from "../store/api";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const user = data?.user;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile / Tablet menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-slate-500 sm:text-sm">Welcome back</p>

          <p className="truncate font-semibold text-slate-900">
            {user?.name || "User"}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* User info */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {user?.name || "User"}
          </p>

          <p className="text-xs capitalize text-slate-500">
            {user?.role || "user"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
