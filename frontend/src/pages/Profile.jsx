import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  GraduationCap,
  Github,
  User,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Linkedin,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Briefcase
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Chemical"];
const YEARS = [1, 2, 3, 4];

function Profile() {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    college: "",
    location: "",
    github: "",
    linkedin: "",
    bio: "",
    department: "",
    year: "",
  });

  /* =========================
     LOAD USER DATA
  ========================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token) {
          // Try fetching from API first for fresh data
          try {
            const res = await fetch("http://localhost:5000/api/users/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data);
              setFormData({
                fullName: data.fullName || "",
                phone: data.phone || "",
                college: data.college || "",
                location: data.location || "",
                github: data.github || "",
                linkedin: data.linkedin || "",
                bio: data.bio || "",
                department: data.department || "",
                year: data.year || "",
              });
              // Update localStorage
              localStorage.setItem("user", JSON.stringify(data));
              setLoading(false);
              return;
            }
          } catch (err) {
            // Fallback to stored user
          }
        }

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setFormData({
            fullName: parsed.fullName || "",
            phone: parsed.phone || "",
            college: parsed.college || "",
            location: parsed.location || "",
            github: parsed.github || "",
            linkedin: parsed.linkedin || "",
            bio: parsed.bio || "",
            department: parsed.department || "",
            year: parsed.year || "",
          });
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
     HANDLE FORM CHANGES
  ========================= */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  /* =========================
     HANDLE PROFILE PIC
  ========================= */

  const handleProfilePicClick = () => {
    if (editing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select an image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 5MB" });
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };


  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setMessage({ type: "error", text: "Please log in again" });
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (selectedFile) {
        data.append("profilePicture", selectedFile);
      }

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setUser(result.user);
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, ...result.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setMessage({ type: "success", text: "Profile updated successfully!" });
        setEditing(false);
        setSelectedFile(null);
        setPreviewImage(null);

        // Clear success message after 3s
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update profile" });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };


  /* =========================
     CANCEL EDITING
  ========================= */

  const handleCancel = () => {
    setEditing(false);
    setSelectedFile(null);
    setPreviewImage(null);
    setMessage({ type: "", text: "" });
    // Reset form data to current user data
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        college: user.college || "",
        location: user.location || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        bio: user.bio || "",
        department: user.department || "",
        year: user.year || "",
      });
    }
  };


  /* =========================
     INITIALS
  ========================= */

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const getProfilePicUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profilePicture) {
      return user.profilePicture.startsWith('http') 
        ? user.profilePicture 
        : `http://localhost:5000${user.profilePicture}`;
    }
    return null;
  };

  const profilePicUrl = getProfilePicUrl();


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar 
          userRole="student" 
          userName={user?.fullName || "Student"}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar 
        userRole="student" 
        userName={user?.fullName || "Student"}
        onLogout={handleLogout}
      />
      <div className="flex-1 text-slate-50 px-6 py-10">

        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your personal information</p>
            </div>

            {!editing ? (
              <button 
                onClick={() => setEditing(true)}
                className="btn-premium px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={handleCancel}
                  className="glass-card glass-card-hover px-5 py-2.5 text-sm text-slate-300 hover:text-white flex items-center gap-2 font-medium"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-premium px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`flex items-center gap-3 rounded-xl px-5 py-3 mb-6 animate-scale-in ${
              message.type === "success" 
                ? "bg-emerald-500/10 border border-emerald-500/20" 
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              {message.type === "success" 
                ? <CheckCircle className="text-emerald-400 flex-shrink-0" size={18} />
                : <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
              }
              <p className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {message.text}
              </p>
            </div>
          )}


          {/* Profile Card */}
          <div className="glass-card p-8 mb-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-6">

              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center text-black text-2xl font-bold overflow-hidden shadow-lg shadow-sky-500/20">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={user?.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {editing && (
                  <button
                    onClick={handleProfilePicClick}
                    className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white" size={24} />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="text-2xl font-bold bg-transparent border-b-2 border-sky-500/50 text-white focus:outline-none focus:border-sky-400 pb-1 w-full"
                    placeholder="Your full name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">
                    {user?.fullName || "Student"}
                  </h2>
                )}

                <p className="text-slate-400 mt-1 flex items-center gap-2">
                  <Briefcase size={14} />
                  {user?.department || "Not specified"} • Year {user?.year || "-"}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 pt-6 border-t border-slate-700/30">
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2 block">Bio</label>
              {editing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {user?.bio || "No bio added yet. Click Edit Profile to add one."}
                </p>
              )}
            </div>
          </div>


          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <EditableInfoCard
              icon={Mail}
              label="Email"
              value={user?.email}
              editing={false}
              readOnly
            />

            <EditableInfoCard
              icon={Phone}
              label="Phone"
              name="phone"
              value={editing ? formData.phone : user?.phone}
              editing={editing}
              onChange={handleChange}
              placeholder="Your phone number"
            />

            <EditableInfoCard
              icon={GraduationCap}
              label="College"
              name="college"
              value={editing ? formData.college : user?.college}
              editing={editing}
              onChange={handleChange}
              placeholder="Your college name"
            />

            <EditableInfoCard
              icon={MapPin}
              label="Location"
              name="location"
              value={editing ? formData.location : user?.location}
              editing={editing}
              onChange={handleChange}
              placeholder="City, State"
            />

            {editing ? (
              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/15 flex-shrink-0">
                  <BookOpen size={18} className="text-sky-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5">Department</p>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <EditableInfoCard
                icon={BookOpen}
                label="Department"
                value={user?.department}
                editing={false}
              />
            )}

            {editing ? (
              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/15 flex-shrink-0">
                  <Calendar size={18} className="text-sky-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5">Year</p>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="">Select year</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <EditableInfoCard
                icon={Calendar}
                label="Year"
                value={user?.year ? `Year ${user.year}` : null}
                editing={false}
              />
            )}

            <EditableInfoCard
              icon={Github}
              label="GitHub"
              name="github"
              value={editing ? formData.github : user?.github}
              editing={editing}
              onChange={handleChange}
              placeholder="github.com/username"
              isLink={!editing}
            />

            <EditableInfoCard
              icon={Linkedin}
              label="LinkedIn"
              name="linkedin"
              value={editing ? formData.linkedin : user?.linkedin}
              editing={editing}
              onChange={handleChange}
              placeholder="linkedin.com/in/username"
              isLink={!editing}
            />

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;


/* ===============================
   EDITABLE INFO CARD
================================ */

function EditableInfoCard({ icon: Icon, label, name, value, editing, onChange, placeholder, readOnly, isLink }) {

  return (
    <div className="glass-card p-4 flex items-center gap-4 animate-slide-up">

      <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/15 flex-shrink-0">
        <Icon size={18} className="text-sky-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-1">
          {label}
        </p>

        {editing && !readOnly ? (
          <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        ) : (
          isLink && value ? (
            <a 
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors truncate block"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm font-medium text-slate-200 truncate">
              {value || "Not provided"}
            </p>
          )
        )}
      </div>

    </div>
  );
}