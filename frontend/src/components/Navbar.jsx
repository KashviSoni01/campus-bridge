import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, User, LogOut, Settings, ChevronDown,
  Home, Briefcase, FileText, Calendar, Users
} from "lucide-react";

const Navbar = ({ userRole, userName, onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Fetch notifications
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications for now
      const mockNotifications = [
        { id: 1, type: 'opportunity', message: 'New internship posted at Google', time: '2 hours ago', read: false },
        { id: 2, type: 'application', message: 'Your application was reviewed', time: '5 hours ago', read: false },
        { id: 3, type: 'deadline', message: 'Hackathon deadline approaching', time: '1 day ago', read: true },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      try {
        const response = await fetch(`http://localhost:5000/api/opportunities?search=${query}`);
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results.slice(0, 5)); // Limit to 5 results
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (opportunity) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/opportunity/${opportunity._id || opportunity.id}`);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setShowNotifications(false);
    
    // Navigate based on notification type
    if (notification.type === 'opportunity') {
      navigate('/opportunities');
    } else if (notification.type === 'application') {
      navigate('/applications');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = userRole === 'admin' ? [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Briefcase, label: 'Opportunities', path: '/admin' },
    { icon: FileText, label: 'Applications', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin' },
    { icon: Calendar, label: 'Calendar', path: '/admin' },
  ] : [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Briefcase, label: 'Opportunities', path: '/opportunities' },
    { icon: FileText, label: 'My Applications', path: '/applications' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Nav Items */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-white font-bold text-xl">CampusBridge</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                placeholder="Search opportunities..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchResultClick(result)}
                      className="p-3 hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div className="text-white font-medium text-sm">{result.title}</div>
                      <div className="text-slate-400 text-xs">{result.organization} • {result.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/30 ${
                            !notification.read ? 'bg-slate-700/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-slate-500' : 'bg-sky-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-white text-sm">{notification.message}</p>
                              <p className="text-slate-400 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{userName || 'Admin'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700/50">
                    <p className="text-white font-medium">{userName || 'Admin User'}</p>
                    <p className="text-slate-400 text-sm capitalize">{userRole}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-slate-700/50 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
