# 📸 Self Project Photoshop System

This is a sample system for a photo studio business which specializes in **printing, shooting, and editing photos**.

---

## ✅ 23/09/2025 Progress
- Initialized **Node.js + Express.js** backend  
- Installed and configured **Sequelize ORM**  
- Connected to **Neon.tech (Postgres)** using SSL  
- Added **.env** for secure configuration  
- Created **User model** (with roles: admin, customer)  
- Synced database successfully with Neon  

---

## ✅ 24/09/2025 Progress
- Initialized **Node.js + Express.js** backend  
- Installed and configured **Sequelize ORM**  
- Connected to **Neon.tech (Postgres)** using SSL  
- Added **.env** for secure configuration  
- Created **User model** (with roles: admin, customer)  
- Added **Service, Booking, Order, Photo, and Gallery models**  
- Defined associations between models in `Models/index.js`  
- Synced database successfully with Neon  

## ✅ 25/09/2025 Progress
- Implemented Sequelize models: Booking, Order, Photo, Gallery, Payment
- Defined associations between users, services, bookings, orders, and photos
- Added controllers and routes for Orders, Bookings, Photos, and Gallery
- Linked Photos with Orders and Payments with Orders
- Tested endpoints with Thunder Client (CRUD verified for Orders, Bookings, and Photos)
- Fixed missing imports in routes and improved error handling

# 📝 Notes

## 🚀 Next Steps in Building the Website

### Step 1. Expand Your Data Models (ERD)
- **Users** (done — roles: admin, customer)  
- **Services** (Wedding Photography, Portrait, Event Coverage, Printing, Editing, etc.)  
- **Orders** (customer bookings/orders with delivery/pickup option)  
- **Photos** (customer uploads + final edited versions)  
- **Gallery** (public marketing showcase by admin)  
- **Payments** (optional: track payment status)  

### Step 2. Add Models + Controllers + Routes
For each entity:
- Define a Sequelize model (`Models/Service.js`, `Models/Booking.js`, etc.)  
- Create a controller with CRUD logic  
- Create a route file (`Routes/serviceRoutes.js`, etc.)  
- Register the route in `app.js`  

**Example Endpoints**
- `/api/services`  
- `/api/bookings`  

### Step 3. Secure Routes
**Customers**:
- Book services  
- Upload photos for editing/printing  
- View gallery & their own orders  
- Choose delivery or pickup  

**Admins**:
- Manage services  
- Approve/manage orders  
- Upload finished photos  
- Handle delivery/pickup logistics  

🔑 Use **JWT middleware** for role-based access.  

### Step 4. Test in Postman
- Register/Login user → get token  
- Test protected routes (e.g., add service, create order)  
- Confirm Neon DB updates with real data  

### Step 5. Build the Frontend
- Customer-facing website + admin dashboard  
- Use **React** (or Next.js)  
- Fetch data from backend API endpoints  

### Step 6. Deploy Free
- **Backend** → Render / Railway  
- **Frontend** → Vercel / Netlify  
- **Database** → already hosted on Neon  

---

## 🆕 New Features Added
- **Photo Uploads**: Customers upload photos for editing/printing  
- **Editing Workflow**: Admin updates order status (`pending → editing → ready → printed`)  
- **Delivery or Pickup**:  
  - Delivery → customer provides address  
  - Pickup → mark order as picked up in shop  
- **Order Tracking**: Customers see order progress  
- **Payments (Optional)**: Track unpaid/paid status  
