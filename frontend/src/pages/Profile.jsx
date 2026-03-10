import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  GraduationCap,
  Github,
  User,
  MapPin
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

function Profile() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER DATA
  ========================= */

  useEffect(() => {

    const loadUser = async () => {

      try {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }

      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }

    };

    loadUser();

  }, []);


  /* =========================
     INITIALS
  ========================= */

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";


  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl font-semibold mb-8">
            My Profile
          </h1>

          {/* Profile Card */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex items-center gap-6">

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center text-black text-xl font-bold">
              {initials}
            </div>

            <div className="flex-1">

              <h2 className="text-xl font-semibold">
                {user?.fullName || "Student"}
              </h2>

              <p className="text-sm text-slate-400">
                {user?.department || "Branch"} • Year {user?.year || "-"}
              </p>

              <p className="text-xs text-sky-400 mt-1">
                Profile Score: 85%
              </p>

            </div>

            <button className="bg-sky-500 hover:bg-sky-400 text-black text-sm px-4 py-2 rounded-lg font-medium">
              Edit Profile
            </button>

          </div>


          {/* Info Grid */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <InfoCard icon={Mail} label="Email" value={user?.email} />
            <InfoCard icon={Phone} label="Phone" value={user?.phone} />
            <InfoCard icon={GraduationCap} label="College" value={user?.college} />
            <InfoCard icon={MapPin} label="Location" value={user?.location} />
            <InfoCard icon={User} label="Department" value={user?.department} />
            <InfoCard icon={Github} label="GitHub" value={user?.github} />

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Profile;


/* ===============================
   INFO CARD
================================ */

function InfoCard({ icon: Icon, label, value }) {

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">

      <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-sky-400" />
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium">
          {value || "Not provided"}
        </p>
      </div>

    </div>
  );
}