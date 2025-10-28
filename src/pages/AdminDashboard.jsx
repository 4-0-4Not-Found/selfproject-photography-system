// src/pages/AdminDashboard.jsx - UPDATED WITH BATCH DELETE FUNCTIONALITY
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [activeSubTab, setActiveSubTab] = useState("new"); // "new", "active", "completed", "canceled", "archived"
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    bookings: 0,
    orders: 0,
    users: 0,
    services: 0
  });
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    category: "session"
  });
  const [editingService, setEditingService] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPhotos, setOrderPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCounts();
    fetchAdminData();
  }, [activeTab]);

  // FIXED: Categorize bookings - Show ALL records in admin view
  const categorizedBookings = {
    new: bookings.filter(b => b.status === 'pending'),
    active: bookings.filter(b => b.status === 'approved'),
    completed: bookings.filter(b => b.status === 'completed'),
    canceled: bookings.filter(b => b.status === 'canceled'),
    archived: bookings.filter(b => b.deletedByUser) // User-deleted records
  };

  // FIXED: Categorize orders - Show ALL records in admin view
  const categorizedOrders = {
    new: orders.filter(o => o.status === 'pending'),
    active: orders.filter(o => ['editing', 'ready', 'printed'].includes(o.status)),
    completed: orders.filter(o => ['delivered', 'picked_up'].includes(o.status)),
    canceled: orders.filter(o => o.status === 'canceled'),
    archived: orders.filter(o => o.deletedByUser) // User-deleted records
  };

  const currentBookings = categorizedBookings[activeSubTab];
  const currentOrders = categorizedOrders[activeSubTab];

  // Fetch all counts when dashboard loads
  const fetchAllCounts = async () => {
    try {
      const [bookingsRes, ordersRes, usersRes, servicesRes] = await Promise.all([
        api.get("/bookings"),
        api.get("/orders"),
        api.get("/users"),
        api.get("/services")
      ]);

      setCounts({
        bookings: bookingsRes.data.length,
        orders: ordersRes.data.length,
        users: usersRes.data.length,
        services: servicesRes.data.length
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
      setCounts({
        bookings: bookings.length,
        orders: orders.length,
        users: users.length,
        services: services.length
      });
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case "users":
          const usersRes = await api.get("/users");
          setUsers(usersRes.data);
          break;
        case "bookings":
          const bookingsRes = await api.get("/bookings");
          setBookings(bookingsRes.data);
          setSelectedBookings(new Set()); // Clear selection when data refreshes
          break;
        case "orders":
          const ordersRes = await api.get("/orders");
          setOrders(ordersRes.data);
          setSelectedOrders(new Set()); // Clear selection when data refreshes
          break;
        case "services":
          const servicesRes = await api.get("/services");
          setServices(servicesRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Admin dashboard error:", error);
      alert("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  // Batch Selection Handlers for Bookings
  const handleSelectBooking = (bookingId) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAllBookings = () => {
    if (selectedBookings.size === currentBookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(currentBookings.map(booking => booking.id)));
    }
  };

  const handleSelectBookingsByStatus = (status) => {
    const filteredBookings = currentBookings.filter(booking => 
      booking.status === status
    );
    setSelectedBookings(new Set(filteredBookings.map(booking => booking.id)));
  };

  // Batch Selection Handlers for Orders
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.size === currentOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(order => order.id)));
    }
  };

  const handleSelectOrdersByStatus = (status) => {
    const filteredOrders = currentOrders.filter(order => 
      order.status === status
    );
    setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
  };

  // Batch Actions for Bookings
  const handleBatchDeleteBookings = async () => {
    if (selectedBookings.size === 0) {
      alert("Please select bookings to delete");
      return;
    }

    const bookingIds = Array.from(selectedBookings);
    const confirmMessage = `Are you sure you want to PERMANENTLY delete ${bookingIds.length} booking(s)? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;
      
    try {
      await api.post("/bookings/batch-delete", { bookingIds });
      alert(`${bookingIds.length} booking(s) permanently deleted`);
      setSelectedBookings(new Set());
      setBatchMode(false);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error batch deleting bookings:", error.response?.data || error.message);
      alert(`Failed to delete bookings: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleBatchRestoreBookings = async () => {
    if (selectedBookings.size === 0) {
      alert("Please select bookings to restore");
      return;
    }

    const bookingIds = Array.from(selectedBookings);
    const confirmMessage = `Restore ${bookingIds.length} booking(s) for user access?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      // Since we don't have batch restore endpoint, do individual restores
      for (const bookingId of bookingIds) {
        await api.patch(`/bookings/${bookingId}/restore`);
      }
      alert(`${bookingIds.length} booking(s) restored successfully`);
      setSelectedBookings(new Set());
      setBatchMode(false);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error batch restoring bookings:", error.response?.data || error.message);
      alert(`Failed to restore bookings: ${error.response?.data?.error || error.message}`);
    }
  };

  // Batch Actions for Orders
  const handleBatchDeleteOrders = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to delete");
      return;
    }

    const orderIds = Array.from(selectedOrders);
    const confirmMessage = `Are you sure you want to PERMANENTLY delete ${orderIds.length} order(s) and associated photos? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.post("/orders/batch-delete", { orderIds });
      alert(`${orderIds.length} order(s) and associated photos permanently deleted`);
      setSelectedOrders(new Set());
      setBatchMode(false);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error batch deleting orders:", error.response?.data || error.message);
      alert(`Failed to delete orders: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleBatchRestoreOrders = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to restore");
      return;
    }

    const orderIds = Array.from(selectedOrders);
    const confirmMessage = `Restore ${orderIds.length} order(s) for user access?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      // Since we don't have batch restore endpoint, do individual restores
      for (const orderId of orderIds) {
        await api.patch(`/orders/${orderId}/restore`);
      }
      alert(`${orderIds.length} order(s) restored successfully`);
      setSelectedOrders(new Set());
      setBatchMode(false);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error batch restoring orders:", error.response?.data || error.message);
      alert(`Failed to restore orders: ${error.response?.data?.error || error.message}`);
    }
  };

  // Individual Actions (unchanged)
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this booking? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/bookings/${bookingId}`);
      alert("Booking permanently deleted");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this order? This will also delete associated photos. This action cannot be undone.")) return;
    
    try {
      await api.delete(`/orders/${orderId}`);
      alert("Order permanently deleted");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const handleRestoreBooking = async (bookingId) => {
    if (!window.confirm("Restore this booking for the user?")) return;
    
    try {
      await api.patch(`/bookings/${bookingId}/restore`);
      alert("Booking restored successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error restoring booking:", error);
      alert("Failed to restore booking");
    }
  };

  const handleRestoreOrder = async (orderId) => {
    if (!window.confirm("Restore this order for the user?")) return;
    
    try {
      await api.patch(`/orders/${orderId}/restore`);
      alert("Order restored successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error restoring order:", error);
      alert("Failed to restore order");
    }
  };

  // Rest of your existing functions remain the same...
  const fetchOrderPhotos = async (orderId) => {
    try {
      setPhotoLoading(true);
      const photosRes = await api.get(`/photos/order/${orderId}`);
      setOrderPhotos(photosRes.data);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error("Error fetching photos:", error);
      alert("Failed to load photos for this order");
      setOrderPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  };

  const closePhotoView = () => {
    setSelectedOrder(null);
    setOrderPhotos([]);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: newStatus });
      alert("Booking status updated successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      alert("Order status updated successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      alert("User role updated successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    try {
      await api.delete(`/services/${serviceId}`);
      alert("Service deleted successfully");
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services", {
        ...newService,
        price: parseFloat(newService.price)
      });
      alert("Service created successfully");
      setNewService({ name: "", description: "", price: "", category: "session" });
      setShowAddService(false);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error creating service:", error);
      alert("Failed to create service");
    }
  };

  const handleEditService = (service) => {
    setEditingService({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/services/${editingService.id}`, {
        name: editingService.name,
        description: editingService.description,
        price: parseFloat(editingService.price),
        category: editingService.category
      });
      alert("Service updated successfully");
      setEditingService(null);
      fetchAdminData();
      fetchAllCounts();
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'editing': return '#17a2b8';
      case 'ready': return '#28a745';
      case 'printed': return '#6f42c1';
      case 'delivered': case 'picked_up': return '#20c997';
      case 'canceled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusBadge = (status, deletedByUser = false) => {
    const color = getStatusColor(status);
    return {
      background: deletedByUser ? '#6c757d' : color, // Gray for archived records
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    };
  };

  if (loading && activeTab) {
    return <div style={{ padding: "20px" }}>Loading admin dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>⚙️ Admin Dashboard</h1>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ 
            padding: "8px 16px", 
            background: "#6c757d", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← Back to User Dashboard
        </button>
      </div>

      {/* Quick Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #007bff", padding: "15px", borderRadius: "8px", textAlign: "center", background: "#f8f9fa" }}>
          <h3 style={{ margin: "0", color: "#007bff" }}>📅</h3>
          <h2 style={{ margin: "5px 0", color: "#007bff" }}>{counts.bookings}</h2>
          <p style={{ margin: "0", fontWeight: "bold" }}>Bookings</p>
          <small style={{ color: "#666" }}>
            Active: {categorizedBookings.new.length + categorizedBookings.active.length} | Archived: {categorizedBookings.archived.length}
          </small>
        </div>
        <div style={{ border: "1px solid #28a745", padding: "15px", borderRadius: "8px", textAlign: "center", background: "#f8f9fa" }}>
          <h3 style={{ margin: "0", color: "#28a745" }}>📦</h3>
          <h2 style={{ margin: "5px 0", color: "#28a745" }}>{counts.orders}</h2>
          <p style={{ margin: "0", fontWeight: "bold" }}>Orders</p>
          <small style={{ color: "#666" }}>
            Active: {categorizedOrders.new.length + categorizedOrders.active.length} | Archived: {categorizedOrders.archived.length}
          </small>
        </div>
        <div style={{ border: "1px solid #ffc107", padding: "15px", borderRadius: "8px", textAlign: "center", background: "#f8f9fa" }}>
          <h3 style={{ margin: "0", color: "#ffc107" }}>👥</h3>
          <h2 style={{ margin: "5px 0", color: "#ffc107" }}>{counts.users}</h2>
          <p style={{ margin: "0", fontWeight: "bold" }}>Users</p>
        </div>
        <div style={{ border: "1px solid #dc3545", padding: "15px", borderRadius: "8px", textAlign: "center", background: "#f8f9fa" }}>
          <h3 style={{ margin: "0", color: "#dc3545" }}>🛠️</h3>
          <h2 style={{ margin: "5px 0", color: "#dc3545" }}>{counts.services}</h2>
          <p style={{ margin: "0", fontWeight: "bold" }}>Services</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <button
          onClick={() => { setActiveTab("bookings"); setActiveSubTab("new"); setBatchMode(false); }}
          style={{
            padding: "10px 20px",
            background: activeTab === "bookings" ? "#007bff" : "transparent",
            color: activeTab === "bookings" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          📅 Bookings ({counts.bookings})
        </button>
        <button
          onClick={() => { setActiveTab("orders"); setActiveSubTab("new"); setBatchMode(false); }}
          style={{
            padding: "10px 20px",
            background: activeTab === "orders" ? "#007bff" : "transparent",
            color: activeTab === "orders" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          📦 Orders ({counts.orders})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            background: activeTab === "users" ? "#007bff" : "transparent",
            color: activeTab === "users" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          👥 Users ({counts.users})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          style={{
            padding: "10px 20px",
            background: activeTab === "services" ? "#007bff" : "transparent",
            color: activeTab === "services" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer"
          }}
        >
          🛠️ Services ({counts.services})
        </button>
      </div>

      {/* FIXED: Sub-tab Navigation for Bookings & Orders - ADDED ARCHIVED TAB */}
      {(activeTab === "bookings" || activeTab === "orders") && (
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setActiveSubTab("new")}
            style={{
              padding: "8px 16px",
              background: activeSubTab === "new" ? "#ffc107" : "transparent",
              color: activeSubTab === "new" ? "black" : "#ffc107",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
              borderRadius: "4px"
            }}
          >
            🆕 New ({activeTab === "bookings" ? categorizedBookings.new.length : categorizedOrders.new.length})
          </button>
          <button
            onClick={() => setActiveSubTab("active")}
            style={{
              padding: "8px 16px",
              background: activeSubTab === "active" ? "#17a2b8" : "transparent",
              color: activeSubTab === "active" ? "white" : "#17a2b8",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
              borderRadius: "4px"
            }}
          >
            🔄 Active ({activeTab === "bookings" ? categorizedBookings.active.length : categorizedOrders.active.length})
          </button>
          <button
            onClick={() => setActiveSubTab("completed")}
            style={{
              padding: "8px 16px",
              background: activeSubTab === "completed" ? "#28a745" : "transparent",
              color: activeSubTab === "completed" ? "white" : "#28a745",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
              borderRadius: "4px"
            }}
          >
            ✅ Completed ({activeTab === "bookings" ? categorizedBookings.completed.length : categorizedOrders.completed.length})
          </button>
          <button
            onClick={() => setActiveSubTab("canceled")}
            style={{
              padding: "8px 16px",
              background: activeSubTab === "canceled" ? "#dc3545" : "transparent",
              color: activeSubTab === "canceled" ? "white" : "#dc3545",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
              borderRadius: "4px"
            }}
          >
            ❌ Canceled ({activeTab === "bookings" ? categorizedBookings.canceled.length : categorizedOrders.canceled.length})
          </button>
          {/* NEW: Archived Tab */}
          <button
            onClick={() => setActiveSubTab("archived")}
            style={{
              padding: "8px 16px",
              background: activeSubTab === "archived" ? "#6c757d" : "transparent",
              color: activeSubTab === "archived" ? "white" : "#6c757d",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            📁 Archived ({activeTab === "bookings" ? categorizedBookings.archived.length : categorizedOrders.archived.length})
          </button>
        </div>
      )}

      {/* Batch Actions Toolbar for Bookings */}
      {batchMode && activeTab === "bookings" && (
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
              onClick={handleSelectAllBookings}
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
              onClick={() => handleSelectBookingsByStatus('completed')}
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
              onClick={() => handleSelectBookingsByStatus('canceled')}
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

            {activeSubTab === 'archived' ? (
              <button
                onClick={handleBatchRestoreBookings}
                disabled={selectedBookings.size === 0}
                style={{ 
                  padding: "5px 10px", 
                  background: selectedBookings.size === 0 ? "#6c757d" : "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: selectedBookings.size === 0 ? "not-allowed" : "pointer",
                  fontSize: "12px"
                }}
              >
                🔄 Restore Selected ({selectedBookings.size})
              </button>
            ) : (
              <button
                onClick={handleBatchDeleteBookings}
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
            )}
            
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

      {/* Batch Actions Toolbar for Orders */}
      {batchMode && activeTab === "orders" && (
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
            🗂️ Batch Mode: {selectedOrders.size} order(s) selected
          </div>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleSelectAllOrders}
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
              {selectedOrders.size === currentOrders.length ? "❌ Select None" : "✅ Select All"}
            </button>
            
            <button
              onClick={() => handleSelectOrdersByStatus('completed')}
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
              onClick={() => handleSelectOrdersByStatus('canceled')}
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

            {activeSubTab === 'archived' ? (
              <button
                onClick={handleBatchRestoreOrders}
                disabled={selectedOrders.size === 0}
                style={{ 
                  padding: "5px 10px", 
                  background: selectedOrders.size === 0 ? "#6c757d" : "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: selectedOrders.size === 0 ? "not-allowed" : "pointer",
                  fontSize: "12px"
                }}
              >
                🔄 Restore Selected ({selectedOrders.size})
              </button>
            ) : (
              <button
                onClick={handleBatchDeleteOrders}
                disabled={selectedOrders.size === 0}
                style={{ 
                  padding: "5px 10px", 
                  background: selectedOrders.size === 0 ? "#6c757d" : "#dc3545", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: selectedOrders.size === 0 ? "not-allowed" : "pointer",
                  fontSize: "12px"
                }}
              >
                🗑️ Delete Selected ({selectedOrders.size})
              </button>
            )}
            
            <button
              onClick={() => {
                setBatchMode(false);
                setSelectedOrders(new Set());
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

      {/* Tab Content Header with Batch Toggle */}
      {(activeTab === "bookings" || activeTab === "orders") && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>
            {activeTab === "bookings" && (
              <>
                {activeSubTab === 'new' && '🆕 New Bookings'}
                {activeSubTab === 'active' && '🔄 Active Bookings'} 
                {activeSubTab === 'completed' && '✅ Completed Bookings'}
                {activeSubTab === 'canceled' && '❌ Canceled Bookings'}
                {activeSubTab === 'archived' && '📁 Archived Bookings (User-Deleted)'}
              </>
            )}
            {activeTab === "orders" && (
              <>
                {activeSubTab === 'new' && '🆕 New Orders'}
                {activeSubTab === 'active' && '🔄 Active Orders'} 
                {activeSubTab === 'completed' && '✅ Completed Orders'}
                {activeSubTab === 'canceled' && '❌ Canceled Orders'}
                {activeSubTab === 'archived' && '📁 Archived Orders (User-Deleted)'}
              </>
            )}
            ({activeTab === "bookings" ? currentBookings.length : currentOrders.length})
          </h3>
          
          {!batchMode && (activeTab === "bookings" || activeTab === "orders") && (
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
      )}

      {/* Photo View Modal (unchanged) */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "90%",
            maxHeight: "90%",
            overflow: "auto",
            position: "relative"
          }}>
            <button
              onClick={closePhotoView}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              ✕
            </button>
            
            <h3>📸 Photos for Order #{selectedOrder}</h3>
            
            {photoLoading ? (
              <p>Loading photos...</p>
            ) : orderPhotos.length === 0 ? (
              <p>No photos found for this order.</p>
            ) : (
              <div>
                <p><strong>{orderPhotos.length} photo(s) uploaded:</strong></p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                  marginTop: "15px"
                }}>
                  {orderPhotos.map((photo, index) => (
                    <div key={photo.id} style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                      textAlign: "center"
                    }}>
                      <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Photo {index + 1}</p>
                      
                      {/* Original Photo */}
                      <div style={{ marginBottom: "15px" }}>
                        <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>Original:</p>
                        <img 
                          src={`http://localhost:3000/${photo.original_url}`}
                          alt={`Original ${index + 1}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "150px",
                            borderRadius: "4px",
                            border: "1px solid #eee"
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150?text=Photo+Not+Found";
                          }}
                        />
                      </div>
                      
                      {/* Edited Photo (if exists) */}
                      {photo.edited_url && (
                        <div>
                          <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>Edited:</p>
                          <img 
                            src={`http://localhost:3000/${photo.edited_url}`}
                            alt={`Edited ${index + 1}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "150px",
                              borderRadius: "4px",
                              border: "1px solid #28a745"
                            }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150?text=Edited+Not+Found";
                            }}
                          />
                        </div>
                      )}
                      
                      {!photo.edited_url && (
                        <p style={{ fontSize: "12px", color: "#999", fontStyle: "italic" }}>
                          No edited version yet
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {/* Bookings Management - FIXED WITH BATCH SUPPORT */}
        {activeTab === "bookings" && (
          <div>
            {currentBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>No {activeSubTab} bookings found.</p>
              </div>
            ) : (
              <div>
                {currentBookings.map((booking) => (
                  <div key={booking.id} style={{ 
                    border: "1px solid #ddd", 
                    padding: "15px", 
                    marginBottom: "10px", 
                    borderRadius: "8px",
                    background: booking.deletedByUser ? '#f8f9fa' : (activeSubTab === 'new' ? '#fff9e6' : 'white'),
                    opacity: booking.deletedByUser ? 0.8 : 1,
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
                            <span style={{ ...getStatusBadge(booking.status, booking.deletedByUser), marginLeft: "10px" }}>
                              {booking.deletedByUser ? 'ARCHIVED' : booking.status.toUpperCase()}
                            </span>
                            {booking.deletedByUser && (
                              <span style={{ 
                                marginLeft: "10px", 
                                fontSize: "10px", 
                                color: "#6c757d",
                                fontStyle: "italic"
                              }}>
                                (User deleted on {new Date(booking.userDeletedAt).toLocaleDateString()})
                              </span>
                            )}
                          </h4>
                          <p><strong>👤 Customer:</strong> {booking.User?.name || `User #${booking.userId}`}</p>
                          <p><strong>📅 Date:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                          <p><strong>📍 Location:</strong> {booking.location}</p>
                          {booking.customDescription && (
                            <p><strong>📝 Custom Description:</strong> {booking.customDescription}</p>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "120px" }}>
                        {!batchMode ? (
                          !booking.deletedByUser ? (
                            <>
                              <select 
                                value={booking.status} 
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                style={{ padding: "5px", fontSize: "12px" }}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
                              </select>
                              
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
                            </>
                          ) : (
                            /* Archived booking actions */
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              <button
                                onClick={() => handleRestoreBooking(booking.id)}
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
                                🔄 Restore
                              </button>
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
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Management - FIXED WITH BATCH SUPPORT */}
        {activeTab === "orders" && (
          <div>
            {currentOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>No {activeSubTab} orders found.</p>
              </div>
            ) : (
              <div>
                {currentOrders.map((order) => (
                  <div key={order.id} style={{ 
                    border: "1px solid #ddd", 
                    padding: "15px", 
                    marginBottom: "10px", 
                    borderRadius: "8px",
                    background: order.deletedByUser ? '#f8f9fa' : (activeSubTab === 'new' ? '#fff9e6' : 'white'),
                    opacity: order.deletedByUser ? 0.8 : 1,
                    borderLeft: batchMode && selectedOrders.has(order.id) ? '4px solid #007bff' : '1px solid #ddd'
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        {/* Checkbox for batch selection */}
                        {batchMode && (
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            style={{ marginTop: "5px" }}
                          />
                        )}
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 10px 0" }}>
                            📦 {order.Service?.name || "Photo Product"}
                            <span style={{ ...getStatusBadge(order.status, order.deletedByUser), marginLeft: "10px" }}>
                              {order.deletedByUser ? 'ARCHIVED' : order.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {order.deletedByUser && (
                              <span style={{ 
                                marginLeft: "10px", 
                                fontSize: "10px", 
                                color: "#6c757d",
                                fontStyle: "italic"
                              }}>
                                (User deleted on {new Date(order.userDeletedAt).toLocaleDateString()})
                              </span>
                            )}
                          </h4>
                          <p><strong>👤 Customer:</strong> {order.User?.name || `User #${order.userId}`}</p>
                          <p><strong>🚚 Delivery:</strong> {order.deliveryMethod === "delivery" ? `Delivery to ${order.deliveryAddress}` : "Studio Pickup"}</p>
                          <p><strong>💳 Payment:</strong> 
                            <span style={{ 
                              color: order.paymentStatus === 'paid' ? 'green' : 'red',
                              marginLeft: "5px"
                            }}>
                              {order.paymentStatus?.toUpperCase()}
                            </span>
                          </p>
                          
                          {/* Quick Photo Info */}
                          {order.Photos && order.Photos.length > 0 && (
                            <div style={{ 
                              marginTop: "5px", 
                              padding: "5px 10px", 
                              background: "#e7f3ff", 
                              borderRadius: "4px",
                              display: "inline-block"
                            }}>
                              <small>
                                <strong>📸 {order.Photos.length} photo(s)</strong>
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "120px" }}>
                        {!batchMode ? (
                          !order.deletedByUser ? (
                            <>
                              <select 
                                value={order.status} 
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                style={{ padding: "5px", fontSize: "12px" }}
                              >
                                <option value="pending">Pending</option>
                                <option value="editing">Editing</option>
                                <option value="ready">Ready</option>
                                <option value="printed">Printed</option>
                                <option value="delivered">Delivered</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="canceled">Canceled</option>
                              </select>
                              
                              <button
                                onClick={() => fetchOrderPhotos(order.id)}
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
                                📷 View Photos
                              </button>
                              
                              {/* Delete button for completed/canceled orders */}
                              {(order.status === 'delivered' || order.status === 'picked_up' || order.status === 'canceled') && (
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
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
                            </>
                          ) : (
                            /* Archived order actions */
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              <button
                                onClick={() => handleRestoreOrder(order.id)}
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
                                🔄 Restore
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
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
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Management (unchanged) */}
        {activeTab === "users" && (
          <div>
            <h3>Manage Users ({users.length} total)</h3>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div>
                {users.map((user) => (
                  <div key={user.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
                    <h4>👤 {user.name || `User #${user.id}`}</h4>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> 
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        style={{ marginLeft: "10px", padding: "5px" }}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </p>
                    <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Management (unchanged) */}
        {activeTab === "services" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3>Manage Services ({services.length} total)</h3>
              <button 
                onClick={() => setShowAddService(!showAddService)}
                style={{ 
                  padding: "8px 16px", 
                  background: "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {showAddService ? "✖ Cancel" : "➕ Add New Service"}
              </button>
            </div>

            {/* Add Service Form */}
            {showAddService && (
              <form onSubmit={handleCreateService} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px", borderRadius: "8px" }}>
                <h4>Add New Service</h4>
                <div style={{ marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required
                    style={{ padding: "8px", width: "300px", marginRight: "10px" }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    required
                    style={{ padding: "8px", width: "100px", marginRight: "10px" }}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    style={{ padding: "8px", marginRight: "10px" }}
                  >
                    <option value="session">Photography Session</option>
                    <option value="product">Photo Product</option>
                  </select>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <textarea
                    placeholder="Service Description"
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    required
                    style={{ padding: "8px", width: "100%", height: "60px", resize: "vertical" }}
                  />
                </div>
                <button 
                  type="submit"
                  style={{ 
                    padding: "8px 16px", 
                    background: "#007bff", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Create Service
                </button>
              </form>
            )}

            {services.length === 0 ? (
              <p>No services found.</p>
            ) : (
              <div>
                {services.map((service) => (
                  <div key={service.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
                    {/* EDIT MODE */}
                    {editingService && editingService.id === service.id ? (
                      <form onSubmit={handleSaveService}>
                        <div style={{ marginBottom: "10px" }}>
                          <input
                            type="text"
                            value={editingService.name}
                            onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                            required
                            style={{ padding: "8px", width: "300px", marginRight: "10px", marginBottom: "5px" }}
                          />
                          <input
                            type="number"
                            value={editingService.price}
                            onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                            required
                            style={{ padding: "8px", width: "100px", marginRight: "10px" }}
                          />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <select
                            value={editingService.category}
                            onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                            style={{ padding: "8px", marginRight: "10px", marginBottom: "5px" }}
                          >
                            <option value="session">Photography Session</option>
                            <option value="product">Photo Product</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <textarea
                            value={editingService.description}
                            onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                            required
                            style={{ padding: "8px", width: "100%", height: "60px", resize: "vertical" }}
                          />
                        </div>
                        <div>
                          <button 
                            type="submit"
                            style={{ 
                              padding: "5px 10px", 
                              background: "#28a745", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "10px"
                            }}
                          >
                            💾 Save
                          </button>
                          <button 
                            type="button"
                            onClick={handleCancelEdit}
                            style={{ 
                              padding: "5px 10px", 
                              background: "#6c757d", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* VIEW MODE */
                      <>
                        <h4>{service.name} - ${service.price}</h4>
                        <p><strong>Category:</strong> 
                          <span style={{ 
                            color: service.category === 'session' ? 'blue' : 'green',
                            marginLeft: "5px"
                          }}>
                            {service.category === 'session' ? '📸 Photography Session' : '📦 Photo Product'}
                          </span>
                        </p>
                        <p><strong>Description:</strong> {service.description}</p>
                        <p><strong>Service ID:</strong> {service.id}</p>
                        <div>
                          <button
                            onClick={() => handleEditService(service)}
                            style={{ 
                              padding: "5px 10px", 
                              background: "#007bff", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "10px"
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            style={{ 
                              padding: "5px 10px", 
                              background: "#dc3545", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}