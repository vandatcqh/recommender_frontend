import { useState } from 'react';

const labels = {
  1: 'Hoàn toàn không thích',
  2: 'Không thích',
  3: 'Bình thường',
  4: 'Thích',
  5: 'Rất thích',
};

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text">
        Bạn có thích mặc sản phẩm này trong bối cảnh này không?
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="star-btn text-3xl bg-transparent border-none cursor-pointer p-1"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            {star <= display ? '★' : '☆'}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted h-4">
        {display ? labels[display] : (
          <span className="italic">
            "Hoàn toàn không thích" ←→ "Rất thích"
          </span>
        )}
      </p>
    </div>
  );
}
