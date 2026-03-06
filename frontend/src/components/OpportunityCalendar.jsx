import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, TrendingUp, AlertCircle, Plus, X, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
import { opportunityAPI } from "../services/api.js";

const OpportunityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("calendar");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    organization: "",
    deadline: "",
    category: "Internship",
    mode: "Online",
    description: ""
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  useEffect(() => {
    // Set mock token for testing (remove in production)
    if (!localStorage.getItem('token') && !sessionStorage.getItem('token')) {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDhiNzE3YjE5ZjM0M2E4ZjNhNzI4ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNjU2MjQwMCwiZXhwIjoxNzM5MTU1NDQwMCJ9.mock-token-for-testing';
      localStorage.setItem('token', mockToken);
    }
    
    fetchOpportunities();
  }, []);

  // Refresh opportunities when modal closes
  useEffect(() => {
    if (!showAddEventModal) {
      fetchOpportunities();
    }
  }, [showAddEventModal]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/admin/opportunities', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let opportunitiesData = [];
        if (data && data.opportunities && Array.isArray(data.opportunities)) {
          opportunitiesData = data.opportunities;
        } else if (Array.isArray(data)) {
          opportunitiesData = data;
        } else if (data && Array.isArray(data.data)) {
          opportunitiesData = data.data;
        } else {
          opportunitiesData = [];
        }
        
        setOpportunities(opportunitiesData);
      } else {
        setOpportunities([]);
      }
    } catch (error) {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.organization || !newEvent.deadline) {
        alert("Please fill all required fields");
        return;
      }

      const eventData = {
        title: newEvent.title,
        organization: newEvent.organization,
        description: newEvent.description,
        category: newEvent.category,
        mode: newEvent.mode,
        deadline: newEvent.deadline,
        status: "Active",
        postedDate: new Date().toISOString(),
        views: 0,
        applications: 0
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
        alert("Event added successfully!");
        setNewEvent({
          title: "",
          organization: "",
          deadline: "",
          category: "Internship",
          mode: "Online",
          description: ""
        });
        
        setShowAddEventModal(false);
        setSelectedDate(null);
        
        await fetchOpportunities();
      } else {
        alert("Failed to add event. Please try again.");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  const handleViewEvent = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/opportunities/${editingEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(editingEvent)
      });
      
      if (response.ok) {
        alert("Event updated successfully!");
        setShowEditModal(false);
        setEditingEvent(null);
        await fetchOpportunities();
      } else {
        alert("Failed to update event. Please try again.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/opportunities/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          alert("Event deleted successfully!");
          await fetchOpportunities();
        } else {
          alert("Failed to delete event. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getOpportunitiesForDate = (day) => {
    if (!day || !opportunities || opportunities.length === 0) return [];
    
    try {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      return opportunities.filter(opp => {
        if (!opp || !opp.deadline) return false;
        
        const oppDate = new Date(opp.deadline);
        if (isNaN(oppDate.getTime())) return false;
        
        return oppDate.getDate() === day &&
               oppDate.getMonth() === date.getMonth() &&
               oppDate.getFullYear() === date.getFullYear();
      });
    } catch (error) {
      console.error("Error in getOpportunitiesForDate:", error);
      return [];
    }
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(clickedDate);
      setNewEvent({
        ...newEvent,
        deadline: clickedDate.toISOString().split('T')[0]
      });
      setShowAddEventModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">📅 Loading calendar...</div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            Opportunity Calendar
          </h2>
          <p className="text-slate-400 mt-2">Manage and view all opportunity deadlines</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "calendar" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setShowAddEventModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
          </svg>
        </button>
        
        <h3 className="text-xl font-semibold text-white">
          {formatMonth(currentDate)}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl backdrop-blur-xl p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayOpportunities = getOpportunitiesForDate(day);
            const isToday = day === today.getDate() && 
                           currentDate.getMonth() === today.getMonth() && 
                           currentDate.getFullYear() === today.getFullYear();
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer
                  ${day ? 'hover:bg-slate-700/50 hover:border-blue-500/50' : ''}
                  ${isToday ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-800/30 border-slate-700/50'}
                `}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {day || ''}
                </div>
                
                {/* Opportunities for this day */}
                {dayOpportunities.length > 0 && (
                  <div className="space-y-1">
                    {dayOpportunities.slice(0, 2).map((opp) => (
                      <div
                        key={opp._id}
                        className="text-xs p-1 bg-slate-700/50 rounded border border-slate-600/50 hover:border-blue-500/50 transition-colors"
                        title={`${opp.title} - ${opp.organization}`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-300 truncate">
                            {opp.organization}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dayOpportunities.length > 2 && (
                      <div className="text-xs text-center text-slate-400">
                        +{dayOpportunities.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Upcoming Deadlines
        </h3>
        
        <div className="space-y-3">
          {opportunities
            .filter(opp => new Date(opp.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5)
            .map((opp, index) => {
              const daysLeft = Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const urgencyColor = daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-yellow-400' : 'text-green-400';
              
              return (
                <motion.div
                  key={opp._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{opp.title}</h4>
                      <p className="text-slate-300 text-sm mb-2">{opp.organization}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">{opp.category}</span>
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">{opp.mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${urgencyColor}`}>
                          {daysLeft} days
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(opp.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewEvent(opp)}
                          className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditEvent(opp)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(opp._id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedDate ? `Add Event for ${selectedDate.toLocaleDateString()}` : 'Add New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setSelectedDate(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Event Title *</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Organization *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Organization name"
                    value={newEvent.organization}
                    onChange={(e) => setNewEvent({...newEvent, organization: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Deadline *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={newEvent.deadline}
                    onChange={(e) => setNewEvent({...newEvent, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
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
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={newEvent.mode}
                    onChange={(e) => setNewEvent({...newEvent, mode: e.target.value})}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Event description"
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setSelectedDate(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                📅 Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && viewingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Event Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingEvent(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Event Title</label>
                <div className="text-white font-medium">{viewingEvent.title}</div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Organization</label>
                <div className="text-white">{viewingEvent.organization}</div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Description</label>
                <div className="text-white">{viewingEvent.description || 'No description provided'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Category</label>
                  <div className="text-white">{viewingEvent.category}</div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Mode</label>
                  <div className="text-white">{viewingEvent.mode}</div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Deadline</label>
                <div className="text-white">{new Date(viewingEvent.deadline).toLocaleDateString()}</div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Status</label>
                <div className="text-white">{viewingEvent.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Event</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Event Title *</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Organization *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={editingEvent.organization}
                    onChange={(e) => setEditingEvent({...editingEvent, organization: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Deadline *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={editingEvent.deadline}
                    onChange={(e) => setEditingEvent({...editingEvent, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={editingEvent.category}
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
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                    value={editingEvent.mode}
                    onChange={(e) => setEditingEvent({...editingEvent, mode: e.target.value})}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 h-24 resize-none"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateEvent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
                >
                  Update Event
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityCalendar;
