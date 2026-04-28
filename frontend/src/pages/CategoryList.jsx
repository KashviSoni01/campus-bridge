import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "../components/DashboardLayout";
import OpportunityCard from "../components/OpportunityCard";

function CategoryList() {
  const { category } = useParams();

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

  const filtered = opportunities.filter((o) => o.type === category);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* Back Button */}
        <Link
          to="/student"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white capitalize">
            {category}
          </h1>

          <p className="text-slate-400 mt-1">
            Opportunities in this category
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-slate-400">Loading opportunities...</p>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-slate-400">
              No opportunities in this category yet.
            </p>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((opp, i) => (
            <OpportunityCard
              key={opp._id || i}
              opportunity={opp}
              index={i}
            />
          ))}
        </div>

      </motion.div>
    </DashboardLayout>
  );
}

export default CategoryList;