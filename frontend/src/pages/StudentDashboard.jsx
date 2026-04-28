import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Briefcase, GraduationCap, CalendarDays, Search, Filter,
  Clock, MapPin, Users, Star, TrendingUp, Eye, ChevronRight, FileText
} from "lucide-react";
import OpportunityCard from "../components/OpportunityCard";
import Navbar from "../components/Navbar.jsx";

const categories = [
  { key: "all", title: "All", icon: Briefcase },
  { key: "internships", title: "Internships", icon: Briefcase },
  { key: "hackathons", title: "Hackathons", icon: Trophy },
  { key: "workshops", title: "Workshops", icon: GraduationCap },
  { key: "competitions", title: "Competitions", icon: Trophy },
  { key: "events", title: "Events", icon: CalendarDays },
];

function StudentDashboard() {

  const navigate = useNavigate();

  const [active, setActive] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    appliedCount: 0,
    savedCount: 0,
    upcomingDeadlines: 0
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  /* ===========================
     FETCH OPPORTUNITIES & STATS
  =========================== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch opportunities
        const oppRes = await fetch("http://localhost:5000/api/opportunities");
        const oppData = await oppRes.json();
        setOpportunities(oppData);

        // Calculate stats
        const now = new Date();
        const upcomingDeadlines = oppData.filter(opp => {
          const deadline = new Date(opp.deadline);
          const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
        }).length;

        setStats({
          totalOpportunities: oppData.length,
          appliedCount: 0, // Will be updated when we fetch applications
          savedCount: 0, // Will be updated when we implement saved feature
          upcomingDeadlines
        });

        // Fetch student's applications
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const appRes = await fetch(`http://localhost:5000/api/applications?student=${parsedUser._id}`);
          if (appRes.ok) {
            const appData = await appRes.json();
            setStats(prev => ({ ...prev, appliedCount: appData.length }));
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  /* ===========================
     GET STUDENT NAME
  =========================== */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setStudentName(parsedUser?.fullName || "Student");
    }

  }, []);


  /* ===========================
     FILTER OPPORTUNITIES
  =========================== */

  const filtered = opportunities.filter((o) => {
    // Category filter
    if (active !== "all") {
      const map = {
        hackathons: "Hackathon",
        internships: "Internship",
        workshops: "Workshop",
        competitions: "Competition",
        events: "Event",
      };
      if (o.category !== map[active]) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        o.title?.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.organization?.toLowerCase().includes(query)
      );
    }

    return true;
  });


  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar 
        userRole="student" 
        userName={studentName}
        onLogout={handleLogout}
      />

      <div className="text-slate-50 px-6 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}

          <h2 className="text-3xl font-bold mb-2">
            Welcome back{" "}
            <span className="text-sky-400">{studentName}</span> 👋
          </h2>

          <p className="text-slate-400 mb-8">
            Discover amazing opportunities tailored for you
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalOpportunities}</div>
              <div className="text-blue-300 text-sm">Total Opportunities</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.appliedCount}</div>
              <div className="text-green-300 text-sm">Applications Sent</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.savedCount}</div>
              <div className="text-purple-300 text-sm">Saved Opportunities</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.upcomingDeadlines}</div>
              <div className="text-orange-300 text-sm">Deadlines This Week</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl hover:bg-slate-800/70 transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Buttons */}

          <div className="flex flex-wrap gap-3 mb-8">

            {categories.map((cat) => {

              const Icon = cat.icon;
              const isActive = active === cat.key;

              return (
                <button
                  key={cat.key}
                  onClick={() => setActive(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-sky-500 text-black"
                      : "bg-slate-900 border border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {cat.title}
                </button>
              );
            })}

          </div>


          {/* Opportunities Grid */}

          {loading ? (

            <p className="text-slate-400">Loading opportunities...</p>

          ) : filtered.length === 0 ? (

            <p className="text-slate-400">No opportunities available.</p>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                />
              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;