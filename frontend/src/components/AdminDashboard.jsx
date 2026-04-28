import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, Users, Briefcase, FileText, Calendar, Settings, 
  Search, Filter, Download, Bell, Menu, X, TrendingUp,
  UserCheck, Clock, AlertCircle, CheckCircle, Eye
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    activeOpportunities: 0,
    expiredOpportunities: 0,
    draftOpportunities: 0,
    recentApplications: 0,
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: Home },
    { id: "opportunities", label: "Opportunities", icon: Briefcase },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, [activeSection]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          totalOpportunities: data.totalOpportunities || 0,
          totalApplications: data.totalApplications || 0,
          activeOpportunities: data.activeOpportunities || 0,
          expiredOpportunities: data.expiredOpportunities || 0,
          draftOpportunities: data.draftOpportunities || 0,
          recentApplications: data.recentApplications || 0,
          recentUsers: data.recentUsers || 0
        });
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  const StatCard = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
      green: "from-green-500/20 to-green-600/20 border-green-500/30",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
      orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
      red: "from-red-500/20 to-red-600/20 border-red-500/30",
      yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30"
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl backdrop-blur-xl p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
              {icon}
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className="w-4 h-4" />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
          <div className="text-white/70 text-sm">{title}</div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users />}
          color="blue"
          trend={stats.recentUsers}
        />
        <StatCard
          title="Total Opportunities"
          value={stats.totalOpportunities}
          icon={<Briefcase />}
          color="green"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText />}
          color="purple"
          trend={stats.recentApplications}
        />
        <StatCard
          title="Active Opportunities"
          value={stats.activeOpportunities}
          icon={<CheckCircle />}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Expired Opportunities"
          value={stats.expiredOpportunities}
          icon={<Clock />}
          color="red"
        />
        <StatCard
          title="Draft Opportunities"
          value={stats.draftOpportunities}
          icon={<AlertCircle />}
          color="yellow"
        />
        <StatCard
          title="Recent Applications"
          value={stats.recentApplications}
          icon={<TrendingUp />}
          color="blue"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-slate-400 text-sm">{activity.details}</p>
                </div>
                <div className="text-slate-500 text-sm">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-xl transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-xl font-bold text-white ${!sidebarOpen && 'hidden'}`}>
            CampusBridge
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-white capitalize">
            {activeSection.replace('-', ' ')}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-800/50 border border-slate-700/50 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === "overview" && renderOverview()}
          {activeSection === "opportunities" && (
            <div className="text-white text-center py-8">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">Opportunities Management</h3>
              <p className="text-slate-400">Full opportunity management system coming soon...</p>
            </div>
          )}
          {activeSection === "applications" && (
            <div className="text-white text-center py-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">Applications Management</h3>
              <p className="text-slate-400">Application review system coming soon...</p>
            </div>
          )}
          {activeSection === "users" && (
            <div className="text-white text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-slate-400">User administration coming soon...</p>
            </div>
          )}
          {activeSection === "calendar" && (
            <div className="text-white text-center py-8">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">Calendar View</h3>
              <p className="text-slate-400">Deadline calendar coming soon...</p>
            </div>
          )}
          {activeSection === "settings" && (
            <div className="text-white text-center py-8">
              <Settings className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">System Settings</h3>
              <p className="text-slate-400">Configuration panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
