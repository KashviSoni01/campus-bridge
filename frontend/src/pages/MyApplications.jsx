import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  FileText,
  Clock,
  MapPin,
  Globe,
  Trash2,
  Eye,
  Briefcase,
  CheckCircle,
  ArrowUpRight,
  Calendar,
  Search
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";

function MyApplications() {

  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ===============================
     FETCH APPLICATIONS
  =============================== */

  useEffect(() => {

    if (!user) return;

    setLoading(true);

    fetch(`http://localhost:5000/api/applications?student=${user?._id || user?.id}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

  }, []);


  /* ===============================
     FETCH SAVED
  =============================== */

  useEffect(() => {

    fetch("http://localhost:5000/api/saved")
      .then((res) => res.json())
      .then((data) => setSaved(data))
      .catch((err) => console.error(err));

  }, []);


  /* ===============================
     REMOVE SAVED
  =============================== */

  const removeSaved = async (id) => {

    try {

      await fetch(`http://localhost:5000/api/saved/${id}`, {
        method: "DELETE"
      });

      setSaved(saved.filter((s) => s._id !== id));

    } catch (err) {

      console.error(err);

    }

  };

  const getStatusClass = (status) => {
    return `status-${(status || 'pending').toLowerCase()}`;
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar 
        userRole="student" 
        userName={user?.fullName || "Student"}
        onLogout={handleLogout}
      />
      <div className="flex-1 text-slate-50 px-6 py-10">

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">
              My Applications
            </h1>
            <p className="text-slate-400">
              Track your applications and manage saved opportunities
            </p>
          </div>


          {/* Tabs */}
          <div className="flex gap-3 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>

            <TabButton
              active={activeTab === "applications"}
              icon={FileText}
              label="Applications"
              count={applications.length}
              onClick={() => setActiveTab("applications")}
            />

            <TabButton
              active={activeTab === "saved"}
              icon={Bookmark}
              label="Saved"
              count={saved.length}
              onClick={() => setActiveTab("saved")}
            />

          </div>


          {/* ===============================
             APPLICATIONS TAB
          =============================== */}

          {activeTab === "applications" && (

            <>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-6 animate-shimmer" style={{ minHeight: '200px' }}>
                      <div className="h-5 bg-slate-800 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
                      <div className="h-3 bg-slate-800 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-800 rounded w-4/5 mb-6"></div>
                      <div className="h-10 bg-slate-800 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (

                <div className="glass-card p-16 text-center animate-scale-in">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No applications yet</h3>
                  <p className="text-slate-500 mb-6">Start exploring opportunities and submit your first application!</p>
                  <Link to="/student">
                    <button className="btn-premium px-8 py-3 text-sm">
                      Browse Opportunities
                    </button>
                  </Link>
                </div>

              ) : (

                <div className="grid md:grid-cols-2 gap-6">
                  {applications.map((app, index) => {

                    const opp = app.opportunity;

                    if (!opp) return null;

                    return (

                      <div
                        key={app._id}
                        className="glass-card glass-card-hover p-6 flex flex-col animate-slide-up"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {opp.category && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 font-medium">
                                  {opp.category}
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1">
                              {opp.title}
                            </h3>

                            <p className="text-sm text-slate-400 flex items-center gap-1.5">
                              <Briefcase size={13} />
                              {opp.organization}
                            </p>
                          </div>

                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ml-3 ${getStatusClass(app.status)}`}>
                            {app.status}
                          </span>

                        </div>

                        {/* Application info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-5">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            Applied {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {opp.deadline && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} />
                              Due {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {/* Skills preview */}
                        {opp.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {opp.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}


                        {/* Action - Links to OpportunityDetail which shows filled data */}
                        <Link
                          to={`/opportunity/${opp._id}`}
                          className="mt-auto"
                        >
                          <button className="w-full btn-premium py-2.5 text-sm flex items-center justify-center gap-2 group">
                            <Eye size={14} />
                            View Details & Application
                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        </Link>

                      </div>

                    );

                  })}
                </div>

              )}
            </>

          )}


          {/* ===============================
             SAVED TAB
          =============================== */}

          {activeTab === "saved" && (

            <div className="grid md:grid-cols-2 gap-6">

              {saved.length === 0 ? (

                <div className="md:col-span-2 glass-card p-16 text-center animate-scale-in">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                    <Bookmark className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No saved opportunities</h3>
                  <p className="text-slate-500">Save opportunities you're interested in to review them later.</p>
                </div>

              ) : (

                saved.map((opp, index) => (

                  <div
                    key={opp._id}
                    className="glass-card glass-card-hover p-6 flex flex-col animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >

                    <div className="flex justify-between items-start mb-3">

                      <h3 className="font-semibold text-lg text-white">
                        {opp.title}
                      </h3>

                      <button
                        onClick={() => removeSaved(opp._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                    <p className="text-sm text-slate-400 mb-3 flex items-center gap-1.5">
                      <Briefcase size={13} />
                      {opp.organization}
                    </p>


                    <div className="flex gap-4 text-xs text-slate-500 mt-auto mb-5">

                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>

                      <span className="flex items-center gap-1.5">

                        {opp.mode === "Online"
                          ? <Globe size={13}/>
                          : <MapPin size={13}/>
                        }

                        {opp.mode === "Online"
                          ? "Online"
                          : opp.location
                        }

                      </span>

                    </div>


                    <div className="grid grid-cols-2 gap-3">

                      <Link to={`/opportunity/${opp._id}`}>
                        <button className="w-full glass-card glass-card-hover py-2.5 rounded-xl text-sm text-slate-300 hover:text-white font-medium transition-all">
                          View Details
                        </button>
                      </Link>

                      <Link to={`/opportunity/${opp._id}/apply`}>
                        <button className="w-full btn-premium py-2.5 text-sm font-medium">
                          Apply
                        </button>
                      </Link>

                    </div>

                  </div>

                ))

              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );

}

export default MyApplications;



function TabButton({ active, icon: Icon, label, count, onClick }) {

  return (

    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
      ${
        active
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5"
          : "glass-card text-slate-400 hover:text-slate-200"
      }`}
    >

      <Icon size={16} />

      {label}

      <span className={`text-xs px-2.5 py-0.5 rounded-full ${
        active
          ? "bg-sky-500/20 text-sky-300"
          : "bg-slate-800 text-slate-500"
      }`}>
        {count}
      </span>

    </button>

  );

}