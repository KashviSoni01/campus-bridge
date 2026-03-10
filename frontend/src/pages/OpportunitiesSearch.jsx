import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";
import OpportunityCard from "../components/OpportunityCard";

function OpportunitiesSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/opportunities")
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = opportunities.filter((o) =>
    o.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-400">Loading opportunities...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <Link
          to="/student"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {query ? `Results for "${query}"` : "All Opportunities"}
          </h1>

          <p className="text-slate-400 mt-1">
            {filtered.length} opportunities found
          </p>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-slate-400">
              No opportunities match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((opp, i) => (
              <OpportunityCard key={opp._id || i} opportunity={opp} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default OpportunitiesSearch;