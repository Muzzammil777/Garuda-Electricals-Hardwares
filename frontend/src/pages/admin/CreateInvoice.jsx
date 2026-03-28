import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Search,
  Loader2,
  ArrowLeft,
  Calculator,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { invoicesAPI, customersAPI, productsAPI, offersAPI } from '../../services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    discount: 0,
    tax_percent: 18,
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, offersRes] = await Promise.all([
        customersAPI.getAll(),
        productsAPI.getAll(),
        offersAPI.getActive()
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      setActiveOffers(offersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleAddItem = (product) => {
    const existingItem = formData.items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          unit: product.unit
        }]
      });
    }
    
    setSearchQuery('');
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unit_price' 
        ? parseFloat(value) || 0 
        : value
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const applyCouponCode = () => {
    const code = couponCodeInput.trim();
    if (!code) {
      toast.error('Enter a coupon code');
      return;
    }

    const matchedOffer = activeOffers.find(
      (offer) => (offer.offer_code || '').toUpperCase() === code.toUpperCase()
    );

    if (!matchedOffer || !matchedOffer.discount_percentage) {
      toast.error('Invalid or inactive coupon code');
      return;
    }

    setAppliedCoupon(matchedOffer);
    toast.success(`Coupon applied: ${matchedOffer.discount_percentage}% off`);
  };

  const applyOfferCoupon = (offer) => {
    if (!offer?.offer_code || !offer.discount_percentage) {
      return;
    }

    setCouponCodeInput(offer.offer_code.toUpperCase());
    setAppliedCoupon(offer);
    toast.success(`Coupon applied: ${offer.discount_percentage}% off`);
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  const getDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) {
      return 0;
    }

    if (appliedCoupon?.discount_percentage) {
      return (subtotal * Number(appliedCoupon.discount_percentage)) / 100;
    }

    const manualDiscount = parseFloat(formData.discount) || 0;
    return Math.max(0, Math.min(manualDiscount, subtotal));
  };

  const getEffectiveDiscountRate = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) {
      return 0;
    }

    const discountAmount = getDiscountAmount();
    return (discountAmount / subtotal) * 100;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * ((parseFloat(formData.tax_percent) || 0) / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax - getDiscountAmount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const effectiveDiscountRate = getEffectiveDiscountRate();
      const payload = {
        customer_id: formData.customer_id, // UUID string, don't parseInt
        invoice_date: today,
        due_date: null,
        notes: [
          formData.notes,
          appliedCoupon?.offer_code ? `Coupon Applied: ${appliedCoupon.offer_code}` : null
        ].filter(Boolean).join('\n') || null,
        status: 'draft',
        payment_status: 'pending',
        items: formData.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          description: null,
          quantity: item.quantity,
          unit: item.unit || 'piece',
          unit_price: item.unit_price,
          tax_rate: parseFloat(formData.tax_percent) || 0,
          discount_rate: effectiveDiscountRate
        }))
      };

      const response = await invoicesAPI.create(payload);
      toast.success('Invoice created successfully!');
      
      // Auto-download PDF and send via WhatsApp
      if (response.data?.id) {
        const invoiceId = response.data.id;
        const invoiceNumber = response.data.invoice_number || 'Invoice';
        
        try {
          // Download PDF first
          toast.loading('Generating PDF...', { id: 'pdf-gen' });
          const pdfRes = await invoicesAPI.downloadPDF(invoiceId);
          const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Invoice_${invoiceNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success('PDF downloaded! Please attach it to WhatsApp.', { id: 'pdf-gen' });

          // Open WhatsApp using the customer phone already loaded in the customers list
          const selectedCustomer = customers.find(c => c.id === formData.customer_id);
          const rawPhone = selectedCustomer?.phone || '';
          const digits = rawPhone.replace(/\D/g, '');
          const phone = digits.length === 10 ? '91' + digits : digits;

          if (phone) {
            const message =
              `Dear ${selectedCustomer?.name || 'Customer'},\n\n` +
              `Thank you for your purchase at *Garuda Electricals & Hardwares*!\n\n` +
              `*Invoice:* #${invoiceNumber}\n` +
              `Please find the PDF invoice attached.\n\n` +
              `For any queries, contact us at 917947143780.\n\n` +
              `Best regards,\n*Garuda Electricals & Hardwares*`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
          } else {
            // Fallback: use API if no phone available on frontend
            const whatsappRes = await invoicesAPI.getWhatsAppLink(invoiceId);
            if (whatsappRes.data?.whatsapp_url) {
              window.open(whatsappRes.data.whatsapp_url, '_blank');
            }
          }
        } catch (err) {
          console.log('Auto-send failed:', err);
          toast.dismiss('pdf-gen');
        }
      }
      
      navigate('/admin/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleProducts = (searchQuery ? filteredProducts : products).slice(0, 12);
  const availableCoupons = activeOffers.filter(
    (offer) => offer.offer_code && offer.discount_percentage
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Generate a new invoice for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Product Search & Items */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h2>
            
            {/* Product Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search and add products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              {visibleProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No products found</div>
              ) : (
                visibleProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddItem(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand || 'No brand'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Items List */}
            {formData.items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Search and add products to the invoice</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="input text-sm py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="input text-sm py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Total</label>
                        <p className="py-2 font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Any additional notes for the invoice..."
            ></textarea>
          </div>
        </div>

        {/* Sidebar - Invoice Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Discount (₹)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  min="0"
                  disabled={Boolean(appliedCoupon)}
                  className="input"
                />
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1">Manual discount is disabled when coupon is applied.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="input pl-9"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCouponCode}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                  >
                    Apply
                  </button>
                </div>

                {availableCoupons.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Available Coupons</p>
                    <div className="flex flex-wrap gap-2">
                      {availableCoupons.map((offer) => {
                        const isSelected = appliedCoupon?.id === offer.id;

                        return (
                          <button
                            key={offer.id}
                            type="button"
                            onClick={() => applyOfferCoupon(offer)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {offer.offer_code.toUpperCase()} ({offer.discount_percentage}% OFF)
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-green-700 font-medium">
                      {appliedCoupon.offer_code} applied ({appliedCoupon.discount_percentage}% off)
                    </span>
                    <button
                      type="button"
                      onClick={removeCouponCode}
                      className="text-green-700 hover:text-green-900"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-gray-600">
                <span>After Discount</span>
                <span className="font-medium">
                  {formatCurrency(calculateSubtotal() - getDiscountAmount())}
                </span>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Tax (%)</label>
                <select
                  value={formData.tax_percent}
                  onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                  className="input"
                >
                  <option value="0">No Tax</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </select>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tax Amount</span>
                <span className="font-medium">{formatCurrency(calculateTax())}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || formData.items.length === 0}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
