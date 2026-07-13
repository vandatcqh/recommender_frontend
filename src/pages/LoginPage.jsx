import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, register } from '../api';
import { setAuthSession } from '../lib/auth';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(username, password);
        setAuthSession({
          token: res.data.token,
          username: res.data.username,
          userId: res.data.user_id,
          isAdmin: res.data.is_admin,
        });
        toast.success(`Chào mừng trở lại, ${res.data.username}! 👋`);
        navigate('/home');
      } else {
        await register(username, password);
        // Auto-login after register
        const res = await login(username, password);
        setAuthSession({
          token: res.data.token,
          username: res.data.username,
          userId: res.data.user_id,
          isAdmin: res.data.is_admin,
        });
        toast.success('Đăng ký thành công! 🎉');
        navigate('/home');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
            <span className="text-3xl text-white">✦</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-dark to-secondary bg-clip-text text-transparent">
            StyleRate
          </h1>
          <p className="text-muted text-sm mt-2">
            Đánh giá thời trang theo ngữ cảnh
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-border p-8">
          {/* Toggle tabs */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer transition-all ${
                isLogin
                  ? 'bg-white text-text shadow-sm'
                  : 'bg-transparent text-muted'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer transition-all ${
                !isLogin
                  ? 'bg-white text-text shadow-sm'
                  : 'bg-transparent text-muted'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-text placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-text placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-semibold border-none cursor-pointer bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  {isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
                </span>
              ) : (
                isLogin ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Hệ thống thu thập đánh giá cho nghiên cứu Context-Aware Recommender Systems
        </p>
      </div>
    </div>
  );
}
