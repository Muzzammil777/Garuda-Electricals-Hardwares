import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Package, 
  Tag, 
  Shield, 
  Truck,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { useSettings } from '../../context/SettingsContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getWhatsAppLink } = useSettings();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getBySlug(slug);
      setProduct(response.data);
      
      // Fetch related products from same category
      if (response.data.category_slug) {
        const relatedResponse = await productsAPI.getAll({ 
          category_slug: response.data.category_slug 
        });
        setRelatedProducts(
          relatedResponse.data
            .filter(p => p.slug !== slug)
            .slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm interested in:\n\n*${product.name}*\nBrand: ${product.brand}\nPrice: ₹${product.price?.toLocaleString('en-IN')}\n\nPlease share more details.`;
    window.open(getWhatsAppLink(message), '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/products" className="text-primary-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Products
            </Link>
            <span className="text-gray-400">/</span>
            {product.category_name && (
              <>
                <Link 
                  to={`/products?category=${product.category_slug}`}
                  className="text-primary-600 hover:underline"
                >
                  {product.category_name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-600 truncate">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-white rounded-2xl border overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
              {product.is_featured && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.brand && (
                <span className="text-primary-600 font-medium">{product.brand}</span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-4">
                {product.name}
              </h1>

              {product.category_name && (
                <Link 
                  to={`/products?category=${product.category_slug}`}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
                >
                  <Tag className="w-4 h-4" />
                  {product.category_name}
                </Link>
              )}

              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  {product.unit && (
                    <span className="text-gray-500">/ {product.unit}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  *Prices are indicative. Contact us for the best quote.
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock_quantity > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-600 font-medium">Available on Order</span>
                  </>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="btn-primary flex items-center justify-center gap-2 flex-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enquire on WhatsApp
                </button>
                <a
                  href="tel:+914324251020"
                  className="btn-secondary flex items-center justify-center gap-2 flex-1"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Genuine Products</h4>
                    <p className="text-sm text-gray-600">100% authentic items</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Truck className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Fast Delivery</h4>
                    <p className="text-sm text-gray-600">Quick local delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link 
                to={`/products?category=${product.category_slug}`}
                className="text-primary-600 hover:underline flex items-center gap-1"
              >
                View All
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
