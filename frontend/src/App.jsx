import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTechnicians from './pages/admin/AdminTechnicians';
import AdminStats from './pages/admin/AdminStats';
import AdminGlass from './pages/admin/AdminGlass';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookService from './pages/customer/BookService';
import BookingHistory from './pages/customer/BookingHistory';
import Invoices from './pages/customer/Invoices';
import InvoiceDetail from './pages/customer/InvoiceDetail';
import CustomerProfile from './pages/customer/CustomerProfile';
import TechnicianProfileView from './pages/customer/TechnicianProfileView';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianJobs from './pages/technician/TechnicianJobs';
import TechnicianKanban from './pages/technician/TechnicianKanban';
import TechnicianSchedule from './pages/technician/TechnicianSchedule';
import CompleteJob from './pages/technician/CompleteJob';
import PaymentReceipt from './pages/technician/PaymentReceipt';
import TechnicianEarnings from './pages/technician/TechnicianEarnings';
import TechnicianProfile from './pages/technician/TechnicianProfile';
import TechnicianReviews from './pages/technician/TechnicianReviews';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/technicians" element={<ProtectedRoute role="admin"><AdminTechnicians /></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute role="admin"><AdminStats /></ProtectedRoute>} />
            <Route path="/admin/glass" element={<ProtectedRoute role="admin"><AdminGlass /></ProtectedRoute>} />

            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/book" element={<ProtectedRoute role="customer"><BookService /></ProtectedRoute>} />
            <Route path="/customer/history" element={<ProtectedRoute role="customer"><BookingHistory /></ProtectedRoute>} />
            <Route path="/customer/invoices" element={<ProtectedRoute role="customer"><Invoices /></ProtectedRoute>} />
            <Route path="/customer/invoice/:invoiceId" element={<ProtectedRoute role="customer"><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />
            <Route path="/customer/technician/:id" element={<ProtectedRoute role="customer"><TechnicianProfileView /></ProtectedRoute>} />

            {/* Technician Routes */}
            <Route path="/technician" element={<ProtectedRoute role="technician"><TechnicianDashboard /></ProtectedRoute>} />
            <Route path="/technician/jobs" element={<ProtectedRoute role="technician"><TechnicianJobs /></ProtectedRoute>} />
            <Route path="/technician/kanban" element={<ProtectedRoute role="technician"><TechnicianKanban /></ProtectedRoute>} />
            <Route path="/technician/schedule" element={<ProtectedRoute role="technician"><TechnicianSchedule /></ProtectedRoute>} />
            <Route path="/technician/complete/:id" element={<ProtectedRoute role="technician"><CompleteJob /></ProtectedRoute>} />
            <Route path="/technician/payment/:jobId" element={<ProtectedRoute role="technician"><PaymentReceipt /></ProtectedRoute>} />
            <Route path="/technician/earnings" element={<ProtectedRoute role="technician"><TechnicianEarnings /></ProtectedRoute>} />
            <Route path="/technician/profile" element={<ProtectedRoute role="technician"><TechnicianProfile /></ProtectedRoute>} />
            <Route path="/technician/reviews" element={<ProtectedRoute role="technician"><TechnicianReviews /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
