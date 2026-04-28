import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, Bell, User, LogOut, Settings, ChevronDown,
  Home, Briefcase, FileText, Calendar, Users, X,
  Clock, MapPin, Globe, ArrowUpRight
} from "lucide-react";

const Navbar = ({ userRole, userName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Get user profile picture
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear previous timeout for debouncing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 1) {
      setIsSearching(true);
      // Debounce: wait 300ms before searching
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/opportunities?search=${encodeURIComponent(query)}&includeExpired=false`);
          if (response.ok) {
            const results = await response.json();
            setSearchResults(results.slice(0, 6));
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (opportunity) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
    navigate(`/opportunity/${opportunity._id || opportunity.id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSearchResults(false);
      setSearchQuery("");
    }
    if (e.key === "Enter" && searchQuery.length > 1) {
      // Navigate to student dashboard with search applied
      setShowSearchResults(false);
      navigate(`/student?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleNotificationClick = (notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setShowNotifications(false);
    
    if (notification.type === 'opportunity') {
      navigate('/student');
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
    { icon: Home, label: 'Dashboard', path: '/student' },
    { icon: Briefcase, label: 'Opportunities', path: '/student' },
    { icon: FileText, label: 'My Applications', path: '/applications' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Nav Items */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate(userRole === 'admin' ? '/admin' : '/student')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-white font-bold text-xl">CampusBridge</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-sky-400 bg-sky-500/10' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 1 && searchResults.length > 0 && setShowSearchResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search opportunities, companies..."
                className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-700/30">
                        <p className="text-xs text-slate-500 font-medium">{searchResults.length} results found</p>
                      </div>
                      {searchResults.map((result, index) => (
                        <div
                          key={result._id || index}
                          onClick={() => handleSearchResultClick(result)}
                          className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-sky-500/15">
                            <Briefcase className="w-4 h-4 text-sky-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate group-hover:text-sky-300 transition-colors">
                              {result.title}
                            </div>
                            <div className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                              <span>{result.organization}</span>
                              <span>•</span>
                              <span>{result.category}</span>
                              {result.deadline && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(result.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No opportunities found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-white font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">{unreadCount} new</span>
                    )}
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
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
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
                      <div className="p-6 text-center text-slate-400 text-sm">
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
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-500 to-purple-500">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                      alt={userName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">{userName || 'User'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                  <div className="p-4 border-b border-slate-700/50">
                    <p className="text-white font-medium">{userName || 'User'}</p>
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
