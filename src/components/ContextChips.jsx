export default function ContextChips({ label, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`chip px-4 py-2 rounded-full text-sm font-medium border cursor-pointer ${
              value === opt.value
                ? 'bg-purple-100 border-purple-400 text-purple-700 shadow-sm'
                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
