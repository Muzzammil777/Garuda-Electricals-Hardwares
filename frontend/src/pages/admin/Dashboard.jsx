import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  FileText, 
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Calendar,
  Loader2
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentInvoices()
      ]);
      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'primary',
      link: '/admin/products'
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers || 0,
      icon: Users,
      color: 'amber',
      link: '/admin/customers'
    },
    {
      title: 'Total Invoices',
      value: stats?.total_invoices || 0,
      icon: FileText,
      color: 'green',
      link: '/admin/invoices'
    },
    {
      title: 'Revenue (This Month)',
      value: formatCurrency(stats?.revenue_this_month || 0),
      icon: IndianRupee,
      color: 'purple',
      isAmount: true
    }
  ];

  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Link to="/admin/invoices/create" className="btn-primary flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6 hover:shadow-medium transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold text-gray-900 ${stat.isAmount ? 'text-xl' : ''}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            {stat.link && (
              <Link 
                to={stat.link}
                className="mt-4 text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link 
              to="/admin/invoices" 
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        
        {recentInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invoices yet</p>
            <Link to="/admin/invoices/create" className="btn-primary mt-4">
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">#{invoice.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{invoice.customer_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : invoice.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/admin/products" 
          className="card p-4 hover:shadow-medium transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Products</p>
            <p className="text-sm text-gray-500">Add or edit products</p>
          </div>
        </Link>

        <Link 
          to="/admin/customers" 
          className="card p-4 hover:shadow-medium transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Customers</p>
            <p className="text-sm text-gray-500">View customer list</p>
          </div>
        </Link>

        <Link 
          to="/admin/invoices/create" 
          className="card p-4 hover:shadow-medium transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Invoice</p>
            <p className="text-sm text-gray-500">Create an invoice</p>
          </div>
        </Link>

        <Link 
          to="/admin/offers" 
          className="card p-4 hover:shadow-medium transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Offers</p>
            <p className="text-sm text-gray-500">Create promotions</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
