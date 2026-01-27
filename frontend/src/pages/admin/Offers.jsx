import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2,
  Tag,
  Calendar,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import { offersAPI } from '../../services/api';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const initialFormState = {
    title: '',
    description: '',
    discount_percentage: '',
    start_date: today,
    end_date: '',
    is_active: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await offersAPI.getAllAdmin();
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      discount_percentage: offer.discount_percentage || '',
      start_date: offer.start_date ? offer.start_date.split('T')[0] : today,
      end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
      is_active: offer.is_active ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        discount_percentage: formData.discount_percentage 
          ? parseFloat(formData.discount_percentage) 
          : null
      };

      if (editingOffer) {
        await offersAPI.update(editingOffer.id, payload);
        toast.success('Offer updated successfully');
      } else {
        await offersAPI.create(payload);
        toast.success('Offer created successfully');
      }

      setShowModal(false);
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.detail || 'Failed to save offer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      await offersAPI.delete(id);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await offersAPI.update(offer.id, {
        ...offer,
        is_active: !offer.is_active
      });
      toast.success(`Offer ${offer.is_active ? 'deactivated' : 'activated'}`);
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
      toast.error('Failed to update offer');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Promotions</h1>
          <p className="text-gray-600">Manage your special offers and deals</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="card text-center py-20">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No offers yet</p>
          <button onClick={openCreateModal} className="btn-primary mt-4">
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const expired = isExpired(offer.end_date);
            
            return (
              <div 
                key={offer.id} 
                className={`card overflow-hidden ${expired ? 'opacity-60' : ''}`}
              >
                {/* Offer Header */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white">
                  {offer.discount_percentage ? (
                    <div className="flex items-center gap-2">
                      <Percent className="w-6 h-6" />
                      <span className="text-3xl font-bold">{offer.discount_percentage}% OFF</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Tag className="w-6 h-6" />
                      <span className="text-xl font-bold">Special Offer</span>
                    </div>
                  )}
                </div>

                {/* Offer Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{offer.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(offer)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {offer.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(offer.start_date)} - {formatDate(offer.end_date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {expired ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Expired
                      </span>
                    ) : offer.is_active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}

                    {!expired && (
                      <button
                        onClick={() => handleToggleActive(offer)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {offer.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="e.g., Summer Sale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input resize-none"
                  placeholder="Describe your offer..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="input"
                  placeholder="e.g., 20"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for non-percentage offers</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    min={formData.start_date}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active (visible on website)
                  </span>
                </label>
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
                    editingOffer ? 'Update Offer' : 'Create Offer'
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

export default Offers;
