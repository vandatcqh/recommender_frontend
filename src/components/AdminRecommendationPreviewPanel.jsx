import { useState } from 'react';
import { getAdminRecommendationPreview } from '../api';

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

export default function AdminRecommendationPreviewPanel() {
  const [username, setUsername] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [occasion, setOccasion] = useState('outing');
  const [weather, setWeather] = useState('cold');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await getAdminRecommendationPreview({
        username: normalizedUsername,
        category_id: categoryId,
        occasion,
        weather,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Không tải được gợi ý');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 mb-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="previewUsername" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Username
            </label>
            <input
              id="previewUsername"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập username"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text"
            />
          </div>
          <div>
            <label htmlFor="previewCategory" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Danh mục
            </label>
            <select
              id="previewCategory"
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text"
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="previewOccasion" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Dịp
            </label>
            <select
              id="previewOccasion"
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text"
            >
              {OCCASIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="previewWeather" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
              Thời tiết
            </label>
            <select
              id="previewWeather"
              value={weather}
              onChange={(event) => setWeather(event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text"
            >
              {WEATHERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Đang tải…' : 'Xem toàn bộ ranking'}
        </button>
        <p className="text-xs text-muted mt-3 mb-0">
          Chế độ admin chỉ đọc: chỉ hiện sản phẩm user chưa đánh giá trong context đã chọn,
          giữ nguyên rank model, không xáo và không ghi tracking.
        </p>
      </form>

      {error && (
        <div className="text-center py-10 text-red-500 bg-white border border-border rounded-2xl">
          {error}
        </div>
      )}

      {result && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-text m-0">
              Toàn bộ ranking của {result.username} ({result.items.length} sản phẩm)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
              {result.source === 'personal' ? 'Cá nhân hóa' : 'Global fallback'}
            </span>
          </div>
          <div className="overflow-x-auto bg-white border border-border rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted text-right">Rank</th>
                  <th className="px-4 py-3 font-semibold text-muted">Sản phẩm</th>
                  <th className="px-4 py-3 font-semibold text-muted">Item ID</th>
                  <th className="px-4 py-3 font-semibold text-muted text-right">Predicted rating</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.item_id} className="border-t border-border">
                    <td className="px-4 py-3 text-right font-bold text-text">#{item.rank}</td>
                    <td className="px-4 py-2">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{item.item_id}</td>
                    <td className="px-4 py-3 text-right font-semibold text-text">
                      {Number(item.pred_rating).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.items.length === 0 && (
              <div className="p-10 text-center text-muted text-sm">
                Không còn sản phẩm chưa đánh giá trong context này hoặc chưa có prediction phù hợp.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
