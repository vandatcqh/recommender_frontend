import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyRatings } from '../api';

const OCCASION_LABELS = { outing: 'Đi chơi', work: 'Đi làm', party: 'Tiệc' };
const WEATHER_LABELS = { hot: 'Nóng', cool: 'Mát', cold: 'Lạnh' };
const OCCASION_COLORS = 'bg-amber-50 text-amber-700 border-amber-200';
const WEATHER_COLORS = 'bg-sky-50 text-sky-700 border-sky-200';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function MyRatingsPage() {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await getMyRatings();
        setRatings(res.data);
      } catch (err) {
        console.error('Failed to fetch ratings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '';
    e.target.style.display = 'none';
    e.target.parentElement.querySelector('.rating-placeholder').style.display = 'flex';
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 page-enter">
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
            <h1 className="text-xl font-bold text-text m-0">Đánh giá của tôi</h1>
            {!loading && (
              <p className="text-sm text-muted mt-0.5">
                Bạn đã đánh giá <span className="font-semibold text-primary-dark">{ratings.length}</span> sản phẩm
              </p>
            )}
          </div>
        </div>

        {/* Ratings list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex gap-3">
                  <div className="w-15 h-15 skeleton rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-3/4 rounded" />
                    <div className="h-3 skeleton w-1/2 rounded" />
                    <div className="h-6 skeleton w-2/3 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-semibold text-text mb-2">Chưa có đánh giá nào</p>
            <p className="text-sm text-muted mb-6">Hãy bắt đầu đánh giá sản phẩm thời trang!</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold border-none cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-15 h-15 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img
                      src={r.item.image_url}
                      alt={r.item.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    <div className="rating-placeholder absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center text-lg hidden">
                      👗
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text line-clamp-1 m-0">
                      {r.item.name}
                    </h3>
                    {r.item.shopee_url && (
                      <a
                        href={r.item.shopee_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-dark hover:text-primary no-underline mt-0.5"
                      >
                        🔗 Xem trên Shopee
                      </a>
                    )}

                    {/* Context chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${OCCASION_COLORS}`}>
                        {OCCASION_LABELS[r.occasion]}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${WEATHER_COLORS}`}>
                        {WEATHER_LABELS[r.weather]}
                      </span>
                    </div>

                    {/* Rating & date */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-semibold text-amber-500">
                        {'⭐'.repeat(r.rating)}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
