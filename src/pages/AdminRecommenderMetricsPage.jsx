import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import {
  getRecommenderMetrics,
  getRecommenderMetricsCsvBlob,
  getRecommenderMetricsJsonBlob,
} from '../api';
import { downloadBlob } from '../lib/auth';

const METRIC_LABELS = {
  users: 'Người dùng',
  sessions: 'Lượt gợi ý',
  impressions: 'Impression',
  likes: 'Like',
  like_rate: 'Like-rate',
  'precision@K': 'Precision@K',
  'hit_rate@K': 'Hit-rate@K',
  MRR: 'MRR',
  'NDCG@K': 'NDCG@K',
  'MAP@K': 'MAP@K',
  mean_liked_rank: 'Hạng TB được like',
  mean_pred_liked: 'Pred TB (liked)',
  mean_pred_not_liked: 'Pred TB (không like)',
};

const RATIO = new Set(['like_rate', 'precision@K', 'hit_rate@K', 'MRR', 'NDCG@K', 'MAP@K']);

function fmt(key, value) {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number') return value;
  if (Number.isInteger(value) && !RATIO.has(key)) return value.toLocaleString();
  if (RATIO.has(key)) return value.toFixed(4);
  return value.toFixed(3);
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted font-semibold">{label}</div>
      <div className="text-2xl font-bold text-text mt-1">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

function MetricTable({ title, data, groupHead }) {
  const groups = Object.keys(data);
  if (!groups.length) return null;
  const cols = ['sessions', 'likes', 'like_rate', 'precision@K', 'hit_rate@K', 'MRR', 'NDCG@K', 'MAP@K', 'mean_liked_rank'];

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold text-text mb-3">{title}</h2>
      <div className="overflow-x-auto bg-white border border-border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted">{groupHead}</th>
              {cols.map((col) => (
                <th key={col} className="px-4 py-3 font-semibold text-muted text-right">
                  {METRIC_LABELS[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-text">{group}</td>
                {cols.map((col) => (
                  <td key={col} className="px-4 py-3 text-right text-muted">
                    {fmt(col, data[group][col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminRecommenderMetricsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRecommenderMetrics();
      setMetrics(res.data);
    } catch (e) {
      const msg = e.response?.status === 403
        ? 'Bạn không có quyền admin'
        : (e.message || 'Lỗi tải dữ liệu');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExportJson = async () => {
    try {
      setExporting('json');
      const res = await getRecommenderMetricsJsonBlob();
      downloadBlob(res.data, 'recommender_metrics.json');
      toast.success('Đã tải JSON');
    } catch {
      toast.error('Export JSON thất bại');
    } finally {
      setExporting('');
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting('csv');
      const res = await getRecommenderMetricsCsvBlob();
      downloadBlob(res.data, 'recommender_metrics.csv');
      toast.success('Đã tải CSV');
    } catch {
      toast.error('Export CSV thất bại');
    } finally {
      setExporting('');
    }
  };

  const overall = metrics?.overall;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 page-enter">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text m-0">Admin · Đánh giá recommender</h1>
            <p className="text-sm text-muted mt-0.5">Metrics từ tương tác gợi ý (impression & like)</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
            >
              ↻ Làm mới
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!!exporting}
              className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
            >
              {exporting === 'json' ? '...' : '⬇ JSON'}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!!exporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none"
            >
              {exporting === 'csv' ? '...' : '⬇ CSV'}
            </button>
          </div>
        </div>

        <p className="text-sm text-muted mb-6">
          Chỉ số tính từ tương tác thật (impression khi bấm Gợi ý, like khi bấm ♥).
        </p>

        {loading && (
          <div className="text-center py-16 text-muted">Đang tải…</div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 bg-white border border-border rounded-2xl">
            {error}
          </div>
        )}

        {!loading && !error && overall && !overall.sessions && (
          <div className="text-center py-16 text-muted bg-white border border-border rounded-2xl">
            Chưa có dữ liệu tương tác nào.<br />
            Hãy vào trang Gợi ý, bấm Gợi ý và thả ♥ vài sản phẩm rồi làm mới.
          </div>
        )}

        {!loading && !error && overall?.sessions > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <KpiCard label="Người dùng" value={fmt('users', overall.users)} />
              <KpiCard label="Lượt gợi ý" value={fmt('sessions', overall.sessions)} />
              <KpiCard label="Impression" value={fmt('impressions', overall.impressions)} />
              <KpiCard label="Like" value={fmt('likes', overall.likes)} />
              <KpiCard label="Like-rate" value={fmt('like_rate', overall.like_rate)} />
              <KpiCard label="NDCG@K" value={fmt('NDCG@K', overall['NDCG@K'])} />
              <KpiCard label="Precision@K" value={fmt('precision@K', overall['precision@K'])} />
              <KpiCard label="Hit-rate@K" value={fmt('hit_rate@K', overall['hit_rate@K'])} />
              <KpiCard label="MRR" value={fmt('MRR', overall.MRR)} />
              <KpiCard label="MAP@K" value={fmt('MAP@K', overall['MAP@K'])} />
              <KpiCard
                label="Hạng TB được like"
                value={fmt('mean_liked_rank', overall.mean_liked_rank)}
                sub="càng nhỏ càng tốt"
              />
              <KpiCard
                label="Pred liked vs không"
                value={`${fmt('mean_pred_liked', overall.mean_pred_liked)} / ${fmt('mean_pred_not_liked', overall.mean_pred_not_liked)}`}
                sub="điểm dự đoán TB"
              />
            </div>

            <MetricTable title="Theo danh mục" data={metrics.byCategory || {}} groupHead="Danh mục" />
            <MetricTable title="Theo ngữ cảnh (dịp | thời tiết)" data={metrics.byContext || {}} groupHead="Ngữ cảnh" />
          </>
        )}
      </main>
    </div>
  );
}
