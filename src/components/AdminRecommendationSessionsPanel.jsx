import { useCallback, useEffect, useState } from 'react';
import { getAdminRecommendationSessions } from '../api';

function localDateValue(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminRecommendationSessionsPanel() {
  const [date, setDate] = useState(localDateValue);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminRecommendationSessions(date);
      setSessions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <label htmlFor="sessionDate" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Ngày hoạt động
          </label>
          <input
            id="sessionDate"
            type="date"
            value={date}
            max={localDateValue()}
            onChange={(event) => setDate(event.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text"
          />
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
        >
          ↻ Làm mới
        </button>
      </div>

      <div className="mb-3 text-sm text-muted">
        {loading ? 'Đang tải…' : `${sessions.length} lượt bấm Gợi ý`}
      </div>

      {error && (
        <div className="text-center py-12 text-red-500 bg-white border border-border rounded-2xl">
          {error}
        </div>
      )}

      {!error && (
        <div className="overflow-x-auto bg-white border border-border rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-muted">Thời gian</th>
                <th className="px-4 py-3 font-semibold text-muted">User</th>
                <th className="px-4 py-3 font-semibold text-muted">Danh mục</th>
                <th className="px-4 py-3 font-semibold text-muted">Bối cảnh</th>
                <th className="px-4 py-3 font-semibold text-muted text-right">Vị trí like đầu tiên</th>
                <th className="px-4 py-3 font-semibold text-muted text-right">Tổng like</th>
                <th className="px-4 py-3 font-semibold text-muted text-right">Item hiển thị</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatTime(session.timestamp)}</td>
                  <td className="px-4 py-3 font-medium text-text">{session.username || '—'}</td>
                  <td className="px-4 py-3 text-muted">{session.category_label}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {session.occasion_label} · {session.weather_label}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text">
                    {session.first_like_position ? `#${session.first_like_position}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{session.like_count}</td>
                  <td className="px-4 py-3 text-right text-muted">{session.impressions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && sessions.length === 0 && (
            <div className="p-10 text-center text-muted text-sm">
              Không có lượt gợi ý trong ngày này.
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted mt-3">
        Vị trí like tính theo thứ tự hiển thị đã xáo trong top-20. Dữ liệu cũ chưa có vị trí hiển thị sẽ dùng rank model.
      </p>
    </div>
  );
}
