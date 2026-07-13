import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import RatingModal from '../components/RatingModal';
import { getItems, getSubcategories } from '../api';

const formatSubcategoryName = (slug) => {
  if (!slug) return '';
  return slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

import iconAo from '../assets/icons8-womans-clothes-48.png';
import iconQuan from '../assets/icons8-pants-48.png';
import iconDam from '../assets/icons8-dress-48.png';
import iconChanvay from '../assets/icons8-skirt-48.png';

const SLUG_TO_CATEGORY = {
  ao: 'áo',
  quan: 'quần',
  dam: 'đầm',
  chanvay: 'chân váy',
};

const CATEGORY_NAMES = {
  ao: 'Áo',
  quan: 'Quần',
  dam: 'Đầm',
  chanvay: 'Chân Váy',
};

const CATEGORY_ICONS = {
  ao: iconAo,
  quan: iconQuan,
  dam: iconDam,
  chanvay: iconChanvay,
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const category = SLUG_TO_CATEGORY[slug];
  const categoryName = CATEGORY_NAMES[slug] || slug;
  const categoryIcon = CATEGORY_ICONS[slug] || iconDam;

  useEffect(() => {
    if (!category) return;
    getSubcategories(category).then(res => setSubcategories(res.data)).catch(console.error);
    // Reset states when changing main category
    setSelectedSubcategory('');
    setSearchQuery('');
    setSearchInput('');
  }, [category]);

  const fetchItems = useCallback(async (pageNum, subcat, searchStr) => {
    if (!category) return;

    setLoading(true);

    try {
      const res = await getItems(category, pageNum, 24, subcat, searchStr);
      setItems(res.data.items);
      setTotal(res.data.total);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchItems(1, selectedSubcategory, searchQuery);
  }, [fetchItems, selectedSubcategory, searchQuery]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchItems(newPage, selectedSubcategory, searchQuery);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const totalPages = Math.ceil(total / 24);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text flex items-center gap-3 m-0">
              <img src={categoryIcon} alt="icon" className="w-8 h-8 object-contain" />
              {categoryName}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              {total > 0 ? `${total} sản phẩm` : 'Đang tải...'}
            </p>
          </div>
        </div>

        {/* Toolbar: Search and Tabs */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value;
                setSearchInput(v);
                // If user clears the input, immediately reset searchQuery to show all items
                if (v.trim() === '') {
                  setSearchQuery('');
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {searchInput && searchInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
                className="px-3 py-2 bg-white border border-border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                title="Xóa tìm kiếm và hiện tất cả"
              >
                Xóa
              </button>
            )}
            <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition cursor-pointer">
              Tìm kiếm
            </button>
          </form>

          {subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  selectedSubcategory === '' 
                    ? 'bg-purple-100 text-purple-700 border-purple-200' 
                    : 'bg-white text-gray-600 border-border hover:bg-gray-50'
                }`}
              >
                Tất cả
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    selectedSubcategory === sub 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-white text-gray-600 border-border hover:bg-gray-50'
                  }`}
                >
                  {formatSubcategoryName(sub)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🤷‍♀️</p>
            <p className="text-muted">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onClick={setSelectedItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg bg-white border border-border text-sm font-semibold text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center min-w-[40px]"
                >
                  &lt;
                </button>
                
                {getPageNumbers().map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => p !== '...' && handlePageChange(p)}
                    disabled={p === '...'}
                    className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-semibold transition-colors flex items-center justify-center
                      ${p === page 
                        ? 'bg-purple-600 text-white border-purple-600 cursor-default shadow-sm' 
                        : p === '...' 
                          ? 'bg-transparent border-transparent text-text cursor-default' 
                          : 'bg-white text-text border-border hover:bg-gray-50 cursor-pointer shadow-sm'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg bg-white border border-border text-sm font-semibold text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center min-w-[40px]"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rating Modal */}
      {selectedItem && (
        <RatingModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
