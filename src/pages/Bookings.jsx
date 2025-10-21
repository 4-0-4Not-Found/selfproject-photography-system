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
  const navigate = useNavigate();

  // Filter services to only show session services
  const sessionServices = services.filter(service => service.category === "session");
  const selectedService = services.find(s => s.id === parseInt(newBooking.serviceId));

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      console.log("Bookings response:", res.data);
      setBookings(res.data);
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
        // PERMANENT FIX: Only include customDescription when actually used
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
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/bookings/my/${id}`);
      alert("Booking canceled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error.response?.data || error.message);
      alert(`Failed to cancel booking: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📅 Photography Session Bookings</h1>

      {/* Booking Form */}
      <form onSubmit={handleCreateBooking} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
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

      {/* Bookings List */}
      <h3>Your Scheduled Sessions ({bookings.length})</h3>
      {bookings.length === 0 ? (
        <p>No sessions booked yet. Schedule your first photography session!</p>
      ) : (
        <div>
          {bookings.map((booking) => (
            <div key={booking.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
              <h4>📸 {booking.Service?.name || "Photography Session"}</h4>
              {booking.customDescription && (
                <p><strong>Custom Description:</strong> {booking.customDescription}</p>
              )}
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Status:</strong> <span style={{ 
                color: booking.status === 'approved' ? 'green' : 
                       booking.status === 'pending' ? 'orange' : 
                       booking.status === 'completed' ? 'blue' : 'red'
              }}>
                {booking.status?.toUpperCase()}
              </span></p>
              
              {booking.status === 'pending' && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  style={{ 
                    padding: "5px 10px", 
                    background: "#dc3545", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel Session
                </button>
              )}
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