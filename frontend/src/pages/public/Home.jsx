import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Award, 
  Users, 
  Clock, 
  MapPin, 
  Phone,
  CheckCircle,
  Star
} from 'lucide-react';
import { categoriesAPI, productsAPI, offersAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import { useSettings } from '../../context/SettingsContext';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings, getWhatsAppLink, getCallLink, formatPhone } = useSettings();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes, offersRes] = await Promise.all([
        categoriesAPI.getWithCounts(),
        productsAPI.getFeatured(8),
        offersAPI.getAll()
      ]);
      setCategories(catRes.data);
      setFeaturedProducts(prodRes.data);
      setOffers(offersRes.data.slice(0, 2));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Clock, value: '15+', label: 'Years Experience' },
    { icon: Users, value: '5000+', label: 'Happy Customers' },
    { icon: Award, value: '50+', label: 'Brand Partners' },
    { icon: Star, value: '4.8', label: 'Customer Rating' },
  ];

  const features = [
    'Premium quality products from top brands',
    'Competitive wholesale and retail prices',
    'Expert guidance and product recommendations',
    'Quick delivery within Karur district',
    'After-sales support and warranty assistance',
    'Bulk order discounts for contractors',
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative gradient-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container-custom py-16 md:py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <img src="/logo.png" alt="" className="w-10 h-15 object-contain" />
              <span className="text-sm text-white/90">Since 2009 • Trusted by 5000+ Customers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Garuda Electricals<br />
              <span className="text-amber-400">& Hardwares</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Your one-stop destination for quality electrical and hardware supplies in Karur. 
              Premium products, competitive prices, and expert service.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-amber btn-lg flex items-center gap-2">
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
            
            {/* Contact Info */}
            <div className="mt-10 flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-sm">{settings.business_city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-400" />
                <a href={getCallLink()} className="text-sm hover:text-white">
                  {formatPhone(settings.business_phone)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8 md:py-12 border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of electrical and hardware products organized by category
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Top-selling products from trusted brands
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-gray-900 text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Trusted Since 2009</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="text-amber-400">Garuda Electricals</span>?
              </h2>
              
              <p className="text-gray-300 mb-8">
                For over 15 years, Garuda Electricals & Hardwares has been the go-to 
                destination for quality electrical and hardware supplies in Karur. 
                We believe in building long-term relationships with our customers 
                through honest pricing and excellent service.
              </p>

              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/about" className="btn-amber flex items-center gap-2 w-fit">
                  Learn More About Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <img src="/logo.png" alt="Garuda Electricals" className="w-45 h-45 mx-auto mb-6 object-contain" />
                  <h3 className="text-2xl font-bold text-white mb-2">Garuda Electricals</h3>
                  <p className="text-white/80">Powering Your World</p>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-500">Genuine Products</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      {offers.length > 0 && (
        <section className="section bg-amber-50">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Special Offers
              </h2>
              <p className="text-gray-600">
                Check out our latest deals and promotions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="card-hover bg-white p-6 md:p-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {offer.title}
                      </h3>
                      {offer.discount_percentage && (
                        <span className="badge-warning text-lg px-3 py-1">
                          {offer.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                    {offer.offer_code && (
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Use code:</span>
                        <div className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded">
                          {offer.offer_code}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{offer.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/offers" className="btn-primary">
                View All Offers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 gradient-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Electrical Supplies?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Contact us today for the best prices on quality electrical and hardware products. 
            We offer special discounts for bulk orders and contractors.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={getWhatsAppLink("Hi! I'd like to enquire about your products.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-500 text-white hover:bg-green-600 btn-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </a>
            <Link to="/contact" className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
