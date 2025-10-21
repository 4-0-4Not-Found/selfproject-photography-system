import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Get user info from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: tokenData.id, name: "User", role: tokenData.role });

      // Fetch user's bookings (this endpoint exists: /bookings/my)
      const bookingsRes = await api.get("/bookings/my");
      
      // For orders, check if you have an endpoint like /orders/my
      // If not, we'll handle it gracefully
      try {
        const ordersRes = await api.get("/orders/my");
        setOrders(ordersRes.data);
      } catch (orderError) {
        console.log("Orders endpoint not available yet");
        setOrders([]);
      }
      
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Status color function for orders (matches bookings pattern)
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'editing': return 'blue';
      case 'ready': return 'green';
      case 'printed': return 'purple';
      case 'delivered': case 'picked_up': return 'darkgreen';
      case 'canceled': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>📸 Photography Studio Dashboard</h1>
      
      {user && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Welcome back, {user.name}!</h2>
          <p>Role: <strong>{user.role}</strong></p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Bookings Section */}
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h3>📅 Your Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <p>No bookings yet. <button onClick={() => navigate("/bookings")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}>Schedule one</button></p>
          ) : (
            <ul style={{ paddingLeft: "0px", listStyle: "none" }}>
              {bookings.slice(0, 3).map(booking => (
                <li key={booking.id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "4px" }}>
                  <strong>📸 {booking.Service?.name || "Photography Session"}</strong><br/>
                  📅 {new Date(booking.date).toLocaleDateString()} at ⏰ {booking.time}<br/>
                  📍 {booking.location}<br/>
                  Status: <span style={{ 
                    color: booking.status === 'approved' ? 'green' : 
                           booking.status === 'pending' ? 'orange' : 
                           booking.status === 'completed' ? 'blue' : 'red'
                  }}>{booking.status?.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          )}
          {bookings.length > 3 && (
            <button 
              onClick={() => navigate("/bookings")}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#007bff", 
                cursor: "pointer", 
                textDecoration: "underline",
                padding: "5px 0"
              }}
            >
              View all {bookings.length} bookings →
            </button>
          )}
        </div>

        {/* Orders Section - MATCHES BOOKINGS FORMAT */}
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h3>📦 Your Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <p>No orders yet. <button onClick={() => navigate("/orders")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}>Create one</button></p>
          ) : (
            <ul style={{ paddingLeft: "0px", listStyle: "none" }}>
              {orders.slice(0, 3).map(order => (
                <li key={order.id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "4px" }}>
                  <strong>📦 {order.Service?.name || "Photo Product"}</strong><br/>
                  🚚 {order.deliveryMethod === "delivery" ? `Delivery to ${order.deliveryAddress}` : "Studio Pickup"}<br/>
                  💳 Payment: <span style={{ 
                    color: order.paymentStatus === 'paid' ? 'green' : 'red'
                  }}>{order.paymentStatus?.toUpperCase()}</span><br/>
                  Status: <span style={{ 
                    color: getOrderStatusColor(order.status)
                  }}>{order.status?.replace('_', ' ').toUpperCase()}</span>
                </li>
              ))}
            </ul>
          )}
          {orders.length > 3 && (
            <button 
              onClick={() => navigate("/orders")}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#007bff", 
                cursor: "pointer", 
                textDecoration: "underline",
                padding: "5px 0"
              }}
            >
              View all {orders.length} orders →
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: "30px" }}>
        <h3>Quick Actions</h3>
        <button 
          onClick={() => navigate("/bookings")} 
          style={{ 
            marginRight: "10px", 
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          📅 Book a Service
        </button>
        <button 
          onClick={() => navigate("/orders")} 
          style={{ 
            marginRight: "10px", 
            padding: "10px 15px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🖼️ Submit Photos for Editing
        </button>
        <button 
          onClick={() => navigate("/gallery")} 
          style={{ 
            padding: "10px 15px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🎨 View Gallery
        </button>
      </div>
    </div>
  );
}