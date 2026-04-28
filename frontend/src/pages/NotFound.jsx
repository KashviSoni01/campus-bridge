import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="text-center">

        <h1 className="text-6xl font-bold mb-4 text-sky-400">
          404
        </h1>

        <p className="text-xl text-slate-400 mb-6">
          Oops! Page not found
        </p>

        <Link
          to="/"
          className="px-6 py-2 rounded-lg bg-sky-500 text-black font-medium hover:bg-sky-400 transition"
        >
          Return to Home
        </Link>

      </div>

    </div>
  );
}

export default NotFound;