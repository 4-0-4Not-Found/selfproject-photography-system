// Middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../Models");

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user; // full user object for convenience
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired", error: err.message });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};
