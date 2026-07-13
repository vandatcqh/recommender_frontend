import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsers, updateAdminUser } from '../api';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const currentUserId = Number(localStorage.getItem('user_id'));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (e) {
      const msg = e.response?.status === 403
        ? 'Bạn không có quyền admin'
        : (e.response?.data?.detail || e.message || 'Lỗi tải danh sách');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (user) => {
    const next = !user.is_admin;
    const label = next ? 'cấp quyền admin' : 'gỡ quyền admin';
    if (!window.confirm(`${next ? 'Cấp' : 'Gỡ'} quyền admin cho "${user.username}"?`)) {
      return;
    }

    setUpdatingId(user.user_id);
    try {
      const res = await updateAdminUser(user.user_id, next);
      setUsers((prev) => prev.map((u) => (u.user_id === user.user_id ? res.data : u)));
      if (user.user_id === currentUserId) {
        localStorage.setItem('is_admin', next ? '1' : '0');
      }
      toast.success(`Đã ${label} cho ${user.username}`);
    } catch (e) {
      const msg = e.response?.data?.detail || `Không thể ${label}`;
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted">Đang tải danh sách…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-white border border-border rounded-2xl">
        {error}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        Cấp hoặc gỡ quyền admin cho tài khoản khác. Phải luôn giữ ít nhất một admin.
      </p>
      <div className="overflow-x-auto bg-white border border-border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted">Tài khoản</th>
              <th className="px-4 py-3 font-semibold text-muted">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold text-muted">Vai trò</th>
              <th className="px-4 py-3 font-semibold text-muted text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.user_id === currentUserId;
              const busy = updatingId === user.user_id;
              return (
                <tr key={user.user_id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text">
                    {user.username}
                    {isSelf && (
                      <span className="ml-2 text-xs text-primary font-semibold">(bạn)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    {user.is_admin ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-muted">
                        Thành viên
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busy || (isSelf && user.is_admin)}
                      onClick={() => handleToggle(user)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.is_admin
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                      title={isSelf && user.is_admin ? 'Không thể tự gỡ quyền admin' : ''}
                    >
                      {busy ? '...' : user.is_admin ? 'Gỡ admin' : 'Cấp admin'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
