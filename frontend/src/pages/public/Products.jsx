import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Loader2, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';

const ITEMS_PER_PAGE = 20;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const categorySlug = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [categorySlug, searchQuery, fetchProducts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getWithCounts();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const params = {
        limit: ITEMS_PER_PAGE,
        offset: (pageNum - 1) * ITEMS_PER_PAGE
      };
      if (categorySlug) params.category_slug = categorySlug;
      if (searchQuery) params.search = searchQuery;
      
      const response = await productsAPI.getAll(params);
      const data = Array.isArray(response.data) ? response.data : response.data.products || [];
      const total = response.data.total || data.length;
      
      if (pageNum === 1) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }
      
      setTotalCount(total);
      setHasMore((pageNum * ITEMS_PER_PAGE) < total);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    
    if (search) {
      setSearchParams({ search, ...(categorySlug && { category: categorySlug }) });
    } else {
      if (categorySlug) {
        setSearchParams({ category: categorySlug });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleCategoryChange = (slug) => {
    if (slug) {
      setSearchParams({ category: slug, ...(searchQuery && { search: searchQuery }) });
    } else {
      if (searchQuery) {
        setSearchParams({ search: searchQuery });
      } else {
        setSearchParams({});
      }
    }
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const selectedCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="gradient-primary py-12 md:py-16">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {selectedCategory ? selectedCategory.name : 'Our Products'}
          </h1>
          <p className="text-white/80 max-w-2xl">
            {selectedCategory 
              ? selectedCategory.description 
              : 'Browse our extensive collection of quality electrical and hardware products from trusted brands.'}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white border-b sticky top-16 md:top-20 z-40">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Search products..."
                  className="input pl-10 pr-4"
                />
              </div>
            </form>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Desktop Category Filter */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange('')}
                className={`btn-sm whitespace-nowrap ${!categorySlug ? 'btn-primary' : 'btn-secondary'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`btn-sm whitespace-nowrap ${categorySlug === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(categorySlug || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {categorySlug && selectedCategory && (
                <span className="badge-primary flex items-center gap-1">
                  {selectedCategory.name}
                  <button onClick={() => handleCategoryChange('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="badge-gray flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchParams(categorySlug ? { category: categorySlug } : {})}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="md:hidden border-t bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`btn-sm ${!categorySlug ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`btn-sm ${categorySlug === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          {!categorySlug && !searchQuery && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory ? `${selectedCategory.name}` : 'All Products'}
              <span className="text-gray-500 font-normal ml-2">
                ({products.length}{totalCount > products.length ? ` of ${totalCount}` : ''} products)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
