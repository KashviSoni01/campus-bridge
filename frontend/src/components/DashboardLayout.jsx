import DashboardSidebar from "./DashboardSidebar";
import TopNavbar from "./TopNavbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 ml-64">

        {/* Top navbar */}
        <TopNavbar />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;