import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, FileUp, CheckCircle } from "lucide-react";

function ApplyForm() {

  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return null;
  }

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

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState("");

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

    Object.keys(formData).forEach((key)=>{

      if(formData[key]){
        data.append(key,formData[key]);
      }
    });

    data.append("opportunityId", id);
    data.append("student", user?.id || user?._id);
    data.append("name", formData.name);
    data.append("email", formData.email);

    try{

      const res = await fetch("http://localhost:5000/api/applications",{
        method:"POST",
        body:data
      });

      const result = await res.json();

      if(!res.ok){
        throw new Error(result.message || "Failed to submit");
      }

      setSuccess(true);

      setTimeout(()=>{
        navigate("/student");
      },2000);

    }catch(err){

      setError(err.message);

    }finally{

      setLoading(false);

    }

  };

  if(success){

    return(
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

          <CheckCircle className="mx-auto text-emerald-400 mb-4" size={40}/>

          <h2 className="text-xl font-semibold mb-2">
            Application Submitted!
          </h2>

          <p className="text-slate-400">
            Redirecting to dashboard...
          </p>

        </div>

      </div>
    )

  }

  return (

    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">

      <div className="max-w-3xl mx-auto">

        <button
          onClick={()=>navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 mb-6"
        >
          <ArrowLeft size={16}/>
          Back
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h1 className="text-2xl font-semibold mb-2">
            Submit Your Application
          </h1>

          {error && (
            <div className="text-red-400 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange}/>
            <InputField label="Email" name="email" value={formData.email} onChange={handleChange}/>
            <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange}/>
            <InputField label="College" name="college" value={formData.college} onChange={handleChange}/>
            <InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange}/>
            <InputField label="Year" name="year" value={formData.year} onChange={handleChange}/>
            <InputField label="Portfolio" name="portfolio" value={formData.portfolio} onChange={handleChange}/>

            <div>
              <label className="block text-sm mb-2">
                Resume
              </label>

              <input type="file" onChange={handleFileChange}/>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black font-semibold py-3 rounded-xl"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>

          </form>

        </div>

      </div>

    </div>

  )

}

export default ApplyForm;


function InputField({label,...props}){

  return(

    <div>

      <label className="block text-sm mb-2">
        {label}
      </label>

      <input
        {...props}
        required
        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
      />

    </div>

  )

}