import React from 'react';
import { Plus, Search, Calendar } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  onAction,
  icon 
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'opportunities':
        return <div className="text-6xl">🎪</div>;
      case 'applications':
        return <div className="text-6xl">📝</div>;
      case 'users':
        return <div className="text-6xl">👥</div>;
      case 'search':
        return <Search className="w-16 h-16 text-slate-600" />;
      case 'calendar':
        return <Calendar className="w-16 h-16 text-slate-600" />;
      default:
        return <div className="text-6xl">📋</div>;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'opportunities':
        return 'No Opportunities Found';
      case 'applications':
        return 'No Applications Yet';
      case 'users':
        return 'No Users Found';
      case 'search':
        return 'No Results Found';
      case 'calendar':
        return 'No Events Scheduled';
      default:
        return 'No Data Available';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'opportunities':
        return 'Create your first opportunity to get started!';
      case 'applications':
        return 'Applications will appear here when students apply to opportunities.';
      case 'users':
        return 'No users have registered yet.';
      case 'search':
        return 'Try adjusting your search or filters.';
      case 'calendar':
        return 'No events are scheduled for this period.';
      default:
        return 'There\'s nothing to show here yet.';
    }
  };

  const getDefaultActionText = () => {
    switch (type) {
      case 'opportunities':
        return '✨ Create Opportunity';
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {getIcon()}
      <h3 className="text-xl font-semibold text-white mb-2 mt-4">
        {title || getDefaultTitle()}
      </h3>
      <p className="text-slate-400 mb-6 max-w-md">
        {description || getDefaultDescription()}
      </p>
      {(actionText || getDefaultActionText()) && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionText || getDefaultActionText()}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
