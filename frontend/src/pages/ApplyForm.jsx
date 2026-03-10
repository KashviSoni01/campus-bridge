import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, FileUp, CheckCircle } from "lucide-react";

function ApplyForm() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    portfolio: "",
    resume: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    data.append("opportunityId", id);

    try {

      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        body: data
      });

      if (!res.ok) throw new Error("Failed to submit application");

      setSuccess(true);

      setTimeout(() => {
        navigate("/student");
      }, 2000);

    } catch (err) {

      alert("Error submitting application");

    } finally {

      setLoading(false);

    }
  };


  if (success) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

          <CheckCircle className="mx-auto text-emerald-400 mb-4" size={40} />

          <h2 className="text-xl font-semibold mb-2">
            Application Submitted!
          </h2>

          <p className="text-slate-400">
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
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>


        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h1 className="text-2xl font-semibold mb-2">
            Submit Your Application
          </h1>

          <p className="text-slate-400 mb-8">
            Fill in the details below to apply
          </p>


          <form onSubmit={handleSubmit} className="space-y-6">


            {/* Name + Email */}

            <div className="grid md:grid-cols-2 gap-6">

              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu"
              />

            </div>


            {/* Phone + Year */}

            <div className="grid md:grid-cols-2 gap-6">

              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
              />

              <InputField
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="3rd Year"
              />

            </div>


            {/* College + Branch */}

            <div className="grid md:grid-cols-2 gap-6">

              <InputField
                label="College"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Your College"
              />

              <InputField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Computer Science"
              />

            </div>


            {/* Portfolio */}

            <InputField
              label="Portfolio / GitHub (Optional)"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://github.com/yourprofile"
            />


            {/* Resume Upload */}

            <div>

              <label className="block text-sm mb-2">
                Resume (Optional)
              </label>

              <label className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center block cursor-pointer hover:border-sky-500 transition">

                <FileUp className="mx-auto mb-2 text-slate-400" size={22} />

                <p className="text-sm text-slate-400">
                  Upload Resume
                </p>

                {formData.resume && (
                  <p className="text-xs text-emerald-400 mt-2">
                    {formData.resume.name}
                  </p>
                )}

                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

              </label>

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black font-semibold py-3 rounded-xl hover:brightness-110 transition"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>

          </form>

        </div>

      </div>

    </div>

  );
}

export default ApplyForm;



function InputField({ label, ...props }) {

  return (

    <div>

      <label className="block text-sm mb-2">
        {label}
      </label>

      <input
        {...props}
        required
        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500"
      />

    </div>

  );
}