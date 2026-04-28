import { MapPin, Globe, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function OpportunityCard({ opportunity, hasApplied }) {

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(opportunity.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const isExpired = daysLeft === 0;

  return (

    <div className="glass-card glass-card-hover p-6 flex flex-col group relative overflow-hidden">

      {/* Subtle gradient decoration on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Category & Status Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {opportunity.category && (
            <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 font-medium">
              {opportunity.category}
            </span>
          )}
        </div>

        {hasApplied && (
          <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <CheckCircle size={12} />
            Applied
          </span>
        )}

        {!hasApplied && isExpired && (
          <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            Expired
          </span>
        )}
      </div>


      {/* Title */}
      <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-sky-300 transition-colors">
        {opportunity.title}
      </h3>


      {/* Organization */}
      <p className="text-sm text-slate-400 mb-3 font-medium">
        {opportunity.organization || opportunity.organizer}
      </p>


      {/* Description */}
      <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed">
        {opportunity.description}
      </p>


      {/* Skills Tags */}
      {opportunity.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {opportunity.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
            >
              {skill}
            </span>
          ))}
          {opportunity.skills.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-md text-slate-500">
              +{opportunity.skills.length - 3}
            </span>
          )}
        </div>
      )}


      {/* Info Row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto mb-5">

        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>
            {new Date(opportunity.deadline).toLocaleDateString()}
          </span>
          {daysLeft <= 7 && daysLeft > 0 && (
            <span className="text-amber-400 font-medium ml-1">
              ({daysLeft}d left)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {opportunity.mode === "Online" || opportunity.isOnline ? (
            <>
              <Globe size={13} />
              <span>Online</span>
            </>
          ) : (
            <>
              <MapPin size={13} />
              <span>{opportunity.location || "On-site"}</span>
            </>
          )}
        </div>

      </div>


      {/* Button */}
      <Link to={`/opportunity/${opportunity._id}`}>
        <button className="w-full btn-premium py-2.5 text-sm flex items-center justify-center gap-2 group/btn">
          {hasApplied ? "View Details" : "View Details"}
          <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </Link>

    </div>

  );
}

export default OpportunityCard;