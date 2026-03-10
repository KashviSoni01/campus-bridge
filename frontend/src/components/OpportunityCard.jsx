import { MapPin, Globe, Clock } from "lucide-react";
import { Link } from "react-router-dom";

function OpportunityCard({ opportunity }) {

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(opportunity.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-sky-500/40 transition">

      {/* Tags */}

      <div className="flex flex-wrap gap-2 mb-3">

        {opportunity.tags?.map((tag, i) => (

          <span
            key={i}
            className="text-xs px-2 py-1 rounded-full bg-sky-500/10 text-sky-400"
          >
            {tag}
          </span>

        ))}

      </div>


      {/* Title */}

      <h3 className="text-lg font-semibold mb-1">
        {opportunity.title}
      </h3>


      {/* Organizer */}

      <p className="text-sm text-slate-400 mb-2">
        {opportunity.organizer}
      </p>


      {/* Description */}

      <p className="text-xs text-slate-400 mb-4 line-clamp-2">
        {opportunity.description}
      </p>


      {/* Info */}

      <div className="space-y-2 text-xs text-slate-400 mt-auto mb-4">

        <div className="flex items-center gap-2">

          <Clock size={14} />

          <span>
            Deadline:{" "}
            {new Date(opportunity.deadline).toLocaleDateString()}
          </span>

          {daysLeft <= 7 && (
            <span className="text-red-400 ml-1">
              ({daysLeft}d left)
            </span>
          )}

        </div>


        <div className="flex items-center gap-2">

          {opportunity.isOnline ? (
            <>
              <Globe size={14} />
              <span>Online</span>
            </>
          ) : (
            <>
              <MapPin size={14} />
              <span>{opportunity.location}</span>
            </>
          )}

        </div>

      </div>


      {/* Button */}

      <Link to={`/opportunity/${opportunity._id}`}>

        <button className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-black text-sm py-2 rounded-lg font-medium hover:brightness-110 transition">

          View Details

        </button>

      </Link>

    </div>

  );
}

export default OpportunityCard;