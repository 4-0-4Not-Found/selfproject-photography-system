// src/pages/Bookings.jsx - UPDATED WITH BATCH DELETE FUNCTIONALITY
import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    date: "",
    time: "",
    location: "",
    customDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming", "completed", "canceled"
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const navigate = useNavigate();

  // Filter services to only show session services
  const sessionServices = services.filter(service => service.category === "session");
  const selectedService = services.find(s => s.id === parseInt(newBooking.serviceId));

  // Categorize bookings
  const categorizedBookings = {
    upcoming: bookings.filter(b => ['pending', 'approved'].includes(b.status)),
    completed: bookings.filter(b => b.status === 'completed'),
    canceled: bookings.filter(b => b.status === 'canceled')
  };

  const currentBookings = categorizedBookings[activeTab];

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      console.log("Bookings response:", res.data);
      setBookings(res.data);
      setSelectedBookings(new Set()); // Clear selection when data refreshes
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      console.log("Services response:", res.data);
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error.response?.data || error.message);
    }
  };

  // Batch Selection Handlers
  const handleSelectBooking = (bookingId) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBookings.size === currentBookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(currentBookings.map(booking => booking.id)));
    }
  };

  const handleSelectCompleted = () => {
    const completedBookings = currentBookings.filter(booking => 
      booking.status === 'completed'
    );
    setSelectedBookings(new Set(completedBookings.map(booking => booking.id)));
  };

  const handleSelectCanceled = () => {
    const canceledBookings = currentBookings.filter(booking => 
      booking.status === 'canceled'
    );
    setSelectedBookings(new Set(canceledBookings.map(booking => booking.id)));
  };

  const handleBatchDelete = async () => {
    if (selectedBookings.size === 0) {
      alert("Please select bookings to delete");
      return;
    }

    const bookingIds = Array.from(selectedBookings);
    const confirmMessage = `Are you sure you want to delete ${bookingIds.length} booking(s)? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.post("/bookings/my/batch-delete", { bookingIds });
      alert(`${bookingIds.length} booking(s) removed from your view successfully`);
      setSelectedBookings(new Set());
      setBatchMode(false);
      fetchBookings();
    } catch (error) {
      console.error("Error batch deleting bookings:", error.response?.data || error.message);
      alert(`Failed to delete bookings: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (!newBooking.location || newBooking.location.trim() === "") {
      alert("Please enter a location for the booking");
      return;
    }

    // If "Other" service is selected, require custom description
    const isCustomSession = selectedService?.name === "Other (Custom Session)";
    if (isCustomSession && !newBooking.customDescription.trim()) {
      alert("Please describe your custom photography session");
      return;
    }

    try {
      const bookingData = {
        serviceId: newBooking.serviceId,
        date: newBooking.date,
        time: newBooking.time,
        location: newBooking.location.trim(),
        ...(isCustomSession && { customDescription: newBooking.customDescription.trim() })
      };

      console.log("Sending booking data to backend:", bookingData);

      const response = await api.post("/bookings", bookingData);

      console.log("Booking creation success:", response.data);
      alert("Booking created successfully!");
      setNewBooking({ serviceId: "", date: "", time: "", location: "", customDescription: "" });
      fetchBookings();
    } catch (error) {
      console.error("Error creating booking:", error);
      console.error("Full error details:", error.response?.data);
      alert(`Failed to create booking: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/my/${id}`);
      alert("Booking canceled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error.response?.data || error.message);
      alert(`Failed to cancel booking: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;
    try {
      await api.delete(`/bookings/my/${id}/delete`);
      alert("Booking removed");
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error.response?.data || error.message);
      alert(`Failed to delete booking: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'canceled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return {
      background: color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    };
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📅 Photography Session Bookings</h1>

      {/* Booking Form */}
      <form onSubmit={handleCreateBooking} style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>Schedule a Photography Session</h3>
        
        {/* Session Type Selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Session Type:
          </label>
          <select
            value={newBooking.serviceId}
            onChange={(e) => {
              const serviceId = e.target.value;
              const service = services.find(s => s.id === parseInt(serviceId));
              setNewBooking({ 
                ...newBooking, 
                serviceId,
                customDescription: service?.name === "Other (Custom Session)" ? "" : ""
              });
            }}
            required
            style={{ padding: "8px", width: "350px" }}
          >
            <option value="">-- Select Session Type --</option>
            {sessionServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </option>
            ))}
          </select>
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            Choose from our professional photography sessions
          </small>
        </div>

        {/* Custom Description for "Other" sessions */}
        {selectedService?.name === "Other (Custom Session)" && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Describe Your Custom Session:
            </label>
            <textarea
              placeholder="e.g., Corporate headshots, Baby photoshoot, Real estate photography, Product photography..."
              value={newBooking.customDescription}
              onChange={(e) => setNewBooking({ ...newBooking, customDescription: e.target.value })}
              required
              style={{ padding: "8px", width: "400px", height: "80px", resize: "vertical" }}
            />
            <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
              Please describe what you need photographed
            </small>
          </div>
        )}

        {/* Date */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Session Date:
          </label>
          <input
            type="date"
            value={newBooking.date}
            onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            required
            style={{ padding: "8px", width: "200px" }}
          />
        </div>

        {/* Time */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Session Time:
          </label>
          <input
            type="time"
            value={newBooking.time}
            onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
            required
            style={{ padding: "8px", width: "150px" }}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Session Location *:
          </label>
          <input
            type="text"
            placeholder="e.g., Studio, Outdoor Park, Wedding Venue, Client's Home"
            value={newBooking.location}
            onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
            required
            style={{ padding: "8px", width: "400px" }}
          />
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            Where will the photography session take place?
          </small>
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: "12px 24px", 
            background: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          📅 Book Photography Session
        </button>
      </form>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            padding: "10px 20px",
            background: activeTab === "upcoming" ? "#007bff" : "transparent",
            color: activeTab === "upcoming" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          📅 Upcoming ({categorizedBookings.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          style={{
            padding: "10px 20px",
            background: activeTab === "completed" ? "#28a745" : "transparent",
            color: activeTab === "completed" ? "white" : "#28a745",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          ✅ Completed ({categorizedBookings.completed.length})
        </button>
        <button
          onClick={() => setActiveTab("canceled")}
          style={{
            padding: "10px 20px",
            background: activeTab === "canceled" ? "#dc3545" : "transparent",
            color: activeTab === "canceled" ? "white" : "#dc3545",
            border: "none",
            cursor: "pointer"
          }}
        >
          ❌ Canceled ({categorizedBookings.canceled.length})
        </button>
      </div>

      {/* Batch Actions Toolbar */}
      {batchMode && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "15px", 
          background: "#e7f3ff", 
          border: "1px solid #b3d9ff",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}>
          <div style={{ fontWeight: "bold", color: "#0066cc" }}>
            🗂️ Batch Mode: {selectedBookings.size} booking(s) selected
          </div>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleSelectAll}
              style={{ 
                padding: "5px 10px", 
                background: "#17a2b8", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {selectedBookings.size === currentBookings.length ? "❌ Select None" : "✅ Select All"}
            </button>
            
            <button
              onClick={handleSelectCompleted}
              style={{ 
                padding: "5px 10px", 
                background: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              ✅ Select Completed
            </button>
            
            <button
              onClick={handleSelectCanceled}
              style={{ 
                padding: "5px 10px", 
                background: "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              ❌ Select Canceled
            </button>
            
            <button
              onClick={handleBatchDelete}
              disabled={selectedBookings.size === 0}
              style={{ 
                padding: "5px 10px", 
                background: selectedBookings.size === 0 ? "#6c757d" : "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: selectedBookings.size === 0 ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              🗑️ Delete Selected ({selectedBookings.size})
            </button>
            
            <button
              onClick={() => {
                setBatchMode(false);
                setSelectedBookings(new Set());
              }}
              style={{ 
                padding: "5px 10px", 
                background: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              ✖ Cancel Batch
            </button>
          </div>
        </div>
      )}

      {/* Bookings List Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3>
          {activeTab === 'upcoming' && '📅 Upcoming Sessions'}
          {activeTab === 'completed' && '✅ Completed Sessions'} 
          {activeTab === 'canceled' && '❌ Canceled Sessions'}
          ({currentBookings.length})
        </h3>
        
        {!batchMode && (
          <button
            onClick={() => setBatchMode(true)}
            style={{ 
              padding: "8px 16px", 
              background: "#6c757d", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🗂️ Batch Select
          </button>
        )}
      </div>

      {/* Bookings List - ORGANIZED */}
      {currentBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>No {activeTab} sessions found.</p>
          {activeTab === 'upcoming' && (
            <p>Schedule your first photography session using the form above!</p>
          )}
        </div>
      ) : (
        <div>
          {currentBookings.map((booking) => (
            <div key={booking.id} style={{ 
              border: "1px solid #ddd", 
              padding: "15px", 
              marginBottom: "10px", 
              borderRadius: "8px",
              background: activeTab === 'upcoming' ? '#f8f9fa' : 'white',
              borderLeft: batchMode && selectedBookings.has(booking.id) ? '4px solid #007bff' : '1px solid #ddd'
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {/* Checkbox for batch selection */}
                  {batchMode && (
                    <input
                      type="checkbox"
                      checked={selectedBookings.has(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      style={{ marginTop: "5px" }}
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>
                      📸 {booking.Service?.name || "Photography Session"}
                      <span style={{ ...getStatusBadge(booking.status), marginLeft: "10px" }}>
                        {booking.status.toUpperCase()}
                      </span>
                    </h4>
                    <p><strong>📅 Date:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    <p><strong>📍 Location:</strong> {booking.location}</p>
                    {booking.customDescription && (
                      <p><strong>📝 Custom Description:</strong> {booking.customDescription}</p>
                    )}
                    <p><strong>💵 Price:</strong> ${booking.Service?.price}</p>
                  </div>
                </div>
                
                {/* Individual Actions */}
                {!batchMode && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "120px" }}>
                    {/* Cancel button for upcoming bookings */}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ 
                          padding: "5px 10px", 
                          background: "#ffc107", 
                          color: "black", 
                          border: "none", 
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        🚫 Cancel
                      </button>
                    )}
                    
                    {/* Delete button for completed/canceled bookings */}
                    {(booking.status === 'completed' || booking.status === 'canceled') && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        style={{ 
                          padding: "5px 10px", 
                          background: "#dc3545", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => navigate("/dashboard")} 
        style={{ 
          marginTop: "20px", 
          padding: "10px 20px", 
          background: "#6c757d", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        ⬅️ Back to Dashboard
      </button>
    </div>
  );
}