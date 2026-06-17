# Initialize Git Configurations if not set
git config --local user.name "Harshavardhan Jagiru"
git config --local user.email "harshavardhan.jagiru@gmail.com"

# Step 1: Initial configurations and setup
Write-Host "Staging Step 1..."
git add backend/package.json backend/package-lock.json backend/.gitignore backend/.env.example frontend/package.json frontend/package-lock.json frontend/.gitignore frontend/tailwind.config.js frontend/postcss.config.js frontend/vite.config.js frontend/eslint.config.js frontend/index.html
git commit -m "chore: initialize project dependencies and configurations for frontend & backend"

# Step 2: Backend base server configurations
Write-Host "Staging Step 2..."
git add backend/server.js backend/config/ backend/middleware/errorMiddleware.js
git commit -m "feat(backend): configure express server, error middleware, and database connection"

# Step 3: Mongoose schemas
Write-Host "Staging Step 3..."
git add backend/models/
git commit -m "feat(backend): define Mongoose database schemas for users, tables, categories, menu items, orders, payments, and reservations"

# Step 4: Auth & Route Security Middleware
Write-Host "Staging Step 4..."
git add backend/controllers/authController.js backend/routes/authRoutes.js backend/middleware/authMiddleware.js
git commit -m "feat(backend): implement JWT-based user authentication, password hashing, and role-based authorization middleware"

# Step 5: Core CRUD controllers & routes
Write-Host "Staging Step 5..."
git add backend/controllers/categoryController.js backend/routes/categoryRoutes.js backend/controllers/menuController.js backend/routes/menuRoutes.js backend/controllers/tableController.js backend/routes/tableRoutes.js backend/controllers/reservationController.js backend/routes/reservationRoutes.js
git commit -m "feat(backend): build REST API controllers and routes for category, menu, reservation, and table configurations"

# Step 6: Order pipeline and Socket events
Write-Host "Staging Step 6..."
git add backend/controllers/orderController.js backend/routes/orderRoutes.js backend/controllers/paymentController.js backend/routes/paymentRoutes.js backend/utils/
git commit -m "feat(backend): establish order workflow controllers, mock payments processing, and real-time Socket.IO status triggers"

# Step 7: Frontend routing shell & layout
Write-Host "Staging Step 7..."
git add frontend/src/main.jsx frontend/src/App.jsx frontend/src/index.css frontend/src/services/ frontend/src/context/ frontend/src/hooks/ frontend/src/components/common/
git commit -m "feat(frontend): construct application shell, router, context providers for auth/sockets, and common layout modules"

# Step 8: Dining floor layout
Write-Host "Staging Step 8..."
git add frontend/src/pages/TableManagement.jsx
git commit -m "feat(frontend): build dining floor management panel with reservation queue and dynamic QR-code generator for tables"

# Step 9: Settle Desk / Billing POS
Write-Host "Staging Step 9..."
git add frontend/src/pages/Billing.jsx frontend/src/pages/OrderManagement.jsx
git commit -m "feat(frontend): engineer billing POS panel with printable invoices, tax calculators, and payment settlement flows"

# Step 10: KDS screen & stats dashboard
Write-Host "Staging Step 10..."
git add frontend/src/pages/Dashboard.jsx frontend/src/components/dashboard/ frontend/src/pages/KitchenPanel.jsx
git commit -m "feat(frontend): design central stats dashboard with weekly revenue velocity line charts and real-time Kitchen Display System (KDS)"

# Step 11: Landing, Login, Customer QR portal
Write-Host "Staging Step 11..."
git add frontend/src/pages/CustomerOrder.jsx frontend/src/pages/Landing.jsx frontend/src/pages/Login.jsx frontend/README.md frontend/public/
git commit -m "feat(frontend): implement mobile customer self-ordering portal with live order-progress timeline and custom gateway page"

# Step 12: Remaining files
Write-Host "Staging Step 12..."
git add .
git commit -m "style: final code format refinements and styling enhancements"

Write-Host "Commits completed successfully!"
