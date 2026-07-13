export default function ProductCard({ item, onClick }) {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '';
    e.target.style.display = 'none';
    e.target.parentElement.querySelector('.placeholder').style.display = 'flex';
  };

  return (
    <div
      className="product-card bg-white rounded-2xl overflow-hidden border border-border cursor-pointer group"
      onClick={() => onClick(item)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
        />
        {/* Placeholder on error */}
        <div
          className="placeholder absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center text-5xl hidden"
        >
          👗
        </div>

        {/* Shopee link icon */}
        {item.shopee_url && (
          <a
            href={item.shopee_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-white transition-all z-10"
            title="Xem trên Shopee"
          >
            <span className="text-sm">🔗</span>
          </a>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-text leading-snug line-clamp-2 m-0">
          {item.name}
        </h3>
      </div>
    </div>
  );
}
