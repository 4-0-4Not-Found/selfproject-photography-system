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

## ✅ 26/09/2025 Progress
- Associations: Users ↔ Bookings, Services ↔ Bookings, Users ↔ Orders, Services ↔ Orders, Orders ↔ Photos, Orders ↔ Payments
- Authentication: JWT with role-based access (user/admin)
- Payments: Added cash/gcash methods, with endpoints for creating and fetching payments
- Testing: Orders, Bookings, Photos, Gallery, and Payments successfully tested via Thunder Client

## ✅ 01/10/2025 Progress
- Added React (Vite) frontend inside project (src/ for code, public/ for build).
- Configured Vite proxy so frontend API calls (/api/...) connect to backend (http://localhost:3000).
- Installed and set up Axios for API requests.
- Built Register and Login pages with working JWT authentication.
- Fixed backend–frontend communication using CORS setup and running backend (node server.js) + frontend (npx vite) in parallel.

## ✅ 02/10/2025 Progress
- Fixed bookings system: frontend now only sends customDescription for "Other" sessions
- Added customDescription column to Bookings table via database migration
- Implemented customer order cancellation matching bookings pattern
- Updated order status enum to include "canceled" status
- Enhanced Dashboard with consistent formatting for bookings and orders
- Added order cancellation endpoint with user ownership verification
- Improved frontend order display with status colors and cancellation buttons

## ✅ 15/10/2025 Progress
- Made Admin dashboard functional
- CRUD operations work on admin side
- customer side and admin side can both manage records seperately
- batch delete and selection in progress

## ✅ 28/10/2025 Progress
- Made Batch Selection functional

# Current File Structure
- Config
  * database.js
- Controllers
  * authController.js
  * bookingController.js
  * galleryController.js
  * orderController.js
  * paymentController.js
  * photoController.js
  * serviceController.js
  * userController.js
- Middleware
  * authMiddleware.js
  * upload.js
- migrations
  * add-soft-delete-fields.js
- Models
  * booking.js
  * gallery.js
  * index.js
  * order.js
  * payment.js
  * photo.js
  * service.js
  * user.js
- node_modules
- Public
- Routes
  * authRoutes.js
  * bookingRoutes.js
  * galleryRoutes.js
  * orderRoutes.js
  * paymentRoutes.js
  * photoRoutes.js
  * serviceRoutes.js
  * userRoutes.js
- src
 - node_modules
 - components
  * Navbar.jsx 
  * ProtectedRoute.jsx
 - pages
  * AdminDashboard.jsx
  * App.jsx
  * Bookings.jsx
  * Dashboard.jsx
  * Home.jsx
  * Login.jsx
  * Orders.jsx
  * Register.jsx
 - utils
  * axios.js
* index.html
* main.jsx
* package.json 
- uploads
- Views
* .env
* .gitinore
* app.js
* check-migration.js
* create-admin.js
* package-lock.json
* package.json
* README.md
* run-soft-delete-migrations.js
* server.js
* vite.config.js

# 📝 Notes

## 📌 Photography Studio Management System – Project Summary (FAIL-SAFE)

### 🎯 Goal & Objective

To build a full-stack photography studio management system that handles:

- Bookings → scheduling photography services (e.g., weddings, portraits, events).

- Orders → print/editing requests with delivery or pickup.

- Photos → uploaded and linked to orders.

- Gallery → public showcase of selected photos.

- Payments → cash or GCash, tracked per order.

- Authentication & Roles → JWT-based login for users; role-based access (user vs. admin).

- Frontend (React + Vite) → for users/admin to interact with the system.

### 🛠️ Current Tech Stack

- Backend: Node.js + Express.js

- Database: Neon Postgres (Sequelize ORM)

- Frontend: React (Vite) + Axios

- Auth: JWT with role-based access control

- Other: CORS enabled for frontend-backend communication

### ✅ Progress So Far
**Backend**

Models implemented: User, Service, Booking, Order, Photo, Gallery, Payment.

Associations set up correctly (Users ↔ Bookings, Orders ↔ Photos, Orders ↔ Payments, etc.).

Controllers + Routes completed:

- Users (basic setup)

- Services (CRUD)

- Bookings (create, fetch)

- Orders (create, fetch, get by ID)

- Photos (linked to Orders)

- Gallery (add, fetch)

- Payments (cash/gcash, linked to Orders)

- Authentication & JWT login/register with roles (user/admin).

- Tested API endpoints using Thunder Client/Postman (CRUD verified).

**Frontend**

- React integrated directly in the backend project structure (src/ for code, public/ for builds).

- Vite configured with proxy to backend (/api → localhost:3000).

- Axios installed and working.

- Pages implemented: Register & Login with working backend communication.

- Fixed frontend-backend communication issue with CORS + proxy config.

- Running both servers in parallel (node server.js for backend, npx vite for frontend).

### 🔜 Next Steps

- Expand frontend: Dashboard, Booking form, Order form, Payment handling, Gallery display.

- Admin UI: manage users, bookings, services, and payments.

- Refine backend: validation, error handling, and optional image storage (Cloudinary/S3).

- Deployment: likely Vercel (frontend) + Render/Railway (backend + Postgres).

### 💡 How to Resume Development

When continuing this project in another AI/chat, provide this summary and say:

“Continue guiding me in developing this Photography Studio Management System from where we left off. The backend and payments are already working, and the frontend has login/register with backend communication. Next, I want to build out the remaining frontend pages (dashboard, bookings, orders, gallery, payments, admin panel) step by step.”

## 🆕 New Features Added
- **Photo Uploads**: Customers upload photos for editing/printing  
- **Editing Workflow**: Admin updates order status (`pending → editing → ready → printed`)  
- **Delivery or Pickup**:  
  - Delivery → customer provides address  
  - Pickup → mark order as picked up in shop  
- **Order Tracking**: Customers see order progress  
- **Payments (Optional)**: Track unpaid/paid status  
