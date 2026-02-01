import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Offers from './pages/public/Offers';
import Contact from './pages/public/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCustomers from './pages/admin/Customers';
import AdminInvoices from './pages/admin/Invoices';
import CreateInvoice from './pages/admin/CreateInvoice';
import AdminOffers from './pages/admin/Offers';
import AdminSettings from './pages/admin/Settings';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/invoices/create" element={<CreateInvoice />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
