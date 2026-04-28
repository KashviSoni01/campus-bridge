import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TopNavbar() {

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentName, setStudentName] = useState("Student");

  const navigate = useNavigate();

  /* =========================
     LOAD USER NAME
  ========================= */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStudentName(user.fullName || "Student");
    }

  }, []);

  /* =========================
     SEARCH HANDLER
  ========================= */

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/opportunities?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /* =========================
     AVATAR INITIALS
  ========================= */

  const initials =
    studentName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "S";

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">

      {/* Search */}

      <form
        onSubmit={handleSearch}
        className={`relative flex items-center transition-all duration-300 ${
          searchFocused ? "w-96" : "w-72"
        }`}
      >

        <Search className="absolute left-3 w-4 h-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search opportunities by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
        />

      </form>


      {/* Right Section */}

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">

          <div className="text-right">

            <p className="text-sm font-medium text-white">
              {studentName}
            </p>

            <p className="text-xs text-slate-400">
              Student Dashboard
            </p>

          </div>

          {/* Avatar */}

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-black font-semibold text-sm">
            {initials}
          </div>

        </div>

      </div>

    </header>
  );
}

export default TopNavbar;