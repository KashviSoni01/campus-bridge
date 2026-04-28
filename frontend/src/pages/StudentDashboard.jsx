import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Briefcase, GraduationCap, CalendarDays, Search, Filter,
  Clock, MapPin, Users, Star, TrendingUp, Eye, ChevronRight, FileText,
  Zap, ArrowUpRight, Sparkles
} from "lucide-react";
import OpportunityCard from "../components/OpportunityCard";
import Navbar from "../components/Navbar.jsx";

const categories = [
  { key: "all", title: "All", icon: Sparkles },
  { key: "internships", title: "Internships", icon: Briefcase },
  { key: "hackathons", title: "Hackathons", icon: Trophy },
  { key: "workshops", title: "Workshops", icon: GraduationCap },
  { key: "competitions", title: "Competitions", icon: Zap },
  { key: "events", title: "Events", icon: CalendarDays },
];

function StudentDashboard() {

  const navigate = useNavigate();

  const [active, setActive] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
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

  // Get search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchFromUrl = params.get("search");
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch opportunities - passing search if present, and only getting active ones
        let url = "http://localhost:5000/api/opportunities?includeExpired=false";
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        const oppRes = await fetch(url);
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
          appliedCount: 0,
          savedCount: 0,
          upcomingDeadlines
        });

        // Fetch student's applications
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const appRes = await fetch(`http://localhost:5000/api/applications?student=${parsedUser._id || parsedUser.id}`);
          if (appRes.ok) {
            const appData = await appRes.json();
            setStats(prev => ({ ...prev, appliedCount: appData.length }));
            // Track which opportunity IDs have been applied to
            const ids = appData.map(app => app.opportunity?._id || app.opportunity).filter(Boolean);
            setAppliedIds(ids);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch slightly if typing in local search bar
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Re-fetch when search changes


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

    return true;
  });

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };


  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar 
        userRole="student" 
        userName={studentName}
        onLogout={handleLogout}
      />

      <div className="text-slate-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Hero Header */}
          <div className="relative mb-10 animate-fade-in">
            {/* Decorative background glow */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-10 right-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative">
              <p className="text-slate-400 text-sm font-medium tracking-wider uppercase mb-2">
                {getGreeting()},
              </p>
              <h2 className="text-4xl font-bold mb-3">
                <span className="gradient-text">{studentName}</span> 👋
              </h2>
              <p className="text-slate-400 text-lg max-w-xl">
                Discover amazing opportunities tailored for you. Stay ahead with the latest internships, hackathons, and more.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            
            <div className="glass-card glass-card-hover p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Live
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalOpportunities}</div>
              <div className="text-slate-400 text-sm">Total Opportunities</div>
            </div>

            <div className="glass-card glass-card-hover p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.appliedCount}</div>
              <div className="text-slate-400 text-sm">Applications Sent</div>
            </div>

            <div className="glass-card glass-card-hover p-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-violet-600/30 rounded-xl flex items-center justify-center border border-violet-500/20">
                  <Star className="w-6 h-6 text-violet-400" />
                </div>
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.savedCount}</div>
              <div className="text-slate-400 text-sm">Saved Opportunities</div>
            </div>

            <div className="glass-card glass-card-hover p-6 animate-slide-up" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/30 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.upcomingDeadlines}</div>
              <div className="text-slate-400 text-sm">Deadlines This Week</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
              <input
                type="text"
                placeholder="Search opportunities, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 glass-card text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3.5 glass-card glass-card-hover text-slate-300 hover:text-white font-medium transition-all">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-3 mb-10 animate-fade-in" style={{ animationDelay: '350ms' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = active === cat.key;

              return (
                <button
                  key={cat.key}
                  onClick={() => setActive(cat.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "btn-premium text-black shadow-lg shadow-sky-500/20"
                      : "glass-card text-slate-400 hover:text-white hover:border-slate-600"
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card p-6 animate-shimmer" style={{ minHeight: '260px' }}>
                  <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-800 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2 mb-6"></div>
                  <div className="h-3 bg-slate-800 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-4/5 mb-6"></div>
                  <div className="h-10 bg-slate-800 rounded w-full mt-auto"></div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (

            <div className="glass-card p-16 text-center animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No opportunities found</h3>
              <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((opp, index) => (
                <div key={opp._id} className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <OpportunityCard
                    opportunity={opp}
                    hasApplied={appliedIds.includes(opp._id)}
                  />
                </div>
              ))}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;