import { useState } from 'react';
import toast from 'react-hot-toast';
import ContextChips from './ContextChips';
import StarRating from './StarRating';
import { submitRating } from '../api';

const OCCASION_OPTIONS = [
  { value: 'outing', label: 'Đi chơi' },
  { value: 'work', label: 'Đi làm' },
  { value: 'party', label: 'Tiệc' },
];

const WEATHER_OPTIONS = [
  { value: 'hot', label: 'Nóng' },
  { value: 'cool', label: 'Mát' },
  { value: 'cold', label: 'Lạnh' },
];

const CONTEXT_PRESETS = [
  { occasion: 'outing', weather: 'hot' },
  { occasion: 'outing', weather: 'cool' },
  { occasion: 'outing', weather: 'cold' },

  { occasion: 'work', weather: 'hot' },
  { occasion: 'work', weather: 'cool' },
  { occasion: 'work', weather: 'cold' },

  { occasion: 'party', weather: 'hot' },
  { occasion: 'party', weather: 'cool' },
  { occasion: 'party', weather: 'cold' },
];

const getRandomContext = (exclude = null) => {
  const filtered = CONTEXT_PRESETS.filter(
    (ctx) =>
      !exclude ||
      ctx.occasion !== exclude.occasion ||
      ctx.weather !== exclude.weather
  );

  return filtered[Math.floor(Math.random() * filtered.length)];
};

export default function RatingModal({ item, onClose, onSuccess }) {
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ratingStep, setRatingStep] = useState(1);

  const isComplete = occasion && weather && rating > 0;

  const handleSubmit = async () => {
    if (!isComplete) return;

    setSubmitting(true);

    try {
      await submitRating({
        item_id: item.id,
        rating,
        occasion,
        weather,
      });

      toast.success('Đánh giá đã được lưu! 🎉');

      onSuccess?.();

      // Nếu đã xong lượt thứ 2 thì đóng modal
      if (ratingStep >= 2) {
        onClose();
        return;
      }

      // Random context mới cho lượt thứ 2
      const nextContext = getRandomContext({
        occasion,
        weather,
      });

      setOccasion(nextContext.occasion);
      setWeather(nextContext.weather);
      setRating(0);
      setRatingStep(2);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          'Bạn đã đánh giá sản phẩm này trong bối cảnh này rồi.'
        );

        // Nếu bị duplicate thì đóng luôn
        onClose();
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '';
    e.target.style.display = 'none';

    const placeholder =
      e.target.parentElement.querySelector('.modal-placeholder');

    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-black hover:bg-gray-100 shadow-sm border border-gray-200 cursor-pointer transition-all"
        >
          ✕
        </button>

        {/* Left: Image Area */}
        <div className="w-full md:w-5/12 bg-gray-50 flex flex-col p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />

            <div className="modal-placeholder absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center text-4xl hidden">
              👗
            </div>
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-lg md:text-xl font-bold text-text leading-snug m-0 line-clamp-2">
              {item.name}
            </h3>

            {item.shopee_url && (
              <a
                href={item.shopee_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary-dark hover:text-primary mt-3 px-5 py-2.5 bg-primary/10 rounded-full no-underline transition-colors"
              >
                🛒 Xem trên Shopee
              </a>
            )}
          </div>
        </div>

        {/* Right: Form Area */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-text mb-2">
            Đánh giá sản phẩm
          </h2>

          <div className="space-y-6 flex-1">
            <ContextChips
              label="Bạn mặc để đi đâu, làm gì?"
              options={OCCASION_OPTIONS}
              value={occasion}
              onChange={setOccasion}
            />

            <ContextChips
              label="Điều kiện thời tiết?"
              options={WEATHER_OPTIONS}
              value={weather}
              onChange={setWeather}
            />

            <div className="pt-2">
              <StarRating
                value={rating}
                onChange={setRating}
              />
            </div>
          </div>
          

          
          
          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted mb-6">
            {ratingStep === 1
              ? 'Giúp hệ thống hiểu hơn sở thích của bạn bằng cách đánh giá sản phẩm này ở 1 ngữ cảnh khác✨'
              : 'Đây là ngữ cảnh được random bởi hệ thống. Bạn có thể điều chỉnh nếu muốn. ✨'}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              className={`w-full py-3.5 rounded-xl text-base font-bold border-none cursor-pointer transition-all ${
                isComplete && !submitting
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Đang gửi...
                </span>
              ) : ratingStep === 1 ? (
                'Gửi & đánh giá thêm'
              ) : (
                'Hoàn tất đánh giá'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}