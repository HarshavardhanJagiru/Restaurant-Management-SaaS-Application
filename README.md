# Devidasa Bites - Real-Time Restaurant Management SaaS Platform

Devidasa Bites is a full-stack, real-time restaurant management SaaS and contactless QR-ordering platform. Built using the MERN stack and Socket.IO, it coordinates operations between customers, waiters, kitchen staff, and admins in real time.

---

## 🚀 Key Features

*   **Contactless QR Ordering:** Customers scan table-specific QR codes to open a mobile-responsive menu, customize items, place orders, and track preparation status live.
*   **Real-Time Kitchen Display System (KDS):** Interactive monitor for kitchen staff to track active orders, update preparation states (Placed ➔ Preparing ➔ Ready), and sync changes instantly.
*   **POS Billing & Invoice Settle Desk:** Settle table balances via Cash, Card, or UPI. Automatically computes 18% GST and 5% service charge, prints bills, and frees up tables on settlement.
*   **Table & Seating Management:** Visual grid layout showing real-time table statuses (Free vs. Occupied) linked to active table orders.
*   **Reservation Queue:** Management board for staff to log incoming reservations, check seat availability, and seat guests directly.
*   **Role-Based Access Control (RBAC):** Restricts interface access (Admin, Waiter, Kitchen Staff) using JWT authorization middleware.
*   **Dashboard Analytics:** Real-time metrics showing total orders, total revenue, occupancy load, active kitchen tickets, and weekly sales velocity line charts.

---

## 🛠️ Tech Stack

### Backend
*   **Runtime Environment:** Node.js with Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Real-Time Events:** Socket.IO (WebSockets)
*   **Security & Auth:** JSON Web Tokens (JWT) & bcryptjs
*   **Utilities:** `qrcode` (for data URL table code generation)

### Frontend
*   **Framework:** React (Vite-powered)
*   **Styling:** Tailwind CSS (featuring a premium dark theme, glassmorphic panels, and glowing active states)
*   **Data Visualization:** Chart.js (`react-chartjs-2`)
*   **Icons:** Lucide React
*   **API Client:** Axios

---

## ⚙️ Project Structure

```text
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API business logic
│   ├── middleware/      # Authentication & global error handling
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express API route bindings
│   ├── utils/           # Helper scripts (tokens, etc.)
│   └── server.js        # Main entry point & Socket.IO config
│
├── frontend/
│   ├── public/          # Static assets & icons
│   ├── src/
│   │   ├── components/  # Shared widgets & dashboard elements
│   │   ├── context/     # Auth and WebSocket global providers
│   │   ├── hooks/       # Custom React hooks (useSocket)
│   │   ├── pages/       # Dashboard, KDS, POS, & Customer pages
│   │   ├── services/    # Axios API configurations
│   │   ├── App.jsx      # Routes wrapper with protected routing
│   │   └── index.css    # Global CSS definitions
```

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Local Instance (or MongoDB Atlas URI)

### Backend Configuration
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/restaurant-saas
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRE=30d
    NODE_ENV=development
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### Frontend Configuration
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_SOCKET_URL=http://localhost:5000
    ```
4.  Start the React frontend:
    ```bash
    npm run dev
    ```

---

## 🛠️ Seeding & Demo Access

For easy testing, the application includes a seed route. Click **"Click here to seed default DB users & menu data"** on the Login Page, or navigate directly to `http://localhost:5000/api/seed` in your browser. This populates categories, items, and provides the following test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@restaurant.com` | `admin123` |
| **Waiter** | `waiter@restaurant.com` | `waiter123` |
| **Kitchen Staff** | `kitchen@restaurant.com` | `kitchen123` |

---

## 📡 WebSocket Event Schemas

The application uses Socket.IO rooms to isolate notification scopes:

*   **`admin` room:** Joined by staff dashboards to listen for global events:
    *   `order-placed` (Payload: Populated Order)
    *   `table-status-changed` (Payload: Updated Table)
    *   `payment-processed` (Payload: Payment details)
*   **`table-${tableId}` room:** Joined by customers scanning a specific table QR code to receive live occupancy changes.
*   **`order-${orderId}` room:** Joined by a customer to receive targeted order progression updates:
    *   `order-status-update` (Payload: Updated order: `placed` ➔ `preparing` ➔ `ready` ➔ `served`)
