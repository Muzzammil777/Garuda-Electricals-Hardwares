import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  Package,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload');

  const initialFormState = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    unit: 'piece',
    brand: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    image_file: '',
    is_featured: false,
    is_active: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll(false); // Get all categories including inactive
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
      
      // If no categories exist, auto-seed default ones
      if (!response.data || response.data.length === 0) {
        console.log('No categories found, seeding default categories...');
        try {
          const seedResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://garuda-electricals-hardwares.onrender.com/api'}/categories/seed/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const seedData = await seedResponse.json();
          console.log('Seeding response:', seedData);
          
          // Fetch categories again after seeding
          setTimeout(async () => {
            const retryResponse = await categoriesAPI.getAll(false);
            setCategories(retryResponse.data);
          }, 1000);
        } catch (seedError) {
          console.error('Error seeding categories:', seedError);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image_url: reader.result,
        image_file: file.name
      }));
      toast.success('Image selected successfully');
    };
    reader.readAsDataURL(file);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setImageInputMode('upload');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price || '',
      unit: product.unit || 'piece',
      brand: product.brand || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || 0,
      image_url: product.image_url || '',
      is_featured: product.is_featured || false,
      is_active: product.is_active !== false
    });
    setImageInputMode('url');
    setShowModal(true);
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        price: parseFloat(formData.price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id || null
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await productsAPI.update(product.id, { is_featured: !product.is_featured });
      toast.success(product.is_featured ? 'Removed from featured' : 'Marked as featured');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update featured status');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories && categories.length > 0 ? (
              categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <button onClick={openCreateModal} className="btn-primary mt-4">
              Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.brand && (
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{product.category_name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      {product.unit && (
                        <span className="text-gray-500 text-sm"> / {product.unit}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${
                        product.stock_quantity > 10 
                          ? 'text-green-600' 
                          : product.stock_quantity > 0 
                          ? 'text-amber-600' 
                          : 'text-red-600'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.is_featured}
                          onChange={() => toggleFeatured(product)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        {product.is_featured && <span className="ml-2 text-xs text-amber-600">⭐</span>}
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Auto-generate slug if creating new product
                      if (!editingProduct) {
                        setFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                          slug: generateSlug(e.target.value)
                        }));
                      }
                    }}
                    required
                    className="input"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="auto-generated-from-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No categories found. Please create categories first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Havells, Finolex"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="piece">Piece</option>
                    <option value="meter">Meter</option>
                    <option value="kg">Kilogram</option>
                    <option value="box">Box</option>
                    <option value="set">Set</option>
                    <option value="pair">Pair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="space-y-3">
                    {/* Toggle Button */}
                    <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          imageInputMode === 'upload'
                            ? 'bg-white text-primary-600 border border-primary-200 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          imageInputMode === 'url'
                            ? 'bg-white text-primary-600 border border-primary-200 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        URL
                      </button>
                    </div>

                    {/* Upload Mode */}
                    {imageInputMode === 'upload' && (
                      <div>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-colors"
                          >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">Click to upload</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                          </label>
                        </div>
                        {formData.image_url && (
                          <div className="flex gap-3 items-start mt-3">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={formData.image_url} 
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Image Preview</p>
                              {formData.image_file && (
                                <p className="text-xs text-gray-500">{formData.image_file}</p>
                              )}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image_url: '', image_file: '' }))}
                                className="text-xs text-red-600 hover:text-red-700 mt-1"
                              >
                                Remove image
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* URL Mode */}
                    {imageInputMode === 'url' && (
                      <div>
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          className="input"
                        />
                        {formData.image_url && (
                          <div className="flex gap-3 items-start mt-3">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={formData.image_url} 
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => {
                                  toast.error('Invalid image URL');
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Image Preview</p>
                              <p className="text-xs text-gray-500 break-all">{formData.image_url}</p>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                className="text-xs text-red-600 hover:text-red-700 mt-1"
                              >
                                Remove URL
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Product description..."
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formData.is_featured ? '⭐ Featured Product' : 'Mark as featured product'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-14">Featured products appear on the homepage</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
