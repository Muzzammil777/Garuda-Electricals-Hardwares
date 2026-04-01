import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import PageTransition from './components/animations/PageTransition';
import FlyingEagleLoader from './components/animations/FlyingEagleLoader';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Products = lazy(() => import('./pages/public/Products'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Offers = lazy(() => import('./pages/public/Offers'));
const Contact = lazy(() => import('./pages/public/Contact'));

// Admin Pages
const Login = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminInvoices = lazy(() => import('./pages/admin/Invoices'));
const CreateInvoice = lazy(() => import('./pages/admin/CreateInvoice'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Layouts
const PublicLayout = lazy(() => import('./components/layouts/PublicLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));
import ProtectedRoute from './components/ProtectedRoute';

const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <FlyingEagleLoader size="md" label="Preparing your experience..." />
  </div>
);

const Wrapped = ({ children }) => <PageTransition>{children}</PageTransition>;

const AnimatedAppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Wrapped><Home /></Wrapped>} />
          <Route path="/about" element={<Wrapped><About /></Wrapped>} />
          <Route path="/products" element={<Wrapped><Products /></Wrapped>} />
          <Route path="/products/:slug" element={<Wrapped><ProductDetail /></Wrapped>} />
          <Route path="/offers" element={<Wrapped><Offers /></Wrapped>} />
          <Route path="/contact" element={<Wrapped><Contact /></Wrapped>} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Wrapped><Login /></Wrapped>} />
        <Route path="/admin/forgot-password" element={<Wrapped><ForgotPassword /></Wrapped>} />
        <Route path="/admin/reset-password" element={<Wrapped><ResetPassword /></Wrapped>} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Wrapped><Dashboard /></Wrapped>} />
          <Route path="/admin/dashboard" element={<Wrapped><Dashboard /></Wrapped>} />
          <Route path="/admin/products" element={<Wrapped><AdminProducts /></Wrapped>} />
          <Route path="/admin/customers" element={<Wrapped><AdminCustomers /></Wrapped>} />
          <Route path="/admin/invoices" element={<Wrapped><AdminInvoices /></Wrapped>} />
          <Route path="/admin/invoices/create" element={<Wrapped><CreateInvoice /></Wrapped>} />
          <Route path="/admin/offers" element={<Wrapped><AdminOffers /></Wrapped>} />
          <Route path="/admin/settings" element={<Wrapped><AdminSettings /></Wrapped>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <MotionConfig reducedMotion="user">
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

            <Suspense fallback={<RouteFallback />}>
              <AnimatedAppRoutes />
            </Suspense>
          </SettingsProvider>
        </AuthProvider>
      </MotionConfig>
    </Router>
  );
}

export default App;
