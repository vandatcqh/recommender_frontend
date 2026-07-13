import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getRecommendations,
  getRecommendationsStatus,
  logRecommenderEvents,
} from '../api';

const CATEGORIES = [
  { id: 1, label: 'Áo' },
  { id: 2, label: 'Chân váy' },
  { id: 3, label: 'Đầm' },
  { id: 4, label: 'Quần' },
];

const OCCASIONS = [
  { value: 'outing', label: 'Đi chơi' },
  { value: 'party', label: 'Tiệc' },
  { value: 'work', label: 'Đi làm' },
];

const WEATHERS = [
  { value: 'cold', label: 'Lạnh' },
  { value: 'cool', label: 'Mát' },
  { value: 'hot', label: 'Nóng' },
];

let sessionSeq = 0;

function newSessionId(username) {
  sessionSeq += 1;
  return `${username}-${new Date().toISOString().replace(/[:.]/g, '')}-${sessionSeq}`;
}

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('user_id') || '';

  const [categoryId, setCategoryId] = useState(1);
  const [occasion, setOccasion] = useState('outing');
  const [weather, setWeather] = useState('cold');
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(null);
  const [items, setItems] = useState([]);
  const [liked, setLiked] = useState({});
  const [showResult, setShowResult] = useState(false);
  const sessionRef = useRef(null);

  useEffect(() => {
    getRecommendationsStatus()
      .then((res) => setHasData(res.data.has_data))
      .catch(() => setHasData(false));
  }, []);

  const baseEvent = (rank, itemId, predRating, action) => ({
    timestamp: new Date().toISOString(),
    session_id: sessionRef.current?.id || '',
    user_id: String(userId),
    username,
    category_id: categoryId,
    occasion,
    weather,
    rank,
    item_id: itemId,
    pred_rating: predRating,
    action,
  });

  const handleRecommend = async () => {
    setLoading(true);
    setShowResult(false);
    setLiked({});

    try {
      const res = await getRecommendations(categoryId, occasion, weather);
      const nextItems = res.data || [];
      setItems(nextItems);

      if (nextItems.length > 0) {
        sessionRef.current = {
          id: newSessionId(username),
          items: nextItems,
        };
        logRecommenderEvents(
          nextItems.map((item) =>
            baseEvent(item.rank, item.item_id, item.pred_rating, 'impression')
          )
        );
      } else {
        sessionRef.current = null;
      }
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      setItems([]);
      sessionRef.current = null;
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const toggleLike = (item) => {
    const nextLiked = !liked[item.item_id];
    setLiked((prev) => ({ ...prev, [item.item_id]: nextLiked }));
    logRecommenderEvents([
      baseEvent(item.rank, item.item_id, item.pred_rating, nextLiked ? 'like' : 'unlike'),
    ]);
  };

  const categoryLabel = CATEGORIES.find((c) => c.id === categoryId)?.label || '';

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 page-enter">
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
            <h1 className="text-xl font-bold text-text m-0">Gợi ý cho {username}</h1>
            <p className="text-sm text-muted mt-0.5">Top-30 sản phẩm theo ngữ cảnh</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 space-y-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Danh mục</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                    categoryId === cat.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-sm'
                      : 'bg-gray-50 text-text border-border hover:border-primary/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="occSel" className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                Dịp
              </label>
              <select
                id="occSel"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
              >
                {OCCASIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="weaSel" className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                Thời tiết
              </label>
              <select
                id="weaSel"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
              >
                {WEATHERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRecommend}
            disabled={loading || hasData === false}
            className={`w-full py-3 rounded-full text-sm font-semibold border-none cursor-pointer transition-all ${
              !loading && hasData !== false
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:scale-[1.01]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Đang tìm kiếm...
              </span>
            ) : (
              'Gợi ý'
            )}
          </button>
        </div>

        {hasData === false && (
          <div className="mt-6 text-center py-10 text-muted">
            Tài khoản <b>{username}</b> chưa có dữ liệu dự đoán.
          </div>
        )}

        {!showResult && hasData !== false && (
          <div className="mt-6 text-center py-10 text-muted">
            Chọn danh mục &amp; ngữ cảnh rồi bấm <b>Gợi ý</b>.
          </div>
        )}

        {showResult && (
          <div className="mt-6">
            {items.length > 0 ? (
              <>
                <h2 className="text-base font-semibold text-text mb-4">
                  Gợi ý {categoryLabel} ({items.length} sản phẩm)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.item_id}
                      className="relative bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleLike(item)}
                        className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-lg cursor-pointer border-none transition-transform hover:scale-105 ${
                          liked[item.item_id] ? 'text-primary' : 'text-gray-300'
                        }`}
                        title="Thích"
                        aria-label="Thích"
                      >
                        ♥
                      </button>
                      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt="sản phẩm"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="text-sm text-muted items-center justify-center w-full h-full"
                          style={{ display: item.image_url ? 'none' : 'flex' }}
                        >
                          Không có ảnh
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-muted">
                Không có sản phẩm phù hợp.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
