import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import TableManagement from './pages/TableManagement';
import OrderManagement from './pages/OrderManagement';
import KitchenPanel from './pages/KitchenPanel';
import Billing from './pages/Billing';
import CustomerOrder from './pages/CustomerOrder';

// ── Protected Route Wrapper ──────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect kitchen staff straight to KDS; others to dashboard
    return <Navigate to={user.role === 'kitchen_staff' ? '/kitchen' : '/dashboard'} replace />;
  }

  return children;
};

// ── App Shell ────────────────────────────────────────────────
const AppShell = () => {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
      <Route path="/landing" element={<Landing />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Customer QR order entry */}
      <Route path="/customer-order/table/:tableId" element={<CustomerOrder />} />

      {/* Admin + Waiter routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'waiter']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables"
        element={
          <ProtectedRoute roles={['admin', 'waiter']}>
            <TableManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute roles={['admin', 'waiter']}>
            <OrderManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute roles={['admin', 'waiter']}>
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute roles={['admin']}>
            <MenuManagement />
          </ProtectedRoute>
        }
      />

      {/* Kitchen Staff + Admin routes */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute roles={['admin', 'kitchen_staff']}>
            <KitchenPanel />
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// ── Root App ─────────────────────────────────────────────────
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppShell />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
