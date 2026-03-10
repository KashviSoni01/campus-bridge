import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Globe,
  Tag,
  CalendarDays,
  Users
} from "lucide-react";

function OpportunityDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchOpportunity = async () => {
      try {

        const res = await fetch(`http://localhost:5000/api/opportunities/${id}`);
        const data = await res.json();

        console.log("Opportunity Details:", data);

        setOpportunity(data);

      } catch (err) {
        console.error("Error fetching opportunity:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();

  }, [id]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading opportunity...
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        Opportunity not found.
      </div>
    );
  }


  const eligibility = opportunity.eligibility || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* Back Button */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>


        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-6">

            {/* Title Card */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h1 className="text-2xl font-semibold mb-2">
                {opportunity.title}
              </h1>

              <p className="text-slate-400 mb-4">
                {opportunity.organization}
              </p>

              <div className="flex flex-wrap gap-2">

                {opportunity.skills?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400"
                  >
                    {tag}
                  </span>
                ))}

              </div>

            </div>


            {/* About */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="text-sm uppercase text-slate-400 mb-3">
                About
              </h2>

              <p className="text-slate-300 leading-relaxed">
                {opportunity.description}
              </p>

            </div>


            {/* Eligibility */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="flex items-center gap-2 text-sm uppercase text-slate-400 mb-3">
                <Users size={16} />
                Eligibility
              </h2>

              <div className="text-sm text-slate-300 space-y-1">

                <p>
                  Year: {eligibility.minYear} - {eligibility.maxYear}
                </p>

                <p>
                  Minimum CGPA: {eligibility.minCGPA}
                </p>

                {eligibility.branches?.length > 0 && (
                  <p>
                    Branches: {eligibility.branches.join(", ")}
                  </p>
                )}

              </div>

            </div>

          </div>


          {/* RIGHT SIDEBAR */}

          <div className="space-y-6">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

              <InfoItem
                icon={Clock}
                label="Deadline"
                value={new Date(opportunity.deadline).toDateString()}
              />

              <InfoItem
                icon={CalendarDays}
                label="Posted On"
                value={new Date(opportunity.createdAt).toDateString()}
              />

              <InfoItem
                icon={opportunity.mode === "Online" ? Globe : MapPin}
                label="Location"
                value={opportunity.location || opportunity.mode}
              />

              <InfoItem
                icon={Tag}
                label="Category"
                value={opportunity.category}
              />

            </div>


            {/* Apply Button */}

            <Link to={`/opportunity/${opportunity._id}/apply`}>

              <button className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black font-semibold py-3 rounded-xl hover:brightness-110 transition">

                Apply Now →

              </button>

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default OpportunityDetail;


/* ===============================
   INFO ITEM COMPONENT
================================ */

function InfoItem({ icon: Icon, label, value }) {

  return (
    <div className="flex items-start gap-3">

      <div className="w-9 h-9 bg-sky-500/10 rounded-lg flex items-center justify-center">
        <Icon size={16} className="text-sky-400" />
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium">
          {value || "Not specified"}
        </p>

      </div>

    </div>
  );
}