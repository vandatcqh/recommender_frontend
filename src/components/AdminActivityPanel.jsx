import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminUserActivity, getAdminUserActivityDetail } from '../api';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function formatMrr(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(4);
}

function TimelineItem({ item }) {
  if (item.type === 'rating') {
    return (
      <div className="flex gap-3 py-3 border-t border-border first:border-t-0">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-lg">⭐</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text">Đánh giá sản phẩm</div>
          <div className="text-sm text-muted mt-0.5">
            {item.item_name || item.item_id} · {item.rating}/5 sao
          </div>
          <div className="text-xs text-muted mt-1">
            {item.occasion_label} · {item.weather_label}
          </div>
          <div className="text-xs text-muted mt-1">{formatDate(item.timestamp)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3 border-t border-border first:border-t-0">
      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-lg">✨</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text">Gợi ý · {item.category_label}</div>
        <div className="text-sm text-muted mt-0.5">
          {item.impressions} impression · {item.likes} like
          {item.unlikes ? ` · ${item.unlikes} unlike` : ''}
        </div>
        <div className="text-xs text-muted mt-1">
          {item.occasion_label} · {item.weather_label}
        </div>
        {item.liked_items?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.liked_items.map((liked) => (
              <span
                key={`${item.session_id}-${liked.rank}`}
                className="inline-flex px-2 py-0.5 rounded-full text-xs bg-pink-50 text-pink-700"
              >
                #{liked.rank} · {liked.item_id} ({liked.pred_rating.toFixed(2)})
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-muted mt-1">{formatDate(item.timestamp)}</div>
      </div>
    </div>
  );
}

export default function AdminActivityPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUserActivity();
      setUsers(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openUser = async (user) => {
    setSelected(user);
    setDetail(null);
    setDetailLoading(true);
    try {
      const params = user.user_id
        ? { user_id: user.user_id }
        : { username: user.username };
      const res = await getAdminUserActivityDetail(params);
      setDetail(res.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Không tải được chi tiết');
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.trim().toLowerCase()),
  );

  if (loading) {
    return <div className="text-center py-12 text-muted">Đang tải hoạt động user…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-white border border-border rounded-2xl">
        {error}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2">
        <div className="mb-3 flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm username…"
            className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-white"
          />
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded-xl border border-border bg-white text-sm cursor-pointer hover:bg-gray-50"
          >
            ↻
          </button>
        </div>
        <div className="bg-white border border-border rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left sticky top-0">
              <tr>
                <th className="px-3 py-2 font-semibold text-muted">User</th>
                <th className="px-3 py-2 font-semibold text-muted text-right">⭐</th>
                <th className="px-3 py-2 font-semibold text-muted text-right">✨</th>
                <th className="px-3 py-2 font-semibold text-muted text-right">♥</th>
                <th className="px-3 py-2 font-semibold text-muted text-right">MRR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.username}
                  onClick={() => openUser(user)}
                  className={`border-t border-border cursor-pointer hover:bg-gray-50 ${
                    selected?.username === user.username ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-text">{user.username}</div>
                    <div className="text-xs text-muted">{formatDate(user.last_activity_at)}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted">{user.rating_count}</td>
                  <td className="px-3 py-2.5 text-right text-muted">{user.recommendation_sessions}</td>
                  <td className="px-3 py-2.5 text-right text-muted">{user.likes}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-text">{formatMrr(user.mrr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted text-sm">Không có user phù hợp</div>
          )}
        </div>
        <p className="text-xs text-muted mt-2">
          ⭐ đánh giá · ✨ lượt gợi ý · ♥ like · MRR trung bình theo lượt gợi ý
        </p>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white border border-border rounded-2xl p-4 min-h-[320px]">
          {!selected && (
            <div className="h-full flex items-center justify-center text-muted text-sm py-16">
              Chọn một user để xem timeline đánh giá & gợi ý
            </div>
          )}
          {selected && detailLoading && (
            <div className="text-center py-16 text-muted">Đang tải chi tiết…</div>
          )}
          {selected && !detailLoading && detail && (
            <>
              <div className="mb-4 pb-4 border-b border-border">
                <h2 className="text-lg font-bold text-text m-0">{detail.username}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-center">
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-lg font-bold text-text">{detail.rating_count}</div>
                    <div className="text-xs text-muted">Đánh giá</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-lg font-bold text-text">{detail.recommendation_sessions}</div>
                    <div className="text-xs text-muted">Lượt gợi ý</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-lg font-bold text-text">{detail.impressions}</div>
                    <div className="text-xs text-muted">Impression</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-lg font-bold text-text">{detail.likes}</div>
                    <div className="text-xs text-muted">Like</div>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2">
                    <div className="text-lg font-bold text-text">{formatMrr(detail.mrr)}</div>
                    <div className="text-xs text-muted">MRR</div>
                  </div>
                </div>
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
                {detail.timeline.length === 0 ? (
                  <div className="text-center py-10 text-muted text-sm">Chưa có hoạt động</div>
                ) : (
                  detail.timeline.map((item, idx) => (
                    <TimelineItem key={`${item.type}-${item.timestamp}-${idx}`} item={item} />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
