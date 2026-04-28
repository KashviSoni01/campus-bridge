import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/AuthLayout.jsx";
import { authAPI } from "../services/api.js";

const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
];

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("department", department);
      formData.append("year", year);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const data = await authAPI.signup(formData);
      const token = data.token;
      const role = data.user?.role || "student";

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.googleLogin(credentialResponse.credential);
      const role = data.user?.role || "student";
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(role === "admin" ? "/admin" : "/student");
    } catch (err) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your CampusBridge account"
      subtitle="Join your campus network in a few seconds."
      footer={
        <p className="text-sm">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign in instead
          </Link>
        </p>
      }
    >
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center space-y-3 pb-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 transition hover:border-sky-500/50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Upload profile picture"
            />
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            {profilePicture ? profilePicture.name : "Click to upload profile picture"}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-200">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Johnson"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-200">
            College email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@chitkara.edu.in"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-200">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 text-[11px]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
              required
            >
              <option value="">Select department</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
              required
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-900/60 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating your account..." : "Create account"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2 text-slate-500">Or sign up with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-in failed")}
            useOneTap
            theme="filled_black"
            shape="circle"
            width="100%"
          />
        </div>
      </form>
    </AuthLayout>
  );
}
