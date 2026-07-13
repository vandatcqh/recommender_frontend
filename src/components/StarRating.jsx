import { useState } from 'react';

const labels = {
  1: 'Rất không phù hợp',
  2: 'Không phù hợp',
  3: 'Bình thường',
  4: 'Phù hợp',
  5: 'Rất phù hợp',
};

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text">
        Mức độ phù hợp trong bối cảnh này?
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
            "Rất không phù hợp" ←→ "Rất phù hợp"
          </span>
        )}
      </p>
    </div>
  );
}
