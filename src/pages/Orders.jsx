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
  const navigate = useNavigate();

  // Filter services to only show product services
  const productServices = services.filter(service => service.category === "product");

  useEffect(() => {
    fetchOrders();
    fetchServices();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      console.log("Orders response:", res.data);
      setOrders(res.data);
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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (newOrder.deliveryMethod === "delivery" && !newOrder.deliveryAddress.trim()) {
      alert("Please enter delivery address for delivery orders");
      return;
    }

    try {
      const orderData = {
        serviceId: newOrder.serviceId,
        deliveryMethod: newOrder.deliveryMethod,
        deliveryAddress: newOrder.deliveryMethod === "delivery" ? newOrder.deliveryAddress : null,
      };

      console.log("Creating order with data:", orderData);

      const response = await api.post("/orders", orderData);
      console.log("Order creation success:", response.data);

      // TODO: Add photo upload functionality here
      
      alert("Order created successfully!");
      setNewOrder({ serviceId: "", deliveryMethod: "pickup", deliveryAddress: "" });
      setPhotos([]);
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Full error details:", error.response?.data);
      alert(`Failed to create order: ${error.response?.data?.error || error.message}`);
    }
  };

  // MATCHES BOOKINGS PATTERN
  const handleCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.patch(`/orders/my/${id}/cancel`);
      alert("Order canceled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error.response?.data || error.message);
      alert(`Failed to cancel order: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    console.log("Photos selected:", files.length);
  };

  // Updated to match bookings status colors
  const getStatusColor = (status) => {
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

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🖼️ Photo Product Orders</h1>

      {/* Order Creation Form */}
      <form onSubmit={handleCreateOrder} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
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

        {/* Photo Upload (Placeholder for now) */}
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
          />
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            {photos.length > 0 ? `${photos.length} photos selected` : "Select photos for printing/editing"}
          </small>
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: "12px 24px", 
            background: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🛒 Place Order
        </button>
      </form>

      {/* Orders List - MATCHES BOOKINGS PATTERN */}
      <h3>Your Product Orders ({orders.length})</h3>
      {orders.length === 0 ? (
        <p>No product orders found. Place your first photo printing/editing order!</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
              <h4>📦 {order.Service?.name || "Photo Product"}</h4>
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Product:</strong> {order.Service?.description}</p>
              <p><strong>Delivery:</strong> {order.deliveryMethod === "delivery" ? `🚚 ${order.deliveryAddress}` : "🏪 Studio Pickup"}</p>
              <p><strong>Payment:</strong> <span style={{ 
                color: order.paymentStatus === 'paid' ? 'green' : 'red'
              }}>{order.paymentStatus?.toUpperCase()}</span></p>
              <p><strong>Status:</strong> <span style={{ 
                color: getStatusColor(order.status)
              }}>
                {order.status?.replace('_', ' ').toUpperCase()}
              </span></p>
              
              {/* Photos Preview */}
              {order.Photos && order.Photos.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <p><strong>Photos:</strong> {order.Photos.length} images</p>
                </div>
              )}
              
              {/* CANCEL BUTTON - MATCHES BOOKINGS PATTERN */}
              {order.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  style={{ 
                    padding: "5px 10px", 
                    background: "#dc3545", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel Order
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