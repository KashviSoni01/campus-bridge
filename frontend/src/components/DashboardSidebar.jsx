import { LayoutDashboard, FileText, User, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/student" },
  { label: "My Applications", icon: FileText, path: "/applications" },
  { label: "Profile", icon: User, path: "/profile" },
];

function DashboardSidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-sky-400">
          CampusBridge
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Student Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">

        {navItems.map((item, i) => {

          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition
                  ${
                    isActive
                      ? "bg-sky-500/20 text-sky-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            </motion.div>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="px-3 pb-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;