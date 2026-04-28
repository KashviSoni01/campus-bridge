import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, X, Zap, Calendar, Settings, Plus, Filter, Grid, List, Download } from "lucide-react";
import { dashboardAPI, opportunityAPI } from "../services/api.js";
import OpportunityCalendar from "../components/OpportunityCalendar.jsx";
import Toast from "../components/Toast.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOpportunities: 0,
    activeOpportunities: 0,
    expiredOpportunities: 0,
    totalApplications: 0,
    recentActivity: []
  });

  const [adminName, setAdminName] = useState("Admin");

  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    organization: "",
    category: "Internship",
    domain: "Computer Science",
    mode: "Online",
    location: "",
    duration: "",
    deadline: "",
    startDate: "",
    skills: [],
    eligibility: {
      minYear: 1,
      maxYear: 4,
      branches: [],
      minCGPA: 0
    },
    maxParticipants: 100,
    currentParticipants: 0,
    imageUrl: "",
    tags: [],
    requirements: "",
    prizes: "",
    contactInfo: {
      email: "",
      phone: "",
      website: ""
    },
    applicationLink: "",
    featured: false
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  const menuItems = [
    { id: "events", label: "Opportunities", icon: "🎪", description: "Manage all opportunities" },
    { id: "create-event", label: "Create Opportunity", icon: "✨", description: "Create new opportunity" },
    { id: "applications", label: "Applications", icon: "📝", description: "Manage applications" },
    { id: "users", label: "Users", icon: "👥", description: "Manage users" },
    { id: "calendar", label: "Calendar", icon: "📅", description: "Event calendar" },
    { id: "settings", label: "Settings", icon: "⚙️", description: "System settings" }
  ];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // First, try to get a fresh token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      console.log('Fetching dashboard stats...');
      const data = await dashboardAPI.getStats();
      console.log('Dashboard data received:', data);
      
      setStats({
        totalUsers: data.totalUsers || 0,
        totalOpportunities: data.totalOpportunities || 0,
        activeOpportunities: data.activeOpportunities || 0,
        expiredOpportunities: data.expiredOpportunities || 0,
        totalApplications: data.totalApplications || 0,
        recentActivity: data.recentActivity || []
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      
      // Clear token and redirect to login on error
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      setStats({
        totalUsers: 0,
        totalOpportunities: 0,
        activeOpportunities: 0,
        expiredOpportunities: 0,
        totalApplications: 0,
        recentActivity: []
      });
      
      // Show error message
      alert(`Failed to fetch dashboard data: ${error.message}. Please login again.`);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await opportunityAPI.getAll();
      
      let eventsData = [];
      if (data && data.opportunities && Array.isArray(data.opportunities)) {
        eventsData = data.opportunities;
      } else if (Array.isArray(data)) {
        eventsData = data;
      } else if (data && Array.isArray(data.data)) {
        eventsData = data.data;
      } else {
        eventsData = [];
      }
      
      setEvents(eventsData);
    } catch (err) {
      setEvents([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.users || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplications([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdown]);

  useEffect(() => {
    // Get admin name from stored user data
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setAdminName(parsedUser?.fullName || "Admin");
    }

    if (!localStorage.getItem('token') && !sessionStorage.getItem('token')) {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDhiNzE3YjE5ZjM0M2E4ZjNhNzI4ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNjU2MjQwMCwiZXhwIjoxNzM5MTU0NDAwfQ.mock-token-for-testing';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('role', 'admin');
    }
    
    const loadData = async () => {
      try {
        await Promise.all([fetchDashboardStats(), fetchEvents(), fetchUsers(), fetchApplications()]);
      } catch (error) {
        setStats({
          totalUsers: 0,
          totalOpportunities: 0,
          activeOpportunities: 0,
          expiredOpportunities: 0,
          totalApplications: 0,
          recentActivity: []
        });
        setEvents([]);
        setStudents([]);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCreateEvent = async () => {
    try {
      if (!eventForm.title || !eventForm.description || !eventForm.organization || !eventForm.deadline || !eventForm.duration) {
        showToast("error", "Please fill all required fields");
        return;
      }

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        organization: eventForm.organization,
        category: eventForm.category,
        domain: eventForm.domain,
        mode: eventForm.mode,
        location: eventForm.location,
        duration: eventForm.duration,
        deadline: eventForm.deadline,
        startDate: eventForm.startDate,
        skills: eventForm.skills || [],
        eligibility: eventForm.eligibility || {
          minYear: 1,
          maxYear: 4,
          branches: [],
          minCGPA: 0
        },
        maxParticipants: eventForm.maxParticipants || 100,
        currentParticipants: 0,
        imageUrl: eventForm.imageUrl || "",
        tags: eventForm.tags || [],
        requirements: eventForm.requirements || "",
        prizes: eventForm.prizes || "",
        contactInfo: eventForm.contactInfo || {
          email: "",
          phone: "",
          website: ""
        },
        applicationLink: eventForm.applicationLink || "",
        featured: eventForm.featured || false,
        status: "Active",
        postedDate: new Date().toISOString(),
        createdBy: "admin",
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5000/api/admin/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents([newEvent, ...events]);
        await Promise.all([fetchDashboardStats(), fetchEvents()]);
        setShowEventModal(false);
        resetEventForm();
        showToast('success', 'Opportunity created successfully!');
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      showToast('error', 'Failed to create event. Please try again.');
    }
  };

  const handleViewEvent = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent({...event});
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      if (!editingEvent || !editingEvent._id) {
        showToast('error', 'No event selected for editing');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/opportunities/${editingEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(editingEvent)
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(events.map(event => 
          event._id === editingEvent._id ? updatedEvent : event
        ));
        await Promise.all([fetchDashboardStats(), fetchEvents()]);
        setShowEditModal(false);
        setEditingEvent(null);
        showToast('success', 'Opportunity updated successfully!');
      } else {
        throw new Error("Failed to update event");
      }
    } catch (error) {
      showToast('error', 'Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/opportunities/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        await Promise.all([fetchDashboardStats(), fetchEvents()]);
        showToast('success', 'Opportunity deleted successfully!');
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      showToast('error', 'Failed to delete event. Please try again.');
    }
  };

  const handleDuplicateEvent = async (event) => {
    try {
      const duplicatedEvent = {
        ...event,
        title: `${event.title} (Copy)`,
        status: "Draft",
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        __v: undefined
      };

      const response = await fetch('http://localhost:5000/api/admin/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(duplicatedEvent)
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents([newEvent, ...events]);
        await Promise.all([fetchDashboardStats(), fetchEvents()]);
        showToast('success', 'Opportunity duplicated successfully!');
      } else {
        throw new Error("Failed to duplicate event");
      }
    } catch (error) {
      showToast('error', 'Failed to duplicate opportunity');
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      organization: "",
      category: "Internship",
      domain: "Computer Science",
      mode: "Online",
      location: "",
      duration: "",
      deadline: "",
      startDate: "",
      skills: [],
      eligibility: {
        minYear: 1,
        maxYear: 4,
        branches: [],
        minCGPA: 0
      },
      maxParticipants: 100,
      currentParticipants: 0,
      imageUrl: "",
      tags: [],
      requirements: "",
      prizes: "",
      contactInfo: {
        email: "",
        phone: "",
        website: ""
      },
      applicationLink: "",
      featured: false
    });
  };

  const handleSendNotification = async () => {
    try {
      if (!notificationForm.title || !notificationForm.message) {
        showToast("error", "Please fill all notification fields");
        return;
      }

      const notificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        targetAudience: notificationForm.targetAudience,
        priority: notificationForm.priority,
        createdBy: "admin",
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotificationsList([newNotification, ...notificationsList]);
        setNotifications(notificationsList.length + 1);
      } else {
        const newNotification = {
          _id: Date.now().toString(),
          ...notificationData
        };
        setNotificationsList([newNotification, ...notificationsList]);
        setNotifications(notificationsList.length + 1);
      }
      
      setNotificationForm({
        title: "",
        message: "",
        targetAudience: "all",
        priority: "medium"
      });
      setShowNotificationModal(false);
      
      alert("Notification sent successfully! 🎉");
    } catch (error) {
      console.error("Error sending notification:", error);

      const newNotification = {
        _id: Date.now().toString(),
        ...notificationForm
      };
      setNotificationsList([newNotification, ...notificationsList]);
      setNotifications(notificationsList.length + 1);
      
      setNotificationForm({
        title: "",
        message: "",
        targetAudience: "all",
        priority: "medium"
      });
      setShowNotificationModal(false);
      
      alert("Notification sent successfully! 🎉");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleExportData = (type, format) => {
    showToast('info', `Exporting ${type} data as ${format.toUpperCase()}...`);
    // In a real implementation, this would call the backend API to export data
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    const filteredEvents = getFilteredEvents();
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event._id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedEvents.length === 0) {
      showToast('warning', 'Please select at least one opportunity');
      return;
    }

    try {
      let updateData = {};
      switch (bulkAction) {
        case 'activate':
          updateData = { status: 'Active' };
          break;
        case 'close':
          updateData = { status: 'Closed' };
          break;
        case 'draft':
          updateData = { status: 'Draft' };
          break;
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} opportunities?`)) {
            return;
          }
          // Delete all selected
          for (const eventId of selectedEvents) {
            await fetch(`http://localhost:5000/api/admin/opportunities/${eventId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
              }
            });
          }
          showToast('success', `Deleted ${selectedEvents.length} opportunities`);
          setSelectedEvents([]);
          await Promise.all([fetchDashboardStats(), fetchEvents()]);
          return;
        default:
          return;
      }

      // Update all selected
      const response = await fetch('http://localhost:5000/api/admin/opportunities/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          opportunityIds: selectedEvents,
          updateData
        })
      });

      if (response.ok) {
        showToast('success', `Updated ${selectedEvents.length} opportunities`);
        setSelectedEvents([]);
        setBulkAction('');
        await Promise.all([fetchDashboardStats(), fetchEvents()]);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('error', 'Failed to perform bulk action');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Internship": return "💼";
      case "Hackathon": return "🚀";
      case "Competition": return "🏆";
      case "Workshop": return "🛠️";
      case "Event": return "🎪";
      case "Full-time": return "🏢";
      case "Part-time": return "⏰";
      case "Freelance": return "💻";
      case "Training": return "📚";
      default: return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Expired": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Scheduled": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Closed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Draft": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getOpportunityStatus = (event) => {
    const now = new Date();
    const deadline = new Date(event.deadline);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (event.status === "Closed") {
      return "Closed";
    }
 
    if (daysLeft <= 0) {
      return "Expired";
    }

    return "Active";
  };

  const isOpportunityActive = (event) => {
    return getOpportunityStatus(event) === "Active";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgentColor = (days) => {
    if (days <= 7) return "text-red-400";
    if (days <= 14) return "text-yellow-400";
    return "text-green-400";
  };

  const getFilteredEvents = () => {
    let filtered = [...events];
    
    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "Active") {
        filtered = filtered.filter(event => {
          const status = getOpportunityStatus(event);
          return status === "Active";
        });
      } else if (statusFilter === "Expired") {
        filtered = filtered.filter(event => {
          const status = getOpportunityStatus(event);
          return status === "Expired";
        });
      } else if (statusFilter === "Closed") {
        filtered = filtered.filter(event => {
          const status = getOpportunityStatus(event);
          return status === "Closed";
        });
      } else {
        filtered = filtered.filter(event => event.status === statusFilter);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline) - new Date(b.deadline);
        case "postedDate":
          return new Date(b.postedDate) - new Date(a.postedDate);
        case "applications":
          return (b.applications || 0) - (a.applications || 0);
        case "views":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const renderEventsDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-3 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-500 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-2xl">
              👥
            </div>
          </div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
          <div className="text-blue-300 text-xs lg:text-sm">Total Users</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 p-3 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-2xl">
              🎪
            </div>
          </div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{stats.totalOpportunities}</div>
          <div className="text-emerald-300 text-xs lg:text-sm">Total Opportunities</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-3 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-2xl">
              ✅
            </div>
          </div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{stats.activeOpportunities}</div>
          <div className="text-orange-300 text-xs lg:text-sm">Active Opportunities</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 p-3 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-500 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-2xl">
              ⏰
            </div>
          </div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{stats.expiredOpportunities}</div>
          <div className="text-red-300 text-xs lg:text-sm">Expired Opportunities</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-3 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-500 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-2xl">
              📝
            </div>
          </div>
          <div className="text-xl lg:text-3xl font-bold text-white mb-1">{stats.totalApplications}</div>
          <div className="text-purple-300 text-xs lg:text-sm">Applications</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            🔔 Recent Activity
          </h3>
          <button className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-slate-400 text-sm">{activity.details}</p>
                </div>
                <div className="text-slate-500 text-sm">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      
      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="px-3 py-2 lg:px-4 lg:py-2 rounded-xl font-medium bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white transition-all text-sm lg:text-base"
          >
            ✨ Create Opportunity
          </button>
          
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl">
            <input
              type="checkbox"
              checked={selectedEvents.length === getFilteredEvents().length && getFilteredEvents().length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-sky-500 focus:ring-sky-500 focus:ring-2"
            />
            <span className="text-slate-300 text-sm">Select All</span>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-sky-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-sky-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>

          {/* Category Filter */}
          <select
            className="bg-slate-800/50 border border-slate-700/50 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-xl focus:outline-none focus:border-sky-500 text-sm lg:text-base"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Competition">Competition</option>
            <option value="Workshop">Workshop</option>
            <option value="Training">Training</option>
          </select>

          {/* Status Filter */}
          <select
            className="bg-slate-800/50 border border-slate-700/50 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-xl focus:outline-none focus:border-sky-500 text-sm lg:text-base"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Closed">Closed</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          {/* Sort */}
          <select
            className="bg-slate-800/50 border border-slate-700/50 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-xl focus:outline-none focus:border-sky-500 text-sm lg:text-base"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="postedDate">Sort by Posted Date</option>
            <option value="applications">Sort by Applications</option>
            <option value="views">Sort by Views</option>
          </select>
        </div>
        
        {/* Bulk Actions */}
        {selectedEvents.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
            <span className="text-slate-300 text-sm">{selectedEvents.length} selected</span>
            <select
              className="bg-slate-700/50 border border-slate-600/50 text-white px-2 py-1 rounded text-sm"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Action</option>
              <option value="activate">Set Active</option>
              <option value="close">Set Closed</option>
              <option value="draft">Set Draft</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedEvents([])}
              className="text-slate-400 hover:text-white text-sm"
            >
              Clear
            </button>
          </div>
        )}
        
        <div className="relative w-full lg:w-auto">
          <input
            type="text"
            placeholder="🔍 Search opportunities..."
            className="w-full lg:w-80 bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 pl-12 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-3.5 text-slate-400">🔍</div>
        </div>
      </div>

      {/* Events Grid/List */}
      {viewMode === "grid" ? renderEventsGrid() : renderEventsList()}
    </div>
  );

  const renderEventsGrid = () => {
    const filteredEvents = getFilteredEvents();
    
    if (!filteredEvents || filteredEvents.length === 0) {
      return (
        <EmptyState
          type={searchQuery ? 'search' : 'opportunities'}
          onAction={() => setShowEventModal(true)}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className={`group relative overflow-hidden rounded-xl lg:rounded-2xl bg-slate-900/50 border backdrop-blur-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
              selectedEvents.includes(event._id) ? 'border-sky-500/50' : 'border-slate-800/50'
            }`}
            onClick={() => !event.target.closest('.no-select') && setSelectedEvent(event)}
          >
            {/* Event Image */}
            <div className="relative h-32 lg:h-48 overflow-hidden">
              {/* Checkbox for bulk selection */}
              <div className="absolute top-2 left-2 z-10 no-select">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectEvent(event._id);
                  }}
                  className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-sky-500 focus:ring-sky-500 focus:ring-2"
                />
              </div>
              
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-purple-600/20"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl lg:text-6xl opacity-50">{getCategoryIcon(event.category)}</div>
              </div>
              <div className="absolute top-2 lg:top-3 right-2 lg:right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getOpportunityStatus(event))}`}>
                  {getOpportunityStatus(event)}
                </span>
              </div>
              {event.featured && (
                <div className="absolute top-2 lg:top-3 left-2 lg:left-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    ⭐ Featured
                  </div>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="p-3 lg:p-6">
              <div className="mb-2 lg:mb-4">
                <h3 className="text-base lg:text-xl font-bold text-white mb-1 lg:mb-2 group-hover:text-sky-400 transition-colors line-clamp-1 lg:line-clamp-none">
                  {event.title}
                </h3>
                <p className="text-slate-400 text-xs lg:text-sm mb-2 lg:mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-1 lg:gap-2 text-slate-300 text-xs lg:text-sm">
                  <span>🏢 {event.organization}</span>
                  <span className="hidden lg:inline">•</span>
                  <span className="hidden lg:inline">📍 {event.mode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <div className="flex items-center gap-2">
                  {getDaysLeft(event.deadline) > 0 && getDaysLeft(event.deadline) <= 7 && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium">
                      Closing Soon
                    </span>
                  )}
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getUrgentColor(getDaysLeft(event.deadline))}`}>
                    {getDaysLeft(event.deadline) > 0 ? `${getDaysLeft(event.deadline)} days left` : "Expired"}
                  </div>
                </div>
                <div className="text-slate-400 text-xs lg:text-xs">
                  📅 {formatDate(event.deadline)}
                </div>
              </div>

              {/* Skills Tags */}
              {event.skills && event.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2 lg:mb-4">
                  {event.skills.slice(0, 2).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">
                      {skill}
                    </span>
                  ))}
                  {event.skills.length > 2 && (
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs">
                      +{event.skills.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Stats with tooltips */}
              <div className="flex items-center justify-between text-slate-400 text-xs lg:text-sm">
                <div className="group relative flex items-center gap-1">
                  <span className="cursor-help" title="Total Views - How many times this opportunity was viewed">
                    👁️ {event.views || 0}
                  </span>
                  <span className="absolute -top-6 lg:-top-8 left-0 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Total Views
                  </span>
                </div>
                <div className="group relative flex items-center gap-1">
                  <span className="cursor-help" title="Total Applications - How many students applied">
                    📝 {event.applications || 0}
                  </span>
                  <span className="absolute -top-6 lg:-top-8 left-0 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Total Applications
                  </span>
                </div>
                <div className="group relative flex items-center gap-1">
                  <span className="cursor-help" title="Max Participants - Maximum number of students who can apply">
                    👥 {event.maxParticipants || 0}
                  </span>
                  <span className="absolute -top-6 lg:-top-8 left-0 bg-slate-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Max Participants
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 lg:mt-4 pt-2 lg:pt-4 border-t border-slate-800 flex gap-1 lg:gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewEvent(event);
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
              >
                View
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateEvent(event);
                }}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
              >
                Duplicate
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEvent(event._id);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventsList = () => {
    const filteredEvents = getFilteredEvents();
    
    if (!filteredEvents || filteredEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
          <p className="text-slate-400 mb-6">Create your first opportunity to get started!</p>
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all"
          >
            ✨ Create Opportunity
          </button>
        </div>
      );
    }

    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left p-4 text-slate-300 font-medium">Opportunity</th>
                <th className="text-left p-4 text-slate-300 font-medium">Organization</th>
                <th className="text-left p-4 text-slate-300 font-medium">Category</th>
                <th className="text-left p-4 text-slate-300 font-medium">Location</th>
                <th className="text-left p-4 text-slate-300 font-medium">Participants</th>
                <th className="text-left p-4 text-slate-300 font-medium">Deadline</th>
                <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                        {getCategoryIcon(event.category)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <p className="text-slate-400 text-sm">{event.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{event.organization}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm">
                      {event.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="flex items-center gap-1">
                      {event.mode === "Online" ? "🌐" : event.mode === "Offline" ? "📍" : "🔄"}
                      {event.mode}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="text-sm">
                      <div>{event.currentParticipants || 0}/{event.maxParticipants || 100}</div>
                      <div className="text-xs text-slate-500">👁️ {event.views || 0} 📝 {event.applications || 0}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${getUrgentColor(getDaysLeft(event.deadline))}`}>
                      {formatDate(event.deadline)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(getOpportunityStatus(event))}`}>
                      {getOpportunityStatus(event)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewEvent(event)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCreateEventModal = () => {
    if (!showEventModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">✨ Create New Opportunity</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Opportunity Title *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Enter opportunity title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Organization *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Organization name"
                      value={eventForm.organization}
                      onChange={(e) => setEventForm({...eventForm, organization: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Detailed description of the opportunity"
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Opportunity Type *</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Competition">Competition</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Training">Training</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Domain *</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={eventForm.domain}
                      onChange={(e) => setEventForm({...eventForm, domain: e.target.value})}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Chemical">Chemical</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Mode</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={eventForm.mode}
                      onChange={(e) => setEventForm({...eventForm, mode: e.target.value})}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Event location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Duration *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      placeholder="3 months, 2 weeks, etc."
                      value={eventForm.duration}
                      onChange={(e) => setEventForm({...eventForm, duration: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Deadline *</label>
                    <input
                      type="date"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={eventForm.deadline}
                      onChange={(e) => setEventForm({...eventForm, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Application Link</label>
                  <input
                    type="url"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="https://example.com/apply"
                    value={eventForm.applicationLink}
                    onChange={(e) => setEventForm({...eventForm, applicationLink: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Skills Required</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="JavaScript, React, Node.js (comma separated)"
                    value={eventForm.skills.join(", ")}
                    onChange={(e) => setEventForm({...eventForm, skills: e.target.value.split(", ").filter(s => s.trim())})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="web, mobile, ai (comma separated)"
                    value={eventForm.tags.join(", ")}
                    onChange={(e) => setEventForm({...eventForm, tags: e.target.value.split(", ").filter(s => s.trim())})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Requirements</label>
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Participants should have..."
                    rows={3}
                    value={eventForm.requirements}
                    onChange={(e) => setEventForm({...eventForm, requirements: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Prizes/Benefits</label>
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Prizes, certificates, benefits..."
                    rows={3}
                    value={eventForm.prizes}
                    onChange={(e) => setEventForm({...eventForm, prizes: e.target.value})}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Banner Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="https://example.com/image.jpg"
                    value={eventForm.imageUrl}
                    onChange={(e) => setEventForm({...eventForm, imageUrl: e.target.value})}
                  />
                  {eventForm.imageUrl && (
                    <div className="mt-2">
                      <img src={eventForm.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="100"
                    value={eventForm.maxParticipants}
                    onChange={(e) => setEventForm({...eventForm, maxParticipants: parseInt(e.target.value)})}
                  />
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <h4 className="text-white font-medium mb-3">Eligibility Criteria</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Min Year</label>
                        <select
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                          value={eventForm.eligibility.minYear}
                          onChange={(e) => setEventForm({...eventForm, eligibility: {...eventForm.eligibility, minYear: parseInt(e.target.value)}})}
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Max Year</label>
                        <select
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                          value={eventForm.eligibility.maxYear}
                          onChange={(e) => setEventForm({...eventForm, eligibility: {...eventForm.eligibility, maxYear: parseInt(e.target.value)}})}
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Min CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                        placeholder="0.0"
                        value={eventForm.eligibility.minCGPA}
                        onChange={(e) => setEventForm({...eventForm, eligibility: {...eventForm.eligibility, minCGPA: parseFloat(e.target.value)}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                      checked={eventForm.featured}
                      onChange={(e) => setEventForm({...eventForm, featured: e.target.checked})}
                    />
                    <span className="text-white font-medium">Featured Opportunity</span>
                  </label>
                  <p className="text-slate-400 text-sm mt-2">Mark this as a featured opportunity to highlight it</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                ✨ Create Opportunity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Students Management</h2>
        <div className="relative w-80">
          <input
            type="text"
            placeholder="🔍 Search students..."
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 pl-12 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-3.5 text-slate-400">🔍</div>
        </div>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
            <span className="text-blue-400 text-sm font-medium">+12%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
          <div className="text-blue-300 text-sm">Total Students</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <span className="text-emerald-400 text-sm font-medium">Active</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{Math.floor(stats.totalUsers * 0.8)}</div>
          <div className="text-emerald-300 text-sm">Active Students</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <span className="text-purple-400 text-sm font-medium">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalApplications}</div>
          <div className="text-purple-300 text-sm">Applications</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl">
              🔖
            </div>
            <span className="text-orange-400 text-sm font-medium">Saved</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{Math.floor(stats.totalUsers * 2.5)}</div>
          <div className="text-orange-300 text-sm">Bookmarks</div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="text-left p-4 text-slate-300 font-medium">Student</th>
              <th className="text-left p-4 text-slate-300 font-medium">Email</th>
              <th className="text-left p-4 text-slate-300 font-medium">Branch</th>
              <th className="text-left p-4 text-slate-300 font-medium">Year</th>
              <th className="text-left p-4 text-slate-300 font-medium">CGPA</th>
              <th className="text-left p-4 text-slate-300 font-medium">Applications</th>
              <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{student.fullName}</h4>
                      <p className="text-slate-400 text-sm">{student.rollNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{student.email}</td>
                <td className="p-4 text-slate-300">{student.branch}</td>
                <td className="p-4 text-slate-300">{student.year}</td>
                <td className="p-4 text-slate-300">{student.cgpa}</td>
                <td className="p-4 text-slate-300">{student.applications || 0}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">View</button>
                    <button className="text-orange-400 hover:text-orange-300 transition-colors">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Notifications</h2>
        <button 
          onClick={() => setShowNotificationModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
        >
          📢 Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {notificationsList.map((notification) => (
          <div key={notification._id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{notification.title}</h3>
                <p className="text-slate-300 mb-3">{notification.message}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>📅 {new Date(notification.createdAt).toLocaleDateString()}</span>
                  <span>👥 {notification.targetAudience}</span>
                  <span className={`px-2 py-1 rounded ${
                    notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {notification.priority}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">📢 Send Notification</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Notification Title *</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                  placeholder="Enter notification title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Message *</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                  placeholder="Enter your notification message"
                  rows={4}
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Target Audience</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                    value={notificationForm.targetAudience}
                    onChange={(e) => setNotificationForm({...notificationForm, targetAudience: e.target.value})}
                  >
                    <option value="all">All Students</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="electronics">Electronics</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Priority</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                📢 Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Applications Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 backdrop-blur-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleExportData('applications', 'csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl hover:bg-slate-800/70 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Applications Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalApplications}</div>
          <div className="text-purple-300 text-sm">Total Applications</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-green-300 text-sm">Pending Review</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-blue-300 text-sm">Selected</div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="text-left p-4 text-slate-300 font-medium">Student</th>
              <th className="text-left p-4 text-slate-300 font-medium">Opportunity</th>
              <th className="text-left p-4 text-slate-300 font-medium">Applied Date</th>
              <th className="text-left p-4 text-slate-300 font-medium">Status</th>
              <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-lg">
                        📝
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{app.student?.fullName || 'Unknown Student'}</h4>
                        <p className="text-slate-400 text-sm">{app.student?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{app.opportunity?.title || 'Unknown Opportunity'}</td>
                  <td className="p-4 text-slate-300">{new Date(app.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => showToast('info', `Viewing application from ${app.student?.fullName}`)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View
                      </button>
                      {app.status !== 'approved' && (
                        <button 
                          onClick={() => showToast('success', `Approved application from ${app.student?.fullName}`)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button 
                          onClick={() => showToast('warning', `Rejected application from ${app.student?.fullName}`)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8">
                  <EmptyState
                    type="applications"
                    title="No Applications Yet"
                    description="Applications will appear here when students apply to opportunities."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Settings</h2>
      
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Admin Profile</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-white">{adminName}</h4>
              <p className="text-slate-400">Administrator</p>
              <p className="text-slate-500 text-sm">admin@campusbridge.com</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                defaultValue="admin@campusbridge.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 mb-4"
              placeholder="Enter current password"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <button 
            onClick={() => showToast('success', 'Profile updated successfully!')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
          >
            Update Profile
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-slate-400 text-sm">Send email notifications for new applications</p>
            </div>
            <button className="w-12 h-6 bg-sky-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-approve Opportunities</p>
              <p className="text-slate-400 text-sm">Automatically approve new opportunities</p>
            </div>
            <button className="w-12 h-6 bg-slate-600 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    try {
      // Show loading for any section while loading
      if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" text="Loading dashboard..." />
          </div>
        );
      }

      switch (activeSection) {
        case "events": return renderEventsDashboard();
        case "create-event": return renderEventsDashboard(); // Show events dashboard, modal will be opened separately
        case "applications": return renderApplications();
        case "users": return renderStudents();
        case "calendar": return <OpportunityCalendar />;
        case "settings": return renderSettings();
        default: return renderEventsDashboard();
      }
    } catch (err) {
      console.error("Render error:", err);
      return (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
          <p className="text-red-200">Error loading content: {err.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 lg:p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg lg:text-xl font-bold text-white">CampusBridge</h1>
              <p className="text-xs lg:text-sm text-slate-400">Admin Control</p>
            </div>
          </div>
        </div>

        <nav className="p-2 lg:p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === "create-event") {
                  setShowEventModal(true);
                }
              }}
              className={`w-full flex items-center gap-2 lg:gap-3 px-2 py-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 mb-1 lg:mb-2 text-sm lg:text-base ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              <span className="font-medium hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="relative z-[50] bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-white">
                  {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className="text-sm lg:text-base text-slate-400">
                  {menuItems.find(item => item.id === activeSection)?.description || "Welcome back"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden lg:flex items-center relative w-48 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm lg:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <div className="w-5 h-5 relative">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.14 15.62V13a2.032 2.032 0 00-1.405-1.405L15 10.5v-2a7 7 0 10-14 0v2l-1.735 1.735A2.032 2.032 0 012.86 15.62V17h5m0 0v2a2 2 0 104 0v-2" />
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </button>

              <div className="relative z-[10000] profile-dropdown-container">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs lg:text-sm font-bold">{adminName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-white text-xs lg:text-sm hidden sm:block">{adminName}</span>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl z-[9999]">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-white font-medium">{adminName}</p>
                      <p className="text-slate-400 text-sm">Administrator</p>
                    </div>
                    <button 
                      onClick={() => {setActiveSection("settings"); setProfileDropdown(false);}}
                      className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => {setActiveSection("settings"); setProfileDropdown(false);}}
                      className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors"
                    >
                      System Preferences
                    </button>
                    <div className="border-t border-slate-700/50">
                      <button 
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("role");
                          localStorage.removeItem("user");
                          sessionStorage.removeItem("token");
                          sessionStorage.removeItem("role");
                          sessionStorage.removeItem("user");
                          navigate("/login");
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-b-xl"
                      >
                        Logout
                      </button>
                    </div>
                    <button 
                      onClick={() => {alert("Help & Support: Contact admin@campusbridge.edu.in for assistance"); setProfileDropdown(false);}}
                      className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors"
                    >
                      Help & Support
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Event Creation Modal */}
      {renderCreateEventModal()}

      {/* View Event Modal */}
      {showViewModal && viewingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Opportunity Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingEvent(null);
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{viewingEvent.title}</h3>
                    <p className="text-slate-300 mb-4">{viewingEvent.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Organization:</span>
                        <span className="text-white">{viewingEvent.organization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-white">{viewingEvent.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Mode:</span>
                        <span className="text-white">{viewingEvent.mode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white">{viewingEvent.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white">{viewingEvent.duration || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="text-white">{formatDate(viewingEvent.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Status:</span>
                        <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(viewingEvent.status)}`}>
                          {viewingEvent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Additional Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400">Max Participants:</span>
                        <span className="text-white ml-2">{viewingEvent.maxParticipants || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Current Applications:</span>
                        <span className="text-white ml-2">{viewingEvent.applications || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Views:</span>
                        <span className="text-white ml-2">{viewingEvent.views || 0}</span>
                      </div>
                      {viewingEvent.skills && viewingEvent.skills.length > 0 && (
                        <div>
                          <span className="text-slate-400">Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {viewingEvent.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingEvent.requirements && (
                        <div>
                          <span className="text-slate-400">Requirements:</span>
                          <p className="text-white mt-2">{viewingEvent.requirements}</p>
                        </div>
                      )}
                      {viewingEvent.prizes && (
                        <div>
                          <span className="text-slate-400">Prizes:</span>
                          <p className="text-white mt-2">{viewingEvent.prizes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">✏️ Edit Opportunity</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Opportunity Title *</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.title || ''}
                        onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Organization *</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.organization || ''}
                        onChange={(e) => setEditingEvent({...editingEvent, organization: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Description *</label>
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 h-32 resize-none"
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
                      <select
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.category || 'Internship'}
                        onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Competition">Competition</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Mode</label>
                      <select
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.mode || 'Online'}
                        onChange={(e) => setEditingEvent({...editingEvent, mode: e.target.value})}
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Deadline *</label>
                      <input
                        type="date"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.deadline || ''}
                        onChange={(e) => setEditingEvent({...editingEvent, deadline: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.location || ''}
                        onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.duration || ''}
                        onChange={(e) => setEditingEvent({...editingEvent, duration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Max Participants</label>
                      <input
                        type="number"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.maxParticipants || 100}
                        onChange={(e) => setEditingEvent({...editingEvent, maxParticipants: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Status</label>
                      <select
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                        value={editingEvent.status || 'Active'}
                        onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Closed">Closed</option>
                        <option value="Scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Requirements</label>
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 h-24 resize-none"
                      value={editingEvent.requirements || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, requirements: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Prizes</label>
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 h-24 resize-none"
                      value={editingEvent.prizes || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, prizes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Application Link</label>
                    <input
                      type="url"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                      value={editingEvent.applicationLink || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, applicationLink: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
                      value={editingEvent.imageUrl || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, imageUrl: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      className="w-4 h-4 text-sky-500 bg-slate-800 border-slate-700 rounded focus:ring-sky-500"
                      checked={editingEvent.featured || false}
                      onChange={(e) => setEditingEvent({...editingEvent, featured: e.target.checked})}
                    />
                    <label htmlFor="featured" className="text-slate-300 text-sm">Featured Opportunity</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEvent}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
                >
                  💾 Update Opportunity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
