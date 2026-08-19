import {
  LayoutDashboard,
  Users,
  UserRound,
  BriefcaseBusiness,
  CalendarCheck,
  Bell,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useGetMeQuery } from "../store/api";

const Sidebar = ({ isOpen, onClose }) => {
  const { data } = useGetMeQuery();

  const role = data?.user?.role;

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: Users,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: UserRound,
    },
    {
      label: "Deals",
      path: "/deals",
      icon: BriefcaseBusiness,
    },
    {
      label: "Activities",
      path: "/activities",
      icon: CalendarCheck,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
  ];

  if (role === "admin") {
    links.push({
      label: "Users",
      path: "/users",
      icon: Users,
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          shadow-xl
          transition-transform duration-300 ease-in-out

          md:translate-x-0
          md:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <h1 className="text-lg font-bold text-slate-900">Sales CRM</h1>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
