import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, 
  Percent, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Clock,
  Loader2
} from 'lucide-react';
import { offersAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getWhatsAppLink } = useSettings();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await offersAPI.getActive();
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="gradient-primary py-16 md:py-20">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            Special Deals
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Exclusive Offers & Deals
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Save big on quality electrical and hardware products. 
            Don't miss out on these limited-time offers!
          </p>
        </div>
      </section>

      {/* Offers Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Offers</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're working on exciting new offers for you. 
                Check back soon or explore our products!
              </p>
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-8">
              {offers.map((offer, index) => {
                const daysRemaining = getDaysRemaining(offer.end_date);
                const isEndingSoon = daysRemaining <= 7;
                
                return (
                  <div 
                    key={offer.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 ${
                      index === 0 ? 'border-2 border-amber-400' : ''
                    }`}
                  >
                    <div className="md:flex">
                      {/* Offer Image/Badge */}
                      <div className="md:w-72 bg-gradient-to-br from-primary-600 to-primary-700 p-8 flex flex-col items-center justify-center text-white">
                        {offer.discount_percentage ? (
                          <>
                            <Percent className="w-12 h-12 mb-2" />
                            <span className="text-5xl font-bold">{offer.discount_percentage}%</span>
                            <span className="text-lg opacity-90">OFF</span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-12 h-12 mb-2" />
                            <span className="text-2xl font-bold">Special</span>
                            <span className="text-lg opacity-90">Offer</span>
                          </>
                        )}
                      </div>

                      {/* Offer Details */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {index === 0 && (
                            <span className="badge-amber flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Top Deal
                            </span>
                          )}
                          {isEndingSoon && daysRemaining > 0 && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Ends in {daysRemaining} days
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                          {offer.title}
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {offer.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mb-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            <span>Valid: {formatDate(offer.start_date)} - {formatDate(offer.end_date)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link to="/products" className="btn-primary flex items-center justify-center gap-2">
                            Shop Now
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link to="/contact" className="btn-secondary">
                            Contact for Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Shop With Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get the best value for your money with our exclusive offers and quality service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing on all products with additional discounts on bulk orders
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600">
                Only genuine products from authorized distributors and reputed brands
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Percent className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Offers</h3>
              <p className="text-gray-600">
                Seasonal sales and festive discounts throughout the year
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Never Miss an Offer
            </h2>
            <p className="text-gray-300 mb-8">
              Visit us regularly or contact us to stay updated on our latest deals and promotions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                WhatsApp Updates
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
