import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Globe,
  Tag,
  CalendarDays,
  Users,
  CheckCircle,
  Briefcase,
  ExternalLink,
  Shield
} from "lucide-react";

function OpportunityDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {

    const fetchOpportunity = async () => {
      try {

        const res = await fetch(`http://localhost:5000/api/opportunities/${id}`);
        const data = await res.json();

        setOpportunity(data);

      } catch (err) {
        console.error("Error fetching opportunity:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();

  }, [id]);

  // Check if student already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (!user) {
        setCheckingApplication(false);
        return;
      }

      try {
        const studentId = user._id || user.id;
        const res = await fetch(`http://localhost:5000/api/applications?student=${studentId}`);
        if (res.ok) {
          const apps = await res.json();
          const existingApp = apps.find(
            app => (app.opportunity?._id || app.opportunity) === id
          );
          if (existingApp) {
            setHasApplied(true);
            setApplicationData(existingApp);
          }
        }
      } catch (err) {
        console.error("Error checking application:", err);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, [id, user?._id, user?.id]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Opportunity not found</h2>
          <p className="text-slate-400 mb-6">This opportunity may have been removed or is no longer available.</p>
          <button onClick={() => navigate(-1)} className="btn-premium px-6 py-2.5 text-sm">
            Go Back
          </button>
        </div>
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
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to opportunities
        </button>


        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title Card */}
            <div className="glass-card p-8 animate-fade-in">

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {opportunity.category && (
                      <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                        {opportunity.category}
                      </span>
                    )}
                    {hasApplied && (
                      <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        <CheckCircle size={12} />
                        Applied
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold mb-2 text-white">
                    {opportunity.title}
                  </h1>

                  <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
                    <Briefcase size={16} />
                    {opportunity.organization}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {opportunity.skills?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-sky-400 border border-slate-700/50 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>


            {/* About */}
            <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h2 className="text-sm uppercase text-slate-400 mb-4 tracking-wider font-semibold flex items-center gap-2">
                <div className="w-1 h-4 bg-sky-500 rounded-full"></div>
                About this opportunity
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>


            {/* Eligibility */}
            <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h2 className="flex items-center gap-2 text-sm uppercase text-slate-400 mb-4 tracking-wider font-semibold">
                <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                <Users size={16} />
                Eligibility Criteria
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(eligibility.minYear || eligibility.maxYear) && (
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <p className="text-xs text-slate-500 mb-1">Year</p>
                    <p className="text-sm text-slate-200 font-medium">
                      {eligibility.minYear} - {eligibility.maxYear}
                    </p>
                  </div>
                )}

                {eligibility.minCGPA && (
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <p className="text-xs text-slate-500 mb-1">Minimum CGPA</p>
                    <p className="text-sm text-slate-200 font-medium">{eligibility.minCGPA}</p>
                  </div>
                )}

                {eligibility.branches?.length > 0 && (
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 sm:col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Eligible Branches</p>
                    <p className="text-sm text-slate-200 font-medium">{eligibility.branches.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>


            {/* Application Data (shown when already applied) */}
            {hasApplied && applicationData && (
              <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h2 className="flex items-center gap-2 text-sm uppercase text-slate-400 mb-6 tracking-wider font-semibold">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <CheckCircle size={16} />
                  Your Application Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AppDetailItem label="Full Name" value={applicationData.name} />
                  <AppDetailItem label="Email" value={applicationData.email} />
                  <AppDetailItem label="Phone" value={applicationData.phone} />
                  <AppDetailItem label="College" value={applicationData.college} />
                  <AppDetailItem label="Branch" value={applicationData.branch} />
                  <AppDetailItem label="Year" value={applicationData.year} />
                  <AppDetailItem label="Portfolio" value={applicationData.portfolio} isLink />
                  <AppDetailItem 
                    label="Applied On" 
                    value={new Date(applicationData.appliedDate || applicationData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })} 
                  />
                  {applicationData.resume && (
                    <div className="sm:col-span-2 bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-xs text-slate-500 mb-1">Resume</p>
                      <a 
                        href={`http://localhost:5000/uploads/${applicationData.resume}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={14} />
                        View uploaded resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mt-6 pt-6 border-t border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Application Status</p>
                    <span className={`text-xs px-4 py-1.5 rounded-full font-semibold status-${applicationData.status?.toLowerCase()}`}>
                      {applicationData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>


          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            <div className="glass-card p-6 space-y-5 animate-fade-in" style={{ animationDelay: '150ms' }}>

              <InfoItem
                icon={Clock}
                label="Deadline"
                value={new Date(opportunity.deadline).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              />

              <InfoItem
                icon={CalendarDays}
                label="Posted On"
                value={new Date(opportunity.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
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


            {/* Action Button */}
            <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
              {checkingApplication ? (
                <div className="glass-card p-4 text-center">
                  <div className="w-6 h-6 mx-auto border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : hasApplied ? (
                <div className="glass-card p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Application Submitted</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    You've already applied for this opportunity. Your application is being reviewed.
                  </p>
                  <div className={`inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-semibold status-${applicationData?.status?.toLowerCase()}`}>
                    Status: {applicationData?.status || "Pending"}
                  </div>
                </div>
              ) : (
                <Link to={`/opportunity/${opportunity._id}/apply`}>
                  <button className="w-full btn-premium py-3.5 text-sm flex items-center justify-center gap-2 text-base font-semibold">
                    Apply Now
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </Link>
              )}
            </div>

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

      <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/15 flex-shrink-0">
        <Icon size={16} className="text-sky-400" />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-200">
          {value || "Not specified"}
        </p>
      </div>

    </div>
  );
}

/* ===============================
   APPLICATION DETAIL ITEM
================================ */

function AppDetailItem({ label, value, isLink }) {
  if (!value) return null;

  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {isLink && value ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          {value}
          <ExternalLink size={12} />
        </a>
      ) : (
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      )}
    </div>
  );
}