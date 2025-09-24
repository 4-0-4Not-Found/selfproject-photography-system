const User = require("./user");
const Service = require("./service");
const Booking = require("./booking");
const Order = require("./order");
const Photo = require("./photo");
const Gallery = require("./gallery");
const Payment = require("./payment");

// Users → Bookings (for scheduled photography)
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

Service.hasMany(Booking, { foreignKey: "serviceId" });
Booking.belongsTo(Service, { foreignKey: "serviceId" });

// Users → Orders (for printing/editing photos)
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Service.hasMany(Order, { foreignKey: "serviceId" });
Order.belongsTo(Service, { foreignKey: "serviceId" });

// Orders → Photos
Order.hasMany(Photo, { foreignKey: "orderId" });
Photo.belongsTo(Order, { foreignKey: "orderId" });

// Orders → Payments
Order.hasOne(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

module.exports = { User, Service, Booking, Order, Photo, Gallery, Payment };
