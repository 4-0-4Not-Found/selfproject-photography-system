// src/pages/Orders.jsx - UPDATED WITH BATCH DELETE FUNCTIONALITY
import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [newOrder, setNewOrder] = useState({
    serviceId: "",
    deliveryMethod: "pickup",
    deliveryAddress: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active", "completed", "canceled"
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const navigate = useNavigate();

  // Filter services to only show product services
  const productServices = services.filter(service => service.category === "product");

  // Categorize orders
  const categorizedOrders = {
    active: orders.filter(o => ['pending', 'editing', 'ready', 'printed'].includes(o.status)),
    completed: orders.filter(o => ['delivered', 'picked_up'].includes(o.status)),
    canceled: orders.filter(o => o.status === 'canceled')
  };

  const currentOrders = categorizedOrders[activeTab];

  useEffect(() => {
    fetchOrders();
    fetchServices();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      console.log("Orders response:", res.data);
      setOrders(res.data);
      setSelectedOrders(new Set()); // Clear selection when data refreshes
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
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
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === currentOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(order => order.id)));
    }
  };

  const handleSelectCompleted = () => {
    const completedOrders = currentOrders.filter(order => 
      ['delivered', 'picked_up'].includes(order.status)
    );
    setSelectedOrders(new Set(completedOrders.map(order => order.id)));
  };

  const handleSelectCanceled = () => {
    const canceledOrders = currentOrders.filter(order => 
      order.status === 'canceled'
    );
    setSelectedOrders(new Set(canceledOrders.map(order => order.id)));
  };

  const handleBatchDelete = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to delete");
      return;
    }

    const orderIds = Array.from(selectedOrders);
    const confirmMessage = `Are you sure you want to delete ${orderIds.length} order(s)? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.post("/orders/my/batch-delete", { orderIds });
      alert(`${orderIds.length} order(s) removed from your view successfully`);
      setSelectedOrders(new Set());
      setBatchMode(false);
      fetchOrders();
    } catch (error) {
      console.error("Error batch deleting orders:", error.response?.data || error.message);
      alert(`Failed to delete orders: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (newOrder.deliveryMethod === "delivery" && !newOrder.deliveryAddress.trim()) {
      alert("Please enter delivery address for delivery orders");
      return;
    }

    try {
      setUploading(true);

      // 1. First create the order
      const orderData = {
        serviceId: newOrder.serviceId,
        deliveryMethod: newOrder.deliveryMethod,
        deliveryAddress: newOrder.deliveryMethod === "delivery" ? newOrder.deliveryAddress : null,
      };

      console.log("Creating order with data:", orderData);

      const response = await api.post("/orders", orderData);
      const orderId = response.data.id;
      console.log("Order creation success:", response.data);

      // 2. THEN upload photos if any were selected
      if (photos.length > 0) {
        console.log("Uploading photos:", photos.length);
        
        const formData = new FormData();
        photos.forEach(photo => {
          formData.append('photos', photo);
        });
        
        try {
          const uploadResponse = await api.post(`/photos/order/${orderId}`, formData, {
            headers: { 
              'Content-Type': 'multipart/form-data' 
            }
          });
          console.log("Photo upload success:", uploadResponse.data);
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          // Continue even if photo upload fails - the order is already created
        }
      }

      alert("Order created successfully!" + (photos.length > 0 ? ` ${photos.length} photos uploaded.` : ""));
      setNewOrder({ serviceId: "", deliveryMethod: "pickup", deliveryAddress: "" });
      setPhotos([]);
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Full error details:", error.response?.data);
      alert(`Failed to create order: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    console.log("Photos selected:", files.length, files);
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.patch(`/orders/my/${id}/cancel`);
      alert("Order canceled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error.response?.data || error.message);
      alert(`Failed to cancel order: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    try {
      await api.delete(`/orders/my/${id}/delete`);
      alert("Order removed");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error.response?.data || error.message);
      alert(`Failed to delete order: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'editing': return '#17a2b8';
      case 'ready': return '#28a745';
      case 'printed': return '#6f42c1';
      case 'delivered': case 'picked_up': return '#20c997';
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

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🖼️ Photo Product Orders</h1>

      {/* Order Creation Form */}
      <form onSubmit={handleCreateOrder} style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>Order Photo Products & Services</h3>
        
        {/* Product Service Selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Product/Service:
          </label>
          <select
            value={newOrder.serviceId}
            onChange={(e) => setNewOrder({ ...newOrder, serviceId: e.target.value })}
            required
            style={{ padding: "8px", width: "350px" }}
          >
            <option value="">-- Select Product or Service --</option>
            {productServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </option>
            ))}
          </select>
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            Choose from our photo printing and editing services
          </small>
        </div>

        {/* Delivery Method */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Delivery Method:
          </label>
          <div>
            <label style={{ marginRight: "15px" }}>
              <input
                type="radio"
                value="pickup"
                checked={newOrder.deliveryMethod === "pickup"}
                onChange={(e) => setNewOrder({ ...newOrder, deliveryMethod: e.target.value, deliveryAddress: "" })}
              />
              🏪 Pickup from Studio
            </label>
            <label>
              <input
                type="radio"
                value="delivery"
                checked={newOrder.deliveryMethod === "delivery"}
                onChange={(e) => setNewOrder({ ...newOrder, deliveryMethod: e.target.value })}
              />
              🚚 Delivery to Address
            </label>
          </div>
        </div>

        {/* Delivery Address (Conditional) */}
        {newOrder.deliveryMethod === "delivery" && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Delivery Address *:
            </label>
            <input
              type="text"
              placeholder="Enter full delivery address"
              value={newOrder.deliveryAddress}
              onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
              required
              style={{ padding: "8px", width: "400px" }}
            />
          </div>
        )}

        {/* Photo Upload */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Photos for Processing:
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ padding: "8px" }}
            disabled={uploading}
          />
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            {uploading ? "📤 Uploading photos..." : 
             photos.length > 0 ? `✅ ${photos.length} photos selected - will be uploaded with order` : 
             "Select photos for printing/editing"}
          </small>
          
          {/* Photo Preview */}
          {photos.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p><strong>Selected Photos Preview:</strong></p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {photos.map((photo, index) => (
                  <div key={index} style={{ textAlign: "center" }}>
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Preview ${index + 1}`}
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #ddd"
                      }}
                    />
                    <small style={{ display: "block", fontSize: "10px" }}>
                      {photo.name}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          style={{ 
            padding: "12px 24px", 
            background: uploading ? "#6c757d" : "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: uploading ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {uploading ? "🔄 Creating Order..." : "🛒 Place Order"}
        </button>
      </form>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "10px 20px",
            background: activeTab === "active" ? "#007bff" : "transparent",
            color: activeTab === "active" ? "white" : "#007bff",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          🔄 Active ({categorizedOrders.active.length})
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
          ✅ Completed ({categorizedOrders.completed.length})
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
          ❌ Canceled ({categorizedOrders.canceled.length})
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
            🗂️ Batch Mode: {selectedOrders.size} order(s) selected
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
              {selectedOrders.size === currentOrders.length ? "❌ Select None" : "✅ Select All"}
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

      {/* Orders List Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3>
          {activeTab === 'active' && '🔄 Active Orders'}
          {activeTab === 'completed' && '✅ Completed Orders'} 
          {activeTab === 'canceled' && '❌ Canceled Orders'}
          ({currentOrders.length})
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

      {/* Orders List - ORGANIZED */}
      {currentOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>No {activeTab} orders found.</p>
          {activeTab === 'active' && (
            <p>Create your first photo order using the form above!</p>
          )}
        </div>
      ) : (
        <div>
          {currentOrders.map((order) => (
            <div key={order.id} style={{ 
              border: "1px solid #ddd", 
              padding: "15px", 
              marginBottom: "10px", 
              borderRadius: "8px",
              background: activeTab === 'active' ? '#f8f9fa' : 'white',
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
                      <span style={{ ...getStatusBadge(order.status), marginLeft: "10px" }}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </h4>
                    <p><strong>🆔 Order ID:</strong> #{order.id}</p>
                    <p><strong>📋 Product:</strong> {order.Service?.description}</p>
                    <p><strong>💵 Price:</strong> ${order.Service?.price}</p>
                    <p><strong>🚚 Delivery:</strong> {order.deliveryMethod === "delivery" ? `Delivery to ${order.deliveryAddress}` : "Studio Pickup"}</p>
                    <p><strong>💳 Payment:</strong> 
                      <span style={{ 
                        color: order.paymentStatus === 'paid' ? 'green' : 'red',
                        marginLeft: "5px"
                      }}>
                        {order.paymentStatus?.toUpperCase()}
                      </span>
                    </p>
                    
                    {/* Photos Info */}
                    {order.Photos && order.Photos.length > 0 && (
                      <div style={{ 
                        marginTop: "5px", 
                        padding: "5px 10px", 
                        background: "#e7f3ff", 
                        borderRadius: "4px",
                        display: "inline-block"
                      }}>
                        <small>
                          <strong>📸 {order.Photos.length} photo(s) uploaded</strong>
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Individual Actions */}
                {!batchMode && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "120px" }}>
                    {/* Cancel button for pending orders */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
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