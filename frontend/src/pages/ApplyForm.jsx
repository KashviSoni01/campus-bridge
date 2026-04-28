import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, FileUp, CheckCircle, AlertCircle, Upload } from "lucide-react";

function ApplyForm() {

  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    portfolio: "",
    resume: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [opportunity, setOpportunity] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, []);


  // Check if already applied on mount
  useEffect(() => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }

    const checkExisting = async () => {
      try {
        const studentId = user._id || user.id;
        const [appRes, oppRes] = await Promise.all([
          fetch(`http://localhost:5000/api/applications?student=${studentId}`),
          fetch(`http://localhost:5000/api/opportunities/${id}`)
        ]);

        if (oppRes.ok) {
          const oppData = await oppRes.json();
          setOpportunity(oppData);
        }

        if (appRes.ok) {
          const apps = await appRes.json();
          const exists = apps.find(
            app => (app.opportunity?._id || app.opportunity) === id
          );
          if (exists) {
            setAlreadyApplied(true);
          }
        }
      } catch (err) {
        console.error("Error checking application status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExisting();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      resume: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();

    data.append("opportunityId", id);
    data.append("student", user?.id || user?._id);
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.phone) data.append("phone", formData.phone);
    if (formData.college) data.append("college", formData.college);
    if (formData.branch) data.append("branch", formData.branch);
    if (formData.year) data.append("year", formData.year);
    if (formData.portfolio) data.append("portfolio", formData.portfolio);
    if (formData.resume) data.append("resume", formData.resume);

    try {

      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to submit");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/student");
      }, 2500);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  // Guard: don't render if not logged in (redirect happens in useEffect above)
  if (!user) return null;

  // Loading state while checking
  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Checking application status...</p>
        </div>
      </div>
    );
  }

  // Already applied screen
  if (alreadyApplied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-6">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>

          <h2 className="text-2xl font-bold mb-3 text-white">
            Already Applied!
          </h2>

          <p className="text-slate-400 mb-2">
            You've already submitted your application
            {opportunity?.title && (
              <> for <span className="text-sky-400 font-medium">{opportunity.title}</span></>
            )}.
          </p>

          <p className="text-slate-500 text-sm mb-8">
            Your application is being reviewed. Check "My Applications" for updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/opportunity/${id}`)}
              className="flex-1 glass-card glass-card-hover py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              View Opportunity
            </button>
            <button
              onClick={() => navigate("/applications")}
              className="flex-1 btn-premium py-3 text-sm"
            >
              My Applications
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 animate-glow">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-white">
            Application Submitted!
          </h2>

          <p className="text-slate-400 mb-1">
            Your application has been received successfully.
          </p>

          <p className="text-slate-500 text-sm">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Opportunity title preview */}
        {opportunity && (
          <div className="glass-card p-5 mb-6 animate-fade-in">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Applying for</p>
            <h2 className="text-lg font-semibold text-white">{opportunity.title}</h2>
            <p className="text-sm text-slate-400">{opportunity.organization}</p>
          </div>
        )}

        <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>

          <h1 className="text-2xl font-bold mb-1 text-white">
            Submit Your Application
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Fill in your details below. Fields marked with * are required.
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 animate-scale-in">
              <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              <InputField label="College" name="college" value={formData.college} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange} required />
              <InputField label="Year" name="year" value={formData.year} onChange={handleChange} required />
            </div>

            <InputField label="Portfolio URL" name="portfolio" type="url" value={formData.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" required />

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Resume (PDF or Word)
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="resume-upload"
                />
                <label 
                  htmlFor="resume-upload" 
                  className="flex items-center gap-3 w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 cursor-pointer hover:border-sky-500/30 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center border border-sky-500/15 group-hover:bg-sky-500/20 transition-colors">
                    <Upload size={18} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">
                      {formData.resume ? formData.resume.name : "Click to upload your resume"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formData.resume ? `${(formData.resume.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, DOCX up to 10MB"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-3.5 text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Submit Application →"
              )}
            </button>

          </form>

        </div>

      </div>

    </div>

  )

}

export default ApplyForm;


function InputField({ label, required, ...props }) {

  return (

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-sky-400">*</span>}
      </label>

      <input
        {...props}
        required={required}
        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
      />
    </div>

  )

}