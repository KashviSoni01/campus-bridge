import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  FileText,
  Clock,
  MapPin,
  Globe,
  Trash2
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

function MyApplications() {

  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ===============================
     FETCH APPLICATIONS
  =============================== */

  useEffect(() => {

    if (!user) return;

    fetch("http://localhost:5000/api/applications")
      .then((res) => res.json())
      .then((data) => {

        const studentId = user?.id || user?._id;
        
        const studentApps = data.filter(
          (app) => app.student === studentId || app.student?._id === studentId || app.student?.toString?.() === studentId
        );

        console.log("Student ID:", studentId, "Apps found:", studentApps.length);

        setApplications(studentApps);

      })
      .catch((err) => console.error(err));

  }, [user]);


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


  return (

    <DashboardLayout>

      <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-2xl font-semibold mb-1">
            My Applications
          </h1>

          <p className="text-slate-400 mb-6">
            Track your applications and saved opportunities
          </p>


          {/* Tabs */}

          <div className="flex gap-3 mb-8">

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

            <div className="grid md:grid-cols-2 gap-6">

              {applications.length === 0 ? (

                <p className="text-slate-400">
                  No applications yet.
                </p>

              ) : (

                applications.map((app) => {

                  const opp = app.opportunity;

                  if (!opp) return null;

                  return (

                    <div
                      key={app._id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col"
                    >

                      <div className="flex justify-between mb-3">

                        <div>

                          <h3 className="text-lg font-semibold">
                            {opp.title}
                          </h3>

                          <p className="text-sm text-slate-400">
                            {opp.organization}
                          </p>

                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400">
                          {app.status}
                        </span>

                      </div>


                      <p className="text-xs text-slate-400 mt-auto">

                        Applied on{" "}
                        {new Date(
                          app.appliedDate || app.createdAt
                        ).toLocaleDateString()}

                      </p>


                      <Link
                        to={`/opportunity/${opp._id}`}
                        className="mt-4"
                      >

                        <button className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black text-sm py-2 rounded-lg font-medium hover:brightness-110 transition">

                          View Opportunity

                        </button>

                      </Link>

                    </div>

                  );

                })

              )}

            </div>

          )}


          {/* ===============================
             SAVED TAB
          =============================== */}

          {activeTab === "saved" && (

            <div className="grid md:grid-cols-2 gap-6">

              {saved.length === 0 ? (

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                  <Bookmark className="mx-auto text-slate-500 mb-3" size={32} />

                  <p className="text-slate-400">
                    No saved opportunities yet.
                  </p>

                </div>

              ) : (

                saved.map((opp) => (

                  <div
                    key={opp._id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col"
                  >

                    <div className="flex justify-between mb-3">

                      <h3 className="font-semibold text-lg">
                        {opp.title}
                      </h3>

                      <button
                        onClick={() => removeSaved(opp._id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                    <p className="text-sm text-slate-400 mb-2">
                      {opp.organization}
                    </p>


                    <div className="flex gap-4 text-xs text-slate-400 mt-auto mb-4">

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(opp.deadline).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1">

                        {opp.mode === "Online"
                          ? <Globe size={14}/>
                          : <MapPin size={14}/>
                        }

                        {opp.mode === "Online"
                          ? "Online"
                          : opp.location
                        }

                      </span>

                    </div>


                    <div className="grid grid-cols-2 gap-3">

                      <Link to={`/opportunity/${opp._id}`}>

                        <button className="w-full border border-slate-700 py-2 rounded-lg text-sm hover:bg-slate-800">

                          View Details

                        </button>

                      </Link>


                      <Link to={`/opportunity/${opp._id}/apply`}>

                        <button className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black py-2 rounded-lg text-sm font-medium hover:brightness-110">

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

    </DashboardLayout>

  );

}

export default MyApplications;



function TabButton({ active, icon: Icon, label, count, onClick }) {

  return (

    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition
      ${
        active
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
      }`}
    >

      <Icon size={16} />

      {label}

      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">
        {count}
      </span>

    </button>

  );

}