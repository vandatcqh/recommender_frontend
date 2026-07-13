import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../api';
import { clearAuthSession, isAdmin } from '../lib/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(isAdmin());
  const username = localStorage.getItem('username') || 'User';
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getMe()
      .then((res) => {
        const flag = !!res.data.is_admin;
        localStorage.setItem('is_admin', flag ? '1' : '0');
        setAdmin(flag);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-lg">✦</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-dark to-secondary bg-clip-text text-transparent">
            StyleRate
          </span>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-text hidden sm:block">{username}</span>
            <svg className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-text">{username}</p>
                <p className="text-xs text-muted">
                  {admin ? 'Quản trị viên' : 'Thành viên StyleRate'}
                </p>
              </div>
              <div className="py-1">
                <Link
                  to="/my-ratings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors no-underline"
                >
                  <span>⭐</span>
                  <span>Đánh giá của tôi</span>
                </Link>
                <Link
                  to="/recommendations"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors no-underline"
                >
                  <span>✨</span>
                  <span>Gợi ý sản phẩm</span>
                </Link>
                {admin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-purple-50 transition-colors no-underline"
                  >
                    <span>📊</span>
                    <span>Admin · Metrics</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span>🚪</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
