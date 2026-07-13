import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import iconAo from '../assets/icons8-womans-clothes-48.png';
import iconQuan from '../assets/icons8-pants-48.png';
import iconDam from '../assets/icons8-dress-48.png';
import iconChanvay from '../assets/icons8-skirt-48.png';

const categories = [
  { slug: 'ao', name: 'Áo', icon: iconAo, gradient: 'from-purple-300 to-purple-500', bg: 'bg-purple-50' },
  { slug: 'quan', name: 'Quần', icon: iconQuan, gradient: 'from-blue-300 to-blue-500', bg: 'bg-blue-50' },
  { slug: 'dam', name: 'Đầm', icon: iconDam, gradient: 'from-pink-300 to-pink-500', bg: 'bg-pink-50' },
  { slug: 'chanvay', name: 'Chân Váy', icon: iconChanvay, gradient: 'from-rose-300 to-rose-500', bg: 'bg-rose-50' },
];

export default function HomePage() {
  const username = localStorage.getItem('username') || 'bạn';

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 page-enter">
        {/* Welcome */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
            Xin chào, <span className="bg-gradient-to-r from-primary-dark to-secondary bg-clip-text text-transparent">{username}</span>! 👋
          </h1>
          <p className="text-muted text-sm md:text-base">
            Chọn danh mục sản phẩm bạn muốn đánh giá
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group no-underline"
            >
              <div className={`${cat.bg} rounded-3xl p-6 md:p-10 border border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-transparent`}>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${cat.gradient} mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <img src={cat.icon} alt={cat.name} className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-text group-hover:text-primary-dark transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Xem & đánh giá →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-10 bg-white rounded-2xl border border-border p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-base font-semibold text-text mb-1">Về StyleRate</h3>
          <p className="text-sm text-muted max-w-2xl mx-auto">
            Giúp chúng tôi xây dựng hệ thống gợi ý thời trang thông minh bằng cách <br /> đánh giá sản phẩm theo ngữ cảnh sử dụng (dịp, thời tiết).
          </p>
        </div>
      </main>
    </div>
  );
}
