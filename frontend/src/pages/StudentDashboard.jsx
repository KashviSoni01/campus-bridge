import { useEffect, useState } from "react";
import { Trophy, Briefcase, GraduationCap, CalendarDays } from "lucide-react";
import OpportunityCard from "../components/OpportunityCard";
import DashboardLayout from "../components/DashboardLayout";

const categories = [
  { key: "hackathons", title: "Hackathons", icon: Trophy },
  { key: "internships", title: "Internships", icon: Briefcase },
  { key: "workshops", title: "Workshops", icon: GraduationCap },
  { key: "events", title: "Events", icon: CalendarDays },
];

function StudentDashboard() {

  const [active, setActive] = useState("internships");
  const [opportunities, setOpportunities] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);

  /* ===========================
     FETCH OPPORTUNITIES
  =========================== */

  useEffect(() => {

    const fetchOpportunities = async () => {
      try {

        const res = await fetch("http://localhost:5000/api/opportunities");
        const data = await res.json();

        console.log("Fetched Opportunities:", data);

        setOpportunities(data);

      } catch (err) {
        console.error("Error fetching opportunities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();

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

    const map = {
      hackathons: "Hackathon",
      internships: "Internship",
      workshops: "Workshop",
      events: "Event",
    };

    return o.category === map[active];

  });


  return (
    <DashboardLayout>

      <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

        <div className="max-w-6xl mx-auto">

          {/* Header */}

          <h2 className="text-2xl font-semibold mb-1">
            Welcome back{" "}
            <span className="text-sky-400">{studentName}</span> 👋
          </h2>

          <p className="text-slate-400 mb-6">
            Explore opportunities across categories
          </p>


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

    </DashboardLayout>
  );
}

export default StudentDashboard;